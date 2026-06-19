"use strict";

const fs = require("fs");
const path = require("path");
const { auditFixture } = require("./qvac_edge_evidence_auditor");

const fixturePath = path.join(__dirname, "evidence_fixture.json");
const outputPath = path.join(__dirname, "output", "evidence_audit_result.json");

const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8").replace(/^\uFEFF/, ""));
const result = auditFixture(fixture);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2) + "\n", "utf8");

const stageSummary = result.verification_stages
  .map((stage) => `stage${stage.stage}:${stage.status}`)
  .join(" ");

console.log(`QVAC mock evidence audit complete: ${result.readiness}`);
console.log(stageSummary);
console.log(`wrote ${path.relative(process.cwd(), outputPath)}`);

if (result.readiness !== "needs_more_evidence") {
  console.error("Expected mock prototype to remain needs_more_evidence until real QVAC proof exists.");
  process.exit(1);
}
