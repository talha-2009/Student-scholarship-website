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

  ON.COUNTRY_LANDMARKS = {
    "Germany": '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g fill="currentColor"><rect x="10" y="120" width="180" height="8" /><rect x="20" y="40" width="10" height="84" /><rect x="45" y="40" width="10" height="84" /><rect x="70" y="40" width="10" height="84" /><rect x="95" y="40" width="10" height="84" /><rect x="120" y="40" width="10" height="84" /><rect x="145" y="40" width="10" height="84" /><rect x="170" y="40" width="10" height="84" /><rect x="10" y="28" width="180" height="14" /><rect x="2" y="14" width="20" height="14" /><rect x="178" y="14" width="20" height="14" /><rect x="14" y="2" width="12" height="12" /><rect x="174" y="2" width="12" height="12" /></g></svg>',
    "Switzerland": '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g fill="currentColor"><path d="M100 20 L150 130 L130 130 L100 70 L70 130 L50 130 Z" /><path d="M40 130 L70 80 L90 130 Z" opacity="0.6" /><path d="M110 130 L135 90 L160 130 Z" opacity="0.6" /><rect x="10" y="130" width="180" height="8" /></g></svg>',
    "United Kingdom": '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g fill="currentColor"><rect x="0" y="148" width="200" height="6" /><rect x="80" y="46" width="40" height="102" /><rect x="70" y="38" width="60" height="10" /><path d="M80 38 L100 6 L120 38 Z" /><rect x="95" y="16" width="10" height="14" /><rect x="86" y="58" width="10" height="14" opacity="0.55" /><rect x="104" y="58" width="10" height="14" opacity="0.55" /><rect x="84" y="108" width="12" height="40" opacity="0.5" /><rect x="104" y="108" width="12" height="40" opacity="0.5" /></g></svg>',
    "Australia": '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g fill="currentColor"><rect x="0" y="138" width="200" height="8" /><path d="M22 138 L20 132 Q42 78 62 132 L60 138 Z" /><path d="M52 138 L50 130 Q76 64 100 130 L98 138 Z" /><path d="M90 138 L88 128 Q116 70 142 128 L140 138 Z" /><path d="M132 138 L130 132 Q152 84 176 132 L174 138 Z" opacity="0.7" /></g></svg>',
    "Canada": '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g fill="currentColor"><path d="M100 14 L108 42 L132 28 L124 52 L150 50 L130 68 L150 84 L122 82 L128 108 L106 92 L102 122 L98 92 L76 108 L82 82 L54 84 L74 68 L54 50 L80 52 L72 28 L96 42 Z" /><rect x="94" y="116" width="12" height="30" /></g></svg>',
    "Austria": '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><g fill="currentColor"><path d="M0 140 L50 60 L80 100 L115 50 L160 140 Z" opacity="0.55" /><rect x="92" y="60" width="16" height="80" /><path d="M92 60 L100 36 L108 60 Z" /><rect x="96" y="44" width="8" height="10" /><rect x="0" y="140" width="200" height="8" /></g></svg>'
  };

  ON.getCountryLandmark = (country = "") => {
    const svg = ON.COUNTRY_LANDMARKS[country];
    return svg ? `<div class="card-landmark">${svg}</div>` : "";
  };

  ON.COUNTRY_FLAGS = {
    "Australia": "🇦🇺",
    "Austria": "🇦🇹",
    "Canada": "🇨🇦",
    "Germany": "🇩🇪",
    "Switzerland": "🇨🇭",
    "United Kingdom": "🇬🇧",
    "United States": "🇺🇸",
    "Global": "🌍"
  };

  ON.getCountryFlag = (country = "") => ON.COUNTRY_FLAGS[country] || "🌍";

  ON.truncateDescription = (text = "", maxLength = 160) => {
    const clean = String(text).trim().replace(/\s+/g, " ");
    if (clean.length <= maxLength) return clean;
    // Cut at the last whole word before maxLength, then append an ellipsis.
    const sliced = clean.slice(0, maxLength);
    const lastSpace = sliced.lastIndexOf(" ");
    const safeCut = lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced;
    return `${safeCut.replace(/[.,;:!?-]+$/, "")}…`;
  };

  ON.escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  ON.DEADLINE_STATUS_LABELS = {
    rolling: "Rolling / Ongoing",
    varies: "Varies by Institution",
    not_announced: "Deadline Not Announced"
  };

  ON.formatDeadline = (item) => {
    // Accept either a raw date string (legacy calls) or a normalized opportunity object.
    const deadlineValue = typeof item === "object" && item !== null ? item.deadline : item;
    const status = typeof item === "object" && item !== null ? item.deadline_status : null;

    if (status && status !== "fixed") {
      return ON.DEADLINE_STATUS_LABELS[status] || "Deadline Not Announced";
    }

    if (!deadlineValue || !String(deadlineValue).trim()) {
      return "Deadline Not Announced";
    }

    const trimmed = String(deadlineValue).trim();
    const parsed = Date.parse(trimmed);
    if (Number.isNaN(parsed)) return "Deadline Not Announced";
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(new Date(parsed));
  };

  ON.getDeadlineUrgency = (item) => {
    const deadlineValue = typeof item === "object" && item !== null ? item.deadline : item;
    const status = typeof item === "object" && item !== null ? item.deadline_status : null;

    if (status && status !== "fixed") return "none";
    if (!deadlineValue || !String(deadlineValue).trim()) return "none";
    const parsed = Date.parse(deadlineValue);
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
    deadline_status: row.deadline_status || "fixed",
    description: row.description || "No description available.",
    link: row.link || "#",
    slug: row.slug || "",
    created_at: row.created_at || ""
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
    // Sort by deadline: fixed dates first (soonest first), then rolling/varies items, alphabetically.
    const aHasDate = a.deadline_status === "fixed" && a.deadline;
    const bHasDate = b.deadline_status === "fixed" && b.deadline;
    if (aHasDate && bHasDate) {
      const deadlineA = Date.parse(a.deadline);
      const deadlineB = Date.parse(b.deadline);
      if (deadlineA !== deadlineB) return deadlineA - deadlineB;
      return a.title.localeCompare(b.title);
    }
    if (aHasDate && !bHasDate) return -1;
    if (!aHasDate && bHasDate) return 1;
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
    const detailUrl = `opportunity-detail.html?id=${encodeURIComponent(item.id)}`;
    const applyHref = item.link && item.link !== "#" ? item.link : detailUrl;
    const applyTarget = item.link && item.link !== "#" ? ' target="_blank" rel="noopener noreferrer"' : "";
    const urgency = ON.getDeadlineUrgency(item);
    const urgencyClass = urgency !== "none" ? ` deadline-${urgency}` : "";
    const whoCanApply = item.level || "Open to eligible applicants";
    const fieldLabel = item.field && item.field !== "All Fields" ? item.field : "Multiple Fields";

    return `
      <article class="live-opportunity-card compact-card">
        ${ON.getCountryLandmark(item.country)}
        <div class="opportunity-card-top">
          <p class="card-kicker">${ON.escapeHtml(item.type)} - ${ON.getCountryFlag(item.country)} ${ON.escapeHtml(item.country)}</p>
          <span class="deadline${urgencyClass}">${ON.escapeHtml(ON.formatDeadline(item))}</span>
        </div>
        <h3>${ON.escapeHtml(item.title)}</h3>
        <ul class="card-overview compact-overview">
          <li><strong>Field:</strong> ${ON.escapeHtml(fieldLabel)}</li>
          <li><strong>Who can apply:</strong> ${ON.escapeHtml(whoCanApply)}</li>
          <li><strong>Funding:</strong> ${ON.escapeHtml(item.funding || "See details")}</li>
        </ul>
        <div class="card-actions">
          <a class="button button-secondary" href="${ON.escapeHtml(detailUrl)}">View Details</a>
          <a class="button button-primary" href="${ON.escapeHtml(applyHref)}"${applyTarget}>Apply Now <span aria-hidden="true">↗</span></a>
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
      const { data } = await client.from("opportunities").select("country").not("country", "is", null);

      const countries = new Set();
      (data || []).forEach((row) => {
        if (row.country && row.country.trim()) {
          countries.add(row.country.trim());
        }
      });

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

      const [allResult, internshipCount] = await Promise.all([
        client.from("opportunities").select("id,country", { count: "exact" }),
        client.from("opportunities").select("id", { count: "exact", head: true }).eq("type", "Internship")
      ]);

      const countries = new Set();
      (allResult.data || []).forEach((row) => {
        if (row.country && row.country.trim()) {
          countries.add(row.country.trim());
        }
      });

      return {
        totalOpportunities: allResult.count || 0,
        totalInternships: internshipCount.count || 0,
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

  ON.generateAIContent = async (opportunityId) => {
    try {
      const client = ON.getSupabaseClient();
      
      // Call the Edge Function
      const { data, error } = await client.functions.invoke('generate-ai-content', {
        body: { opportunityId }
      });

      if (error) {
        console.error('Error generating AI content:', error);
        throw error;
      }

      console.log('AI content generated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in generateAIContent:', error);
      throw error;
    }
  };
})(window.OpportunityNest);
