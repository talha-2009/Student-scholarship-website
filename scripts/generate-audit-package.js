const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const AUDIT = path.join(ROOT, "audit");
const OUT = path.join(ROOT, "adsense-audit-output");
const mode = process.argv.includes("--baseline") ? "baseline" : "final";

function latestAdSenseAudit() {
  const files = fs.readdirSync(OUT)
    .filter((name) => /^adsense-audit-\d+\.json$/.test(name))
    .map((name) => ({ name, time: fs.statSync(path.join(OUT, name)).mtimeMs }))
    .sort((a, b) => b.time - a.time);
  if (!files.length) throw new Error("No adsense-audit-*.json file found.");
  return JSON.parse(fs.readFileSync(path.join(OUT, files[0].name), "utf8"));
}

function readJson(file, fallback) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}

function table(rows, headers) {
  if (!rows.length) return "_None._";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${headers.map((h) => String(row[h] ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ")).join(" | ")} |`)
  ].join("\n");
}

function priority(issue) {
  if (issue.category === "Links" || /Missing canonical/i.test(issue.description)) return "P0";
  if (issue.category === "Content" && /thin/i.test(issue.description)) return "P1";
  if (issue.category === "Duplicate" || issue.category === "Technical") return "P2";
  return "P3";
}

function thinType(page) {
  if (page.type === "Listing") return "T6";
  if (page.type === "Opportunity detail") return "T1";
  if (page.type === "Blog index") return "T3";
  if (page.type === "Guide") return "T1";
  if (page.type === "Utility") return "T7";
  return "T1";
}

function rootCause(issue) {
  if (issue.category === "Links") return "Internal link points to a route that is not represented by a static file or known audit route.";
  if (/Missing canonical/i.test(issue.description)) return "Template page relies on runtime URL handling instead of a static canonical.";
  if (/thin/i.test(issue.description)) return "Page has useful intent but not enough distinct visible main-content value for an indexable article-style page.";
  return "Needs manual review.";
}

function proposedFix(issue) {
  if (issue.category === "Links") return "Update the link to the canonical destination or teach the audit about an intentional Vercel rewrite if it is a false positive.";
  if (/Missing canonical/i.test(issue.description)) return "Add a canonical or mark the runtime template as non-indexable if it should not be directly indexed.";
  if (/thin/i.test(issue.description)) return "Improve with specific student-useful sections, examples, steps, internal links, and truthful source notes; avoid filler.";
  return issue.fix;
}

fs.mkdirSync(AUDIT, { recursive: true });
fs.mkdirSync(path.join(AUDIT, mode), { recursive: true });

const audit = latestAdSenseAudit();
const inventory = readJson(path.join(OUT, "adsense-page-inventory.json"), {});
const linkAudit = readJson(path.join(ROOT, "scripts", "link-audit-report.json"), { brokenLinks: [] });
const high = audit.issues.filter((issue) => issue.severity === "High");
const thinPages = inventory.thinPages || [];
const duplicateTitles = inventory.duplicateTitles || [];
const duplicateDescriptions = inventory.duplicateDescriptions || [];
const missingMetadata = inventory.missingMetadata || [];
const readiness = inventory.readiness ?? 0;

const highRows = high.map((issue) => ({
  Priority: priority(issue),
  File: issue.path,
  Problem: issue.description,
  Severity: issue.severity,
  RootCause: rootCause(issue),
  ProposedFix: proposedFix(issue),
  Components: issue.path.startsWith("guides/") ? "Guide content" : issue.path.startsWith("opportunity/") ? "Opportunity page" : "Static page/build",
  DB: "No",
  Verification: "Run npm.cmd run build, node scripts/adsense-audit.js, and inspect the generated page."
}));

const thinRows = thinPages.map((page) => ({
  URL: page.url || page.rel,
  Type: thinType(page),
  Value: page.type,
  Words: page.words,
  UniqueInfo: page.hasOfficial ? "Has source/application context" : "Needs stronger original context",
  DuplicateRisk: page.duplicateRisk || "metadata checked",
  Action: page.type === "Utility" ? "Noindex or remove from indexable inventory if no user value" : "Improve with useful, page-specific editorial content",
  Target: page.type === "Opportunity detail" ? "Quick facts, eligibility, funding, application steps, deadline notes, official source, related links" : "Clear intro, practical sections, examples, internal links, FAQ only when useful"
}));

const report = {
  generatedAt: new Date().toISOString(),
  mode,
  readiness,
  pagesScanned: audit.totalPages,
  criticalIssues: audit.issuesBySeverity?.Critical ?? 0,
  highSeverity: high.length,
  mediumSeverity: audit.issuesBySeverity?.Medium ?? 0,
  lowSeverity: audit.issuesBySeverity?.Low ?? 0,
  infoIssues: audit.issuesBySeverity?.Info ?? 0,
  brokenLinks: linkAudit.brokenLinks?.length ?? 0,
  thinRiskPages: thinPages.length,
  duplicateTitleGroups: duplicateTitles.length,
  duplicateMetaDescriptionGroups: duplicateDescriptions.length,
  missingMetadata: missingMetadata.length,
  trustPages: audit.trustPages,
  exposedSecrets: audit.exposedSecrets?.length ?? 0,
  highSeverityItems: highRows,
  brokenLinkFindings: linkAudit.brokenLinks || [],
  thinPages: thinRows,
  duplicateTitles,
  duplicateDescriptions,
  metadataFindings: missingMetadata,
  sitemapFindings: "Generated by npm.cmd run build; detailed URL-level validation still required.",
  robotsFindings: "robots.txt present; important content/assets should remain crawlable.",
  schemaFindings: audit.issues.filter((issue) => issue.category === "Schema")
};

const md = `# OpportunityNest ${mode === "baseline" ? "Baseline" : "Final"} Audit Report

Generated: ${report.generatedAt}

## Executive Summary

| Metric | Value |
| --- | ---: |
| Pages scanned | ${report.pagesScanned} |
| Critical issues | ${report.criticalIssues} |
| High severity issues | ${report.highSeverity} |
| Broken-link findings | ${report.brokenLinks} |
| Thin-risk pages | ${report.thinRiskPages} |
| Duplicate title groups | ${report.duplicateTitleGroups} |
| Duplicate meta-description groups | ${report.duplicateMetaDescriptionGroups} |
| Missing metadata findings | ${report.missingMetadata} |
| Exposed secrets | ${report.exposedSecrets} |
| Readiness score | ${report.readiness}/100 |

This is an audit snapshot, not an AdSense approval guarantee.

## High-Severity Items

${table(highRows, ["Priority", "File", "Problem", "Severity", "RootCause", "ProposedFix", "Components", "DB", "Verification"])}

## Broken Links

${table((linkAudit.brokenLinks || []).map((item) => ({ File: item.file, Href: item.href, Target: item.resolvedPath })), ["File", "Href", "Target"])}

## Thin-Risk Pages

${table(thinRows, ["URL", "Type", "Value", "Words", "UniqueInfo", "DuplicateRisk", "Action", "Target"])}

## Duplicate URL / Metadata Findings

- Duplicate title groups: ${report.duplicateTitleGroups}
- Duplicate meta-description groups: ${report.duplicateMetaDescriptionGroups}
- Missing metadata findings: ${report.missingMetadata}

## Sitemap / Robots / Schema

- Sitemap: ${report.sitemapFindings}
- Robots: ${report.robotsFindings}
- Schema findings: ${report.schemaFindings.length}

## AdSense Reapplication Decision

REAPPLICATION: NOT READY

REMAINING BLOCKERS:
- High-severity thin-content issues remain until the listed guide/opportunity pages are improved.
- Broken-link findings require investigation, including distinguishing real obsolete routes from audit false positives.
- Thin-risk pages require page-by-page classification and useful editorial improvements.
`;

fs.writeFileSync(path.join(AUDIT, `${mode}-report.json`), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(AUDIT, `${mode}-report.md`), md);
fs.writeFileSync(path.join(AUDIT, mode, "report.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(AUDIT, mode, "report.md"), md);

const highPlan = `# High-Severity Plan

${table(highRows, ["Priority", "File", "Problem", "Severity", "RootCause", "ProposedFix", "Components", "DB", "Verification"])}
`;
fs.writeFileSync(path.join(AUDIT, "high-severity-plan.md"), highPlan);

const thinPlan = `# Thin Content Plan

Classification key: T1 useful but underdeveloped, T2 duplicate/near-duplicate, T3 generated wrapper, T4 filter/search page, T5 expired opportunity, T6 category/country needing editorial content, T7 technical/no-value page.

${table(thinRows, ["URL", "Type", "Value", "Words", "UniqueInfo", "DuplicateRisk", "Action", "Target"])}
`;
fs.writeFileSync(path.join(AUDIT, "thin-content-plan.md"), thinPlan);

console.log(`${mode} report written to ${path.join(AUDIT, `${mode}-report.md`)}`);
