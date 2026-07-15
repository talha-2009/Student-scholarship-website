const data = JSON.parse(require("fs").readFileSync("audit-data.json", "utf8"));

console.log(`=== FULL DATABASE AUDIT: ${data.length} opportunities ===\n`);

// 1. Check for null/empty/missing fields
const fields = ["type", "funding", "title", "country", "level", "field", "deadline", "description", "link", "slug"];
const issues = { nullFields: [], shortDesc: [], noFunding: [], noDeadline: [], noLink: [], noSlug: [], noCountry: [], noLevel: [], noField: [], noType: [] };

data.forEach((o, i) => {
  fields.forEach(f => {
    if (o[f] === null || o[f] === undefined || (typeof o[f] === "string" && o[f].trim() === "")) {
      issues.nullFields.push({ idx: i, title: o.title, field: f });
    }
  });
  if (o.description && o.description.length < 200) issues.shortDesc.push({ idx: i, title: o.title, len: o.description.length });
  if (!o.funding || o.funding.trim() === "") issues.noFunding.push({ idx: i, title: o.title });
  if (!o.deadline || o.deadline.trim() === "") issues.noDeadline.push({ idx: i, title: o.title });
  if (!o.link || o.link.trim() === "") issues.noLink.push({ idx: i, title: o.title });
  if (!o.slug || o.slug.trim() === "") issues.noSlug.push({ idx: i, title: o.title });
  if (!o.country || o.country.trim() === "") issues.noCountry.push({ idx: i, title: o.title });
  if (!o.level || o.level.trim() === "") issues.noLevel.push({ idx: i, title: o.title });
  if (!o.field || o.field.trim() === "") issues.noField.push({ idx: i, title: o.title });
  if (!o.type || o.type.trim() === "") issues.noType.push({ idx: i, title: o.title });
});

console.log("--- NULL/EMPTY FIELDS ---");
if (issues.nullFields.length === 0) console.log("  NONE - All fields populated");
else issues.nullFields.forEach(x => console.log(`  [${x.idx}] ${x.title}: missing "${x.field}"`));

console.log("\n--- SHORT DESCRIPTIONS (<200 chars) ---");
if (issues.shortDesc.length === 0) console.log("  NONE");
else issues.shortDesc.forEach(x => console.log(`  [${x.idx}] ${x.title}: ${x.len} chars`));

console.log("\n--- NO FUNDING INFO ---");
if (issues.noFunding.length === 0) console.log("  NONE");
else issues.noFunding.forEach(x => console.log(`  [${x.idx}] ${x.title}`));

console.log("\n--- NO DEADLINE ---");
if (issues.noDeadline.length === 0) console.log("  NONE");
else issues.noDeadline.forEach(x => console.log(`  [${x.idx}] ${x.title}`));

console.log("\n--- NO LINK ---");
if (issues.noLink.length === 0) console.log("  NONE");
else issues.noLink.forEach(x => console.log(`  [${x.idx}] ${x.title}`));

console.log("\n--- NO SLUG ---");
if (issues.noSlug.length === 0) console.log("  NONE");
else issues.noSlug.forEach(x => console.log(`  [${x.idx}] ${x.title}`));

console.log("\n--- NO COUNTRY ---");
if (issues.noCountry.length === 0) console.log("  NONE");
else issues.noCountry.forEach(x => console.log(`  [${x.idx}] ${x.title}`));

console.log("\n--- NO LEVEL ---");
if (issues.noLevel.length === 0) console.log("  NONE");
else issues.noLevel.forEach(x => console.log(`  [${x.idx}] ${x.title}`));

console.log("\n--- NO FIELD ---");
if (issues.noField.length === 0) console.log("  NONE");
else issues.noField.forEach(x => console.log(`  [${x.idx}] ${x.title}`));

// 2. Check for duplicate slugs
console.log("\n--- DUPLICATE SLUGS ---");
const slugs = data.map(o => o.slug);
const dupSlugs = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (dupSlugs.length === 0) console.log("  NONE");
else dupSlugs.forEach(s => console.log(`  DUPLICATE: "${s}"`));

// 3. Check for duplicate titles
console.log("\n--- DUPLICATE TITLES ---");
const titles = data.map(o => o.title.toLowerCase());
const dupTitles = titles.filter((t, i) => titles.indexOf(t) !== i);
if (dupTitles.length === 0) console.log("  NONE");
else dupTitles.forEach(t => console.log(`  DUPLICATE: "${t}"`));

// 4. Check for similar titles (fuzzy)
console.log("\n--- SIMILAR TITLES (potential duplicates) ---");
for (let i = 0; i < data.length; i++) {
  for (let j = i + 1; j < data.length; j++) {
    const a = data[i].title.toLowerCase();
    const b = data[j].title.toLowerCase();
    // Simple similarity: shared words
    const wordsA = new Set(a.split(/\s+/));
    const wordsB = new Set(b.split(/\s+/));
    const shared = [...wordsA].filter(w => wordsB.has(w) && w.length > 3);
    const similarity = shared.length / Math.min(wordsA.size, wordsB.size);
    if (similarity > 0.6) {
      console.log(`  [${i}] "${data[i].title}" vs [${j}] "${data[j].title}" (${(similarity * 100).toFixed(0)}% similar)`);
    }
  }
}

// 5. Check description uniqueness (first 50 chars overlap)
console.log("\n--- DESCRIPTION SIMILARITY CHECK ---");
let descIssues = 0;
for (let i = 0; i < data.length; i++) {
  for (let j = i + 1; j < data.length; j++) {
    if (!data[i].description || !data[j].description) continue;
    const a = data[i].description.substring(0, 100).toLowerCase();
    const b = data[j].description.substring(0, 100).toLowerCase();
    if (a === b) {
      console.log(`  IDENTICAL START: [${i}] "${data[i].title}" vs [${j}] "${data[j].title}"`);
      descIssues++;
    }
  }
}
if (descIssues === 0) console.log("  NONE - All descriptions have unique openings");

// 6. Check deadline validity (past deadlines)
console.log("\n--- EXPIRED DEADLINES ---");
const now = new Date();
data.forEach((o, i) => {
  if (o.deadline) {
    const d = new Date(o.deadline);
    if (d < now) {
      console.log(`  [${i}] ${o.title}: ${o.deadline} (EXPIRED)`);
    }
  }
});

// 7. Check link format
console.log("\n--- INVALID LINK FORMAT ---");
data.forEach((o, i) => {
  if (o.link && !o.link.startsWith("http")) {
    console.log(`  [${i}] ${o.title}: "${o.link}"`);
  }
});

// 8. Description length distribution
console.log("\n--- DESCRIPTION LENGTH DISTRIBUTION ---");
const lengths = data.map(o => o.description ? o.description.length : 0).sort((a, b) => a - b);
console.log(`  Shortest: ${lengths[0]} chars`);
console.log(`  Longest: ${lengths[lengths.length - 1]} chars`);
console.log(`  Median: ${lengths[Math.floor(lengths.length / 2)]} chars`);
console.log(`  Under 200 chars: ${lengths.filter(l => l < 200).length}`);
console.log(`  200-500 chars: ${lengths.filter(l => l >= 200 && l < 500).length}`);
console.log(`  500-1000 chars: ${lengths.filter(l => l >= 500 && l < 1000).length}`);
console.log(`  1000+ chars: ${lengths.filter(l => l >= 1000).length}`);

// 9. Type distribution
console.log("\n--- TYPE DISTRIBUTION ---");
const types = {};
data.forEach(o => { types[o.type] = (types[o.type] || 0) + 1; });
Object.entries(types).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`  ${t}: ${c}`));

// 10. Country distribution
console.log("\n--- COUNTRY DISTRIBUTION ---");
const countries = {};
data.forEach(o => { countries[o.country] = (countries[o.country] || 0) + 1; });
Object.entries(countries).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => console.log(`  ${c}: ${n}`));

console.log("\n=== AUDIT COMPLETE ===");
