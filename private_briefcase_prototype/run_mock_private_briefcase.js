"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const sampleDir = path.join(rootDir, "samples");
const outputDir = path.join(rootDir, "output");
const proofDir = path.join(outputDir, "local_ai_proof_bundle");
const mockGeneratedAt = process.env.QVAC_MOCK_GENERATED_AT || "2026-06-19T00:00:00.000Z";

const sampleSpecs = [
  {
    fileName: "contract_excerpt.txt",
    mode: "contract",
    displayName: "Service agreement",
    action: "Sign or approve"
  },
  {
    fileName: "invoice_note.txt",
    mode: "invoice",
    displayName: "Invoice note",
    action: "Process payment"
  },
  {
    fileName: "request_message.txt",
    mode: "message",
    displayName: "Request message",
    action: "Reply or share"
  },
  {
    fileName: "image_memo_ocr.txt",
    mode: "image_note",
    displayName: "Image memo OCR stand-in",
    action: "Confirm tasks"
  }
];

function readSample(spec) {
  const filePath = path.join(sampleDir, spec.fileName);
  return {
    ...spec,
    path: `samples/${spec.fileName}`,
    content: fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "")
  };
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeText(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, value, "utf8");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function firstLines(sample, count = 4) {
  return sample.content.split(/\r?\n/).filter(Boolean).slice(0, count);
}

function check(label, why, evidence, status = "check") {
  return { label, why, evidence, status };
}

function buildModeBrief(sample) {
  switch (sample.mode) {
    case "contract":
      return {
        mode: sample.mode,
        display_name: sample.displayName,
        action: sample.action,
        action_question: "What should be checked before signing or approval?",
        summary: "Approval should focus on subcontractor consent, confidentiality, termination timing, and the short payment window.",
        primary_checks: [
          check("Subcontractor approval", "The provider may use subcontractors only with written client approval.", "Risk note: provider may use subcontractors only with written client approval.", "must_confirm"),
          check("Sensitive client files", "Both parties must protect client files and operational notes, so the review should remain local.", "Confidentiality: both parties must protect client files and operational notes.", "privacy"),
          check("Short termination notice", "Three days may be too short for operational handoff planning.", "Termination: either party may terminate with 3 days notice.", "review"),
          check("Payment timing", "Net 7 after invoice receipt affects cash timing and approval workflow.", "Payment due: Net 7 after invoice receipt", "process")
        ],
        next_action: "Confirm subcontractor need and client-file handling before approving the agreement."
      };
    case "invoice":
      return {
        mode: sample.mode,
        display_name: sample.displayName,
        action: sample.action,
        action_question: "What should be prepared before payment processing?",
        summary: "The invoice mode prepares reconciliation fields and payment-processing checks rather than making a generic danger judgment.",
        primary_checks: [
          check("Amount and due date", "The payment queue needs a clean amount and deadline.", "Amount: 2,450 USD / Due date: 2026-06-26", "process"),
          check("Invoice identifier", "The invoice ID should be captured for accounting and duplicate prevention.", "Invoice ID: INV-2026-0619-QVAC", "process"),
          check("Payment detail change", "Bank-detail changes should be verified through a trusted non-email channel before processing.", "Change warning: vendor asks to update bank details by email before payment.", "must_confirm"),
          check("Approval owner", "The right internal owner should approve the payment before scheduling.", "Approval owner: operations lead", "process")
        ],
        next_action: "Prepare the payment record, then verify the bank-detail change by a trusted non-email channel before scheduling payment."
      };
    case "message":
      return {
        mode: sample.mode,
        display_name: sample.displayName,
        action: sample.action,
        action_question: "What should be checked before replying or sharing files?",
        summary: "The message mode catches action requests that mix approval, client roster sharing, and payment confirmation.",
        primary_checks: [
          check("Client roster sharing", "A client roster may include personal data and should not be shared without confirming the recipient and purpose.", "send the client roster", "privacy"),
          check("Subcontractor addendum", "This connects back to the contract approval condition.", "approve the subcontractor addendum today", "must_confirm"),
          check("Bank transfer confirmation", "Payment confirmation should not be forwarded into an unverified vendor thread.", "updated bank transfer confirmation to the vendor email thread", "must_confirm"),
          check("Friday summary", "The leadership summary is safe to prepare locally after sensitive fields are reviewed.", "summary by Friday for leadership", "process")
        ],
        next_action: "Verify the recipient and approval authority before sending roster or payment-related details."
      };
    case "image_note":
      return {
        mode: sample.mode,
        display_name: sample.displayName,
        action: sample.action,
        action_question: "What should be confirmed from this image note?",
        summary: "The image-note mode turns local OCR text into a short checklist without uploading the screenshot or photo.",
        primary_checks: [
          check("Subcontractor clause", "The whiteboard repeats the contract approval dependency.", "Review subcontractor approval clause.", "review"),
          check("Payment details channel", "The memo says phone verification is preferred over email.", "Confirm payment details by phone, not email.", "must_confirm"),
          check("No cloud AI upload", "The note explicitly blocks cloud AI upload for client files.", "Do not upload client files to cloud AI tools.", "privacy"),
          check("Approval summary", "The Friday approval summary can be prepared from local-only context.", "Prepare summary for Friday approval.", "process")
        ],
        next_action: "Create the Friday approval summary locally and keep the client-file material out of cloud AI tools."
      };
    default:
      throw new Error(`Unsupported mode: ${sample.mode}`);
  }
}

function buildMockBrief(samples) {
  const modeBriefs = samples.map(buildModeBrief);

  return {
    schema_version: "qvac_private_briefcase.before_you_act.mock.v2",
    generated_at: mockGeneratedAt,
    app: "QVAC Private Briefcase: Before You Act",
    adapter: "mock_before_you_act_ui_with_real_qvac_artifact",
    real_qvac_sdk: false,
    qvac_sdk_status: "real_model_run_cache_rerun_and_real_brief_verified_separately",
    supported_surfaces: ["desktop_web", "mobile_web"],
    user_question: "What should I check before I act on this?",
    summary: "Before You Act turns sensitive local files into action-specific checks for signing, approval, payment processing, replies, and file sharing.",
    mode_briefs: modeBriefs,
    citations: samples.map((sample) => ({
      mode: sample.mode,
      source: sample.path,
      sha256: sha256(sample.content),
      excerpt: firstLines(sample).join(" / ")
    })),
    mobile_preview: {
      viewport: "single-column, touch-friendly HTML",
      primary_use_case: "phone review before replying, approving, or processing a payment",
      no_cloud_posture: "mock uses Node built-ins only; real QVAC model proof is captured separately"
    },
    readiness: "ready_for_user_review",
    blocking_gaps: [
      "Mobile-native packaging is not implemented yet; current output is responsive mobile web.",
      "OCR/transcription/RAG path still needs QVAC implementation.",
      "DoraHacks logged-in rule/form readback is still pending.",
      "Demo video recording depends on the final DoraHacks form requirements."
    ]
  };
}

function renderMarkdown(brief) {
  const sections = brief.mode_briefs.map((modeBrief) => {
    const checks = modeBrief.primary_checks
      .map((item) => `- [${item.status}] ${item.label}: ${item.why} (${item.evidence})`)
      .join("\n");
    return `## ${modeBrief.display_name} / ${modeBrief.action}

${modeBrief.summary}

### Before You Act Checks

${checks}

### Next Action

${modeBrief.next_action}
`;
  }).join("\n");

  const citations = brief.citations.map((item) => `- ${item.source}: ${item.sha256}`).join("\n");

  return `# ${brief.app} Mock Brief

Status: ${brief.readiness}
Generated: ${brief.generated_at}
Surface: desktop and mobile web mock

## User Question

${brief.user_question}

## Local Brief

${brief.summary}

${sections}

## Source Hashes

${citations}

## Honesty Note

This is a mock UI prototype. It proves the Before You Act product shape for desktop and smartphone review; real QVAC SDK evidence is generated separately by \`npm run qvac:probe\` and \`npm run qvac:brief\`.
`;
}

function statusLabel(status) {
  const labels = {
    must_confirm: "Confirm",
    privacy: "Privacy",
    review: "Review",
    process: "Process",
    check: "Check"
  };
  return labels[status] || status;
}

function renderHtml(brief) {
  const fileTabs = brief.mode_briefs.map((modeBrief, index) => `
    <a class="file-tab ${index === 0 ? "active" : ""}" href="#${escapeHtml(modeBrief.mode)}">
      <span>${escapeHtml(modeBrief.display_name)}</span>
      <small>${escapeHtml(modeBrief.action)}</small>
    </a>`).join("");

  const briefSections = brief.mode_briefs.map((modeBrief) => {
    const checks = modeBrief.primary_checks.map((item) => `
      <li>
        <span class="pill ${escapeHtml(item.status)}">${escapeHtml(statusLabel(item.status))}</span>
        <div>
          <strong>${escapeHtml(item.label)}</strong>
          <p>${escapeHtml(item.why)}</p>
          <cite>${escapeHtml(item.evidence)}</cite>
        </div>
      </li>`).join("");

    return `
      <section class="brief-card" id="${escapeHtml(modeBrief.mode)}">
        <div class="brief-head">
          <p class="eyebrow">${escapeHtml(modeBrief.action)}</p>
          <h2>${escapeHtml(modeBrief.display_name)}</h2>
        </div>
        <p class="summary">${escapeHtml(modeBrief.summary)}</p>
        <h3>Before You Act Checks</h3>
        <ul class="check-list">${checks}</ul>
        <div class="next-action">
          <strong>Next safe action</strong>
          <p>${escapeHtml(modeBrief.next_action)}</p>
        </div>
      </section>`;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(brief.app)} Mock</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #16202a;
      --muted: #60707f;
      --line: #d8e0e8;
      --bg: #f5f7f9;
      --panel: #ffffff;
      --teal: #00756f;
      --blue: #2e5aac;
      --amber: #9a6200;
      --rose: #a23a47;
      --green: #21724f;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Arial, "Segoe UI", sans-serif;
      color: var(--ink);
      background: var(--bg);
      line-height: 1.6;
      overflow-x: hidden;
    }
    header {
      background: #11242f;
      color: #fff;
      padding: 24px 18px;
    }
    header h1 {
      margin: 0 0 8px;
      font-size: clamp(26px, 8vw, 44px);
      line-height: 1.08;
      letter-spacing: 0;
      overflow-wrap: anywhere;
      width: 100%;
      max-width: 100%;
    }
    header p { margin: 0; color: #d9e7ef; width: 100%; max-width: 780px; overflow-wrap: anywhere; }
    main {
      width: min(1180px, 100%);
      margin: 0 auto;
      padding: 16px;
    }
    .app-shell {
      display: grid;
      grid-template-columns: minmax(240px, 320px) 1fr;
      gap: 16px;
      align-items: start;
    }
    nav, .brief-card, .proof-panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
    }
    nav {
      position: sticky;
      top: 12px;
      overflow: hidden;
    }
    .nav-title {
      padding: 14px 14px 8px;
      border-bottom: 1px solid var(--line);
    }
    .nav-title strong { display: block; }
    .nav-title span { color: var(--muted); font-size: 13px; }
    .file-tab {
      display: block;
      padding: 13px 14px;
      border-bottom: 1px solid var(--line);
      color: var(--ink);
      text-decoration: none;
    }
    .file-tab:last-child { border-bottom: 0; }
    .file-tab.active { background: #edf7f5; border-left: 4px solid var(--teal); padding-left: 10px; }
    .file-tab span { display: block; font-weight: 700; }
    .file-tab small { color: var(--muted); }
    .brief-stack { display: grid; gap: 16px; }
    .brief-card { padding: 18px; scroll-margin-top: 16px; }
    .brief-head { display: flex; justify-content: space-between; gap: 12px; align-items: start; border-bottom: 1px solid var(--line); padding-bottom: 10px; }
    h2 { margin: 0; font-size: 22px; }
    h3 { margin: 18px 0 8px; font-size: 15px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }
    .eyebrow { margin: 0; color: var(--teal); font-weight: 700; font-size: 13px; }
    .summary { font-size: 17px; }
    .check-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 10px;
    }
    .check-list li {
      display: grid;
      grid-template-columns: 92px 1fr;
      gap: 10px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      background: #fbfcfd;
    }
    .check-list strong { display: block; margin-bottom: 3px; }
    .check-list p { margin: 0 0 4px; color: #33414f; }
    cite { display: block; color: var(--muted); font-style: normal; font-size: 13px; }
    .pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 30px;
      border-radius: 999px;
      border: 1px solid var(--line);
      font-size: 12px;
      font-weight: 700;
      align-self: start;
    }
    .must_confirm { color: var(--rose); background: #fff0f2; border-color: #f1c4cb; }
    .privacy { color: var(--blue); background: #eef4ff; border-color: #cbd9fa; }
    .review { color: var(--amber); background: #fff7e6; border-color: #ead4a7; }
    .process { color: var(--green); background: #edf8f2; border-color: #c7e4d5; }
    .next-action {
      margin-top: 14px;
      border-left: 4px solid var(--teal);
      background: #eef8f6;
      padding: 12px 14px;
      border-radius: 6px;
    }
    .next-action p { margin: 4px 0 0; }
    .proof-panel { padding: 16px; margin-top: 16px; }
    .proof-panel code { background: #eef2f5; border: 1px solid #d7e0ea; border-radius: 5px; padding: 1px 5px; }
    .mobile-action {
      display: none;
      position: sticky;
      bottom: 0;
      margin: 18px 0 0;
      padding: 10px 16px;
      background: rgba(245, 247, 249, .94);
      border-top: 1px solid var(--line);
      backdrop-filter: blur(8px);
    }
    .mobile-action a {
      display: block;
      text-align: center;
      background: var(--teal);
      color: #fff;
      padding: 12px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
    }
    @media (max-width: 760px) {
      header { padding: 20px 16px; }
      header h1 { font-size: 30px; }
      main { padding: 12px; }
      .app-shell { grid-template-columns: 1fr; }
      nav { position: static; }
      .brief-head { display: block; }
      h2, .file-tab span, .check-list strong, cite { overflow-wrap: anywhere; }
      .check-list li { grid-template-columns: 1fr; }
      .pill { width: max-content; padding: 4px 10px; border-radius: 6px; }
      .mobile-action { display: block; }
    }
  </style>
</head>
<body>
<header>
  <h1>QVAC Private Briefcase:<br>Before You Act</h1>
  <p>${escapeHtml(brief.summary)} This mock is designed for both desktop review and smartphone review before acting.</p>
</header>
<main>
  <div class="app-shell">
    <nav aria-label="Local files">
      <div class="nav-title">
        <strong>Local files</strong>
        <span>${escapeHtml(brief.readiness)} / UI mock + real QVAC proof</span>
      </div>
${fileTabs}
    </nav>
    <div>
      <div class="brief-stack">${briefSections}</div>
      <section class="proof-panel">
        <h2>Local AI Proof Bundle</h2>
        <p>This UI mock run writes input hashes, output hashes, stage files, and a reproducibility note. Real QVAC model proof and a real Before You Act brief artifact now exist separately through <code>npm run qvac:probe</code> and <code>npm run qvac:brief</code>.</p>
        <p><strong>Mobile posture:</strong> responsive web mock now; native/mobile QVAC packaging remains an approval-gated next step.</p>
      </section>
      <div class="mobile-action"><a href="#contract">Back to first file</a></div>
    </div>
  </div>
</main>
</body>
</html>
`;
}

function renderMobilePreviewChecklist(brief) {
  return `# Mobile Preview Checklist

Status: ${brief.readiness}
Generated: ${brief.generated_at}

This mock is now shaped for smartphone review as well as desktop review.

## Smartphone Use Case

- Open the generated \`private_briefcase_report.html\` on a phone-sized viewport.
- Review one local file at a time.
- Use the Before You Act checks before replying, signing, approving, sharing, or processing payment.
- Export the Local AI Proof Bundle after the review.

## Current Boundary

- This is responsive mobile web, not a native mobile app.
- Desktop \`@qvac/sdk\` install, model download, and cache rerun proof exist in the originating workspace.
- Expo build, app store package, and real device deployment have not been performed.
- Do not claim Mobile track without real mobile/device QVAC proof.
`;
}

function buildProofBundle(samples, brief) {
  const inputManifest = samples.map((sample) => ({
    path: sample.path,
    mode: sample.mode,
    sha256: sha256(sample.content),
    bytes: Buffer.byteLength(sample.content, "utf8")
  }));

  const outputText = JSON.stringify(brief, null, 2);

  return {
    manifest: {
      schema_version: "qvac_private_briefcase_proof.mock.v2",
      generated_at: brief.generated_at,
      app: brief.app,
      artifact_status: "mock_only_not_submission_ready",
      supported_surfaces: brief.supported_surfaces,
      qvac_sdk_status: "model_run_verified_separate_artifact",
      input_manifest: inputManifest,
      output_sha256: sha256(outputText),
      readiness: brief.readiness
    },
    stage1: {
      stage: 1,
      name: "Eligibility and source verification",
      status: "pass_mock",
      evidence: ["App theme uses local Before You Act document review.", "Real @qvac/sdk model proof is captured in qvac probe and real brief artifacts."]
    },
    stage2: {
      stage: 2,
      name: "Local run and no-cloud posture",
      status: "pass_mock",
      evidence: ["Mock run uses Node built-ins only.", "No external network calls are made by this prototype.", "Generated HTML is responsive for desktop and smartphone review."]
    },
    stage3: {
      stage: 3,
      name: "Judge-readable proof bundle",
      status: "pass_mock",
      evidence: ["Manifest, input hashes, mode briefs, mobile preview notes, and reproducibility note are generated."]
    }
  };
}

function main() {
  const samples = sampleSpecs.map(readSample);
  const brief = buildMockBrief(samples);
  const proof = buildProofBundle(samples, brief);

  writeJson(path.join(outputDir, "private_briefcase_brief.json"), brief);
  writeText(path.join(outputDir, "private_briefcase_brief.md"), renderMarkdown(brief));
  writeText(path.join(outputDir, "private_briefcase_report.html"), renderHtml(brief));
  writeText(path.join(outputDir, "mobile_preview_checklist.md"), renderMobilePreviewChecklist(brief));
  writeJson(path.join(proofDir, "manifest.json"), proof.manifest);
  writeJson(path.join(proofDir, "stage_1_eligibility.json"), proof.stage1);
  writeJson(path.join(proofDir, "stage_2_local_run.json"), proof.stage2);
  writeJson(path.join(proofDir, "stage_3_judge_review.json"), proof.stage3);

  const requiredModes = new Set(sampleSpecs.map((spec) => spec.mode));
  const actualModes = new Set(brief.mode_briefs.map((modeBrief) => modeBrief.mode));
  for (const mode of requiredModes) {
    if (!actualModes.has(mode)) {
      console.error(`Missing Before You Act mode: ${mode}`);
      process.exit(1);
    }
  }

  if (/invoice\s+suspicious|suspicious\s+invoice/i.test(JSON.stringify(brief))) {
    console.error("Invoice mode must stay framed as reconciliation and payment-processing preparation.");
    process.exit(1);
  }

  console.log(`QVAC Private Briefcase mock complete: ${brief.readiness}`);
  console.log(`wrote ${path.relative(process.cwd(), outputDir)}`);

  if (brief.readiness !== "ready_for_user_review") {
    console.error("Private Briefcase prototype must remain ready_for_user_review until DoraHacks readback and final approval are complete.");
    process.exit(1);
  }
}

main();
