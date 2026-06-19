# Evidence Bundle Specification

Status: local_spec_until_official_readback
Updated: 2026-06-17 JST

## Goal

The evidence bundle should let a judge answer four questions quickly:

1. Does this project use QVAC for AI workloads?
2. Does it run on-device without cloud dependencies?
3. Can another reviewer reproduce the local run?
4. Is the proof organized enough for the hackathon's 3-stage verification process?

## Bundle Tree

```text
evidence_bundle/
  manifest.json
  submission_summary.md
  stage_1_eligibility.json
  stage_2_local_reproducibility.json
  stage_3_judge_review.json
  no_cloud_scan.json
  hardware_runtime.json
  qvac_runtime_logs/
    install_summary.txt
    inference_run.txt
    offline_rerun.txt
    qvac_logging_stream.txt
  screenshots/
  report.html
```

The mock prototype currently generates a reduced version of this tree. The real QVAC proof should fill `hardware_runtime.json` and `qvac_runtime_logs/`.

## Stage 1: Eligibility And Theme Fit

Purpose: prove the submission matches QVAC Hackathon I.

Expected evidence:

- project name and track
- license
- public repo URL after approval
- QVAC SDK usage location
- no-cloud architecture summary
- source URL/date notes

## Stage 2: Local Reproducibility And No-Cloud Run

Purpose: prove the project runs locally and can be reproduced.

Expected evidence:

- OS, Node, npm, GPU, Vulkan/runtime notes
- `@qvac/sdk` version and lockfile
- model/cache metadata
- install command transcript
- local inference command transcript
- offline rerun transcript
- no-cloud static scan output

## Stage 3: Judge-Readable Evidence Review

Purpose: make the proof easy to inspect.

Expected evidence:

- concise summary
- pass/fail table
- known gaps
- screenshots/video manifest
- final submission checklist

## Known Uncertainty

The exact DoraHacks "3-stage verification" wording still requires logged-in browser readback. Until that is done, these stage names are a practical internal mapping, not a quote of the official process.
