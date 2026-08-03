#!/usr/bin/env node
/**
 * Comprehensive AdSense-readiness audit over dist/ (the deployed output).
 * Checks every HTML page for technical SEO, content quality, links, schema,
 * trust pages, and policy signals. Writes a structured JSON report.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative, extname } from "path";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist");
const BASE = "https://www.opportunitynest.org";

// ─── Collect HTML files ────────────────────────────────────────────
function getAllHtml(dir, results = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) getAllHtml(full, results);
    else if (extname(entry.name) === ".html") results.push(full);
  }
  return results;
}

const files = getAllHtml(DIST);
const pages = [];

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /placeholder text/i,
  /todo:/i,
  /TBD/i,
  /coming soon/i,
  /under construction/i,
  /\bXXX\b/,
  /\[insert/i,
  /your text here/i,
  /sample content/i,
  /test page/i,
  /\[content\]/i,
];

const LOW_VALUE_HEADINGS = [
  "read more", "learn more", "click here", "apply now",
];

for (const file of files) {
  const rel = relative(DIST, file).replace(/\\/g, "/");
  const html = readFileSync(file, "utf8");
  const text = stripTags(html);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const desc = descMatch ? descMatch[1] : "";
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : "";
  const robotsMatch = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i);
  const robots = robotsMatch ? robotsMatch[1] : "";
  const ogUrlMatch = html.match(/<meta\s+property="og:url"\s+content="([^"]*)"/i);
  const ogUrl = ogUrlMatch ? ogUrlMatch[1] : "";
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? stripTags(h1Match[1]) : "";

  const schemaScripts = html.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
  const schemaTypes = [];
  for (const s of schemaScripts) {
    const types = s.match(/"@type"\s*:\s*"([^"]+)"/g) || [];
    for (const t of types) schemaTypes.push(t.replace('"@type":"', "").replace('"', ""));
  }

  const jsonLdBlocks = [];
  for (const s of schemaScripts) {
    const m = s.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    jsonLdBlocks.push(m);
  }

  // Word count excluding footer/nav (approximate main-content word count)
  let mainText = text;
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
  if (mainMatch) mainText = stripTags(mainMatch[0]);
  const mainWords = mainText.split(/\s+/).filter(Boolean).length;

  const placeholders = [];
  for (const p of PLACEHOLDER_PATTERNS) {
    if (p.test(text)) placeholders.push(p.source);
  }

  // Links
  const linkHrefs = [...html.matchAll(/<a\s+[^>]*href="([^"]+)"/gi)].map((m) => m[1]);
  const internalLinks = linkHrefs.filter((h) => h.startsWith("/") || h.startsWith(BASE));
  const externalLinks = linkHrefs.filter((h) => /^https?:\/\//i.test(h) && !h.startsWith(BASE));
  const brokenAnchorLinks = linkHrefs.filter((h) => h === "#" || h === "");

  pages.push({
    path: rel,
    url: file === join(DIST, "index.html") ? BASE + "/" : BASE + "/" + rel.replace(/\\/g, "/").replace(/index\.html$/, "").replace(/\.html$/, "").replace(/\/$/, "") + (file === join(DIST, "index.html") || rel.endsWith("index.html") ? "/" : "/"),
    title,
    desc,
    descLength: desc.length,
    canonical,
    robots,
    ogUrl,
    h1,
    wordCount,
    mainWords,
    schemaTypes: [...new Set(schemaTypes)],
    hasJsonLd: schemaScripts.length > 0,
    placeholders,
    internalLinks,
    externalLinks,
    brokenAnchorLinks,
    sizeBytes: statSync(file).size,
  });
}

// ─── Analysis helpers ──────────────────────────────────────────────
const issues = [];
function add(severity, cat, path, desc, why, fix) {
  issues.push({ severity, category: cat, path, description: desc, whyAdSense: why, fix });
}

// Title/description duplication map
const titleCount = {};
const descCount = {};
for (const p of pages) {
  if (p.title) titleCount[p.title] = (titleCount[p.title] || 0) + 1;
  if (p.desc) descCount[p.desc] = (descCount[p.desc] || 0) + 1;
}

// Internal target set — every file in dist (HTML + static assets)
const internalTargets = new Set();
function getAllFiles(dir, results = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) getAllFiles(full, results);
    else results.push(full);
  }
  return results;
}
for (const f of getAllFiles(DIST)) {
  const r = relative(DIST, f).replace(/\\/g, "/");
  internalTargets.add(BASE + "/" + r);
  internalTargets.add(BASE + "/" + r.replace(/\/index\.html$/, "/"));
  internalTargets.add(BASE + "/" + r.replace(/\/index\.html$/, ""));
}
internalTargets.add(BASE + "/");
for (const p of pages) {
  internalTargets.add(p.url);
  internalTargets.add(BASE + "/" + p.path);
}

// Category listing vs article pages
function isListing(path) {
  return /\/index\.html$/.test(path) && !path.startsWith("opportunity/") && !path.startsWith("blog/") && !path.startsWith("guides/");
}

for (const p of pages) {
  const isHome = p.path === "index.html";
  const isListingPage = isListing(p.path);
  const isArticle = p.path.startsWith("opportunity/") || p.path.startsWith("blog/") || p.path.startsWith("guides/");
  const isStatic = !isListingPage && !isArticle && !isHome;

  // Technical issues
  if (!p.title) add("Critical", "Technical", p.path, "Missing <title> tag", "Pages without titles are treated as low-quality and may not be indexed.", "Add a unique descriptive title.");
  else if (titleCount[p.title] > 1) add("High", "Duplicate", p.path, `Duplicate title tag (used ${titleCount[p.title]}x): "${p.title}"`, "Duplicate titles create duplicate-content signals and confuse users in SERPs.", "Make each title unique.");
  if (p.title.length > 70) add("Low", "Technical", p.path, `Title too long (${p.title.length} chars)`, "Titles get truncated in SERPs, reducing CTR and trust.", "Keep titles under ~60-65 chars.");
  if (!p.desc) add("Critical", "Technical", p.path, "Missing meta description", "No description means Google auto-generates a snippet, weakening CTR.", "Add a unique 120-160 char description.");
  else if (p.desc.length < 50) add("Medium", "Technical", p.path, `Meta description too short (${p.desc.length} chars)`, "Thin descriptions give Google little to work with.", "Expand description to 120-160 chars.");
  else if (p.desc.length > 165) add("Low", "Technical", p.path, `Meta description too long (${p.desc.length} chars)`, "Descriptions get cut off in SERPs.", "Trim to ~160 chars.");
  if (descCount[p.desc] > 1) add("High", "Duplicate", p.path, `Duplicate meta description (used ${descCount[p.desc]}x)`, "Duplicate descriptions waste crawl budget and signal thin content.", "Write unique descriptions.");
  if (!p.canonical) add("High", "Technical", p.path, "Missing canonical tag", "Without a canonical, Google may pick a duplicate URL variant.", "Add self-referencing canonical.");
  else if (p.canonical !== p.url) add("High", "Technical", p.path, `Canonical mismatch: points to ${p.canonical} but page URL is ${p.url}`, "Conflicting canonical/serving URL confuses indexing.", "Align canonical with the final URL.");
  if (!p.ogUrl) add("Low", "Technical", p.path, "Missing og:url", "Weakens social sharing consistency.", "Add og:url matching canonical.");
  else if (p.ogUrl !== p.canonical && p.ogUrl !== p.url) add("Low", "Technical", p.path, `og:url (${p.ogUrl}) differs from canonical (${p.canonical})`, "Inconsistent URL declarations.", "Align og:url with canonical.");
  if (p.robots && /noindex/i.test(p.robots)) add("Info", "Indexability", p.path, `Page is noindex (${p.robots})`, "Noindex pages won't appear in Google — confirm this is intentional.", "Remove noindex if the page should be indexed.");
  if (!p.robots) add("Info", "Technical", p.path, "No explicit robots meta (defaults to index,follow)", "Not a violation, but explicit is better.", "Optionally add <meta name='robots' content='index,follow'>.");
  if (!p.hasJsonLd) add("Low", "Schema", p.path, "No structured data (JSON-LD)", "Structured data improves eligibility for rich results and AI visibility.", "Add appropriate schema (Article/BreadcrumbList/FAQ/Organization).");

  // Content quality
  if (isArticle && p.mainWords < 800) add("High", "Content", p.path, `Article is thin: ~${p.mainWords} words in main content`, "AdSense reviewers flag articles under ~800 words as low-value/thin content.", "Expand with eligibility, benefits, application steps, FAQ.");
  else if (isListingPage && p.mainWords < 200) add("Medium", "Content", p.path, `Listing page has little intro text (~${p.mainWords} words)`, "Pure link-list pages are considered thin/low-value.", "Add 200-400 words of unique editorial intro.");
  if (p.placeholders.length) add("Critical", "Policy", p.path, `Placeholder/low-value text detected: ${p.placeholders.join(", ")}`, "Placeholder text is an explicit AdSense low-value-content violation.", "Replace with real content.");
  if (!p.h1) add("High", "Content", p.path, "Missing H1 heading", "No H1 hurts topical clarity and user scanability.", "Add a single descriptive H1.");
  if (p.h1 && (p.h1.length < 10)) add("Low", "Content", p.path, `H1 is very short: "${p.h1}"`, "Weak heading does not convey page value.", "Write a descriptive H1.");
  if (p.h1 && p.title && p.h1 !== p.title.replace(/\s*\|\s*OpportunityNest.*$/i, "").trim() && !p.title.includes(p.h1)) add("Info", "Content", p.path, `H1 and title differ`, "Not a violation, but consistency helps.", "Optionally align H1 with title keywords.");

  // Links
  if (p.brokenAnchorLinks.length) add("High", "Links", p.path, `${p.brokenAnchorLinks.length} empty/hash links (# or "")`, "Broken links create navigation problems and wasted crawl budget.", "Remove or retarget them.");
  for (const link of p.internalLinks) {
    if (link.startsWith("/")) {
      const abs = BASE + link;
      if (!internalTargets.has(abs) && !abs.endsWith("/index.html") && !internalTargets.has(abs.replace(/\/$/, "") + "/")) {
        add("High", "Links", p.path, `Broken internal link: ${link}`, "404 links degrade UX and crawl efficiency.", "Fix or redirect the target.");
      }
    }
  }
}

// Supabase keys / secrets scan
const secretPatterns = [/service_role\b/i, /service_role_key/i, /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/];
const exposedSecrets = [];
for (const file of files) {
  const rel = relative(DIST, file).replace(/\\/g, "/");
  if (/\.(js|json)$/.test(rel) || /\.html$/.test(rel)) {
    const content = readFileSync(file, "utf8");
    for (const pat of secretPatterns) {
      if (pat.test(content)) exposedSecrets.push({ path: rel, pattern: pat.source });
    }
  }
}

// Trust page presence
const trustPages = {
  about: false, contact: false, privacy: false, terms: false, disclaimer: false,
  "editorial-policy": false, "fact-checking-policy": false, "verification-process": false, "cookie-policy": false,
};
for (const p of pages) {
  const base = p.path.replace(/\.html$/, "").split("/")[0];
  if (trustPages[base] !== undefined) trustPages[base] = true;
}

const report = {
  generatedAt: new Date().toISOString(),
  totalPages: pages.length,
  trustPages,
  exposedSecrets,
  issues,
  issuesBySeverity: { Critical: issues.filter(i=>i.severity==="Critical").length, High: issues.filter(i=>i.severity==="High").length, Medium: issues.filter(i=>i.severity==="Medium").length, Low: issues.filter(i=>i.severity==="Low").length, Info: issues.filter(i=>i.severity==="Info").length },
};

writeFileSync(join(ROOT, "reports", "adsense-audit.json"), JSON.stringify(report, null, 2));
console.log(`Pages scanned: ${pages.length}`);
console.log(`Issues: Critical=${report.issuesBySeverity.Critical} High=${report.issuesBySeverity.High} Medium=${report.issuesBySeverity.Medium} Low=${report.issuesBySeverity.Low} Info=${report.issuesBySeverity.Info}`);
console.log(`Trust pages present: ${Object.entries(trustPages).filter(([k,v])=>v).map(([k])=>k).join(", ") || "NONE"}`);
console.log(`Exposed secrets: ${exposedSecrets.length}`);
