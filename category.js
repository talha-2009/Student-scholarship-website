const SUPABASE_URL = "https://rveunrzbeynaizitqanx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_i_Hzb5vyGZhjIXWNprJ_Tg_FJTry3DD";

const opportunityGrid = document.querySelector("#opportunity-grid");
const opportunityStatus = document.querySelector("#opportunity-status");
const opportunityControls = document.querySelector("#opportunity-controls");
const liveSearch = document.querySelector("#live-search");
const countryFilter = document.querySelector("#country-filter");
const pageType = opportunityGrid?.dataset.type || "";
const emptyMessage = opportunityGrid?.dataset.empty || "No opportunities match your search.";

let opportunities = [];

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const normalizeOpportunity = (row) => ({
  id: row.id,
  type: row.type || "",
  funding: row.funding || "",
  title: row.title || "",
  country: row.country || "",
  level: row.level || "",
  field: row.field || "",
  deadline: row.deadline || "",
  description: row.description || "",
  link: row.link || "#"
});

const setStatus = (message, isError = false) => {
  if (!opportunityStatus) return;
  opportunityStatus.textContent = message;
  opportunityStatus.classList.toggle("is-error", isError);
};

const renderOpportunities = () => {
  if (!opportunityGrid) return;

  const searchTerm = (liveSearch?.value || "").trim().toLowerCase();
  const selectedCountry = countryFilter?.value || "";

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

    return matchesSearch && matchesCountry;
  });

  if (!filtered.length) {
    opportunityGrid.innerHTML = `<p class="empty-state">${escapeHtml(emptyMessage)}</p>`;
    setStatus("No matching opportunities found.");
    return;
  }

  opportunityGrid.innerHTML = filtered
    .map(
      (item) => `
        <article class="live-opportunity-card">
          <div class="opportunity-card-top">
            <p class="card-kicker">${escapeHtml(item.type)} - ${escapeHtml(item.country)}</p>
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

  setStatus(`${filtered.length} ${pageType.toLowerCase()} listings shown.`);
};

const loadCategoryOpportunities = async () => {
  if (!opportunityGrid) return;

  opportunityGrid.innerHTML = "<p class=\"empty-state\">Loading opportunities...</p>";
  setStatus("Loading opportunities...");

  try {
    if (!window.supabase) {
      throw new Error("Supabase client could not be loaded. Check the CDN script tag.");
    }

    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    const { data, error } = await supabaseClient
      .from("opportunities")
      .select("id,type,funding,title,country,level,field,deadline,description,link,created_at")
      .eq("type", pageType)
      .order("deadline", { ascending: true });

    if (error) throw error;

    opportunities = (data || []).map(normalizeOpportunity);
    renderOpportunities();
  } catch (error) {
    console.error(`${pageType} opportunities fetch failed:`, error);
    opportunityGrid.innerHTML =
      "<p class=\"empty-state\">We could not load opportunities right now. Please check your connection or Supabase public SELECT policy.</p>";
    setStatus(error.message || "We could not load opportunities right now.", true);
  }
};

opportunityControls?.addEventListener("input", renderOpportunities);
opportunityControls?.addEventListener("submit", (event) => {
  event.preventDefault();
  renderOpportunities();
});

loadCategoryOpportunities();
