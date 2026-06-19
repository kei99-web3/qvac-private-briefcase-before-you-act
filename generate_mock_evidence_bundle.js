"use strict";

const fs = require("fs");
const path = require("path");
const { auditFixture } = require("./qvac_edge_evidence_auditor");

const fixturePath = path.join(__dirname, "evidence_fixture.json");
const bundleDir = path.join(__dirname, "output", "evidence_bundle");

function readFixture() {
  return JSON.parse(fs.readFileSync(fixturePath, "utf8").replace(/^\uFEFF/, ""));
}

function writeJson(relativePath, value) {
  const outputPath = path.join(bundleDir, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function writeText(relativePath, value) {
  const outputPath = path.join(bundleDir, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, value, "utf8");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMarkdownSummary(audit) {
  const stages = audit.verification_stages
    .map((stage) => `| ${stage.stage} | ${stage.name} | ${stage.status} |`)
    .join("\n");
  const gaps = audit.blocking_gaps.map((gap) => `- ${gap}`).join("\n");

  return `# QVAC Edge Evidence Auditor Mock Evidence Bundle

Status: ${audit.readiness}
Generated: ${audit.generated_at}

This is a mock-only local evidence bundle. It proves the bundle shape, scanner behavior, and submission narrative, but it is not final QVAC SDK evidence.

## Verification Stages

| Stage | Name | Status |
| --- | --- | --- |
${stages}

## Blocking Gaps

${gaps}

## Next Required Proof

Replace the mock adapter with real @qvac/sdk inference, capture QVAC logs, cache a model, rerun offline, and update this bundle with real runtime evidence.
`;
}

function renderHtmlReport(audit) {
  const stageRows = audit.verification_stages
    .map((stage) => `<tr><td>${stage.stage}</td><td>${escapeHtml(stage.name)}</td><td>${escapeHtml(stage.status)}</td></tr>`)
    .join("");
  const gapItems = audit.blocking_gaps.map((gap) => `<li>${escapeHtml(gap)}</li>`).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QVAC Edge Evidence Auditor Mock Bundle</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; line-height: 1.5; color: #16202a; }
    main { max-width: 920px; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #cfd8e3; padding: 10px; text-align: left; }
    th { background: #eef3f8; }
    .status { display: inline-block; padding: 4px 8px; border: 1px solid #c47f00; background: #fff5dd; }
    code { background: #eef3f8; padding: 2px 4px; }
  </style>
</head>
<body>
<main>
  <h1>QVAC Edge Evidence Auditor Mock Bundle</h1>
  <p>Status: <span class="status">${escapeHtml(audit.readiness)}</span></p>
  <p>This local bundle is generated without cloud calls or dependencies. It remains mock-only until real <code>@qvac/sdk</code> proof is captured.</p>
  <h2>Verification Stages</h2>
  <table>
    <thead><tr><th>Stage</th><th>Name</th><th>Status</th></tr></thead>
    <tbody>${stageRows}</tbody>
  </table>
  <h2>Blocking Gaps</h2>
  <ul>${gapItems}</ul>
</main>
</body>
</html>
`;
}

function buildManifest(audit) {
  return {
    schema_version: "qvac_edge_evidence_bundle.mock.v1",
    generated_at: audit.generated_at,
    project: audit.project,
    readiness: audit.readiness,
    artifact_status: "mock_only_not_submission_ready",
    artifacts: [
      "manifest.json",
      "submission_summary.md",
      "stage_1_eligibility.json",
      "stage_2_local_reproducibility.json",
      "stage_3_judge_review.json",
      "no_cloud_scan.json",
      "qvac_sdk_gap.md",
      "report.html"
    ]
  };
}

function main() {
  const fixture = readFixture();
  const audit = auditFixture(fixture);
  const stageByNumber = new Map(audit.verification_stages.map((stage) => [stage.stage, stage]));

  fs.mkdirSync(bundleDir, { recursive: true });
  writeJson("manifest.json", buildManifest(audit));
  writeJson("stage_1_eligibility.json", stageByNumber.get(1));
  writeJson("stage_2_local_reproducibility.json", stageByNumber.get(2));
  writeJson("stage_3_judge_review.json", stageByNumber.get(3));
  writeJson("no_cloud_scan.json", audit.no_cloud_scan);
  writeText("submission_summary.md", renderMarkdownSummary(audit));
  writeText(
    "qvac_sdk_gap.md",
    "# Real QVAC SDK Proof Gap\n\nThis mock bundle intentionally does not include real @qvac/sdk inference. User approval is required before SDK installation, model download, runtime logs, and offline rerun evidence are captured.\n"
  );
  writeText("report.html", renderHtmlReport(audit));

  console.log(`QVAC mock evidence bundle generated: ${path.relative(process.cwd(), bundleDir)}`);
  console.log(`readiness: ${audit.readiness}`);

  if (audit.readiness !== "needs_more_evidence") {
    console.error("Expected mock bundle to remain needs_more_evidence until real QVAC proof exists.");
    process.exit(1);
  }
}

main();
