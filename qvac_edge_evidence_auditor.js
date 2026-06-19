"use strict";

const { inferEvidenceSummary } = require("./mock_qvac_adapter");

const REMOTE_PATTERNS = [
  /https?:\/\//i,
  /\bfetch\s*\(/i,
  /\bXMLHttpRequest\b/i,
  /\bWebSocket\b/i,
  /\bimport\s*\(/i,
  /\baxios\b/i,
  /\bopenai\b/i,
  /\banthropic\b/i,
  /\btelemetry\b/i,
  /\bsegment\b/i,
  /\bposthog\b/i
];

function scanNoCloud(files) {
  return (files || []).map((file) => {
    const content = String(file.content || "");
    if (file.kind === "scanner") {
      return {
        path: file.path,
        kind: file.kind,
        no_cloud_pass: true,
        matches: [],
        note: "scanner policy vocabulary is excluded from app dependency checks"
      };
    }
    const matches = REMOTE_PATTERNS.filter((pattern) => pattern.test(content)).map((pattern) => pattern.source);
    return {
      path: file.path,
      kind: file.kind,
      no_cloud_pass: matches.length === 0,
      matches
    };
  });
}

function buildVerificationStages(fixture, inferenceSummary, noCloudResults) {
  const requirements = new Set(fixture.requirements || []);
  const noCloudPass = noCloudResults.every((result) => result.no_cloud_pass);
  const detected = inferenceSummary.detected_themes || {};

  return [
    {
      stage: 1,
      name: "Eligibility and theme fit",
      status: detected.qvac_sdk && requirements.has("all_ai_inference_must_use_qvac_sdk") ? "pass_mock" : "fail",
      evidence: [
        "Project has an explicit qvacAdapter boundary.",
        "Real @qvac/sdk proof is still pending approval."
      ]
    },
    {
      stage: 2,
      name: "Local reproducibility and no-cloud run",
      status: noCloudPass && detected.no_cloud ? "pass_mock" : "needs_work",
      evidence: [
        `No-cloud static scan pass: ${noCloudPass}`,
        `Hardware fixture: ${fixture.hardware && fixture.hardware.gpu ? fixture.hardware.gpu : "unknown"}`
      ]
    },
    {
      stage: 3,
      name: "Judge-readable evidence bundle",
      status: detected.evidence_bundle && detected.three_stage_verification ? "pass_mock" : "needs_work",
      evidence: [
        "Bundle manifest shape exists.",
        "Official 3-stage wording still needs DoraHacks readback."
      ]
    }
  ];
}

function auditFixture(fixture) {
  const inferenceSummary = inferEvidenceSummary(fixture);
  const noCloudResults = scanNoCloud(fixture.files);
  const stages = buildVerificationStages(fixture, inferenceSummary, noCloudResults);
  const blockingGaps = [];

  if (!inferenceSummary.real_qvac_sdk) {
    blockingGaps.push("Real @qvac/sdk inference proof is missing.");
  }
  if (stages.some((stage) => stage.status === "fail")) {
    blockingGaps.push("At least one verification stage failed.");
  }
  if (noCloudResults.some((result) => !result.no_cloud_pass)) {
    blockingGaps.push("No-cloud scan found remote/network patterns.");
  }
  blockingGaps.push("Official DoraHacks 3-stage verification details need final readback.");

  return {
    schema_version: "qvac_edge_evidence_audit.mock.v1",
    generated_at: new Date().toISOString(),
    project: fixture.project,
    inference_summary: inferenceSummary,
    no_cloud_scan: noCloudResults,
    verification_stages: stages,
    readiness: blockingGaps.length === 0 ? "ready_to_submit_after_user_approval" : "needs_more_evidence",
    blocking_gaps: blockingGaps,
    approval_gates: [
      "Install @qvac/sdk",
      "Download/cache model",
      "Create or publish public GitHub repo",
      "Register or submit on DoraHacks",
      "Post to X/Discord/Keet Build in Public"
    ]
  };
}

module.exports = { auditFixture, scanNoCloud };
