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
- Keeps status honest while real adapter integration and final evidence packaging are still pending.

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
$env:NODE_OPTIONS="--use-system-ca"
npm install --maxsockets=1 --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
npm run qvac:probe
```

`@qvac/sdk` is declared and locked in `private_briefcase_prototype/package-lock.json`. In the originating Windows workspace, npm needed `NODE_OPTIONS=--use-system-ca`, and `bare-zlib` had to be pinned to `1.3.1` via `overrides` because `bare-zlib@1.4.0` tarball fetches repeatedly failed with `ECONNRESET`. With that setup, install completed and `npm run qvac:probe` verified the SDK import and core exports. The probe writes an honest status file under `private_briefcase_prototype/output/`.

See `docs/QVAC_NPM_INSTALL_DIAGNOSIS.md` for the install diagnosis and reproduction notes.

## Mobile Preview

The generated report is responsive for smartphone-width review. Local Playwright verification at 390px found no horizontal overflow:

- `docs/mobile_preview_playwright_390.png`
- `docs/mobile_preview_playwright_metrics.json`

## Final QVAC Plan

The final hackathon version should use `@qvac/sdk` for local inference and, if stable, local OCR/RAG.

Evidence captured in the originating local workspace:

- QVAC SDK version and runtime logs
- model/cache metadata
- local inference output
- cache rerun proof with process-level HTTP/HTTPS proxy isolation

Evidence still to package or strengthen:

- stricter runtime no-cloud proof, if required
- input and output hashes

Source-level no-cloud scan:

- `docs/NO_CLOUD_SOURCE_SCAN.md`

## License

Apache-2.0.
