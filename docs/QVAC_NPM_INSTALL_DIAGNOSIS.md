# QVAC SDK npm Install Diagnosis

Checked: 2026-06-19 JST
Status: `install_import_resolved_model_verified`

## Conclusion

The QVAC SDK install path is verified for the originating Windows workspace.

The observed failure was not a general `@qvac/sdk` availability issue. Two local/npm-path issues were found:

1. npm failed TLS verification unless Node used the Windows system CA store.
2. npm resolved `bare-zlib@1.4.0`, but that specific tarball repeatedly failed with `ECONNRESET` in this environment.

The working install path is:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
npm install --ignore-scripts --no-audit --no-fund --maxsockets=1 --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
npm run qvac:probe
```

`package.json` pins `bare-zlib` to `1.3.1` via `overrides`, which makes the dependency graph installable and lets the SDK import probe pass.

## Evidence Summary

- Node: `v24.15.0`
- npm: `11.12.1`
- npm registry: `https://registry.npmjs.org/`
- `npm ping` failed by default with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.
- `NODE_OPTIONS=--use-system-ca npm ping` succeeded.
- `npm pack bare-zlib@1.4.0` repeatedly failed with `ECONNRESET`.
- `npm pack bare-zlib@1.3.1` succeeded.
- Full install succeeded after the system-CA setting and `bare-zlib@1.3.1` override.
- `npm run qvac:probe` imported `@qvac/sdk@0.13.5`.
- `npm audit --omit=dev --json` reported zero vulnerabilities.
- Installed dependency `package.json` files contained no `preinstall`, `install`, or `postinstall` scripts in the originating workspace.
- Installed `node_modules` size was about `4.82 GiB`.

## Remaining Work

This resolves package installation and SDK import. A follow-up run also verified the smallest local model path in the originating workspace.

Follow-up model status:

- `LLAMA_3_2_1B_INST_Q4_0` downloaded and checksum-validated.
- local completion succeeded.
- cache rerun succeeded with HTTP/HTTPS proxy variables pointed at an invalid local proxy.

The project still needs final adapter integration, stricter no-cloud evidence if desired, and final evidence/demo packaging before hackathon submission.
