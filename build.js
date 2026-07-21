#!/usr/bin/env node
/**
 * OpportunityNest Production Build
 * Minifies CSS/JS with esbuild, generates hashed filenames,
 * copies and updates all HTML files, outputs to dist/.
 */
import { buildSync } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync, statSync, renameSync } from "fs";
import { join, relative, extname, dirname, basename } from "path";
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

// ─── Step 1: Minify CSS and JS ───────────────────────────────────
console.log("Building production assets...\n");

const cssFiles = ["styles.css"];
const jsFiles = [
  "nav.js", "utils.js", "script.js", "category.js",
  "contact.js", "opportunity-detail.js", "internship-detail.js", "dynamic-types.js"
];
const assetMap = {};

// Minify CSS
for (const file of cssFiles) {
  const srcPath = join(ROOT, file);
  const origSize = statSync(srcPath).size;
  const input = readFileSync(srcPath, "utf8");

  const result = buildSync({
    stdin: { contents: input, loader: "css", resolveDir: ROOT },
    bundle: false,
    minify: true,
    write: false,
    sourcemap: false,
    legalComments: "none"
  });

  const minContent = result.outputFiles[0].text;
  const hash = hashContent(minContent);
  const hashedName = file.replace(".css", `.${hash}.min.css`);
  writeFileSync(join(DIST, hashedName), minContent);

  const minSize = Buffer.byteLength(minContent);
  const savings = ((1 - minSize / origSize) * 100).toFixed(0);
  console.log(`  ${file}  →  ${hashedName}  (${(origSize/1024).toFixed(1)} KB → ${(minSize/1024).toFixed(1)} KB, -${savings}%)`);
  assetMap[file] = hashedName;
}

// Minify JS
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
  assetMap[file] = hashedName;
}

// ─── Step 2: Copy and update HTML files ───────────────────────────
console.log("\nUpdating HTML files...");

const htmlFiles = getAllHtmlFiles(ROOT);
let updatedCount = 0;

for (const htmlPath of htmlFiles) {
  let html = readFileSync(htmlPath, "utf8");
  let modified = false;

  for (const [src, hashedName] of Object.entries(assetMap)) {
    const ext = extname(src);
    if (ext === ".css") {
      const oldRef = `href="/${src}"`;
      const newRef = `href="/${hashedName}"`;
      if (html.includes(oldRef)) {
        html = html.split(oldRef).join(newRef);
        modified = true;
      }
    } else {
      const oldRef = `src="/${src}"`;
      const newRef = `src="/${hashedName}"`;
      if (html.includes(oldRef)) {
        html = html.split(oldRef).join(newRef);
        modified = true;
      }
    }
  }

  const relativePath = relative(ROOT, htmlPath);
  const distPath = join(DIST, relativePath);
  mkdirp(join(distPath, ".."));
  writeFileSync(distPath, html);
  if (modified) updatedCount++;
}

console.log(`  Processed ${htmlFiles.length} HTML files (${updatedCount} updated)\n`);

// ─── Step 3: Copy static assets ──────────────────────────────────
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
