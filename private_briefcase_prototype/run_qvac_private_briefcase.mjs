import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { completion, LLAMA_3_2_1B_INST_Q4_0, loadModel, unloadModel } from "@qvac/sdk";

const __filename = fileURLToPath(import.meta.url);
const projectDir = path.dirname(__filename);
const samplesDir = path.join(projectDir, "samples");
const outputDir = path.join(projectDir, "output");
const generatedAt = process.env.QVAC_BRIEF_GENERATED_AT || new Date().toISOString();

const sampleSpecs = [
  ["contract", "contract_excerpt.txt"],
  ["invoice", "invoice_note.txt"],
  ["message", "request_message.txt"],
  ["image_note", "image_memo_ocr.txt"]
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function readSamples() {
  const samples = [];
  for (const [mode, fileName] of sampleSpecs) {
    const content = (await fs.readFile(path.join(samplesDir, fileName), "utf8")).replace(/^\uFEFF/, "");
    samples.push({
      mode,
      path: `samples/${fileName}`,
      sha256: sha256(content),
      bytes: Buffer.byteLength(content, "utf8"),
      content
    });
  }
  return samples;
}

function buildPrompt(samples) {
  const localFiles = samples
    .map((sample) => `--- ${sample.mode}: ${sample.path} ---\n${sample.content.trim()}`)
    .join("\n\n");

  return `You are QVAC Private Briefcase: Before You Act.
Use only the local files below. Do not ask for cloud services.
Return a concise JSON object with these keys:
- contract_checks: checks before signing or approval
- invoice_checks: payment-processing reconciliation checks, not a generic danger verdict
- message_checks: checks before replying, sharing files, or confirming payment
- image_note_checks: checks before acting on the OCR-like image note
- next_actions: short, practical next steps
- privacy_note: one sentence explaining why this should stay local

Local files:
${localFiles}`;
}

function compactModelSource(modelSource) {
  return {
    name: modelSource.name || null,
    registrySource: modelSource.registrySource || null,
    registryPath: modelSource.registryPath || null,
    expectedSize: modelSource.expectedSize || null,
    sha256Checksum: modelSource.sha256Checksum || null,
    engine: modelSource.engine || null,
    quantization: modelSource.quantization || null,
    params: modelSource.params || null
  };
}

function renderMarkdown(evidence) {
  const samples = evidence.input_samples
    .map((sample) => `- ${sample.mode}: ${sample.path} (${sample.sha256})`)
    .join("\n");

  return `# QVAC Private Briefcase Real Brief

Generated: ${evidence.generated_at}
Status: ${evidence.status}
Adapter: ${evidence.adapter}
Model: ${evidence.model_source.name}
Model run OK: ${evidence.model_run.ok}

## Performance Log

- Load duration: ${evidence.model_run.performance.load_duration_ms} ms
- Completion duration: ${evidence.model_run.performance.completion_duration_ms} ms
- TTFT: ${evidence.model_run.performance.ttft_ms} ms
- Output stream chunks as token estimate: ${evidence.model_run.performance.output_stream_chunks_as_token_estimate}
- Tokens/sec estimate: ${evidence.model_run.performance.tokens_per_second_estimate}

## Input Hashes

${samples}

## QVAC Output

${evidence.model_run.text.trim()}

## Notes

${evidence.notes.map((note) => `- ${note}`).join("\n")}
`;
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const samples = await readSamples();
  const prompt = buildPrompt(samples);
  const progressEvents = [];
  const modelSource = LLAMA_3_2_1B_INST_Q4_0;
  const evidence = {
    schema: "qvac_private_briefcase.real_brief.v1",
    generated_at: generatedAt,
    status: "not_started",
    adapter: "@qvac/sdk",
    real_qvac_sdk: true,
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    },
    model_source: compactModelSource(modelSource),
    input_samples: samples.map(({ content, ...sample }) => sample),
    prompt_sha256: sha256(prompt),
    model_run: {
      ok: false,
      progress_events: progressEvents,
      text: "",
      error: null,
      performance: {
        standard_demo_run: true,
        prompt_sha256: sha256(prompt),
        prompt_chars: prompt.length,
        prompt_word_estimate: prompt.trim().split(/\s+/).filter(Boolean).length,
        load_duration_ms: null,
        completion_duration_ms: null,
        unload_duration_ms: null,
        ttft_ms: null,
        output_chars: 0,
        output_stream_chunks_as_token_estimate: 0,
        tokens_per_second_estimate: null
      }
    },
    notes: [
      "Generated with local QVAC SDK model execution.",
      "Sample content stayed on the local machine during this run."
    ]
  };

  let modelId;
  try {
    const loadStarted = Date.now();
    modelId = await loadModel({
      modelSrc: modelSource,
      modelType: "llamacpp-completion",
      onProgress: (progress) => progressEvents.push(progress)
    });
    evidence.model_run.performance.load_duration_ms = Date.now() - loadStarted;

    const history = [{ role: "user", content: prompt }];
    const result = completion({ modelId, history, stream: true });
    let text = "";
    const completionStarted = Date.now();
    let firstTokenAt = null;
    let outputChunkCount = 0;
    for await (const token of result.tokenStream) {
      if (firstTokenAt === null) {
        firstTokenAt = Date.now();
      }
      outputChunkCount += 1;
      text += token;
    }
    const completionDurationMs = Date.now() - completionStarted;
    const tokensPerSecond = completionDurationMs > 0
      ? outputChunkCount / (completionDurationMs / 1000)
      : null;

    evidence.model_run.ok = true;
    evidence.model_run.text = text;
    evidence.model_run.performance.completion_duration_ms = completionDurationMs;
    evidence.model_run.performance.ttft_ms = firstTokenAt === null ? null : firstTokenAt - completionStarted;
    evidence.model_run.performance.output_chars = text.length;
    evidence.model_run.performance.output_stream_chunks_as_token_estimate = outputChunkCount;
    evidence.model_run.performance.tokens_per_second_estimate = tokensPerSecond === null ? null : Number(tokensPerSecond.toFixed(2));
    evidence.status = "real_qvac_brief_verified";
  } catch (error) {
    evidence.model_run.error = {
      name: error?.name || "Error",
      message: error?.message || String(error),
      code: error?.code || null
    };
    evidence.status = "real_qvac_brief_failed";
  } finally {
    if (modelId) {
      const unloadStarted = Date.now();
      await unloadModel({ modelId });
      evidence.model_run.performance.unload_duration_ms = Date.now() - unloadStarted;
    }
  }

  await fs.writeFile(
    path.join(outputDir, "qvac_private_briefcase_real_brief.json"),
    JSON.stringify(evidence, null, 2) + "\n",
    "utf8"
  );
  await fs.writeFile(
    path.join(outputDir, "qvac_private_briefcase_real_brief.md"),
    renderMarkdown(evidence),
    "utf8"
  );
  await fs.writeFile(
    path.join(outputDir, "demo_run_log.json"),
    JSON.stringify({
      schema: "qvac_private_briefcase.demo_run_log.v1",
      generated_at: evidence.generated_at,
      status: evidence.status,
      standard_demo_run: true,
      model_source: evidence.model_source,
      prompt_sha256: evidence.prompt_sha256,
      performance: evidence.model_run.performance,
      model_load_unload_events: [
        {
          event: "loadModel",
          duration_ms: evidence.model_run.performance.load_duration_ms,
          model: evidence.model_source.name
        },
        {
          event: "completion",
          duration_ms: evidence.model_run.performance.completion_duration_ms,
          model: evidence.model_source.name
        },
        {
          event: "unloadModel",
          duration_ms: evidence.model_run.performance.unload_duration_ms,
          model: evidence.model_source.name
        }
      ],
      progress_events: evidence.model_run.progress_events
    }, null, 2) + "\n",
    "utf8"
  );

  console.log(`QVAC Private Briefcase real brief: ${evidence.status}`);
  if (!evidence.model_run.ok) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
