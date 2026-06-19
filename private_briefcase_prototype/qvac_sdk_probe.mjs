import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const projectDir = path.dirname(__filename);
const outputDir = path.join(projectDir, "output");
const samplesDir = path.join(projectDir, "samples");
const generatedAt = process.env.QVAC_PROBE_GENERATED_AT || new Date().toISOString();
const shouldLoadModel = process.env.QVAC_LOAD_MODEL === "1";
const requireImport = process.env.QVAC_REQUIRE_IMPORT === "1";

async function readJson(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    return { error: String(error?.message || error) };
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(filePath) {
  const data = await fs.readFile(filePath);
  return createHash("sha256").update(data).digest("hex");
}

function compactError(error) {
  return {
    name: error?.name || "Error",
    message: error?.message || String(error),
    code: error?.code || null
  };
}

async function readSamples() {
  const names = [
    "contract_excerpt.txt",
    "invoice_note.txt",
    "request_message.txt",
    "image_note_ocr_standin.txt"
  ];
  const files = [];
  for (const name of names) {
    const filePath = path.join(samplesDir, name);
    if (await fileExists(filePath)) {
      const content = await fs.readFile(filePath, "utf8");
      files.push({ name, sha256: createHash("sha256").update(content).digest("hex"), content });
    }
  }
  return files;
}

function buildBeforeYouActPrompt(samples) {
  const sampleText = samples
    .map((sample) => `--- ${sample.name} ---\n${sample.content.trim()}`)
    .join("\n\n");

  return `You are QVAC Private Briefcase: Before You Act.
Use only the local text below. Do not ask for cloud services.
Return concise JSON with:
- contract checks before signing or approval
- invoice checks for payment-processing reconciliation
- request-message checks before replying or sharing files
- image-note checks before acting on tasks

Local files:
${sampleText}`;
}

function renderMarkdown(evidence) {
  const lines = [
    "# QVAC SDK Probe",
    "",
    `Generated: ${evidence.generated_at}`,
    `Status: ${evidence.status}`,
    `SDK declared: ${evidence.sdk_declared}`,
    `Lockfile present: ${evidence.lockfile.present}`,
    `Node modules SDK present: ${evidence.sdk_install.present}`,
    `Import OK: ${evidence.import.ok}`,
    `Model run attempted: ${evidence.model_run.attempted}`,
    `Model run OK: ${evidence.model_run.ok}`,
    "",
    "## Notes",
    "",
    ...evidence.notes.map((note) => `- ${note}`)
  ];

  if (evidence.import.error) {
    lines.push("", "## Import Error", "", "```json", JSON.stringify(evidence.import.error, null, 2), "```");
  }

  if (evidence.model_run.error) {
    lines.push("", "## Model Run Error", "", "```json", JSON.stringify(evidence.model_run.error, null, 2), "```");
  }

  if (evidence.model_run.text) {
    lines.push("", "## Model Output", "", evidence.model_run.text.trim());
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });

  const packageJsonPath = path.join(projectDir, "package.json");
  const packageLockPath = path.join(projectDir, "package-lock.json");
  const sdkPackagePath = path.join(projectDir, "node_modules", "@qvac", "sdk", "package.json");
  const sdkTarballPath = path.join(projectDir, "..", "research", "qvac-sdk-0.13.5.tgz");
  const packageJson = await readJson(packageJsonPath);
  const lockPresent = await fileExists(packageLockPath);
  const sdkPackagePresent = await fileExists(sdkPackagePath);
  const sdkTarballPresent = await fileExists(sdkTarballPath);

  const evidence = {
    schema: "qvac_private_briefcase.sdk_probe.v1",
    generated_at: generatedAt,
    status: "not_started",
    sdk_declared: packageJson.dependencies?.["@qvac/sdk"] || null,
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    },
    lockfile: {
      present: lockPresent,
      path: "package-lock.json"
    },
    sdk_install: {
      present: sdkPackagePresent,
      version: null,
      package_path: "node_modules/@qvac/sdk/package.json"
    },
    sdk_tarball: {
      present: sdkTarballPresent,
      path: "../research/qvac-sdk-0.13.5.tgz",
      sha256: sdkTarballPresent ? await sha256File(sdkTarballPath) : null
    },
    import: {
      ok: false,
      checked_exports: {},
      export_count: 0,
      error: null
    },
    model_run: {
      attempted: shouldLoadModel,
      ok: false,
      model_constant: "LLAMA_3_2_1B_INST_Q4_0",
      progress_events: [],
      text: "",
      error: null
    },
    input_samples: await readSamples(),
    notes: []
  };

  if (sdkPackagePresent) {
    const sdkPackage = await readJson(sdkPackagePath);
    evidence.sdk_install.version = sdkPackage.version || null;
  } else {
    evidence.notes.push("node_modules/@qvac/sdk is not present. Full npm install did not complete in this workspace.");
  }

  try {
    const sdk = await import("@qvac/sdk");
    const exports = Object.keys(sdk).sort();
    evidence.import.ok = true;
    evidence.import.export_count = exports.length;
    evidence.import.checked_exports = {
      loadModel: typeof sdk.loadModel === "function",
      completion: typeof sdk.completion === "function",
      unloadModel: typeof sdk.unloadModel === "function",
      LLAMA_3_2_1B_INST_Q4_0: Boolean(sdk.LLAMA_3_2_1B_INST_Q4_0)
    };
    evidence.notes.push("QVAC SDK import succeeded.");

    if (shouldLoadModel) {
      if (!evidence.import.checked_exports.LLAMA_3_2_1B_INST_Q4_0) {
        throw new Error("Required model constant LLAMA_3_2_1B_INST_Q4_0 is not exported by the installed SDK.");
      }

      const modelId = await sdk.loadModel({
        modelSrc: sdk.LLAMA_3_2_1B_INST_Q4_0,
        modelType: "llm",
        onProgress: (progress) => {
          evidence.model_run.progress_events.push(progress);
        }
      });

      try {
        const history = [{ role: "user", content: buildBeforeYouActPrompt(evidence.input_samples) }];
        const result = sdk.completion({ modelId, history, stream: true });
        let text = "";
        for await (const token of result.tokenStream) {
          text += token;
        }
        evidence.model_run.text = text;
        evidence.model_run.ok = true;
        evidence.notes.push("QVAC model load and local completion succeeded.");
      } finally {
        await sdk.unloadModel({ modelId });
      }
    } else {
      evidence.notes.push("Set QVAC_LOAD_MODEL=1 to attempt model download/load and local completion.");
    }
  } catch (error) {
    const compact = compactError(error);
    if (shouldLoadModel && evidence.import.ok) {
      evidence.model_run.error = compact;
      evidence.notes.push("QVAC SDK imported, but model download/load/completion failed.");
    } else {
      evidence.import.error = compact;
      evidence.notes.push("QVAC SDK import failed. This usually means npm install did not complete.");
    }
  }

  if (evidence.model_run.ok) {
    evidence.status = "qvac_model_run_verified";
  } else if (evidence.import.ok) {
    evidence.status = "qvac_import_verified_model_not_run";
  } else if (lockPresent && evidence.sdk_declared) {
    evidence.status = "qvac_dependency_locked_install_incomplete";
  } else {
    evidence.status = "qvac_dependency_missing";
  }

  await fs.writeFile(path.join(outputDir, "qvac_sdk_probe.json"), JSON.stringify(evidence, null, 2), "utf8");
  await fs.writeFile(path.join(outputDir, "qvac_sdk_probe.md"), renderMarkdown(evidence), "utf8");

  console.log(`QVAC SDK probe: ${evidence.status}`);
  if (requireImport && !evidence.import.ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
