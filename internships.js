const ON = window.OpportunityNest;
const PAGE_SIZE = ON.PAGE_SIZE;

const internshipGrid = document.querySelector("#internship-grid");
const internshipStatus = document.querySelector("#opportunity-status");
const internshipControls = document.querySelector("#internship-controls");
const liveSearch = document.querySelector("#live-search");
const countryFilter = document.querySelector("#country-filter");
const sortFilter = document.querySelector("#sort-filter");
const pagination = document.querySelector("#pagination");

let internships = [];
let currentPage = 1;

const setStatus = (message, isError = false) => ON.setStatus(internshipStatus, message, isError);

const getFilteredInternships = () => {
  const searchTerm = (liveSearch?.value || "").trim().toLowerCase();
  const country = countryFilter?.value || "";
  const sortBy = sortFilter?.value || "deadline";

  const filtered = internships.filter((item) => {
    const haystack = [item.title, item.country, item.field, item.description, item.funding, item.level]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !searchTerm || haystack.includes(searchTerm);
    const matchesCountry = !country || item.country.toLowerCase() === country.toLowerCase();
    return matchesSearch && matchesCountry;
  });

  return filtered.sort((a, b) => ON.compareOpportunities(a, b, sortBy));
};

const renderInternships = () => {
  const filtered = getFilteredInternships();

  if (!filtered.length) {
    internshipGrid.innerHTML = '<p class="empty-state">No internships match your search.</p>';
    ON.renderPagination(pagination, 0, 1, () => {});
    setStatus("No matching internships found.");
    return;
  }

  const { page, pageCount, items } = ON.paginate(filtered, currentPage, PAGE_SIZE);
  currentPage = page;

  internshipGrid.innerHTML = items.map(ON.renderOpportunityCard).join("");
  ON.renderPagination(pagination, pageCount, currentPage, (nextPage) => {
    currentPage = nextPage;
    renderInternships();
    internshipGrid.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  setStatus(`${filtered.length} internships found. Showing page ${currentPage} of ${pageCount}.`);
};

const loadInternships = async () => {
  internshipGrid.innerHTML = ON.renderLoadingSkeleton(6);
  setStatus("Loading internships...");

  try {
    const { data, error } = await ON.getSupabaseClient()
      .from("opportunities")
      .select("id,type,funding,title,country,level,field,deadline,description,link,created_at")
      .eq("type", "Internship")
      .order("deadline", { ascending: true });

    if (error) throw error;

    internships = ON.assignOpportunitySlugs((data || []).map(ON.normalizeOpportunity));
    renderInternships();
  } catch (error) {
    console.error("Internships fetch failed:", error);
    internshipGrid.innerHTML = ON.renderErrorWithRetry(
      error.message || "We could not load internships right now. Please check your connection.",
      "loadInternships()"
    );
    setStatus(error.message || "We could not load internships right now.", true);
  }
};

const resetAndRender = () => {
  currentPage = 1;
  renderInternships();
};

const clearFilters = () => {
  if (liveSearch) liveSearch.value = "";
  if (countryFilter) countryFilter.value = "";
  if (sortFilter) sortFilter.value = "deadline";
  currentPage = 1;
  renderInternships();
};

internshipControls?.addEventListener("input", resetAndRender);
internshipControls?.addEventListener("submit", (event) => {
  event.preventDefault();
  resetAndRender();
});

document.getElementById("clear-filters")?.addEventListener("click", clearFilters);

ON.populateCountryFilter(countryFilter);
if (internshipGrid) {
  loadInternships();
}
