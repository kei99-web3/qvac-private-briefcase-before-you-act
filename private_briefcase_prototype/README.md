# QVAC Private Briefcase Mock Prototype

Status: mock_with_qvac_sdk_probe
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

`@qvac/sdk` is declared in `package.json` and locked in `package-lock.json`. Full install was attempted after approval, but the local npm download failed with repeated `ECONNRESET` network errors before `node_modules/@qvac/sdk` was installed.

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
npm run qvac:probe
```

If `npm install` succeeds later, a real model run can be attempted with:

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

This is not final submission evidence yet. The mock evidence must be replaced or supplemented with a successful QVAC SDK import, local model run, and offline rerun proof once dependency download succeeds.
