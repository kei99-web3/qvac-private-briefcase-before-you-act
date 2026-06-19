# Real QVAC Adapter Plan

Status: dependency_locked_install_incomplete

## Goal

Replace `mock_qvac_adapter.js` with a real QVAC adapter while keeping the audit output shape stable.

## Intended Interface

The real adapter should produce the same fields as the mock adapter:

- `adapter`
- `real_qvac_sdk`
- `summary`
- `detected_themes`
- `next_real_sdk_step`

Additional real fields should include:

- `qvac_sdk_version`
- `model_source`
- `model_cache_path_or_hash`
- `local_inference_prompt`
- `local_inference_output_excerpt`
- `qvac_logging_stream_excerpt`
- `offline_rerun_status`

## Minimal Implementation Steps

1. `@qvac/sdk@^0.13.5` is declared and locked in `private_briefcase_prototype/package-lock.json`.
2. Run `npm install` inside `private_briefcase_prototype/` once npm registry downloads are stable.
3. Run `npm run qvac:probe` to verify SDK import and exported APIs.
4. Run `QVAC_LOAD_MODEL=1 npm run qvac:probe` or the PowerShell equivalent to attempt the smallest local model completion.
5. Rerun after model cache with network disabled or blocked as practical.
6. Write real runtime logs into `output/evidence_bundle/qvac_runtime_logs/`.

## Evidence To Save

- `npm install` transcript
- `package-lock.json`
- `npm ls --depth=0`
- model/cache metadata
- QVAC inference transcript
- QVAC logging stream transcript
- offline rerun transcript
- final no-cloud scan output

## Current Blocker

User approval has been granted for dependency installation and model proof, but local npm downloads repeatedly failed with `ECONNRESET` before `node_modules/@qvac/sdk` could be installed. `npm install --package-lock-only` succeeded, and `npm audit --package-lock-only --omit=dev --json` reported zero vulnerabilities for the locked production dependency graph.
