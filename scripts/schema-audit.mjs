import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");

function walk(dir, results = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else if (entry.name.endsWith(".html")) results.push(full);
  }
  return results;
}

const files = walk(DIST);
let totalBlocks = 0;
let validBlocks = 0;
const errors = [];
const typesSeen = {};
let emptyBlockCount = 0;

for (const f of files) {
  const c = readFileSync(f, "utf8");
  const blocks = [...c.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of blocks) {
    totalBlocks++;
    const raw = m[1].trim();
    if (!raw) { emptyBlockCount++; continue; }
    try {
      const parsed = JSON.parse(raw);
      const blocks = Array.isArray(parsed) ? parsed : [parsed];
      for (const data of blocks) {
        const types = Array.isArray(data["@type"]) ? data["@type"] : [data["@type"]];
        for (const t of types) {
          if (t) typesSeen[t] = (typesSeen[t] || 0) + 1;
          if (t === "Article") {
            if (!data.author) errors.push({ path: f, msg: "Article missing author" });
            if (!data.datePublished) errors.push({ path: f, msg: "Article missing datePublished" });
          }
          if (t === "BreadcrumbList") {
            const items = data.itemListElement;
            if (!items || !Array.isArray(items) || items.length < 2) errors.push({ path: f, msg: "BreadcrumbList has <2 items" });
            else {
              for (const it of items) {
                if (!it.item) errors.push({ path: f, msg: `BreadcrumbList item ${it.position} missing item URL` });
              }
            }
          }
        }
      }
      validBlocks++;
    } catch (e) {
      errors.push({ path: f, msg: `JSON-LD parse error: ${e.message}`, snippet: raw.slice(0, 120) });
    }
  }
}

console.log(`Files: ${files.length}`);
console.log(`JSON-LD blocks: ${totalBlocks}, valid: ${validBlocks}, empty: ${emptyBlockCount}, errors: ${errors.length}`);
console.log("\nSchema types seen:");
Object.entries(typesSeen).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log("\nErrors (first 40):");
errors.slice(0, 40).forEach((e) => console.log(`  ${e.path.replace(/\\/g, "/").replace("dist/", "")} :: ${e.msg}`));
