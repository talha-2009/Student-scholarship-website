#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { extname, join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const ROOT = dirname(__filename);
const PROJECT_ROOT = join(ROOT, "..");
const CDN = "https://flagcdn.com/h20/";

function flagImg(code, country, w, h) {
  return '<img class="country-flag" src="' + (code === "global" ? "/global.svg" : CDN + code + ".svg") + '" alt="' + (code === "global" ? "Global" : "Flag of " + country) + '" width="' + w + '" height="' + h + '" loading="lazy">';
}

const emojiMap = [
  ["\u{1F1E6}\u{1F1FA}", flagImg("au", "Australia", 20, 15)],
  ["\u{1F1E6}\u{1F1F9}", flagImg("at", "Austria", 20, 15)],
  ["\u{1F1E7}\u{1F1EA}", flagImg("be", "Belgium", 20, 15)],
  ["\u{1F1E8}\u{1F1E6}", flagImg("ca", "Canada", 20, 15)],
  ["\u{1F1E8}\u{1F1F3}", flagImg("cn", "China", 20, 15)],
  ["\u{1F1E9}\u{1F1EA}", flagImg("de", "Germany", 20, 15)],
  ["\u{1F1EA}\u{1F1F8}", flagImg("eu", "Europe", 20, 15)],
  ["\u{1F1EB}\u{1F1F7}", flagImg("fr", "France", 20, 15)],
  ["\u{1F1EE}\u{1F1F9}", flagImg("it", "Italy", 20, 15)],
  ["\u{1F1EF}\u{1F1F5}", flagImg("jp", "Japan", 20, 15)],
  ["\u{1F1F0}\u{1F1F7}", flagImg("kr", "South Korea", 20, 15)],
  ["\u{1F1F2}\u{1F1FE}", flagImg("my", "Malaysia", 20, 15)],
  ["\u{1F1F3}\u{1F1F1}", flagImg("nl", "Netherlands", 20, 15)],
  ["\u{1F1F5}\u{1F1F0}", flagImg("kr", "South Korea", 20, 15)],
  ["\u{1F1F8}\u{1F1E6}", flagImg("sa", "Saudi Arabia", 20, 15)],
  ["\u{1F1F8}\u{1F1EA}", flagImg("ch", "Switzerland", 20, 15)],
  ["\u{1F1F9}\u{1F1F3}", flagImg("tr", "Turkey", 20, 15)],
  ["\u{1F1E6}\u{1F1EA}", flagImg("ae", "UAE", 20, 15)],
  ["\u{1F1EC}\u{1F1E7}", flagImg("gb", "United Kingdom", 20, 15)],
  ["\u{1F1FA}\u{1F1F8}", flagImg("us", "United States", 20, 15)],
  ["\u{1F30D}", flagImg("global", "", 20, 20)],
];

function getAllHtmlFiles(dir, results) {
  if (!results) results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !["node_modules", "dist", ".git", ".vercel", ".agents"].includes(entry.name)) {
      getAllHtmlFiles(full, results);
    } else if (entry.isFile() && extname(entry.name) === ".html") {
      results.push(full);
    }
  }
  return results;
}

function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

const htmlFiles = getAllHtmlFiles(PROJECT_ROOT);
let updatedCount = 0;

for (const filePath of htmlFiles) {
  const original = readFileSync(filePath, "utf8");
  let content = original;
  for (const [emoji, html] of emojiMap) {
    content = replaceAll(content, emoji, html);
  }
  if (content !== original) {
    writeFileSync(filePath, content, "utf8");
    const relative = filePath.slice(PROJECT_ROOT.length + 1);
    console.log("  Updated: " + relative);
    updatedCount++;
  }
}

console.log("\nScanned " + htmlFiles.length + " HTML files.");
console.log("Updated " + updatedCount + " files with flag images.");
