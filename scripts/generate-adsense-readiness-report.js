const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const REPORTS = path.join(ROOT, "adsense-audit-output");
const BASE = "https://www.opportunitynest.org";

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

function textOnly(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function match(html, re) {
  return html.match(re)?.[1]?.trim() || "";
}

function pageType(rel) {
  if (rel === "index.html") return "Homepage";
  if (rel.startsWith("opportunity/")) return "Opportunity detail";
  if (rel.startsWith("blog/")) return rel === "blog/index.html" ? "Blog index" : "Blog article";
  if (rel.startsWith("guides/")) return "Guide";
  if (/^(about|contact|privacy|terms|disclaimer|editorial-policy|fact-checking-policy|verification-process|cookie-policy|faq)\.html$/.test(rel)) return "Trust";
  if (rel.endsWith("/index.html")) return "Listing";
  return "Utility";
}

function urlFor(rel) {
  if (rel === "index.html") return `${BASE}/`;
  return `${BASE}/${rel.replace(/\\/g, "/").replace(/index\.html$/, "").replace(/\.html$/, ".html")}`;
}

const pages = walk(DIST).map((file) => {
  const rel = path.relative(DIST, file).replace(/\\/g, "/");
  const html = fs.readFileSync(file, "utf8");
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] || html;
  const words = textOnly(main).split(/\s+/).filter(Boolean).length;
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((m) => m[1]);
  const externalLinks = links.filter((href) => /^https?:\/\//i.test(href) && !href.startsWith(BASE));
  const internalLinks = links.filter((href) => href.startsWith("/") || href.startsWith(BASE));
  const title = match(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const desc = match(html, /<meta\s+name=["']description["']\s+content=["']([^"']*)/i);
  const h1 = textOnly(match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i));
  const canonical = match(html, /<link\s+rel=["']canonical["']\s+href=["']([^"']+)/i);
  const robots = match(html, /<meta\s+name=["']robots["']\s+content=["']([^"']+)/i);
  const type = pageType(rel);
  const hasOfficial = /official source|official website|visit official|apply now/i.test(html);
  const hasVerified = /last verified|last reviewed|verified/i.test(html);
  const hasRelated = /related (scholarships|internships|fellowships|opportunities)|you may also like/i.test(html);
  const expiredRisk = /\b(deadline|apply by)[^<]{0,80}(2024|2025|January|February|March|April|May|June|July) [0-9]{1,2}, 2026/i.test(textOnly(main));
  const originalScore = Math.max(1, Math.min(5, Math.round(words / 350) + (hasOfficial ? 1 : 0) + (hasRelated ? 1 : 0)));
  let classification = "A";
  if (type === "Opportunity detail" && (!hasOfficial || !hasVerified || words < 800)) classification = "C";
  if (type === "Listing" && words < 250) classification = "C";
  if (!title || !desc || !h1 || !canonical) classification = "B";
  if (/noindex/i.test(robots)) classification = "F";
  if (expiredRisk) classification = classification === "A" ? "B" : classification;
  return {
    rel, url: urlFor(rel), type, words, h1, title, desc, canonical, robots: robots || "index, follow",
    internalLinks: internalLinks.length, externalLinks: externalLinks.length, originalScore,
    thinRisk: words < (type === "Listing" ? 250 : 800), duplicateRisk: "checked below",
    brokenLinkRisk: "see link audit", adsenseValue: Math.max(15, Math.min(100, originalScore * 18 + (hasOfficial ? 5 : 0) + (hasVerified ? 5 : 0))),
    classification, hasOfficial, hasVerified, hasRelated, expiredRisk
  };
});

const byTitle = new Map();
const byDesc = new Map();
for (const p of pages) {
  if (p.title) byTitle.set(p.title, [...(byTitle.get(p.title) || []), p.rel]);
  if (p.desc) byDesc.set(p.desc, [...(byDesc.get(p.desc) || []), p.rel]);
}
const duplicateTitles = [...byTitle.entries()].filter(([, v]) => v.length > 1);
const duplicateDescriptions = [...byDesc.entries()].filter(([, v]) => v.length > 1);
const thinPages = pages.filter((p) => p.thinRisk).sort((a, b) => a.words - b.words);
const weakOpportunityPages = pages.filter((p) => p.type === "Opportunity detail" && (!p.hasOfficial || !p.hasVerified || !p.hasRelated || p.words < 800));
const expiredRisks = pages.filter((p) => p.expiredRisk);
const missingMetadata = pages.filter((p) => !p.title || !p.desc || !p.h1 || !p.canonical);
const trustSlugs = ["about.html", "contact.html", "privacy.html", "terms.html", "disclaimer.html", "editorial-policy.html", "fact-checking-policy.html", "verification-process.html"];
const missingTrustPages = trustSlugs.filter((slug) => !pages.some((p) => p.rel === slug));
const linkAuditPath = path.join(ROOT, "scripts", "link-audit-report.json");
const linkAudit = fs.existsSync(linkAuditPath) ? JSON.parse(fs.readFileSync(linkAuditPath, "utf8")) : null;
const brokenLinks = linkAudit?.brokenLinks || [];
const readiness = Math.max(1, Math.round(100 - Math.min(35, brokenLinks.length / 5) - Math.min(25, thinPages.length / 8) - Math.min(20, weakOpportunityPages.length / 5) - Math.min(10, duplicateTitles.length + duplicateDescriptions.length) - missingTrustPages.length * 2));

function table(rows, headers, limit = rows.length) {
  const body = rows.slice(0, limit).map((row) => `| ${headers.map((h) => String(row[h] ?? "").replace(/\|/g, "\\|")).join(" | ")} |`);
  return [`| ${headers.join(" | ")} |`, `| ${headers.map(() => "---").join(" | ")} |`, ...body].join("\n");
}

const summaryRows = pages.map((p) => ({
  URL: p.url, Type: p.type, Words: p.words, H1: p.h1, Title: p.title, Canonical: p.canonical,
  Indexability: p.robots, Internal: p.internalLinks, External: p.externalLinks,
  Original: p.originalScore, Thin: p.thinRisk ? "Yes" : "No", Duplicate: "metadata checked",
  Broken: "see audit", Score: p.adsenseValue, Action: p.classification
}));

const md = `# OpportunityNest AdSense Readiness Audit

Generated: ${new Date().toISOString()}

## Executive Summary

- Pages audited: ${pages.length}
- Broken internal links reported by local static audit: ${brokenLinks.length}
- Thin-content risk pages: ${thinPages.length}
- Weak opportunity pages: ${weakOpportunityPages.length}
- Duplicate title groups: ${duplicateTitles.length}
- Duplicate meta-description groups: ${duplicateDescriptions.length}
- Missing trust pages: ${missingTrustPages.length ? missingTrustPages.join(", ") : "None"}
- AdSense readiness score: ${readiness}/100

This score is a practical readiness estimate, not a guarantee of AdSense approval.

## Page Inventory

${table(summaryRows, ["URL", "Type", "Words", "H1", "Title", "Canonical", "Indexability", "Internal", "External", "Original", "Thin", "Duplicate", "Broken", "Score", "Action"], 80)}

## Thin Pages

${table(thinPages.map((p) => ({ Page: p.rel, Type: p.type, Words: p.words, Action: "Improve, consolidate, noindex, or redirect based on user value" })), ["Page", "Type", "Words", "Action"], 100)}

## Duplicate Pages

### Duplicate Titles
${duplicateTitles.length ? duplicateTitles.map(([title, files]) => `- ${title}: ${files.join(", ")}`).join("\n") : "No duplicate title groups found."}

### Duplicate Meta Descriptions
${duplicateDescriptions.length ? duplicateDescriptions.map(([desc, files]) => `- ${desc}: ${files.join(", ")}`).join("\n") : "No duplicate meta-description groups found."}

## Broken Links

${table(brokenLinks.map((b) => ({ File: b.file, Href: b.href, Target: b.resolvedPath })), ["File", "Href", "Target"], 120)}

## Expired Opportunity Risks

${expiredRisks.length ? table(expiredRisks.map((p) => ({ Page: p.rel, Action: "Verify current cycle, mark expired, update, or noindex" })), ["Page", "Action"]) : "No obvious expired-date risks detected by static text scan."}

## Missing Metadata

${missingMetadata.length ? table(missingMetadata.map((p) => ({ Page: p.rel, Missing: [!p.title && "title", !p.desc && "description", !p.h1 && "h1", !p.canonical && "canonical"].filter(Boolean).join(", ") })), ["Page", "Missing"]) : "No missing title, description, H1, or canonical detected."}

## Missing Trust Pages

${missingTrustPages.length ? missingTrustPages.map((p) => `- ${p}`).join("\n") : "All required trust pages exist: About, Contact, Privacy, Terms, Disclaimer, Editorial Policy, Fact Checking Policy, Verification Process."}

## Weak Opportunity Pages

${weakOpportunityPages.length ? table(weakOpportunityPages.map((p) => ({ Page: p.rel, Words: p.words, Official: p.hasOfficial ? "Yes" : "No", Verified: p.hasVerified ? "Yes" : "No", Related: p.hasRelated ? "Yes" : "No" })), ["Page", "Words", "Official", "Verified", "Related"], 120) : "No weak opportunity pages detected by the static criteria."}

## Blog Articles Needing Improvement

${table(pages.filter((p) => p.type === "Blog article").map((p) => ({ Page: p.rel, Words: p.words, Action: p.words < 1200 ? "Strengthen as original guide" : "Keep and maintain" })), ["Page", "Words", "Action"])}

## Internal Linking Recommendations

- Keep pillar pages linked to cluster guides: Pakistani scholarships, scholarships without IELTS, application checklist, SOP, CV, degree-level scholarships, and country guides.
- Add contextual links from every high-impression blog post to 3-6 relevant opportunity pages.
- Ensure opportunity pages include related scholarships, related internships/fellowships where relevant, a country page, and one application guide.
- Avoid exact-match anchors everywhere; use natural descriptive anchors.

## Technical SEO Problems

- Fix or account for static-audit broken links caused by slash URLs for .html pages.
- Keep canonical URLs aligned with the deployed Vercel rewrites.
- Continue checking one clear H1, unique titles, unique descriptions, sitemap, robots.txt, and structured data after each build.
- External application-link verification requires network access and should be repeated before AdSense re-review.

## Prioritized Implementation Plan

1. P0: Fix trust/navigation broken links, broken apply buttons, intrusive or nonessential ad scripts, and report-error pathways.
2. P1: Improve or noindex thin listing/detail pages that do not help students.
3. P2: Standardize opportunity detail pages with official source, last verified, funding interpretation, eligibility, application steps, deadline notes, tips, and related links.
4. P3: Keep upgrading the Pakistani fully funded scholarships article as the flagship pillar and link it to cluster pages.
5. P4: Add contextual related links to articles, listing pages, and opportunity pages.
6. P5: Re-run sitemap, canonical, robots, metadata, and structured-data checks.
7. P6: Run mobile UX/performance QA and remove any persistent loading states or intrusive ad placements.
`;

fs.mkdirSync(REPORTS, { recursive: true });
fs.writeFileSync(path.join(REPORTS, "adsense-readiness-audit.md"), md, "utf8");
fs.writeFileSync(path.join(REPORTS, "adsense-page-inventory.json"), JSON.stringify({ generatedAt: new Date().toISOString(), readiness, pages, thinPages, duplicateTitles, duplicateDescriptions, brokenLinks, expiredRisks, missingMetadata, missingTrustPages, weakOpportunityPages }, null, 2));
console.log(`Readiness score: ${readiness}/100`);
console.log(`Wrote ${path.join(REPORTS, "adsense-readiness-audit.md")}`);
