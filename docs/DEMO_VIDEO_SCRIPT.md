# Demo Video Script

Status: script_ready_video_not_recorded
Updated: 2026-06-19 JST
Target length: 60-90 seconds

## Title

QVAC Private Briefcase: Before You Act

## One-Line Pitch

A local AI briefcase for sensitive files: contracts, invoices, request messages, and image notes are checked on the user's own PC before signing, approving, processing payment, replying, or sharing.

## Narration Script

0-10s:

> Sensitive work often happens right before an action: sign this contract, process this invoice, reply to this message, or share this file. But those files may contain private terms, payment details, or personal data that should not be sent to a cloud AI service.

10-25s:

> QVAC Private Briefcase is an offline-first assistant for that moment. The user opens local files and asks one practical question: what should I check before I act?

25-45s:

> The prototype supports contract, invoice, request-message, and image-note review. For contracts it highlights personal data, confidentiality, liability, renewal, and payment terms. For invoices it focuses on payment processing fields: amount, tax, due date, invoice ID, payee details, and contract or purchase-order references.

45-65s:

> The demo includes a real QVAC SDK proof path. `@qvac/sdk` is installed locally, the LLAMA 3.2 1B quantized model runs on-device, and the app generates a real Before You Act brief from local sample files.

65-80s:

> The project also exports a Local AI Proof Bundle for judges: hashes, runtime evidence, no-cloud source scan, model/cache metadata, and three-stage-style verification notes.

80-90s:

> The result is a privacy-preserving AI app for everyday sensitive decisions, built for local PC use and shaped for smartphone-style review.

## Shot List

1. Show the public repo README and title.
2. Show the generated `private_briefcase_report.html` desktop view.
3. Show the mobile-width preview screenshot.
4. Show contract/invoice/request/image-note sections.
5. Show terminal output for `npm run qvac:brief`.
6. Show `qvac_private_briefcase_real_brief.md`.
7. Show no-cloud scan and proof-bundle files.
8. End on the project name and repository URL.

## Boundary

The script and shot list are ready. The video itself is not included in this repository because the final DoraHacks form may specify duration, upload/link requirements, or whether a video is mandatory.
