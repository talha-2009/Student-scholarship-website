import { readFileSync, writeFileSync } from "fs";

// Mapping: orphan guide -> related guides that should link to it (and vice versa)
const pairs = [
  // ACT guide: link from SAT guide (both US admissions tests)
  ["guides/act-guide.html", "guides/sat-guide.html"],
  // GMAT guide: link from SAT guide (standardized tests)
  ["guides/gmat-guide.html", "guides/sat-guide.html"],
  // best-skills: link from career-planning (both career skills)
  ["guides/best-skills.html", "guides/career-planning.html"],
  // scholarship-interview-questions: link from scholarship-interview
  ["guides/scholarship-interview-questions.html", "guides/scholarship-interview.html"],
];

for (const [orphanRel, relatedRel] of pairs) {
  const orphan = readFileSync(orphanRel, "utf8");
  const orphanName = orphan.match(/<h1>([^<]+)<\/h1>/)?.[1]?.trim() || orphanRel.split("/").pop().replace(".html", "");
  const orphanLink = `<li><a href="/${orphanRel}">${orphanName}</a></li>`;

  const relatedPath = relatedRel;
  let c = readFileSync(relatedPath, "utf8");
  const idx = c.indexOf("Explore More Resources");
  if (idx === -1) {
    console.log(`SKIP ${relatedRel} (no Explore More Resources)`);
    continue;
  }
  const articleEnd = c.indexOf("</article>", idx);
  const segEnd = articleEnd === -1 ? c.indexOf("</main>", idx) : articleEnd;
  const seg = c.slice(idx, segEnd);
  if (seg.includes(orphanRel)) {
    console.log(`SKIP ${relatedRel} (already links to ${orphanRel})`);
    continue;
  }
  // Insert before the last </li> in the resource list
  const lastLi = seg.lastIndexOf("</li>");
  const insertAt = idx + lastLi + 5;
  const updated = c.slice(0, insertAt) + orphanLink + c.slice(insertAt);
  writeFileSync(relatedPath, updated, "utf8");
  console.log(`ADDED ${orphanRel} <- ${relatedRel}`);
}
