/**
 * Shared helpers for OpportunityNest — Supabase client, formatting, rendering, pagination.
 * 
 * SECURITY NOTE: For production, replace the hardcoded values below with environment variables:
 * - Use Vercel Environment Variables or similar
 * - Never commit real keys to version control
 * - The current values are placeholders - replace with your actual Supabase credentials
 */
window.OpportunityNest = window.OpportunityNest || {};

(function (ON) {
  // Configuration - Replace these with environment variables in production
  ON.SUPABASE_URL = "https://rveunrzbeynaizitqanx.supabase.co";
  ON.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_i_Hzb5vyGZhjIXWNprJ_Tg_FJTry3DD";
  ON.SITE_URL = "https://opportunitynest.org";
  ON.PAGE_SIZE = 6;

  let supabaseClient;

  ON.escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  ON.formatDeadline = (value) => {
    if (!value || !String(value).trim()) return "Open";
    const trimmed = String(value).trim();
    const parsed = Date.parse(trimmed);
    if (Number.isNaN(parsed)) return trimmed;
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(new Date(parsed));
  };

  ON.getDeadlineUrgency = (value) => {
    if (!value || !String(value).trim()) return "none";
    const parsed = Date.parse(value);
    if (Number.isNaN(parsed)) return "none";
    const daysUntil = Math.ceil((parsed - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntil < 0) return "expired";
    if (daysUntil <= 7) return "urgent";
    if (daysUntil <= 30) return "soon";
    return "normal";
  };

  ON.getSupabaseClient = () => {
    if (!window.supabase) {
      throw new Error("Supabase client could not be loaded. Check the CDN script tag.");
    }
    if (!supabaseClient) {
      supabaseClient = window.supabase.createClient(ON.SUPABASE_URL, ON.SUPABASE_PUBLISHABLE_KEY);
    }
    return supabaseClient;
  };

  ON.normalizeOpportunity = (row) => ({
    id: row.id,
    type: row.type || "",
    funding: row.funding || "",
    title: row.title || "Untitled opportunity",
    country: row.country || "Not specified",
    level: row.level || "",
    field: row.field || "",
    deadline: row.deadline || "",
    description: row.description || "No description available.",
    link: row.link || "#",
    created_at: row.created_at || ""
  });

  ON.mapInternshipToOpportunity = (row) => ({
    id: row.id,
    type: "Internship",
    funding: row.funding || "",
    title: row.title || "Internship program",
    country: row.country || "Global",
    level: row.degree_level || "",
    field: row.internship_type || "",
    deadline: row.deadline || "",
    description: row.description || "",
    link: row.official_url || "#",
    created_at: row.created_at || "",
    isInternship: true
  });

  ON.setStatus = (element, message, isError = false) => {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("is-error", isError);
  };

  ON.updateMetaDescription = (description) => {
    if (!description) return;
    let meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
  };

  ON.compareOpportunities = (a, b, sortBy) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "newest") {
      return (b.created_at || "").localeCompare(a.created_at || "");
    }
    const deadlineA = Date.parse(a.deadline || "") || Number.MAX_SAFE_INTEGER;
    const deadlineB = Date.parse(b.deadline || "") || Number.MAX_SAFE_INTEGER;
    if (deadlineA !== deadlineB) return deadlineA - deadlineB;
    return a.title.localeCompare(b.title);
  };

  ON.filterOpportunities = (items, { searchTerm = "", country = "", type = "" } = {}) => {
    const query = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const haystack = [item.title, item.country, item.field, item.description, item.type, item.funding, item.level]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesCountry = !country || item.country.toLowerCase() === country.toLowerCase();
      const matchesType = !type || item.type.toLowerCase() === type.toLowerCase();
      return matchesSearch && matchesCountry && matchesType;
    });
  };

  ON.renderOpportunityCard = (item) => {
    const detailUrl = item.isInternship
      ? `internship-detail.html?id=${encodeURIComponent(item.id)}`
      : `opportunity-detail.html?id=${encodeURIComponent(item.id)}`;
    const applyHref = item.link && item.link !== "#" ? item.link : detailUrl;
    const applyTarget = item.link && item.link !== "#" ? ' target="_blank" rel="noopener noreferrer"' : "";
    const urgency = ON.getDeadlineUrgency(item.deadline);
    const urgencyClass = urgency !== "none" ? ` deadline-${urgency}` : "";

    return `
      <article class="live-opportunity-card">
        <div class="opportunity-card-top">
          <p class="card-kicker">${ON.escapeHtml(item.type)} - ${ON.escapeHtml(item.country)}</p>
          <span class="deadline${urgencyClass}">${ON.escapeHtml(ON.formatDeadline(item.deadline))}</span>
        </div>
        <h3>${ON.escapeHtml(item.title)}</h3>
        <p>${ON.escapeHtml(item.description)}</p>
        <dl class="opportunity-meta">
          <div>
            <dt>Funding</dt>
            <dd>${ON.escapeHtml(item.funding || "See listing")}</dd>
          </div>
          <div>
            <dt>Level</dt>
            <dd>${ON.escapeHtml(item.level || "All levels")}</dd>
          </div>
          <div>
            <dt>Field</dt>
            <dd>${ON.escapeHtml(item.field || "Multiple fields")}</dd>
          </div>
        </dl>
        <div class="card-actions">
          <a class="button button-primary" href="${ON.escapeHtml(applyHref)}"${applyTarget}>View &amp; Apply</a>
          <a class="button button-secondary" href="${ON.escapeHtml(detailUrl)}">View Details</a>
        </div>
      </article>
    `;
  };

  ON.renderPagination = (container, pageCount, currentPage, onPageChange) => {
    if (!container) return;
    if (pageCount <= 1) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = Array.from({ length: pageCount }, (_, index) => {
      const page = index + 1;
      return `<button class="pagination-button${page === currentPage ? " is-active" : ""}" type="button" data-page="${page}" aria-label="Go to page ${page}" aria-current="${page === currentPage ? "page" : "false"}">${page}</button>`;
    }).join("");

    if (container._paginationHandler) {
      container.removeEventListener("click", container._paginationHandler);
    }

    container._paginationHandler = (event) => {
      const button = event.target.closest("[data-page]");
      if (!button) return;
      onPageChange(Number(button.dataset.page));
    };

    container.addEventListener("click", container._paginationHandler);
  };

  ON.paginate = (items, page, pageSize = ON.PAGE_SIZE) => {
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(Math.max(1, page), pageCount);
    const start = (safePage - 1) * pageSize;
    return {
      page: safePage,
      pageCount,
      items: items.slice(start, start + pageSize)
    };
  };

  ON.renderLoadingSkeleton = (count = 6) => {
    return Array.from({ length: count }, () => `
      <article class="live-opportunity-card skeleton-card" aria-hidden="true">
        <div class="opportunity-card-top">
          <div class="skeleton skeleton-kicker"></div>
          <div class="skeleton skeleton-deadline"></div>
        </div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text-short"></div>
        <dl class="opportunity-meta">
          <div><div class="skeleton skeleton-meta"></div></div>
          <div><div class="skeleton skeleton-meta"></div></div>
          <div><div class="skeleton skeleton-meta"></div></div>
        </dl>
        <div class="card-actions">
          <div class="skeleton skeleton-button"></div>
          <div class="skeleton skeleton-button"></div>
        </div>
      </article>
    `).join("");
  };

  ON.renderErrorWithRetry = (message, onRetry) => {
    return `
      <div class="error-state">
        <p class="error-message">${ON.escapeHtml(message)}</p>
        <button class="button button-primary" onclick="${onRetry}">Try Again</button>
      </div>
    `;
  };

  ON.fetchUniqueCountries = async () => {
    try {
      const client = ON.getSupabaseClient();
      
      const [opportunitiesResult, internshipsResult] = await Promise.all([
        client.from("opportunities").select("country").not("country", "is", null),
        client.from("internships").select("country").not("country", "is", null)
      ]);

      const countries = new Set();
      
      if (opportunitiesResult.data) {
        opportunitiesResult.data.forEach(row => {
          if (row.country && row.country.trim()) {
            countries.add(row.country.trim());
          }
        });
      }
      
      if (internshipsResult.data) {
        internshipsResult.data.forEach(row => {
          if (row.country && row.country.trim()) {
            countries.add(row.country.trim());
          }
        });
      }

      return Array.from(countries).sort();
    } catch (error) {
      console.error("Error fetching countries:", error);
      return [];
    }
  };

  ON.populateCountryFilter = async (selectElement) => {
    if (!selectElement) return;
    
    const countries = await ON.fetchUniqueCountries();
    
    selectElement.innerHTML = '<option value="">All</option>';
    
    countries.forEach(country => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      selectElement.appendChild(option);
    });
  };

  ON.fetchStatistics = async () => {
    try {
      const client = ON.getSupabaseClient();
      
      const [opportunitiesCount, internshipsCount, opportunitiesCountries, internshipsCountries] = await Promise.all([
        client.from("opportunities").select("id", { count: "exact", head: true }),
        client.from("internships").select("id", { count: "exact", head: true }),
        client.from("opportunities").select("country").not("country", "is", null),
        client.from("internships").select("country").not("country", "is", null)
      ]);

      const countries = new Set();
      
      if (opportunitiesCountries.data) {
        opportunitiesCountries.data.forEach(row => {
          if (row.country && row.country.trim()) {
            countries.add(row.country.trim());
          }
        });
      }
      
      if (internshipsCountries.data) {
        internshipsCountries.data.forEach(row => {
          if (row.country && row.country.trim()) {
            countries.add(row.country.trim());
          }
        });
      }

      return {
        totalOpportunities: opportunitiesCount.count || 0,
        totalInternships: internshipsCount.count || 0,
        totalCountries: countries.size
      };
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return {
        totalOpportunities: 0,
        totalInternships: 0,
        totalCountries: 0
      };
    }
  };

  ON.updateStatistics = async () => {
    const stats = await ON.fetchStatistics();
    
    const opportunitiesStat = document.querySelector('[data-stat="opportunities"]');
    const internshipsStat = document.querySelector('[data-stat="internships"]');
    const countriesStat = document.querySelector('[data-stat="countries"]');
    const internshipStatCard = document.getElementById('internship-stat-card');
    
    if (opportunitiesStat) {
      opportunitiesStat.textContent = stats.totalOpportunities.toLocaleString();
    }
    
    if (internshipsStat) {
      internshipsStat.textContent = stats.totalInternships.toLocaleString();
    }
    
    if (countriesStat) {
      countriesStat.textContent = stats.totalCountries.toLocaleString();
    }
    
    if (internshipStatCard) {
      if (stats.totalInternships === 0) {
        internshipStatCard.style.display = 'none';
      } else {
        internshipStatCard.style.display = '';
      }
    }
  };
})(window.OpportunityNest);
