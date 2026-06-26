const SITE_URL = "https://opportunitynest.org";

function slugify(value = "") {
  const normalized = String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "opportunity";
}

function getOpportunitySlugBase(item) {
  return item.slug || slugify(`${item.title} ${item.country}`);
}

function assignOpportunitySlugs(items = []) {
  const baseCounts = new Map();

  items.forEach((item) => {
    const base = getOpportunitySlugBase(item);
    baseCounts.set(base, (baseCounts.get(base) || 0) + 1);
  });

  return items.map((item) => {
    const base = getOpportunitySlugBase(item);
    const slug = baseCounts.get(base) > 1 ? `${base}-${slugify(item.id).slice(0, 8)}` : base;
    return { ...item, slug };
  });
}

function getOpportunityDetailUrl(item) {
  return `/opportunity/${encodeURIComponent(item.slug || getOpportunitySlugBase(item))}/`;
}

module.exports = {
  SITE_URL,
  slugify,
  getOpportunitySlugBase,
  assignOpportunitySlugs,
  getOpportunityDetailUrl
};
