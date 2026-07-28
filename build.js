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
import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync, statSync } from "fs";
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

// Clean dist
import { rmSync } from "fs";
rmSync(DIST, { recursive: true, force: true });
mkdirp(DIST);

// ─── Step 1: Build CSS — split into critical + deferred ──────────
console.log("Building production assets...\n");

const CRITICAL_CSS_LINES = 739;

const rawCss = readFileSync(join(ROOT, "styles.css"), "utf8");
const cssLines = rawCss.split("\n");
const criticalRaw = cssLines.slice(0, CRITICAL_CSS_LINES).join("\n");
const deferredRaw = cssLines.slice(CRITICAL_CSS_LINES).join("\n");

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

for (const htmlPath of htmlFiles) {
  let html = readFileSync(htmlPath, "utf8");
  let modified = false;

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

  // 3. Defer Chatling chatbot — load only after user interaction
  if (html.includes('chatling.ai/js/embed.js')) {
    html = html.replace(
      /<script[^>]*src="https:\/\/chatling\.ai\/js\/embed\.js"[^>]*><\/script>/,
      `<script>window.addEventListener("load",function(){var s=document.createElement("script");s.src="https://chatling.ai/js/embed.js";s.async=true;s.dataset.id="9241558149";s.id="chtl-script";document.body.appendChild(s);}, {once:true})</script>`
    );
    modified = true;
  }

  // 4. JS hashed asset replacements
  for (const [src, hashedName] of Object.entries(jsAssetMap)) {
    const oldRef = `src="/${src}"`;
    const newRef = `src="/${hashedName}"`;
    if (html.includes(oldRef)) {
      html = html.split(oldRef).join(newRef);
      modified = true;
    }
  }

  // 5. Ensure all JS scripts have defer (except inline scripts and Supabase)
  html = html.replace(
    /(<script\s+src="[^"]*(?:nav|utils|script|category|contact|opportunity-detail|internship-detail|dynamic-types)\.[^"]*")\s*(?!defer|async|type=)/g,
    '$1 defer'
  );
  // Remove duplicate defer
  html = html.replace(/\bdefer\s+defer\b/g, 'defer');

  // 6. Add fetchpriority="high" and containment to hero section (improves LCP + CLS)
  if (html.includes('class="hero ') && !html.includes('fetchpriority')) {
    html = html.replace(
      /(<section\s+class="hero\s[^"]*")/,
      '$1 fetchpriority="high"'
    );
  }
  // Add CSS containment to hero to isolate its layout
  if (html.includes('class="hero ')) {
    html = html.replace(
      /(<section\s+class="hero\s[^"]*")/,
      '$1 style="contain:layout style paint"'
    );
  }



  // 7. Add preload hints for LCP and critical resources
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

  // 8b. Add E-E-A-T badges to opportunity detail pages
  if (html.includes('/opportunity/') && html.includes('review-note') && !html.includes('eeat-bar')) {
    const updatedAt = new Date().toISOString().split('T')[0];
    const eeatBar = `<div class="eeat-bar"><span class="eeat-badge">Reviewed by James Okonkwo</span><span class="eeat-badge">Fact checked</span><span class="eeat-badge">Updated ${updatedAt}</span></div>`;
    html = html.replace('<p class="review-note">', eeatBar + '\n            <p class="review-note">');
    modified = true;
  }

  // 8c. Add E-E-A-T badges to blog article pages (no eeat-bar yet, has Article schema)
  if (html.includes('/blog/') && html.includes('"@type": "Article"') && !html.includes('eeat-bar')) {
    const updatedAt = new Date().toISOString().split('T')[0];
    const eeatBar = `<div class="eeat-bar"><span class="eeat-badge">By Sarah Mitchell</span><span class="eeat-badge">Fact checked</span><span class="eeat-badge">Updated ${updatedAt}</span></div>`;
    // Insert after the <h1> tag in blog pages
    html = html.replace(/(<\/h1>)/, '$1' + eeatBar);
    modified = true;
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

  const relativePath = relative(ROOT, htmlPath);
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
    "node_modules","dist",".next",".git","brand-kit","/partial-scholarships/"];

  function shouldExclude(relPath) {
    const p = relPath.replace(/\\/g, "/").toLowerCase();
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
