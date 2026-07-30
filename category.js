const ON = window.OpportunityNest;

const opportunityGrid = document.querySelector("#opportunity-grid");
const opportunityStatus = document.querySelector("#opportunity-status");
const opportunityControls = document.querySelector("#opportunity-controls");
const liveSearch = document.querySelector("#live-search");
const countryFilter = document.querySelector("#country-filter");
const fundingFilter = document.querySelector("#funding-filter");
const sortFilter = document.querySelector("#sort-filter");
const pagination = document.querySelector("#pagination");
const pageType = opportunityGrid?.dataset.type || "";
const emptyMessage = opportunityGrid?.dataset.empty || "No opportunities match your search.";

let opportunities = [];
let currentPage = 1;

const setStatus = (message, isError = false) => ON.setStatus(opportunityStatus, message, isError);

const renderOpportunities = () => {
  if (!opportunityGrid) return;

  const filtered = ON.filterOpportunities(opportunities, {
    searchTerm: liveSearch?.value || "",
    country: countryFilter?.value || "",
    type: "",
    funding: fundingFilter?.value || ""
  });
  const sorted = ON.sortOpportunities(filtered, {
    query: liveSearch?.value || "",
    sortBy: sortFilter?.value || "deadline"
  });

  if (!sorted.length) {
    const hasQuery = liveSearch?.value || "";
    const suggestions = hasQuery
      ? `<p>Try a different search term like "fully funded" or "master's". <a href="/${pageType.toLowerCase()}s/">Browse all ${pageType.toLowerCase()}s</a></p>`
      : `<p>Try clearing a filter or <a href="/">browse all opportunities</a>.</p>`;
    opportunityGrid.innerHTML = `<div class="empty-state"><p>${ON.escapeHtml(emptyMessage)}</p>${suggestions}<button class="button button-secondary" onclick="clearFilters()">Clear Filters</button></div>`;
    ON.renderPagination(pagination, 0, 1, () => {});
    setStatus("No matching opportunities found.");
    return;
  }

  const { page, pageCount, items } = ON.paginate(sorted, currentPage);
  currentPage = page;

  opportunityGrid.innerHTML = items.map(ON.renderOpportunityCard).join("");
  ON.renderPagination(pagination, pageCount, currentPage, (nextPage) => {
    currentPage = nextPage;
    renderOpportunities();
    opportunityGrid.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  setStatus(`${sorted.length} ${pageType.toLowerCase()} listings found. Showing page ${currentPage} of ${pageCount}.`);
  updateUrl();
};

const loadCategoryOpportunities = async () => {
  if (!opportunityGrid) return;

  opportunityGrid.innerHTML = ON.renderLoadingSkeleton(6);
  setStatus("Loading opportunities...");

  try {
    const allOpportunities = await ON.fetchOpportunityRows();
    const nPageType = ON.normalizeValue(pageType);
    opportunities = allOpportunities.filter((item) => {
      const nType = ON.normalizeValue(item.type);
      return nType === nPageType || nType.includes(nPageType);
    });
    renderOpportunities();
  } catch (error) {
    console.error(`${pageType} opportunities fetch failed:`, error);
    opportunityGrid.innerHTML = ON.renderErrorWithRetry(
      error.message || "We could not load opportunities right now. Please check your connection.",
      "loadCategoryOpportunities()"
    );
    setStatus(error.message || "We could not load opportunities right now.", true);
  }
};

const updateUrl = () => {
  const params = new URLSearchParams();
  const searchQuery = liveSearch?.value || "";
  const selectedCountry = countryFilter?.value || "";
  const selectedFunding = fundingFilter?.value || "";
  if (searchQuery) params.set("q", searchQuery);
  if (selectedCountry) params.set("country", selectedCountry);
  if (selectedFunding) params.set("funding", selectedFunding);
  const queryString = params.toString();
  const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
  window.history.replaceState({}, "", newUrl);
};

const resetAndRender = () => {
  currentPage = 1;
  renderOpportunities();
};

const clearFilters = () => {
  if (liveSearch) liveSearch.value = "";
  if (countryFilter) countryFilter.value = "";
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

const urlParams = new URLSearchParams(window.location.search);
const urlQuery = urlParams.get("q");
if (urlQuery && liveSearch) liveSearch.value = urlQuery;
const urlCountry = urlParams.get("country");
if (urlCountry && countryFilter) countryFilter.value = urlCountry;
const urlFunding = urlParams.get("funding");
if (urlFunding && fundingFilter) fundingFilter.value = urlFunding;

window.addEventListener("popstate", () => {
  const params = new URLSearchParams(window.location.search);
  if (liveSearch) liveSearch.value = params.get("q") || "";
  if (countryFilter) countryFilter.value = params.get("country") || "";
  if (fundingFilter) fundingFilter.value = params.get("funding") || "";
  resetAndRender();
});

if (urlQuery) {
  let robots = document.querySelector('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement("meta");
    robots.name = "robots";
    document.head.appendChild(robots);
  }
  robots.content = "noindex,follow";
}

ON.populateCountryFilter(countryFilter);
loadCategoryOpportunities();
