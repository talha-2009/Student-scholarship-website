const fs = require("fs");
const path = require("path");
const { SITE_URL, assignOpportunitySlugs, getOpportunityDetailUrl } = require("./opportunity-slugs");
const SITE_ROOT = "https://www.opportunitynest.org";

var SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) { console.error("ERROR: SUPABASE_URL env var required"); process.exit(1); }
var SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_PUBLISHABLE_KEY) { console.error("ERROR: SUPABASE_PUBLISHABLE_KEY env var required"); process.exit(1); }

const staticPages = [
  ["/", "daily", "1.0"],
  ["/scholarships/", "daily", "0.9"],
  ["/internships/", "daily", "0.9"],
  ["/fellowships/", "daily", "0.9"],
  ["/competitions.html", "daily", "0.8"],
  ["/about.html", "monthly", "0.7"],
  ["/contact.html", "monthly", "0.6"],
  ["/faq.html", "monthly", "0.6"],
  ["/privacy.html", "yearly", "0.5"],
  ["/terms.html", "yearly", "0.5"],
  ["/disclaimer.html", "yearly", "0.5"],
  ["/country/switzerland/", "weekly", "0.7"],
  ["/country/canada/", "weekly", "0.7"],
  ["/country/austria/", "weekly", "0.7"],
  ["/country/germany/", "weekly", "0.7"],
  ["/country/global/", "weekly", "0.7"],
  ["/country/australia/", "weekly", "0.7"],
  ["/country/united-kingdom/", "weekly", "0.7"],
  ["/scholarships/australia/", "weekly", "0.7"],
  ["/scholarships/canada/", "weekly", "0.7"],
  ["/scholarships/germany/", "weekly", "0.7"],
  ["/scholarships/united-kingdom/", "weekly", "0.7"],
  ["/internships/austria/", "weekly", "0.7"],
  ["/internships/germany/", "weekly", "0.7"],
  ["/internships/global/", "weekly", "0.7"],
  ["/internships/switzerland/", "weekly", "0.7"],
  ["/fellowships/austria/", "weekly", "0.7"],
  ["/fellowships/canada/", "weekly", "0.7"],
  ["/fellowships/germany/", "weekly", "0.7"],
  ["/fellowships/global/", "weekly", "0.7"],
  ["/competitions/switzerland/", "weekly", "0.7"]
];

async function fetchOpportunities() {
  const url = `${SUPABASE_URL}/rest/v1/opportunities?select=id,title,country,slug,created_at,deadline,deadline_status&order=created_at.desc`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status} ${await response.text()}`);
  }

  const rows = await response.json();
  return rows.filter((item) => {
    if (item.deadline_status && item.deadline_status !== "fixed") return true;
    if (!item.deadline || !/^\d{4}-\d{2}-\d{2}$/.test(item.deadline)) return true;
    return item.deadline >= new Date().toISOString().slice(0, 10);
  });
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderUrl(loc, changefreq, priority, lastmod = "") {
  const lastmodTag = lastmod ? `\n    <lastmod>${xmlEscape(lastmod.slice(0, 10))}</lastmod>` : "";
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmodTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function main() {
  const opportunities = assignOpportunitySlugs(await fetchOpportunities());
  const entries = [
    ...staticPages.map(([pathName, changefreq, priority]) => renderUrl(`${SITE_ROOT}${pathName}`, changefreq, priority)),
    ...opportunities.map((item) =>
      renderUrl(`${SITE_ROOT}${getOpportunityDetailUrl(item)}`, "weekly", "0.8", item.created_at)
    )
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(__dirname, "..", "sitemap.xml"), sitemap);
  fs.writeFileSync(path.join(__dirname, "..", "sitemap.xml"), sitemap.replace(/https:\/\/opportunitynest\.org/g, SITE_ROOT));
  console.log(`Generated sitemap.xml with ${entries.length} URLs (${opportunities.length} opportunities).`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
