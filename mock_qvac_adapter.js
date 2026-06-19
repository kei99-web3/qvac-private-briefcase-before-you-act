"use strict";

function inferEvidenceSummary(input) {
  const requirementText = (input.requirements || []).join(" ");
  const fileText = (input.files || []).map((file) => `${file.path} ${file.content}`).join(" ");
  const observationText = (input.observations || []).map((item) => item.text).join(" ");
  const joined = `${requirementText} ${fileText} ${observationText}`.toLowerCase();

  return {
    adapter: "mock_qvac_adapter",
    real_qvac_sdk: false,
    summary: "Mock inference says this project is shaped around local evidence-bundle verification, but needs real QVAC SDK proof before submission.",
    detected_themes: {
      qvac_sdk: joined.includes("@qvac/sdk") || joined.includes("qvac"),
      no_cloud: joined.includes("no-cloud") || joined.includes("no cloud") || joined.includes("offline"),
      evidence_bundle: joined.includes("evidence"),
      three_stage_verification: joined.includes("3-stage") || joined.includes("three_stage"),
      reproducibility: joined.includes("reproducibility") || joined.includes("rerun")
    },
    next_real_sdk_step: "After user approval, replace this adapter with @qvac/sdk loadModel/completion/unloadModel and capture loggingStream output."
  };
}

module.exports = { inferEvidenceSummary };
