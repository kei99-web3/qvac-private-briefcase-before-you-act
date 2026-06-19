# QVAC Private Briefcase Mock Prototype

Status: mock_with_qvac_model_run_verified
Updated: 2026-06-19 JST

## Purpose

This prototype proves the Before You Act product shape and now includes a QVAC SDK probe path.

It simulates:

- importing sensitive local files
- generating a Before You Act Brief
- switching between contract, invoice, message, and image-note modes
- rendering a responsive desktop/mobile HTML review screen
- showing source-grounded citations
- exporting a Local AI Proof Bundle

`@qvac/sdk` is declared in `package.json`, locked in `package-lock.json`, imports successfully in the originating local workspace, and has verified a real `LLAMA_3_2_1B_INST_Q4_0` model run/cache rerun.

Install note for Windows/npm:

- npm without `NODE_OPTIONS=--use-system-ca` failed with `UNABLE_TO_VERIFY_LEAF_SIGNATURE` in the originating environment.
- npm originally resolved `bare-zlib@1.4.0`, whose tarball repeatedly failed with `ECONNRESET`.
- `package.json` pins `bare-zlib` to `1.3.1` via `overrides`, which allowed `npm install` to complete.
- Installed `node_modules` size is about 4.82 GiB.

## Run

```powershell
npm test
```

or:

```powershell
node .\run_mock_private_briefcase.js
```

Run the QVAC SDK readiness probe:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npm install --maxsockets=1 --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
npm run qvac:probe
```

After `npm install`, a real model run can be repeated with:

```powershell
$env:QVAC_LOAD_MODEL="1"
npm run qvac:probe
```

## Outputs

- `output/private_briefcase_brief.md`
- `output/private_briefcase_brief.json`
- `output/private_briefcase_report.html`
- `output/mobile_preview_checklist.md`
- `output/mobile_preview_playwright_390.png` when browser verification is performed
- `output/qvac_sdk_probe.md`
- `output/qvac_sdk_probe.json`
- `output/local_ai_proof_bundle/`

## Mobile Boundary

The generated HTML is responsive and phone-review friendly. This is not a native mobile app yet; Expo/native mobile packaging, QVAC mobile runtime proof, and device testing require a separate approval gate.

## Submission Boundary

This is not final submission evidence yet. The originating workspace has local QVAC model run/cache rerun proof, but this mock prototype still needs the real QVAC adapter wired into the final Private Briefcase brief flow.
