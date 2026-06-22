const ON = window.OpportunityNest;
const PAGE_SIZE = ON.PAGE_SIZE;

const internshipGrid = document.querySelector("#internship-grid");
const internshipStatus = document.querySelector("#opportunity-status");
const internshipControls = document.querySelector("#internship-controls");
const liveSearch = document.querySelector("#live-search");
const countryFilter = document.querySelector("#country-filter");
const degreeFilter = document.querySelector("#degree-filter");
const typeFilter = document.querySelector("#type-filter");
const fundedFilter = document.querySelector("#funded-filter");
const remoteFilter = document.querySelector("#remote-filter");
const sortFilter = document.querySelector("#sort-filter");
const pagination = document.querySelector("#pagination");

let internships = [];
let currentPage = 1;

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const isRemote = (item) =>
  [item.city, item.country, item.internship_type, item.description].join(" ").toLowerCase().includes("remote");

const isFullyFunded = (item) => {
  const funding = (item.funding || "").toLowerCase();
  return funding.includes("fully funded") || funding.includes("stipend") || funding.includes("scholarship");
};

const setStatus = (message, isError = false) => ON.setStatus(internshipStatus, message, isError);

const normalizeInternship = (row) => ({
  id: row.id,
  title: row.title || "Internship program",
  organization: row.organization || "Organization",
  country: row.country || "",
  city: row.city || "",
  internship_type: row.internship_type || "",
  degree_level: row.degree_level || "",
  duration: row.duration || "",
  funding: row.funding || "",
  deadline: row.deadline || "",
  official_url: row.official_url || "#",
  description: row.description || "No description available.",
  logo_url: row.logo_url || "",
  featured: Boolean(row.featured),
  created_at: row.created_at || ""
});

const getFilteredInternships = () => {
  const searchTerm = (liveSearch?.value || "").trim().toLowerCase();
  const country = countryFilter?.value || "";
  const degree = degreeFilter?.value || "";
  const type = typeFilter?.value || "";
  const fundedOnly = Boolean(fundedFilter?.checked);
  const remoteOnly = Boolean(remoteFilter?.checked);
  const sortBy = sortFilter?.value || "deadline";

  const filtered = internships.filter((item) => {
    const haystack = [
      item.title,
      item.organization,
      item.country,
      item.city,
      item.internship_type,
      item.degree_level,
      item.duration,
      item.funding,
      item.deadline,
      item.description
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!searchTerm || haystack.includes(searchTerm)) &&
      (!country || item.country.toLowerCase() === country.toLowerCase()) &&
      (!degree || item.degree_level.toLowerCase().includes(degree.toLowerCase())) &&
      (!type || item.internship_type.toLowerCase() === type.toLowerCase()) &&
      (!fundedOnly || isFullyFunded(item)) &&
      (!remoteOnly || isRemote(item))
    );
  });

  return filtered.sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "newest") return (b.created_at || "").localeCompare(a.created_at || "");
    const deadlineA = Date.parse(a.deadline || "") || Number.MAX_SAFE_INTEGER;
    const deadlineB = Date.parse(b.deadline || "") || Number.MAX_SAFE_INTEGER;
    if (deadlineA !== deadlineB) return deadlineA - deadlineB;
    return a.title.localeCompare(b.title);
  });
};

const renderActions = (item) => {
  const detailUrl = `internship-detail.html?id=${encodeURIComponent(item.id)}&slug=${encodeURIComponent(slugify(item.title))}`;
  return `
    <div class="card-actions">
      <a class="button button-primary" href="${ON.escapeHtml(item.official_url)}" target="_blank" rel="noopener noreferrer">Apply Now <span aria-hidden="true">↗</span></a>
      <a class="button button-secondary" href="${ON.escapeHtml(item.official_url)}" target="_blank" rel="noopener noreferrer">Official Website <span aria-hidden="true">↗</span></a>
      <a class="button button-secondary" href="${detailUrl}">View Details</a>
    </div>
  `;
};

const renderInternshipCard = (item) => {
  const urgency = ON.getDeadlineUrgency(item.deadline);
  const urgencyClass = urgency !== "none" ? ` deadline-${urgency}` : "";

  return `
  <article class="live-opportunity-card internship-card">
    <div class="opportunity-card-top">
      <div class="internship-brand">
        <span class="internship-logo" aria-hidden="true">${ON.escapeHtml(item.organization.slice(0, 2).toUpperCase())}</span>
        <div>
          <p class="card-kicker">${ON.escapeHtml(item.organization)}</p>
          <h3>${ON.escapeHtml(item.title)}</h3>
        </div>
      </div>
      ${item.featured ? '<span class="verified">Featured</span>' : ""}
    </div>
    <p>${ON.escapeHtml(item.description)}</p>
    <dl class="opportunity-meta">
      <div>
        <dt>Location</dt>
        <dd>${ON.escapeHtml([item.city, item.country].filter(Boolean).join(", ") || "Global")}</dd>
      </div>
      <div>
        <dt>Degree</dt>
        <dd>${ON.escapeHtml(item.degree_level || "All levels")}</dd>
      </div>
      <div>
        <dt>Type</dt>
        <dd>${ON.escapeHtml(item.internship_type || "General")}</dd>
      </div>
      <div>
        <dt>Duration</dt>
        <dd>${ON.escapeHtml(item.duration || "See official website")}</dd>
      </div>
      <div>
        <dt>Funding</dt>
        <dd>${ON.escapeHtml(item.funding || "See official website")}</dd>
      </div>
      <div>
        <dt>Deadline</dt>
        <dd><span class="deadline${urgencyClass}">${ON.escapeHtml(ON.formatDeadline(item.deadline))}</span></dd>
      </div>
    </dl>
    ${renderActions(item)}
  </article>
`;
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

  internshipGrid.innerHTML = items.map(renderInternshipCard).join("");
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
      .from("internships")
      .select("id,title,organization,country,city,internship_type,degree_level,duration,funding,deadline,official_url,description,logo_url,featured,created_at")
      .not("official_url", "is", null)
      .order("featured", { ascending: false })
      .order("deadline", { ascending: true });

    if (error) throw error;

    internships = (data || []).map(normalizeInternship);
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
  if (degreeFilter) degreeFilter.value = "";
  if (typeFilter) typeFilter.value = "";
  if (fundedFilter) fundedFilter.checked = false;
  if (remoteFilter) remoteFilter.checked = false;
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

if (internshipGrid) {
  loadInternships();
}
