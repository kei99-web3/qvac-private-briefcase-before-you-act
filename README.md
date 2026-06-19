# QVAC Private Briefcase: Before You Act

Offline AI for sensitive documents before signing, approving, processing payment, replying, or sharing.

## Problem

Cloud AI is useful, but not every file belongs in the cloud.

QVAC Private Briefcase is designed for contracts, invoices, request messages, image notes, and other files that should stay on the user's machine.

## What It Does

- Reads local sample files.
- Produces a Before You Act Brief.
- Shows source-grounded review points.
- Treats contracts as sign/approval checks, invoices as payment-processing reconciliation, and messages as reply/share checks.
- Exports a Local AI Proof Bundle.
- Keeps status honest until real QVAC SDK model proof exists.

## Current Prototype

The active prototype is in:

```text
private_briefcase_prototype/
```

Run:

```powershell
cd private_briefcase_prototype
npm test
```

The prototype also includes a QVAC SDK readiness probe:

```powershell
npm run qvac:probe
```

`@qvac/sdk` is declared and locked in `private_briefcase_prototype/package-lock.json`. A full local install was attempted, but npm downloads failed with repeated `ECONNRESET` network errors before runtime import could be verified on this machine. The probe writes an honest status file under `private_briefcase_prototype/output/`.

## Mobile Preview

The generated report is responsive for smartphone-width review. Local Playwright verification at 390px found no horizontal overflow:

- `docs/mobile_preview_playwright_390.png`
- `docs/mobile_preview_playwright_metrics.json`

## Final QVAC Plan

The final hackathon version should use `@qvac/sdk` for local inference and, if stable, local OCR/RAG.

Evidence to capture:

- QVAC SDK version and runtime logs
- model/cache metadata
- local inference output
- offline rerun proof
- no-cloud scan
- input and output hashes

## License

Apache-2.0.
