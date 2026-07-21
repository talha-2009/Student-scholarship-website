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

const CRITICAL_CSS_LINES = 409;

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

// ─── Step 3: Process HTML files ──────────────────────────────────
console.log("\nUpdating HTML files...");

const htmlFiles = getAllHtmlFiles(ROOT);
let updatedCount = 0;

const PRECONNECT_TAGS = [
  '<link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin>',
  '<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>',
  '<link rel="preconnect" href="https://www.google-analytics.com" crossorigin>',
  '<link rel="preconnect" href="https://rveunrzbeynaizitqanx.supabase.co" crossorigin>'
].join("\n    ");

const CRITICAL_STYLE_TAG = `<style>${criticalMin}</style>`;
const DEFERRED_LINK_TAG = `<link rel="stylesheet" href="/${deferredName}" media="print" onload="this.media='all'">`;
const NOSCRIPT_TAG = `<noscript><link rel="stylesheet" href="/${deferredName}"></noscript>`;

for (const htmlPath of htmlFiles) {
  let html = readFileSync(htmlPath, "utf8");
  let modified = false;

  // 1. Replace render-blocking CSS link with critical inline + async deferred
  const cssLinkRegex = /<link\s+rel="stylesheet"\s+href="\/styles\.css"\s*\/?>/g;
  if (cssLinkRegex.test(html)) {
    html = html.replace(/<link\s+rel="stylesheet"\s+href="\/styles\.css"\s*\/?>/,
      `${CRITICAL_STYLE_TAG}\n    ${DEFERRED_LINK_TAG}\n    ${NOSCRIPT_TAG}`);
    modified = true;
  }

  // 2. Add preconnect hints if missing
  if (!html.includes('pagead2.googlesyndication.com" crossorigin>')) {
    // Insert after existing preconnects if any, else after </title>, else after <meta charset
    if (html.includes('<link rel="preconnect"')) {
      const lastPreconnect = html.lastIndexOf('<link rel="preconnect"');
      const endOfLine = html.indexOf('>', lastPreconnect) + 1;
      html = html.slice(0, endOfLine) + '\n    ' + PRECONNECT_TAGS + html.slice(endOfLine);
    } else if (html.includes('</title>')) {
      html = html.replace('</title>', `</title>\n    ${PRECONNECT_TAGS}`);
    } else if (html.includes('<meta charset')) {
      html = html.replace('<meta charset', `${PRECONNECT_TAGS}\n    <meta charset`);
    }
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

  // 6. Add fetchpriority="high" to hero section if present (improves LCP)
  if (html.includes('class="hero ') && !html.includes('fetchpriority')) {
    html = html.replace(
      /(<section\s+class="hero\s[^"]*")/,
      '$1 fetchpriority="high"'
    );
  }

  // 7. Add logo preload for LCP on pages with nav
  if (!html.includes('rel="preload"') && html.includes('brand-mark')) {
    html = html.replace(
      /(<\/head>)/,
      '    <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" fetchpriority="high">\n    $1'
    );
  }

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

// ─── Done ─────────────────────────────────────────────────────────
console.log("Build complete! Output → dist/");
