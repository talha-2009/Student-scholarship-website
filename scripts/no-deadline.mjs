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

for (const f of walk(OPP)) {
  const c = readFileSync(f, "utf8");
  const slug = f.split(join("opportunity", "\\")).pop().split("\\")[0];
  if (!/"timeRequired"\s*:\s*"([^"]+)"/.test(c)) {
    const deadline = c.match(/[Dd]eadline[^<]{0,100}/);
    console.log(`NO-DEADLINE ${slug} :: ${deadline ? deadline[0].slice(0, 100) : "n/a"}`);
  }
}
