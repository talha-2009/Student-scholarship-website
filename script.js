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

let opportunities = [];
let internships = [];
let currentPage = 1;

const setOpportunityStatus = (message, isError = false) => ON.setStatus(opportunityStatus, message, isError);

const getCombinedDataset = () => {
  const selectedType = typeFilter?.value || "";
  if (selectedType === "Internship") {
    return internships.map(ON.mapInternshipToOpportunity);
  }
  if (selectedType) {
    return opportunities;
  }
  return [...opportunities, ...internships.map(ON.mapInternshipToOpportunity)];
};

const renderOpportunities = () => {
  if (!opportunityGrid) return;

  const filtered = ON.filterOpportunities(getCombinedDataset(), {
    searchTerm: liveSearch?.value || "",
    country: countryFilter?.value || "",
    type: typeFilter?.value || ""
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
      .select("id,type,funding,title,country,level,field,deadline,description,link,created_at")
      .order("deadline", { ascending: true });

    if (error) throw error;
    opportunities = (data || []).map(ON.normalizeOpportunity);
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

const loadInternshipsForHome = async () => {
  try {
    const { data, error } = await ON.getSupabaseClient()
      .from("internships")
      .select("id,title,organization,country,city,internship_type,degree_level,duration,funding,deadline,official_url,description,featured,created_at")
      .not("official_url", "is", null)
      .order("deadline", { ascending: true });

    if (error) throw error;
    internships = data || [];
    renderOpportunities();
  } catch (error) {
    console.error("Home internships fetch failed:", error);
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
      const mapped = ON.mapInternshipToOpportunity(item);
      return `
        <article class="live-opportunity-card internship-card">
          <div class="opportunity-card-top">
            <div class="internship-brand">
              <span class="internship-logo" aria-hidden="true">${ON.escapeHtml((item.organization || "ON").slice(0, 2).toUpperCase())}</span>
              <div>
                <p class="card-kicker">${ON.escapeHtml(item.organization || "Internship")}</p>
                <h3>${ON.escapeHtml(item.title || "Internship program")}</h3>
              </div>
            </div>
            <span class="verified">Featured</span>
          </div>
          <p>${ON.escapeHtml(item.description || "")}</p>
          <dl class="opportunity-meta">
            <div>
              <dt>Location</dt>
              <dd>${ON.escapeHtml([item.city, item.country].filter(Boolean).join(", ") || "Global")}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>${ON.escapeHtml(item.duration || "See official website")}</dd>
            </div>
            <div>
              <dt>Funding</dt>
              <dd>${ON.escapeHtml(item.funding || "See official website")}</dd>
            </div>
          </dl>
          <div class="card-actions">
            <a class="button button-primary" href="${ON.escapeHtml(item.official_url || "#")}" target="_blank" rel="noopener noreferrer">Apply Now <span aria-hidden="true">↗</span></a>
            <a class="button button-secondary" href="internship-detail.html?id=${encodeURIComponent(item.id)}">View Details</a>
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
      .from("internships")
      .select("id,title,organization,country,city,duration,funding,official_url,description,featured")
      .eq("featured", true)
      .not("official_url", "is", null)
      .limit(3);

    if (error) throw error;
    renderFeaturedInternships(data || []);
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

ON.populateCountryFilter(countryFilter);
ON.updateStatistics();
loadOpportunities();
loadInternshipsForHome();
loadFeaturedInternships();
