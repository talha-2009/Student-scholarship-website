import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const pages = ["competitions/global","competitions/rotating-global","competitions/switzerland","country/global-commonwealth-nations","country/global-eu-consortium","country/global-eu-partner-countries","country/rotating-global","fellowships/austria","fellowships/canada","fellowships/china","fellowships/france","fellowships/germany","fellowships/global","fellowships/india","fellowships/ireland","fellowships/saudi-arabia","fellowships/singapore","fellowships/united-states","internships/austria","internships/france","internships/germany","internships/india","internships/japan","internships/switzerland","internships/united-states","scholarships/australia","scholarships/france","scholarships/global","scholarships/global-eu-consortium","scholarships/netherlands","scholarships/new-zealand","scholarships/singapore","scholarships/switzerland","scholarships/thailand","scholarships/united-states"];
for (const p of pages) {
  const src = join(__dirname, "..", p, "index.html");
  const c = readFileSync(src, "utf8");
  const h1 = (c.match(/<h1>([^<]+)<\/h1>/) || [])[1] || "";
  const cards = [...c.matchAll(/<h3>([^<]+)<\/h3>/g)].map((m) => m[1]);
  const deadlines = [...c.matchAll(/<span class="deadline">([^<]+)<\/span>/g)].map((m) => m[1]);
  const kickers = [...c.matchAll(/<p class="card-kicker">([^<]+)<\/p>/g)].map((m) => m[1]);
  console.log(`${p} :: H1="${h1}"`);
  console.log(`   cards(${cards.length}): ${cards.slice(0, 4).join(" | ")}`);
  console.log(`   deadlines: ${deadlines.slice(0, 3).join(", ")}`);
  console.log(`   kickers: ${[...new Set(kickers)].slice(0, 3).join(", ")}`);
}
