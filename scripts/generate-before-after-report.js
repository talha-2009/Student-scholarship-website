const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AUDIT = path.join(ROOT, "audit");

function read(name) {
  return JSON.parse(fs.readFileSync(path.join(AUDIT, name), "utf8"));
}

const before = read("baseline-report.json");
const after = read("final-report.json");

const rows = [
  ["Pages scanned", before.pagesScanned, after.pagesScanned],
  ["Critical issues", before.criticalIssues, after.criticalIssues],
  ["High severity", before.highSeverity, after.highSeverity],
  ["Broken links", before.brokenLinks, after.brokenLinks],
  ["Thin-risk pages", before.thinRiskPages, after.thinRiskPages],
  ["Duplicate title groups", before.duplicateTitleGroups, after.duplicateTitleGroups],
  ["Duplicate meta-description groups", before.duplicateMetaDescriptionGroups, after.duplicateMetaDescriptionGroups],
  ["Missing metadata findings", before.missingMetadata, after.missingMetadata],
  ["Exposed secrets", before.exposedSecrets, after.exposedSecrets],
  ["Readiness", before.readiness, after.readiness]
];

const table = [
  "| Metric | Before | After |",
  "| --- | ---: | ---: |",
  ...rows.map(([metric, b, a]) => `| ${metric} | ${b} | ${a} |`)
].join("\n");

const md = `# Before / After Audit

${table}

## Interpretation

The current pre-push work preserved build/test health and generated the required audit artifacts, but it did not resolve the major content/link blockers yet. AdSense reapplication should wait until the high-severity thin-content items, broken-link findings, and thin-risk pages are addressed at the root cause.

REAPPLICATION: NOT READY
`;

fs.writeFileSync(path.join(AUDIT, "before-after.md"), md);
console.log(`Wrote ${path.join(AUDIT, "before-after.md")}`);
