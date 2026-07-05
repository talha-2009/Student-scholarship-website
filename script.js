const ON = window.OpportunityNest;
const opportunityGrid = document.querySelector("#opportunity-grid");
const opportunityStatus = document.querySelector("#opportunity-status");
const opportunityControls = document.querySelector("#opportunity-controls");
const liveSearch = document.querySelector("#live-search");
const countryFilter = document.querySelector("#country-filter");
const typeFilter = document.querySelector("#type-filter");
const sortFilter = document.querySelector("#sort-filter");
const pagination = document.querySelector("#pagination");
const featuredInternshipGrid = document.querySelector("#featured-internship-grid");
const headerNavMenu = document.querySelector("#nav-menu");

let opportunities = [];
let currentPage = 1;

const setOpportunityStatus = (message, isError = false) => ON.setStatus(opportunityStatus, message, isError);

const normalizeTypeKey = (type = "") => type.trim().toLowerCase();

const getUniqueTypes = (items = []) => {
  const types = new Map();
  items.forEach((item) => {
    const type = item.type?.trim();
    if (!type) return;
    const key = normalizeTypeKey(type);
    if (!types.has(key)) {
      types.set(key, type);
    }
  });
  return Array.from(types.values()).sort((a, b) => a.localeCompare(b));
};

const populateTypeFilter = (types = []) => {
  if (!typeFilter) return;

  const selectedType = typeFilter.value;
  typeFilter.innerHTML = '<option value="">All types</option>';

  types.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    typeFilter.appendChild(option);
  });

  if (selectedType && types.some((type) => normalizeTypeKey(type) === normalizeTypeKey(selectedType))) {
    const matchingType = types.find((type) => normalizeTypeKey(type) === normalizeTypeKey(selectedType));
    typeFilter.value = matchingType;
  }
};

const applyTypeFromUrl = (types = []) => {
  if (!typeFilter) return;

  const urlType = new URLSearchParams(window.location.search).get("type");
  if (!urlType) return;

  const matchingType = types.find((type) => normalizeTypeKey(type) === normalizeTypeKey(urlType));
  if (matchingType) {
    typeFilter.value = matchingType;
  }
};

const renderConditionalTypeNavLinks = (types = []) => {
  if (!headerNavMenu) return;

  headerNavMenu.querySelectorAll("[data-dynamic-type-link]").forEach((link) => link.remove());

  const links = [
    { type: "Competition", label: "Competitions" },
    { type: "Youth Program", label: "Youth Programs" }
  ];
  const insertBefore = headerNavMenu.querySelector('a[href="/about.html"]') || headerNavMenu.querySelector(".nav-cta");

  links.forEach(({ type, label }) => {
    const matchingType = types.find((itemType) => normalizeTypeKey(itemType) === normalizeTypeKey(type));
    if (!matchingType) return;

    const link = document.createElement("a");
    link.href = `/?type=${encodeURIComponent(matchingType)}#opportunities`;
    link.textContent = label;
    link.dataset.dynamicTypeLink = "true";

    headerNavMenu.insertBefore(link, insertBefore);
  });
};

const getCombinedDataset = () => {
  const selectedType = typeFilter?.value || "";

  if (selectedType) {
    return opportunities.filter((o) => normalizeTypeKey(o.type) === normalizeTypeKey(selectedType));
  }
  return opportunities;
};

const renderOpportunities = () => {
  if (!opportunityGrid) return;

  const dataset = getCombinedDataset();
  
  // When a type is selected, dataset already contains only that type from getCombinedDataset
  // So don't apply additional type filter - only filter by search and country
  const filtered = ON.filterOpportunities(dataset, {
    searchTerm: liveSearch?.value || "",
    country: countryFilter?.value || "",
    type: ""  // Always empty since dataset is pre-filtered by type
  }).sort((a, b) => ON.compareOpportunities(a, b, sortFilter?.value || "deadline"));

  if (!filtered.length) {
    opportunityGrid.innerHTML = '<p class="empty-state">No opportunities match your search yet. Try clearing a filter or browse category pages.</p>';
    ON.renderPagination(pagination, 0, 1, () => {});
    setOpportunityStatus("No matching opportunities found.");
    return;
  }

  const { page, pageCount, items } = ON.paginate(filtered, currentPage);
  currentPage = page;

  opportunityGrid.innerHTML = items.map(ON.renderOpportunityCard).join("");
  ON.renderPagination(pagination, pageCount, currentPage, (nextPage) => {
    currentPage = nextPage;
    renderOpportunities();
    opportunityGrid.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  setOpportunityStatus(`${filtered.length} opportunities found. Showing page ${currentPage} of ${pageCount}.`);
};

const loadOpportunities = async () => {
  if (!opportunityGrid) return;

  opportunityGrid.innerHTML = ON.renderLoadingSkeleton(6);
  setOpportunityStatus("Loading opportunities...");

  try {
    const { data, error } = await ON.getSupabaseClient()
      .from("opportunities")
      .select("id,type,funding,title,country,level,field,deadline,deadline_status,description,link,slug,created_at")
      .order("deadline", { ascending: true });

    if (error) throw error;
    opportunities = (data || []).map(ON.normalizeOpportunity);
    const types = getUniqueTypes(opportunities);
    populateTypeFilter(types);
    applyTypeFromUrl(types);
    renderConditionalTypeNavLinks(types);
    renderOpportunities();
  } catch (error) {
    console.error("Supabase opportunities fetch failed:", error);
    opportunityGrid.innerHTML = ON.renderErrorWithRetry(
      error.message || "We could not load opportunities right now. Please check your connection.",
      "loadOpportunities()"
    );
    setOpportunityStatus(error.message || "We could not load opportunities right now.", true);
  }
};

const renderFeaturedInternships = (items = []) => {
  if (!featuredInternshipGrid) return;

  if (!items.length) {
    featuredInternshipGrid.innerHTML = '<p class="empty-state">No featured internships are available yet.</p>';
    return;
  }

  featuredInternshipGrid.innerHTML = items
    .map((item) => {
      const detailUrl = ON.getOpportunityUrl(item);
      const urgency = ON.getDeadlineUrgency(item);
      const urgencyClass = urgency !== "none" ? ` deadline-${urgency}` : "";
      const whoCanApply = item.level || "Open to eligible applicants";
      const fieldLabel = item.field && item.field !== "All Fields" ? item.field : "Multiple Fields";

      return `
        <article class="live-opportunity-card compact-card internship-card">
          ${ON.getCountryLandmark(item.country)}
          <div class="opportunity-card-top">
            <div class="internship-brand">
              <span class="internship-logo" aria-hidden="true">${ON.escapeHtml((item.title || "ON").slice(0, 2).toUpperCase())}</span>
              <div>
                <p class="card-kicker">${ON.getCountryFlag(item.country)} ${ON.escapeHtml(item.country || "Global")}</p>
                <h3>${ON.escapeHtml(item.title || "Internship program")}</h3>
              </div>
            </div>
            <span class="deadline${urgencyClass}">${ON.escapeHtml(ON.formatDeadline(item))}</span>
          </div>
          <ul class="card-overview compact-overview">
            <li><strong>Field:</strong> ${ON.escapeHtml(fieldLabel)}</li>
            <li><strong>Who can apply:</strong> ${ON.escapeHtml(whoCanApply)}</li>
            <li><strong>Funding:</strong> ${ON.escapeHtml(item.funding || "See details")}</li>
          </ul>
          <div class="card-actions">
            <a class="button button-secondary" href="${ON.escapeHtml(detailUrl)}">View Details</a>
            <a class="button button-primary" href="${ON.escapeHtml(item.link || "#")}" target="_blank" rel="noopener noreferrer">Apply Now <span aria-hidden="true">↗</span></a>
          </div>
        </article>
      `;
    })
    .join("");
};

const loadFeaturedInternships = async () => {
  if (!featuredInternshipGrid) return;

  featuredInternshipGrid.innerHTML = ON.renderLoadingSkeleton(3);

  try {
    const { data, error } = await ON.getSupabaseClient()
      .from("opportunities")
      .select("id,type,funding,title,country,level,field,deadline,deadline_status,description,link,slug,created_at")
      .eq("type", "Internship")
      .not("link", "is", null)
      .order("deadline", { ascending: true, nullsFirst: false })
      .limit(3);

    if (error) throw error;
    renderFeaturedInternships((data || []).map(ON.normalizeOpportunity));
  } catch (error) {
    console.error("Featured internships fetch failed:", error);
    featuredInternshipGrid.innerHTML =
      '<p class="empty-state">We could not load featured internships right now.</p>';
  }
};

const resetAndRender = () => {
  currentPage = 1;
  renderOpportunities();
};

const clearFilters = () => {
  if (liveSearch) liveSearch.value = "";
  if (countryFilter) countryFilter.value = "";
  if (typeFilter) typeFilter.value = "";
  if (sortFilter) sortFilter.value = "deadline";
  currentPage = 1;
  renderOpportunities();
};

opportunityControls?.addEventListener("input", resetAndRender);
opportunityControls?.addEventListener("submit", (event) => {
  event.preventDefault();
  resetAndRender();
});

document.getElementById("clear-filters")?.addEventListener("click", clearFilters);

const urlSearch = new URLSearchParams(window.location.search).get("q");
if (urlSearch && liveSearch) {
  liveSearch.value = urlSearch;
}

const setSearchPageMeta = () => {
  const query = new URLSearchParams(window.location.search).get("q");
  if (!query) return;

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }

  canonical.href = `${ON.SITE_URL}/`;

  let robots = document.querySelector('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement("meta");
    robots.name = "robots";
    document.head.appendChild(robots);
  }
  robots.content = "noindex,follow";
};

setSearchPageMeta();

ON.populateCountryFilter(countryFilter);
ON.updateStatistics();
loadOpportunities();
loadFeaturedInternships();
