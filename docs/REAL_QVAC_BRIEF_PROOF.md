# Real QVAC Brief Proof

Checked: 2026-06-19 JST
Status: `real_qvac_brief_verified`

## Command

```powershell
cd private_briefcase_prototype
$env:NODE_OPTIONS="--use-system-ca"
npm run qvac:brief
```

## Result

The originating local workspace generated a real QVAC Before You Act brief from the four local sample files:

- `samples/contract_excerpt.txt`
- `samples/invoice_note.txt`
- `samples/request_message.txt`
- `samples/image_memo_ocr.txt`

The run used:

- SDK: `@qvac/sdk@0.13.5`
- Model: `LLAMA_3_2_1B_INST_Q4_0`
- Engine: `llamacpp-completion`
- Expected model size: `773025824` bytes
- Model checksum: `66bfbb2d48bdb77cd56bd03ef820deff3c4a74b1a09de3b917ae13e72c1a70c2`

Generated artifacts in the originating workspace:

- `output/qvac_private_briefcase_real_brief.md`
- `output/qvac_private_briefcase_real_brief.json`

## Output Shape

The real QVAC output contains:

- contract checks
- invoice payment-processing checks
- request-message checks
- image-note checks
- next actions
- privacy note

## Boundary

This document is a public proof note. The generated local artifacts are produced by running `npm run qvac:brief` after installing the SDK and caching the model.
