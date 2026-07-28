#!/usr/bin/env node
/**
 * OpportunityNest Production Build
 * - Splits CSS into critical (inlined) + deferred (async-loaded)
 * - Minifies JS/CSS with esbuild
 * - Generates hashed filenames
 * - Updates all HTML files with critical CSS, async styles, preconnects, deferred Chatling
 * - Copies static assets to dist/
 */
import { buildSync } from "esbuild";
import { existsSync, readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync, statSync } from "fs";
import { join, relative, extname, dirname } from "path";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = dirname(__filename);
const DIST = join(ROOT, "dist");

// ─── Helpers ──────────────────────────────────────────────────────
function mkdirp(dir) { mkdirSync(dir, { recursive: true }); }
function hashContent(content) {
  return createHash("sha256").update(content).digest("hex").slice(0, 8);
}
function getAllHtmlFiles(dir, results = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !["node_modules", "dist", "scripts", ".git", ".vercel"].includes(entry.name)) {
      getAllHtmlFiles(full, results);
    } else if (entry.isFile() && extname(entry.name) === ".html") {
      results.push(full);
    }
  }
  return results;
}
function findStaticFiles(dir, results = []) {
  const exts = [".svg", ".png", ".jpg", ".jpeg", ".webp", ".avif", ".ico", ".json", ".txt", ".xml"];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !["node_modules", "dist", "scripts", ".git", ".vercel"].includes(entry.name)) {
      findStaticFiles(full, results);
    } else if (entry.isFile() && exts.includes(extname(entry.name)) && !["package.json", "package-lock.json", "vercel.json"].includes(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

// Copy service worker file specifically
function copyServiceWorker() {
  const swSrc = join(ROOT, "sw.js");
  const swDest = join(DIST, "sw.js");
  if (existsSync(swSrc)) {
    writeFileSync(swDest, readFileSync(swSrc, "utf8"), "utf8");
    console.log("  sw.js → dist/sw.js");
  }
}

// Clean dist
import { rmSync } from "fs";
rmSync(DIST, { recursive: true, force: true });
mkdirp(DIST);

// ─── Step 1: Build CSS — split into critical + deferred ──────────
console.log("Building production assets...\n");

const CRITICAL_CSS_LINES = 852;

const rawCss = readFileSync(join(ROOT, "styles.css"), "utf8");
const cssLines = rawCss.split("\n");

function findSafeCssSplitIndex(lines, preferredIndex) {
  let depth = 0;
  let lastSafeIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const char of line) {
      if (char === "{") depth++;
      if (char === "}") depth = Math.max(0, depth - 1);
    }
    if (depth === 0) {
      lastSafeIndex = i + 1;
      if (i + 1 >= preferredIndex) return i + 1;
    }
  }
  return lastSafeIndex || lines.length;
}

const cssSplitIndex = findSafeCssSplitIndex(cssLines, CRITICAL_CSS_LINES);
const criticalRaw = cssLines.slice(0, cssSplitIndex).join("\n");
const deferredRaw = cssLines.slice(cssSplitIndex).join("\n");

const cssAssetMap = {};

// Minify critical CSS
const criticalResult = buildSync({
  stdin: { contents: criticalRaw, loader: "css", resolveDir: ROOT },
  bundle: false, minify: true, write: false, sourcemap: false, legalComments: "none"
});
const criticalMin = criticalResult.outputFiles[0].text;
const criticalHash = hashContent(criticalMin);
const criticalName = `critical.${criticalHash}.min.css`;
writeFileSync(join(DIST, criticalName), criticalMin);
cssAssetMap["critical"] = { min: criticalMin, name: criticalName };

// Minify deferred CSS
const deferredResult = buildSync({
  stdin: { contents: deferredRaw, loader: "css", resolveDir: ROOT },
  bundle: false, minify: true, write: false, sourcemap: false, legalComments: "none"
});
const deferredMin = deferredResult.outputFiles[0].text;
const deferredHash = hashContent(deferredMin);
const deferredName = `styles.${deferredHash}.min.css`;
writeFileSync(join(DIST, deferredName), deferredMin);
cssAssetMap["deferred"] = { min: deferredMin, name: deferredName };

const origCssSize = statSync(join(ROOT, "styles.css")).size;
console.log(`  styles.css (critical)  →  ${criticalName}  (${(Buffer.byteLength(criticalMin)/1024).toFixed(1)} KB)`);
console.log(`  styles.css (deferred)  →  ${deferredName}  (${(Buffer.byteLength(deferredMin)/1024).toFixed(1)} KB)`);
console.log(`  Total: ${(origCssSize/1024).toFixed(1)} KB → ${(Buffer.byteLength(criticalMin)/1024 + Buffer.byteLength(deferredMin)/1024).toFixed(1)} KB`);

// ─── Step 2: Minify JS ──────────────────────────────────────────
const jsFiles = [
  "nav.js", "utils.js", "script.js", "category.js",
  "contact.js", "opportunity-detail.js", "internship-detail.js", "dynamic-types.js"
];
const jsAssetMap = {};

for (const file of jsFiles) {
  const srcPath = join(ROOT, file);
  if (!existsSync(srcPath)) {
    console.warn(`  Skipping missing optional JS file: ${file}`);
    continue;
  }
  const origSize = statSync(srcPath).size;
  const input = readFileSync(srcPath, "utf8");

  const result = buildSync({
    stdin: { contents: input, loader: "js", resolveDir: ROOT },
    bundle: false,
    minify: true,
    write: false,
    sourcemap: false,
    legalComments: "none",
    target: ["es2020"]
  });

  const minContent = result.outputFiles[0].text;
  const hash = hashContent(minContent);
  const hashedName = file.replace(".js", `.${hash}.min.js`);
  writeFileSync(join(DIST, hashedName), minContent);

  const minSize = Buffer.byteLength(minContent);
  const savings = ((1 - minSize / origSize) * 100).toFixed(0);
  console.log(`  ${file}  →  ${hashedName}  (${(origSize/1024).toFixed(1)} KB → ${(minSize/1024).toFixed(1)} KB, -${savings}%)`);
  jsAssetMap[file] = hashedName;
}

const NEW_FOOTER = `<footer class="site-footer" role="contentinfo"> <div class="container"> <div class="footer-grid"> <!-- Brand --> <div class="footer-col footer-brand"> <a class="footer-logo" href="/" aria-label="OpportunityNest home"> <span class="brand-mark" aria-hidden="true">ON</span> </a> <p class="footer-desc">Helping students discover verified scholarships, internships, fellowships, competitions and youth programs worldwide.</p> <div class="footer-social"> <a href="https://facebook.com/opportunitynest" target="_blank" rel="noopener noreferrer" aria-label="Facebook"> <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> </a> <a href="https://twitter.com/opportunitynest" target="_blank" rel="noopener noreferrer" aria-label="Twitter"> <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> </a> <a href="https://linkedin.com/company/opportunitynest" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"> <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> </a> </div> </div> <!-- Opportunities --> <div class="footer-col"> <h3 class="footer-heading">Opportunities</h3> <nav aria-label="Opportunities"> <ul> <li><a href="/scholarships.html">Scholarships</a></li> <li><a href="/internships.html">Internships</a></li> <li><a href="/fellowships.html">Fellowships</a></li> <li><a href="/competitions.html">Competitions</a></li> <li><a href="/youth-programs/">Youth Programs</a></li> <li><a href="/study-in-usa/">Study Abroad</a></li> </ul> </nav> </div> <!-- Resources --> <div class="footer-col"> <h3 class="footer-heading">Resources</h3> <nav aria-label="Resources"> <ul> <li><a href="/blog/">Blog</a></li> <li><a href="/guides/application-checklist.html">Resource Center</a></li> <li><a href="/editorial-policy.html">Editorial Policy</a></li> <li><a href="/fact-checking-policy.html">Fact Checking Policy</a></li> <li><a href="/verification-process.html">Verification Process</a></li> <li><a href="/faq.html">FAQ</a></li> </ul> </nav> </div> <!-- Popular Categories --> <div class="footer-col"> <h3 class="footer-heading">Popular Categories</h3> <nav aria-label="Popular Categories"> <ul> <li><a href="/fully-funded-scholarships/">Fully Funded Scholarships</a></li> <li><a href="/undergraduate-scholarships/">Undergraduate Scholarships</a></li> <li><a href="/masters-scholarships/">Master's Scholarships</a></li> <li><a href="/phd-scholarships/">PhD Scholarships</a></li> <li><a href="/study-in-usa/">Study in USA</a></li> <li><a href="/study-in-uk/">Study in UK</a></li> <li><a href="/study-in-canada/">Study in Canada</a></li> <li><a href="/study-in-germany/">Study in Germany</a></li> <li><a href="/study-in-australia/">Study in Australia</a></li> </ul> </nav> </div> <!-- Company --> <div class="footer-col"> <h3 class="footer-heading">Company</h3> <nav aria-label="Company"> <ul> <li><a href="/about.html">About</a></li> <li><a href="/contact.html">Contact</a></li> <li><a href="/privacy.html">Privacy Policy</a></li> <li><a href="/terms.html">Terms &amp; Conditions</a></li> <li><a href="/disclaimer.html">Disclaimer</a></li> <li><a href="/sitemap.xml">Sitemap</a></li> </ul> </nav> </div> </div> <div class="footer-bottom"> <p>&copy; 2026 OpportunityNest.org. All rights reserved.</p> <div class="footer-bottom-links"> <a href="/privacy.html">Privacy</a> <a href="/terms.html">Terms</a> <a href="/sitemap.xml">Sitemap</a> </div> </div> </div> </footer>`;

// ─── Step 3: Process HTML files ──────────────────────────────────
console.log("\nUpdating HTML files...");

const htmlFiles = getAllHtmlFiles(ROOT);
let updatedCount = 0;

const RESOURCE_HINTS = [
  '<link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin>',
  '<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>',
  '<link rel="preconnect" href="https://www.google-analytics.com" crossorigin>',
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
  '<link rel="preconnect" href="https://rveunrzbeynaizitqanx.supabase.co" crossorigin>',
  '<link rel="preconnect" href="https://flagcdn.com" crossorigin>',
  '<link rel="dns-prefetch" href="https://chatling.ai">'
].join("\n    ");

const CRITICAL_STYLE_TAG = `<style>${criticalMin}</style>`;
const PRELOAD_DEFERRED_TAG = `<link rel="preload" href="/${deferredName}" as="style" fetchpriority="low">`;
const DEFERRED_LINK_TAG = `<link rel="stylesheet" href="/${deferredName}" media="print" onload="this.media='all'">`;
const NOSCRIPT_TAG = `<noscript><link rel="stylesheet" href="/${deferredName}"></noscript>`;

const SEO_OVERRIDES = {
  "index.html": {
    title: "Fully Funded Scholarships & Internships 2026 | OpportunityNest",
    description: "Find verified fully funded scholarships, paid internships, fellowships, grants, and global opportunities for 2026 with deadlines and official application links."
  },
  "scholarships/index.html": {
    title: "Scholarships for International Students 2026 | Fully Funded Awards",
    description: "Browse verified scholarships for international students in 2026, including fully funded awards, country pages, deadlines, eligibility notes, and official application links."
  },
  "internships/index.html": {
    title: "International Internships 2026 | Paid, Remote & Global Programs",
    description: "Find verified international internships for 2026, including paid, remote, summer, NGO, engineering, IT, and global programs with official application links."
  },
  "fellowships/index.html": {
    title: "International Fellowships 2026 | Research, Policy & Leadership",
    description: "Explore verified fellowships for 2026, including research, policy, leadership, government, and fully funded programs with deadlines and official source links."
  },
  "fully-funded-scholarships/index.html": {
    title: "Fully Funded Scholarships 2026 | Complete List for International Students",
    description: "Explore fully funded scholarships for 2026 covering full tuition, living stipends, airfare, and health insurance. Compare top programs like Chevening, DAAD, Fulbright, and more."
  },
  "masters-scholarships/index.html": {
    title: "Master's Scholarships 2026 | Fully Funded Graduate Programs Worldwide",
    description: "Find master's scholarships for 2026 including fully funded graduate programs, tuition waivers, and research assistantships. Search by country, field, and funding type."
  },
  "phd-scholarships/index.html": {
    title: "PhD Scholarships 2026 | Fully Funded Doctoral Programs | OpportunityNest",
    description: "Discover PhD scholarships for 2026 — fully funded doctoral programs, research fellowships, and graduate assistantships worldwide with application deadlines."
  },
  "undergraduate-scholarships/index.html": {
    title: "Undergraduate Scholarships 2026 | Bachelor's Degree Funding",
    description: "Browse undergraduate scholarships for 2026, including bachelor's degree funding, merit-based awards, need-based aid, and fully funded programs for international students."
  },
  "high-school-scholarships/index.html": {
    title: "High School Scholarships & Summer Programs 2026 | OpportunityNest",
    description: "Find high school scholarships, summer programs, pre-college opportunities, and youth leadership programs for high school students worldwide."
  },
  "scholarships-without-ielts/index.html": {
    title: "Scholarships Without IELTS for International Students 2026",
    description: "Apply for scholarships without IELTS in 2026. Find programs accepting Duolingo, TOEFL, or no English test requirements. Study abroad without language barriers."
  },
  "scholarships-in-germany/index.html": {
    title: "Scholarships in Germany 2026 | DAAD & Fully Funded Programs",
    description: "Explore scholarships in Germany for 2026, including DAAD programs, Heinrich Böll, Konrad Adenauer, and fully funded German study opportunities for international students."
  },
  "scholarships-in-usa/index.html": {
    title: "Scholarships in USA 2026 | Fully Funded American Programs",
    description: "Find scholarships in USA 2026 — Fulbright, Hubert Humphrey, Knight-Hennessy, and more. Fully funded American study programs for international students."
  },
  "scholarships-in-uk/index.html": {
    title: "Scholarships in UK 2026 | Chevening, Rhodes & British Programs",
    description: "Browse scholarships in UK for 2026 — Chevening, Rhodes, Marshall, Clarendon, Gates Cambridge and more fully funded British study programs."
  },
  "scholarships-in-canada/index.html": {
    title: "Scholarships in Canada 2026 | Fully Funded Canadian Programs",
    description: "Explore scholarships in Canada for 2026 including UBC, UofT, Vanier, McCall MacBain, and other fully funded Canadian study programs."
  },
  "scholarships-in-china/index.html": {
    title: "Scholarships in China 2026 | CSC & Chinese Government Programs",
    description: "Find scholarships in China for 2026 — Chinese Government Scholarship (CSC), Schwarzman, and fully funded programs for international students studying in China."
  },
  "scholarships-in-japan/index.html": {
    title: "Scholarships in Japan 2026 | MEXT & Japanese Government Programs",
    description: "Discover scholarships in Japan for 2026 including MEXT, Japanese Government (Monbusho), and fully funded programs for international students."
  },
  "scholarships-in-australia/index.html": {
    title: "Scholarships in Australia 2026 | Australia Awards & Merit Programs",
    description: "Browse scholarships in Australia for 2026 — Australia Awards, Destination Australia, University of Melbourne, UNSW, and other Australian study funding."
  },
  "paid-internships/index.html": {
    title: "Paid Internships 2026 | Fully Funded & Stipend Programs",
    description: "Find paid internships for 2026, including fully funded international programs with stipends, travel coverage, and accommodation. Apply to Google, UN, Microsoft, and more."
  },
  "summer-internships/index.html": {
    title: "Summer Internships 2026 | Paid Programs for Students",
    description: "Discover summer internships for 2026 with stipends, housing, and travel benefits. Programs for undergraduate, graduate, and PhD students worldwide."
  },
  "remote-internships/index.html": {
    title: "Remote Internships 2026 | Work-from-Home Global Programs",
    description: "Find remote internships for 2026 you can do from anywhere. Paid virtual programs in tech, marketing, design, research, and more fields."
  },
  "fully-funded-fellowships/index.html": {
    title: "Fully Funded Fellowships 2026 | Research & Leadership Programs",
    description: "Explore fully funded fellowships for 2026, including research, policy, leadership, and postdoctoral programs with full funding for international applicants."
  },
  "government-scholarships/index.html": {
    title: "Government Scholarships 2026 | National & International Awards",
    description: "Browse government scholarships for 2026 from DAAD, Fulbright, Chevening, MEXT, Chinese Government, and other national scholarship programs."
  },
  "study-in-usa/index.html": {
    title: "Study in USA 2026 | Scholarships, Visas & University Guide",
    description: "Complete guide to study in USA for 2026. Find US scholarships, student visa info, top universities, and funding opportunities for international students."
  },
  "study-in-uk/index.html": {
    title: "Study in UK 2026 | Scholarships, Visas & University Guide",
    description: "Guide to study in UK for 2026. UK scholarships, student visa (Tier 4) process, top universities, and funding for international students."
  },
  "study-in-canada/index.html": {
    title: "Study in Canada 2026 | Scholarships, Visas & University Guide",
    description: "Learn how to study in Canada for 2026. Canadian scholarships, study permit process, top universities and college funding for international students."
  },
  "study-in-germany/index.html": {
    title: "Study in Germany 2026 | DAAD, Free Tuition & Scholarships",
    description: "Complete guide to study in Germany for 2026. Free tuition universities, DAAD scholarships, student visa, and application process for international students."
  },
  "study-in-australia/index.html": {
    title: "Study in Australia 2026 | Scholarships, Visas & University Guide",
    description: "Your guide to study in Australia for 2026. Australian scholarships, student visa (Subclass 500), and top university funding for international students."
  },
  "study-in-europe/index.html": {
    title: "Study in Europe 2026 | Scholarships & Free Tuition Programs",
    description: "Discover how to study in Europe for 2026. European scholarships, Erasmus Mundus, free tuition countries, and study abroad funding for international students."
  },
  "exchange-programs/index.html": {
    title: "Student Exchange Programs 2026 | Global Study Abroad",
    description: "Find student exchange programs for 2026, including semester abroad, year-long exchanges, and cultural immersion programs with funding support."
  },
  "youth-programs/index.html": {
    title: "Youth Programs 2026 | Leadership, Volunteering & Summits",
    description: "Explore youth programs for 2026 — leadership summits, volunteering abroad, UN youth programs, and global conferences for young leaders."
  },
  "conferences/index.html": {
    title: "International Conferences 2026 | Academic & Youth Summits",
    description: "Find international conferences for 2026, including academic conferences, youth summits, Model UN, and professional development events worldwide."
  },
  "grants/index.html": {
    title: "Research Grants 2026 | Funding for Students & Researchers",
    description: "Discover research grants for 2026, including academic funding, scientific research grants, and fieldwork support for students and early-career researchers."
  }
};

function replaceMetaContent(html, selector, content) {
  const escaped = content.replace(/"/g, "&quot;");
  const pattern = new RegExp(`(<meta\\s+${selector}\\s+content=")[^"]*(")`, "i");
  return html.replace(pattern, `$1${escaped}$2`);
}

function applySeoOverrides(html, relativePath) {
  const override = SEO_OVERRIDES[relativePath.replace(/\\/g, "/")];
  if (!override) return html;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${override.title}</title>`);
  html = replaceMetaContent(html, 'name="description"', override.description);
  html = replaceMetaContent(html, 'property="og:title"', override.title);
  html = replaceMetaContent(html, 'property="og:description"', override.description);
  html = replaceMetaContent(html, 'name="twitter:title"', override.title);
  html = replaceMetaContent(html, 'name="twitter:description"', override.description);
  return html;
}

function normalizeCrawlerText(html) {
  return html
    .replace(/1"“3/g, "1-3")
    .replace(/4"“9/g, "4-9")
    .replace(/â†’/g, "->")
    .replace(/â†—/g, "↗")
    .replace(/‰¡/g, "Filter")
    .replace(/†—/g, "Link")
    .replace(/˜…/g, "Details")
    .replace(/\?{4}\s*/g, "");
}

for (const htmlPath of htmlFiles) {
  let html = readFileSync(htmlPath, "utf8");
  const relativePath = relative(ROOT, htmlPath).replace(/\\/g, "/");
  let modified = false;

  const seoUpdated = applySeoOverrides(html, relativePath);
  if (seoUpdated !== html) {
    html = seoUpdated;
    modified = true;
  }

  // 1. Replace render-blocking CSS link with critical inline + async deferred
  const cssLinkRegex = /<link\s+rel="stylesheet"\s+href="\/styles\.css"\s*\/?>/g;
  if (cssLinkRegex.test(html)) {
    html = html.replace(/<link\s+rel="stylesheet"\s+href="\/styles\.css"\s*\/?>/,
      `${CRITICAL_STYLE_TAG}\n    ${PRELOAD_DEFERRED_TAG}\n    ${DEFERRED_LINK_TAG}\n    ${NOSCRIPT_TAG}`);
    modified = true;
  }

  // 1b. Remove preload of /styles.css (does not exist in dist — critical CSS is inlined)
  const preloadRegex = /<link\s+rel="preload"\s+href="\/styles\.css"\s+as="style"\s*\/?>/g;
  if (preloadRegex.test(html)) {
    html = html.replace(preloadRegex, "");
    modified = true;
  }

  // 1c. Defer Google Fonts CSS (render-blocking → async)
  const googleFontsPattern = 'fonts.googleapis.com/css2?family=';
  if (html.includes(googleFontsPattern) && html.includes('rel="stylesheet"')) {
    // Replace the blocking Google Fonts link with async version
    html = html.replace(
      /<link\s+href="(https:\/\/fonts\.googleapis\.com\/css2\?family=[^"]+)"\s+rel="stylesheet"\s*\/?>/,
      '<link href="$1" rel="stylesheet" media="print" onload="this.media=\'all\'"> <noscript><link href="$1" rel="stylesheet"></noscript>'
    );
    modified = true;
  }

  // 2. Add resource hints (preconnect, dns-prefetch) right after <head>
  // Place before any scripts so browser can start DNS/connection early
  if (!html.includes('pagead2.googlesyndication.com" crossorigin>')) {
    // Insert resource hints immediately after <head> tag
    html = html.replace('<head>', '<head>\n    ' + RESOURCE_HINTS);
    modified = true;
  }

  // 3. Add Monetag verification meta tag
  if (!html.includes('name="monetag"')) {
    html = html.replace('</head>', '    <meta name="monetag" content="8aca6e41b32c4da95a713300fdf33197">\n  </head>');
    modified = true;
  }

  // 3b. Add Monetag ad script (async, non-blocking)
  if (!html.includes('quge5.com/88/tag.min.js')) {
    html = html.replace('</head>', '    <script src="https://quge5.com/88/tag.min.js" data-zone="264737" async data-cfasync="false"></script>\n  </head>');
    modified = true;
  }

  // 4. Defer Chatling chatbot — load only after user interaction
  if (html.includes('chatling.ai/js/embed.js')) {
    html = html.replace(
      /<script[^>]*src="https:\/\/chatling\.ai\/js\/embed\.js"[^>]*><\/script>/,
      `<script>window.addEventListener("load",function(){var s=document.createElement("script");s.src="https://chatling.ai/js/embed.js";s.async=true;s.dataset.id="9241558149";s.id="chtl-script";document.body.appendChild(s);}, {once:true})</script>`
    );
    modified = true;
  }

  // 5. JS hashed asset replacements
  for (const [src, hashedName] of Object.entries(jsAssetMap)) {
    const oldRef = `src="/${src}"`;
    const newRef = `src="/${hashedName}"`;
    if (html.includes(oldRef)) {
      html = html.split(oldRef).join(newRef);
      modified = true;
    }
  }

  // 6. Ensure all JS scripts have defer (except inline scripts and Supabase)
  html = html.replace(
    /(<script\s+src="[^"]*(?:nav|utils|script|category|contact|opportunity-detail|internship-detail|dynamic-types)\.[^"]*")\s*(?!defer|async|type=)/g,
    '$1 defer'
  );
  // Remove duplicate defer
  html = html.replace(/\bdefer\s+defer\b/g, 'defer');

  // 7. Add CSS containment to hero to isolate its layout
  if (html.includes('class="hero ')) {
    html = html.replace(
      /(<section\s+class="hero\s[^"]*")/,
      '$1 style="contain:layout style paint"'
    );
  }



  // 8. Add preload hints for LCP and critical resources
  if (html.includes('brand-mark')) {
    // Preload logo (LCP element)
    if (!html.includes('rel="preload" href="/logo.svg"')) {
      html = html.replace(
        /(<\/head>)/,
        '    <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" fetchpriority="high">\n    $1'
      );
    }
    // Preload nav JS (critical for navigation rendering, early download before defer)
    const navHash = jsAssetMap["nav.js"];
    if (navHash && !html.includes(`rel="preload" href="/${navHash}"`)) {
      html = html.replace(
        /(<\/head>)/,
        `    <link rel="preload" href="/${navHash}" as="script">\n    $1`
      );
    }
    // Preload Google Fonts CSS (already async, preload gives it higher download priority)
    if (html.includes('fonts.googleapis.com/css2') && !html.includes('rel="preload" href="https://fonts.googleapis.com/css2')) {
      html = html.replace(
        /(<\/head>)/,
        '    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" as="style">\n    $1'
      );
    }
  }

  // 9. Add E-E-A-T badges to opportunity detail pages
  if (html.includes('/opportunity/') && html.includes('review-note') && !html.includes('eeat-bar')) {
    const updatedAt = new Date().toISOString().split('T')[0];
    const eeatBar = `<div class="eeat-bar"><span class="eeat-badge">Reviewed by Abdullah Ijaz Abbasi</span><span class="eeat-badge">Fact checked</span><span class="eeat-badge">Updated ${updatedAt}</span></div>`;
    html = html.replace('<p class="review-note">', eeatBar + '\n            <p class="review-note">');
    modified = true;
  }

  // 10. Inject Event schema for deadlines on opportunity pages
  if (html.includes('"@type": "EducationalOccupationalProgram"') && html.includes('"timeRequired"')) {
    const deadlineMatch = html.match(/"timeRequired":\s*"([^"]+)"/);
    if (deadlineMatch && deadlineMatch[1] && !/varies|rolling|see|n\/a|tbd/i.test(deadlineMatch[1])) {
      const nameMatch = html.match(/"name":\s*"([^"]+)"/);
      const eventName = nameMatch ? nameMatch[1] + ' Application Deadline' : 'Application Deadline';
      const eventSchema = `\n    <script type="application/ld+json">{\n  "@context": "https://schema.org",\n  "@type": "Event",\n  "name": "${eventName}",\n  "eventStatus": "https://schema.org/EventScheduled",\n  "endDate": "${deadlineMatch[1]}",\n  "description": "Application deadline for ${nameMatch ? nameMatch[1] : 'this opportunity'}"\n}</script>`;
      if (!html.includes('"@type": "Event"')) {
        html = html.replace('</head>', eventSchema + '\n  </head>');
        modified = true;
      }
    }
  }

  // 11. Add E-E-A-T badges to blog article pages (no eeat-bar yet, has Article schema)
  if (html.includes('/blog/') && html.includes('"@type": "Article"') && !html.includes('eeat-bar')) {
    const updatedAt = new Date().toISOString().split('T')[0];
    const eeatBar = `<div class="eeat-bar"><span class="eeat-badge">By Abdullah Ijaz Abbasi</span><span class="eeat-badge">Fact checked</span><span class="eeat-badge">Updated ${updatedAt}</span></div>`;
    // Insert after the <h1> tag in blog pages
    html = html.replace(/(<\/h1>)/, '$1' + eeatBar);
    modified = true;
  }

  // 12. Add CollectionPage + FAQ schema to category listing pages that have ItemList
  const categoryNameMatch = html.match(/<h1>([^<]+)<\/h1>/);
  if (html.includes('"@type": "ItemList"') && categoryNameMatch && !html.includes('"@type": "FAQPage"')) {
    const catName = categoryNameMatch[1].replace(/\([^)]*\)/g, '').trim();
    const safeName = catName.replace(/"/g, '&quot;');
    const faqQuestions = [
      { q: `What are ${safeName}?`, a: `${safeName} are educational and professional development programs that provide financial support, training, or international exposure to students and early-career professionals. Each listing on this page includes verified deadlines, eligibility criteria, funding details, and direct links to official application pages.` },
      { q: `Who can apply for ${safeName}?`, a: `Eligibility varies by program, but most ${safeName.toLowerCase()} are open to international students, recent graduates, and early-career professionals. Check each program's eligibility section for specific requirements regarding nationality, academic background, language proficiency, and work experience.` },
      { q: `How do I apply for ${safeName}?`, a: `Each opportunity on this page has a direct "Apply Now" link to the official provider website. Before applying, review the eligibility requirements, prepare required documents (transcripts, CV, motivation letter, references), and note the application deadline. We recommend starting your applications at least 4 weeks before the deadline.` },
      { q: `When are the deadlines for ${safeName}?`, a: `Deadlines are listed individually for each opportunity and vary by program. Some have fixed annual deadlines, while others use rolling admissions. Always verify the exact deadline on the official provider website and note that some deadlines are in the provider's local time zone.` }
    ];
    const faqSchema = `\n    <script type="application/ld+json">{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": [${faqQuestions.map((f, i) => `\n    {"@type":"Question","name":"${f.q}","acceptedAnswer":{"@type":"Answer","text":"${f.a}"}}`).join(',')}\n  ]\n}</script>`;
    html = html.replace('</head>', faqSchema + '\n  </head>');
    modified = true;

    // Also add CollectionPage type to existing ItemList
    if (!html.includes('"@type": "CollectionPage"')) {
      html = html.replace(
        /("@type":\s*)"ItemList"/,
        '$1"CollectionPage","@type":"ItemList"'
      );
      modified = true;
    }
  }
  const footerRegex = /<footer\s+class="site-footer"[^>]*>[\s\S]*?<\/footer>/;
  if (footerRegex.test(html) && !html.includes('footer-heading')) {
    html = html.replace(footerRegex, NEW_FOOTER);
    modified = true;
  }

  // ─── SEO: fix hash fragment links, .html extensions, and canonical URLs ──
  // 9a. Replace hash fragment navigation links with proper clean routes
  const hashReplacements = [
    ['/#opportunities', '/scholarships/'],
    ['?type=Youth+Program#opportunities', 'youth-programs/'],
    ['?type=Undergraduate#opportunities', 'undergraduate-scholarships/'],
    ['?type=Master%27s#opportunities', 'masters-scholarships/'],
    ['?type=PhD#opportunities', 'phd-scholarships/'],
    ['?type=Postdoctoral#opportunities', 'postdoctoral-scholarships/'],
    ['?funding=Fully+Funded#opportunities', 'fully-funded-scholarships/'],
    ['?funding=Partial+Funding#opportunities', 'partially-funded-scholarships/'],
    ['?funding=Merit+Based#opportunities', 'merit-scholarships/'],
    ['?type=Internship&funding=Paid#opportunities', 'paid-internships/'],
    ['?type=Internship&funding=Remote#opportunities', 'remote-internships/'],
    ['?type=Internship&category=Engineering#opportunities', 'engineering-internships/'],
    ['?type=Internship&category=IT#opportunities', 'it-internships/'],
    ['?type=Fellowship&funding=Fully+Funded#opportunities', 'fully-funded-fellowships/'],
    ['?type=Fellowship&category=Research#opportunities', 'research-fellowships/'],
    ['?type=Fellowship&category=Leadership#opportunities', 'leadership-fellowships/'],
    ['?type=Youth+Program&category=Leadership#opportunities', 'leadership-programs/'],
    ['?type=Youth+Program&category=Volunteer#opportunities', 'volunteer-programs/'],
    ['?type=Youth+Program&category=Conference#opportunities', 'conferences/'],
    ['search_term_string}#opportunities', 'search_term_string}'],
    ['search_term_string%5C%23opportunities', 'search_term_string}'],
  ];
  for (const [from, to] of hashReplacements) {
    if (html.includes(from)) {
      html = html.split(from).join(to);
      modified = true;
    }
  }

  // 9b. Fix .html navigation links → clean trailing-slash routes
  const htmlToRoute = [
    ['/scholarships.html', '/scholarships/'],
    ['/internships.html', '/internships/'],
    ['/fellowships.html', '/fellowships/'],
    ['/competitions.html', '/competitions/'],
    ['/conferences.html', '/conferences/'],
    ['/about.html', '/about/'],
    ['/contact.html', '/contact/'],
    ['/faq.html', '/faq/'],
    ['/privacy.html', '/privacy/'],
    ['/terms.html', '/terms/'],
    ['/disclaimer.html', '/disclaimer/'],
    ['/editorial-policy.html', '/editorial-policy/'],
    ['/fact-checking-policy.html', '/fact-checking-policy/'],
    ['/verification-process.html', '/verification-process/'],
    ['/thank-you.html', '/thank-you/'],
    ['/exchange-program.html', '/exchange-programs/'],
    ['/category.html', '/scholarships/'],
    ['/opportunity-detail.html', '/scholarships/'],
    ['/internship-detail.html', '/scholarships/'],
  ];
  for (const [from, to] of htmlToRoute) {
    if (html.includes(from)) {
      html = html.split(from).join(to);
      modified = true;
    }
  }

  const searchActionTarget = 'https://www.opportunitynest.org/?q={search_term_string}#opportunities';
  if (html.includes(searchActionTarget)) {
    html = html.split(searchActionTarget).join('https://www.opportunitynest.org/scholarships/?q={search_term_string}');
    modified = true;
  }

  // 9c. Fix canonical .html URLs to clean trailing-slash
  html = html.replace(
    /(rel="canonical"\s+href="https:\/\/www\.opportunitynest\.org\/)([^"]+)\.html(")/g,
    '$1$2/$3'
  );
  // Fix og:url .html URLs
  html = html.replace(
    /(property="og:url"\s+content="https:\/\/www\.opportunitynest\.org\/)([^"]+)\.html(")/g,
    '$1$2/$3'
  );

  // 9d. Fix BreadcrumbList schema item URLs (remove .html)
  html = html.replace(
    /("item":\s*"https:\/\/www\.opportunitynest\.org\/[^"]+)\.html(")/g,
    '$1/$2'
  );
  // Fix ItemList schema urls
  html = html.replace(
    /("url":\s*"https:\/\/www\.opportunitynest\.org\/[^"]+)\.html(")/g,
    '$1/$2'
  );

  const normalizedHtml = normalizeCrawlerText(html);
  if (normalizedHtml !== html) {
    html = normalizedHtml;
    modified = true;
  }

  const distPath = join(DIST, relativePath);
  mkdirp(join(distPath, ".."));
  writeFileSync(distPath, html);
  if (modified) updatedCount++;
}

console.log(`  Processed ${htmlFiles.length} HTML files (${updatedCount} updated)\n`);

// ─── Step 4: Copy static assets ──────────────────────────────────
console.log("Copying static assets...");
const staticFiles = findStaticFiles(ROOT);
for (const filePath of staticFiles) {
  const relativePath = relative(ROOT, filePath);
  const destPath = join(DIST, relativePath);
  mkdirp(join(destPath, ".."));
  cpSync(filePath, destPath);
}
console.log(`  Copied ${staticFiles.length} static files\n`);

// Copy service worker
copyServiceWorker();

// ─── Step 5: Auto-generate sitemap.xml ────────────────────────────
console.log("Generating sitemap.xml...");
function generateSitemap() {
  const BASE = "https://www.opportunitynest.org";
  const today = new Date().toISOString().split("T")[0];

  // Priority map: assign priority based on path patterns
  function getPriority(relPath, isDirIndex) {
    const p = relPath.replace(/\\/g, "/").toLowerCase();
    if (p === "index.html" || p === "") return "1.0";
    if (p.startsWith("opportunity/")) return "0.8";
    if (p.startsWith("scholarships/") || p.startsWith("internships/") || p.startsWith("fellowships/") || p.startsWith("competitions/")) return "0.7";
    if (p.startsWith("country/")) return "0.8";
    if (p.startsWith("guides/")) return "0.7";
    if (p.startsWith("blog/")) return "0.8";
    if (["about.html","contact.html","faq.html"].includes(p)) return "0.7";
    if (["privacy.html","terms.html","disclaimer.html"].includes(p)) return "0.5";
    if (["editorial-policy.html","fact-checking-policy.html","verification-process.html"].includes(p)) return "0.6";
    // Category pages
    const categories = ["fully-funded-scholarships","partially-funded-scholarships","undergraduate-scholarships",
      "masters-scholarships","phd-scholarships","postdoctoral-scholarships","high-school-scholarships",
      "government-scholarships","merit-scholarships","paid-internships","remote-internships","summer-internships",
      "international-internships","fully-funded-fellowships","research-fellowships","leadership-fellowships",
      "youth-programs","exchange-programs","grants","study-in-usa","study-in-uk","study-in-canada",
      "study-in-australia","study-in-germany","study-in-europe"];
    if (categories.some(c => p.startsWith(c))) return "0.8";
    return "0.5";
  }

  function getChangefreq(relPath) {
    const p = relPath.replace(/\\/g, "/").toLowerCase();
    if (p === "index.html" || p === "") return "daily";
    if (p.startsWith("opportunity/")) return "weekly";
    if (p.startsWith("blog/")) return "monthly";
    if (["privacy.html","terms.html","disclaimer.html"].includes(p)) return "yearly";
    return "weekly";
  }

  // Convert file path to clean URL
  function toCleanUrl(relPath) {
    let url = relPath.replace(/\\/g, "/");
    // Remove index.html
    if (url.endsWith("/index.html")) { url = url.slice(0, -10); }
    // Remove .html extension for non-root pages
    else if (url.endsWith(".html")) { url = url.slice(0, -5); }
    // Root index.html -> /
    if (url === "index.html" || url === "") return BASE + "/";
    // Ensure no double slashes
    if (url.endsWith("/")) url = url.slice(0, -1);
    return BASE + "/" + url + "/";
  }

  // Pages to exclude from sitemap
  const excludePatterns = ["404.html","preview.html","nav-dropdown-backup.html","exchange-program.html",
    "category.html","internship-detail.html","opportunity-detail.html",
    "node_modules","dist",".next",".git","brand-kit","/partial-scholarships/"];

  function shouldExclude(relPath) {
    const p = relPath.replace(/\\/g, "/").toLowerCase();
    if (p === "index.html") return false;
    if (["category.html", "internship-detail.html", "opportunity-detail.html"].includes(p)) return true;
    return excludePatterns.some(pat => p.includes(pat));
  }

  // Collect all HTML files excluding noindex/private pages
  const allHtml = getAllHtmlFiles(ROOT);
  const sitemapUrls = [];

  for (const filePath of allHtml) {
    const relPath = relative(ROOT, filePath).replace(/\\/g, "/");
    if (shouldExclude(relPath)) continue;

    // Check if contains noindex
    const content = readFileSync(filePath, "utf8");
    if (/noindex/i.test(content)) continue;

    const cleanUrl = toCleanUrl(relPath);
    if (cleanUrl === `${BASE}/index/`) continue;
    const priority = getPriority(relPath);
    const changefreq = getChangefreq(relPath);

    sitemapUrls.push({ loc: cleanUrl, changefreq, priority, lastmod: today });
  }

  // Deduplicate by URL
  const seen = new Set();
  const unique = [];
  for (const u of sitemapUrls) {
    if (!seen.has(u.loc)) { seen.add(u.loc); unique.push(u); }
  }

  // Build XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const u of unique) {
    xml += `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>\n`;
  }
  xml += `</urlset>\n`;

  writeFileSync(join(ROOT, "sitemap.xml"), xml);
  console.log(`  Generated sitemap with ${unique.length} URLs`);
  return unique.length;
}
const sitemapCount = generateSitemap();

// ─── Done ─────────────────────────────────────────────────────────
console.log(`Build complete! Output → dist/ (${sitemapCount} URLs in sitemap)`);
