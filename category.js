const ON = window.OpportunityNest;

const opportunityGrid = document.querySelector("#opportunity-grid");
const opportunityStatus = document.querySelector("#opportunity-status");
const opportunityControls = document.querySelector("#opportunity-controls");
const liveSearch = document.querySelector("#live-search");
const countryFilter = document.querySelector("#country-filter");
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
    country: countryFilter?.value || ""
  }).sort((a, b) => ON.compareOpportunities(a, b, sortFilter?.value || "deadline"));

  if (!filtered.length) {
    opportunityGrid.innerHTML = `<p class="empty-state">${ON.escapeHtml(emptyMessage)}</p>`;
    ON.renderPagination(pagination, 0, 1, () => {});
    setStatus("No matching opportunities found.");
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

  setStatus(`${filtered.length} ${pageType.toLowerCase()} listings found. Showing page ${currentPage} of ${pageCount}.`);
};

const loadCategoryOpportunities = async () => {
  if (!opportunityGrid) return;

  opportunityGrid.innerHTML = ON.renderLoadingSkeleton(6);
  setStatus("Loading opportunities...");

  try {
    const { data, error } = await ON.getSupabaseClient()
      .from("opportunities")
      .select("id,type,funding,title,country,level,field,deadline,description,link,created_at")
      .eq("type", pageType)
      .order("deadline", { ascending: true });

    if (error) throw error;

    opportunities = (data || []).map(ON.normalizeOpportunity);
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

const resetAndRender = () => {
  currentPage = 1;
  renderOpportunities();
};

const clearFilters = () => {
  if (liveSearch) liveSearch.value = "";
  if (countryFilter) countryFilter.value = "";
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

loadCategoryOpportunities();
