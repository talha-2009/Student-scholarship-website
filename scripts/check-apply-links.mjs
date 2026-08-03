import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OPP_DIR = join(__dirname, "..", "dist", "opportunity");

function walk(dir, results = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else if (entry.name.endsWith(".html")) results.push(full);
  }
  return results;
}

const files = walk(OPP_DIR);
const SOCIAL = /facebook\.com|twitter\.com|linkedin\.com|instagram\.com|youtube\.com/;
const results = [];

for (const f of files) {
  const c = readFileSync(f, "utf8");
  const apply = [...c.matchAll(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>(?:[^<]*)Apply[^<]*<\/a>/gi)].map((m) => m[1]);
  const all = [...c.matchAll(/<a[^>]*href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]).filter((u) => !SOCIAL.test(u));
  results.push({
    slug: f.split(join("opportunity", "\\")).pop().split("\\")[0],
    apply,
    external: [...new Set(all)].filter((u) => u !== apply[0]),
  });
}

const noApply = results.filter((r) => r.apply.length === 0);
console.log(`total opportunity pages: ${results.length}`);
console.log(`pages with NO Apply button: ${noApply.length}`);
for (const r of noApply) {
  console.log(`${r.slug} | external: ${r.external.join(", ")}`);
}
