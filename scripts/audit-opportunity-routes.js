const {
  SITE_URL,
  assignOpportunitySlugs,
  getOpportunityDetailUrl,
  slugify
} = require("./opportunity-slugs");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://rveunrzbeynaizitqanx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_i_Hzb5vyGZhjIXWNprJ_Tg_FJTry3DD";

async function fetchOpportunities() {
  const url = `${SUPABASE_URL}/rest/v1/opportunities?select=id,type,title,country,level,field,deadline,description,link,slug,created_at&order=created_at.desc`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function auditRoutes(opportunities) {
  const rows = assignOpportunitySlugs(opportunities);
  const slugCounts = new Map();
  const failures = [];

  rows.forEach((item) => {
    slugCounts.set(item.slug, (slugCounts.get(item.slug) || 0) + 1);

    if (!item.slug) failures.push(`${item.id}: missing slug`);
    if (item.slug !== slugify(item.slug)) failures.push(`${item.id}: slug is not normalized (${item.slug})`);
    if (!/^\/opportunity\/[a-z0-9-]+\/$/.test(getOpportunityDetailUrl(item))) {
      failures.push(`${item.id}: invalid detail URL ${getOpportunityDetailUrl(item)}`);
    }
  });

  for (const [slug, count] of slugCounts.entries()) {
    if (count > 1) failures.push(`Duplicate slug generated: ${slug} (${count} records)`);
  }

  const sample = rows.find((item) => item.slug === "daad-research-grants-for-doctoral-candidates-and-young-academics-germany");
  if (!sample) {
    failures.push("Sample failing DAAD slug did not resolve to a live opportunity record");
  }

  return { rows, failures };
}

async function main() {
  const opportunities = await fetchOpportunities();
  const { rows, failures } = auditRoutes(opportunities);

  console.log(`Opportunities tested: ${rows.length}`);
  console.log(`Generated route count: ${rows.length}`);
  console.log(`Sample route: ${SITE_URL}/opportunity/daad-research-grants-for-doctoral-candidates-and-young-academics-germany/`);

  if (failures.length) {
    console.error("Route audit failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log("Route audit passed: every live opportunity has one unique normalized slug URL.");
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { auditRoutes };
