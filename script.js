const ON = window.ON || window.OpportunityNest;
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

const populateCountryFilter = (items = []) => {
  if (!countryFilter) return;
  const selectedCountry = countryFilter.value;
  const countries = [...new Set(items.map((item) => item.country?.trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));

  countryFilter.innerHTML = '<option value="">All countries</option>';
  countries.forEach((country) => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    countryFilter.appendChild(option);
  });

  if (countries.includes(selectedCountry)) countryFilter.value = selectedCountry;
};

const updateStatistics = (items = []) => {
  const opportunityStat = document.querySelector('[data-stat="opportunities"]');
  const internshipStat = document.querySelector('[data-stat="internships"]');
  const countryStat = document.querySelector('[data-stat="countries"]');
  const internshipStatCard = document.querySelector("#internship-stat-card");
  const internshipCount = items.filter((item) => normalizeTypeKey(item.type) === "internship").length;
  const countryCount = new Set(items.map((item) => item.country?.trim()).filter(Boolean)).size;

  if (opportunityStat) opportunityStat.textContent = items.length.toLocaleString();
  if (internshipStat) internshipStat.textContent = internshipCount.toLocaleString();
  if (countryStat) countryStat.textContent = countryCount.toLocaleString();
  if (internshipStatCard) internshipStatCard.hidden = internshipCount === 0;
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

const updateUrl = () => {
  const params = new URLSearchParams();
  const selectedType = typeFilter?.value || "";
  const selectedCategory = document.getElementById("category-filter")?.value || "";
  const selectedFunding = document.getElementById("funding-filter")?.value || "";
  const selectedCountry = countryFilter?.value || "";
  const searchQuery = liveSearch?.value || "";

  if (selectedType) params.set("type", selectedType);
  if (selectedCategory) params.set("category", selectedCategory);
  if (selectedFunding) params.set("funding", selectedFunding);
  if (selectedCountry) params.set("country", selectedCountry);
  if (searchQuery) params.set("q", searchQuery);

  const queryString = params.toString();
  const newUrl = queryString ? `${window.location.pathname}?${queryString}#opportunities` : `${window.location.pathname}#opportunities`;
  window.history.replaceState({}, "", newUrl);
};

const populateCategoryFilter = (items = []) => {
  const categoryFilter = document.getElementById("category-filter");
  if (!categoryFilter) return;

  const selectedCategory = categoryFilter.value;
  const categories = ON.getFilterCounts(items, "type").map((item) => item.value);
  categoryFilter.innerHTML = '<option value="">All categories</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  if (categories.includes(selectedCategory)) categoryFilter.value = selectedCategory;
};

const renderFilterChips = (items = []) => {
  ON.renderFilterChips("category-chips", ON.getFilterCounts(items, "type").slice(0, 8), "category");
  ON.renderFilterChips("country-chips", ON.getFilterCounts(items, "country").slice(0, 8), "country");
};

const renderOpportunities = () => {
  if (!opportunityGrid) return;

  const dataset = getCombinedDataset();
  const categoryValue = document.getElementById("category-filter")?.value || "";
  const fundingValue = document.getElementById("funding-filter")?.value || "";
  
  // When a type is selected, dataset already contains only that type from getCombinedDataset
  // So don't apply additional type filter - only filter by search and country
  const filtered = ON.filterOpportunities(dataset, {
    searchTerm: liveSearch?.value || "",
    country: countryFilter?.value || "",
    type: categoryValue,
    funding: fundingValue
  }).sort((a, b) => ON.compareOpportunities(a, b, sortFilter?.value || "deadline"));

  if (!filtered.length) {
    opportunityGrid.innerHTML = `<div class="empty-state"><p>No opportunities match your current filters.</p><button class="button button-secondary" onclick="clearFilters()">Clear Filters</button></div>`;
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
  updateUrl();
};

const loadOpportunities = async () => {
  if (!opportunityGrid) return;

  opportunityGrid.innerHTML = ON.renderLoadingSkeleton(6);
  setOpportunityStatus("Loading opportunities...");

  try {
    opportunities = await ON.fetchOpportunityRows();
    const types = getUniqueTypes(opportunities);
    populateTypeFilter(types);
    populateCountryFilter(opportunities);
    populateCategoryFilter(opportunities);
    updateStatistics(opportunities);
    applyTypeFromUrl(types);
    renderFilterChips(opportunities);
    renderOpportunities();
    renderFeaturedInternships(
      opportunities
        .filter((item) => normalizeTypeKey(item.type) === "internship" && item.link && item.link !== "#")
        .slice(0, 3)
    );
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
            <a class="button button-primary" href="${ON.escapeHtml(item.link || "#")}" target="_blank" rel="noopener noreferrer">Apply Now <span aria-hidden="true">â†—</span></a>
          </div>
        </article>
      `;
    })
    .join("");
};

const resetAndRender = () => {
  currentPage = 1;
  renderOpportunities();
};

const clearFilters = () => {
  if (liveSearch) liveSearch.value = "";
  if (countryFilter) countryFilter.value = "";
  if (typeFilter) typeFilter.value = "";
  const categoryFilter = document.getElementById("category-filter");
  if (categoryFilter) categoryFilter.value = "";
  const fundingFilter = document.getElementById("funding-filter");
  if (fundingFilter) fundingFilter.value = "";
  if (sortFilter) sortFilter.value = "deadline";
  currentPage = 1;
  renderOpportunities();
};

let filterDebounce = 0;
opportunityControls?.addEventListener("input", () => {
  clearTimeout(filterDebounce);
  filterDebounce = setTimeout(resetAndRender, 150);
});
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

loadOpportunities();
