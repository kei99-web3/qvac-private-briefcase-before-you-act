# Real QVAC Proof Runner

Status: real_qvac_brief_runner_verified

## Goal

Keep the user-facing UI mock honest while providing a real `@qvac/sdk` proof runner that generates a Before You Act brief from local sample files.

## Implemented Interface

`private_briefcase_prototype/run_qvac_private_briefcase.mjs` produces:

- generated timestamp
- `real_qvac_brief_verified` status
- `@qvac/sdk` adapter name
- `LLAMA_3_2_1B_INST_Q4_0` model id
- four local input hashes
- model run status
- QVAC-generated JSON brief

## Reproduction Steps

1. `@qvac/sdk@^0.13.5` is declared and locked in `private_briefcase_prototype/package-lock.json`.
2. Run `npm install` inside `private_briefcase_prototype/` with `NODE_OPTIONS=--use-system-ca`.
3. Keep the `bare-zlib@1.3.1` override unless `bare-zlib@1.4.0` tarball fetches are known to be stable in the target environment.
4. Run `npm run qvac:probe` to verify SDK import and exported APIs.
5. Run `QVAC_LOAD_MODEL=1 npm run qvac:probe` or the PowerShell equivalent to verify the smallest local model completion.
6. Run `npm run qvac:brief` to generate a real Before You Act brief.
7. Rerun after model cache with network disabled or blocked as practical.

## Evidence To Save

- `npm install` transcript
- `package-lock.json`
- `npm ls --depth=0`
- model/cache metadata
- QVAC inference transcript
- generated `qvac_private_briefcase_real_brief.md`
- generated `qvac_private_briefcase_real_brief.json`
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

The remaining blocker is not the core QVAC proof. The real model proof and real brief artifact exist. The remaining external gate is manual DoraHacks readback and final user approval before submission.
