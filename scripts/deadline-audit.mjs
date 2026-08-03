import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OPP = join(__dirname, "..", "dist", "opportunity");

function walk(dir, results = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else if (entry.name.endsWith(".html")) results.push(full);
  }
  return results;
}

const files = walk(OPP);
const today = new Date();
let expired = 0, rolling = 0, none = 0, parsed = 0;
const exList = [];

for (const f of files) {
  const c = readFileSync(f, "utf8");
  const m = c.match(/"timeRequired"\s*:\s*"([^"]+)"/);
  const slug = f.split(join("opportunity", "\\")).pop().split("\\")[0];
  if (m) {
    const dt = m[1];
    if (/varies|rolling|see|n\/a|tbd|open|apply early/i.test(dt)) rolling++;
    else {
      const d = new Date(dt);
      if (!isNaN(d)) { parsed++; if (d < today) { expired++; exList.push({ slug, deadline: dt }); } }
      else none++;
    }
  } else none++;
}

console.log(`total: ${files.length} | expired: ${expired} | rolling/non-date: ${rolling} | parsed: ${parsed} | no deadline: ${none}`);
for (const e of exList) console.log(`  ${e.slug} => ${e.deadline}`);
