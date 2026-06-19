# Real QVAC Adapter Plan

Status: sdk_model_run_verified_adapter_pending

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
2. Run `npm install` inside `private_briefcase_prototype/` with `NODE_OPTIONS=--use-system-ca`.
3. Keep the `bare-zlib@1.3.1` override unless `bare-zlib@1.4.0` tarball fetches are known to be stable in the target environment.
4. Run `npm run qvac:probe` to verify SDK import and exported APIs.
5. Run `QVAC_LOAD_MODEL=1 npm run qvac:probe` or the PowerShell equivalent to attempt the smallest local model completion.
6. Rerun after model cache with network disabled or blocked as practical.
7. Write real runtime logs into `output/evidence_bundle/qvac_runtime_logs/`.

## Evidence To Save

- `npm install` transcript
- `package-lock.json`
- `npm ls --depth=0`
- model/cache metadata
- QVAC inference transcript
- QVAC logging stream transcript
- offline rerun transcript
- final no-cloud scan output

## Current Status

User approval has been granted for dependency installation and model proof.

The install/import blocker has been resolved for the originating workspace:

- npm needed `NODE_OPTIONS=--use-system-ca` to avoid `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.
- `bare-zlib@1.4.0` tarball fetches repeatedly failed with `ECONNRESET`.
- `bare-zlib@1.3.1` fetched successfully.
- npm `overrides` pins both `@qvac/sdk` and `@qvac/rag -> bare-fetch` paths to `bare-zlib@1.3.1`.
- `npm run qvac:probe` imported `@qvac/sdk@0.13.5` and confirmed the core exports.
- `LLAMA_3_2_1B_INST_Q4_0` downloaded, checksum-validated, loaded through `llamacpp-completion`, and completed a local prompt.
- cache rerun succeeded with HTTP/HTTPS proxy variables pointed at an invalid local proxy.
- `npm run qvac:brief` generates a real QVAC Before You Act brief artifact from the four local sample files.

The remaining blocker is final packaging: the real model proof and real brief artifact exist, but the final DoraHacks packet still needs manual readback and judge-facing evidence organization.
