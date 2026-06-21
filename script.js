const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#nav-menu");
const opportunityGrid = document.querySelector("#opportunity-grid");
const opportunityStatus = document.querySelector("#opportunity-status");
const opportunityControls = document.querySelector("#opportunity-controls");
const liveSearch = document.querySelector("#live-search");
const countryFilter = document.querySelector("#country-filter");
const typeFilter = document.querySelector("#type-filter");
const SUPABASE_URL = "https://rveunrzbeynaizitqanx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_i_Hzb5vyGZhjIXWNprJ_Tg_FJTry3DD";

let opportunities = [];

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navMenu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      navToggle.setAttribute("aria-expanded", "false");
      navMenu.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    }
  });
}

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const normalizeOpportunity = (row) => ({
  id: row.id,
  type: row.type || row.category || "",
  funding: row.funding || row.funding_type || "",
  title: row.title || row.name || "",
  country: row.country || row.location || "",
  level: row.level || row.study_level || "",
  field: row.field || row.subject || "",
  deadline: row.deadline || row.deadline_date || "",
  description: row.description || row.summary || "",
  link: row.link || row.url || row.application_link || "#"
});

const setOpportunityStatus = (message, isError = false) => {
  if (!opportunityStatus) return;
  opportunityStatus.textContent = message;
  opportunityStatus.classList.toggle("is-error", isError);
};

const renderOpportunities = () => {
  if (!opportunityGrid) return;

  const searchTerm = (liveSearch?.value || "").trim().toLowerCase();
  const selectedCountry = countryFilter?.value || "";
  const selectedType = typeFilter?.value || "";

  const filtered = opportunities.filter((item) => {
    const haystack = [
      item.title,
      item.type,
      item.funding,
      item.country,
      item.level,
      item.field,
      item.deadline,
      item.description
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = !searchTerm || haystack.includes(searchTerm);
    const matchesCountry = !selectedCountry || item.country.toLowerCase() === selectedCountry.toLowerCase();
    const matchesType = !selectedType || item.type.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesCountry && matchesType;
  });

  if (!filtered.length) {
    opportunityGrid.innerHTML = '<p class="empty-state">No opportunities match your search yet. Try clearing a filter.</p>';
    setOpportunityStatus("No matching opportunities found.");
    return;
  }

  opportunityGrid.innerHTML = filtered
    .map(
      (item) => `
        <article class="live-opportunity-card">
          <div class="opportunity-card-top">
            <p class="card-kicker">${escapeHtml(item.type)} • ${escapeHtml(item.country)}</p>
            <span class="deadline">${escapeHtml(item.deadline || "Open")}</span>
          </div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
          <dl class="opportunity-meta">
            <div>
              <dt>Funding</dt>
              <dd>${escapeHtml(item.funding || "See listing")}</dd>
            </div>
            <div>
              <dt>Level</dt>
              <dd>${escapeHtml(item.level || "All levels")}</dd>
            </div>
            <div>
              <dt>Field</dt>
              <dd>${escapeHtml(item.field || "Multiple fields")}</dd>
            </div>
          </dl>
          <a class="button button-secondary" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">View &amp; Apply</a>
        </article>
      `
    )
    .join("");

  setOpportunityStatus(`${filtered.length} opportunities shown.`);
};

const loadOpportunities = async () => {
  if (!opportunityGrid) return;

  opportunityGrid.innerHTML = '<p class="empty-state">Loading opportunities...</p>';
  setOpportunityStatus("Loading opportunities...");

  try {
    if (!window.supabase) {
      throw new Error("Supabase client could not be loaded. Check the CDN script tag.");
    }

    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const { data, error } = await supabaseClient
      .from("opportunities")
      .select("id,type,funding,title,country,level,field,deadline,description,link,created_at")
      .order("deadline", { ascending: true });

    if (error) throw error;

    opportunities = (data || []).map(normalizeOpportunity);
    renderOpportunities();
  } catch (error) {
    console.error("Supabase opportunities fetch failed:", error);
    opportunityGrid.innerHTML =
      '<p class="empty-state">We could not load opportunities right now. Please check your connection or Supabase public SELECT policy.</p>';
    setOpportunityStatus(
      error.message || "We could not load opportunities right now. Please try again soon.",
      true
    );
  }
};

opportunityControls?.addEventListener("input", renderOpportunities);
opportunityControls?.addEventListener("submit", (event) => {
  event.preventDefault();
  renderOpportunities();
});

loadOpportunities();
