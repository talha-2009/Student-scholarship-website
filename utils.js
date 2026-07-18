/**
 * Shared helpers for OpportunityNest â€” Supabase client, formatting, rendering, pagination.
 */
window.OpportunityNest = window.OpportunityNest || {};
window.ON = window.OpportunityNest;

(function (ON) {
  // Configuration
  ON.SUPABASE_URL = "https://rveunrzbeynaizitqanx.supabase.co";
  ON.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_i_Hzb5vyGZhjIXWNprJ_Tg_FJTry3DD";
  ON.SITE_URL = "https://www.opportunitynest.org";
  ON.PAGE_SIZE = 6;
  ON.OFFICIAL_URL_OVERRIDES = {
    "https://www.unesco.org/en/prizes/esd": "https://www.unesco.org/en/prizes/education-sustainable-development?hub=72522",
    "https://www.salzburgglobal.org/get-involved": "https://www.salzburgglobal.org/fellowship/an-introduction",
    "https://www.kas.de/en/web/begabtenfoerderung-und-kultur/stipendien-und-foerderung": "https://www.kas.de/en/web/begabtenfoerderung-und%20kultur/international-talent-development",
    "https://www.rosalux.de/en/foundation/rosa-luxemburg-stiftung/scholarships": "https://www.rosalux.de/en/foundation/studienwerk/scholarships",
    "https://www.studyinjapan.go.jp/en/smap_stopj-applications_mext.html": "https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/",
    "https://www.universiteitleiden.nl/en/education/scholarships/leiden-university-excellence-scholarships-lexs": "https://www.student.universiteitleiden.nl/en/scholarships/sea/leiden-university-excellence-scholarship-lexs",
    "https://usief.org.in/Fellowships/Fulbright-Nehru-Fellowships-for-Indian-Citizens.aspx": "https://www.usief.org.in/fulbright-fellowships/fellowships-for-indian-citizen/fulbright-nehru-masters-fellowships/",
    "https://ethz.ch/en/studies/master/financials/scholarships/excellence-scholarship.html": "https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html",
    "https://us.fulbrightonline.org/fulbright-us-student-program/fulbright-program-overview/foreign-language-teaching-assistant-flta": "https://exchanges.state.gov/non-us/program/fulbright-foreign-language-teaching-assistant-flta",
    "https://www.urbanstudiesfoundation.org/grants-fellowships/": "https://www.urbanstudiesfoundation.org/funding/international-fellowships/"
  };

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
    "Australia": "ðŸ‡¦ðŸ‡º",
    "Austria": "ðŸ‡¦ðŸ‡¹",
    "Canada": "ðŸ‡¨ðŸ‡¦",
    "Germany": "ðŸ‡©ðŸ‡ª",
    "Switzerland": "ðŸ‡¨ðŸ‡­",
    "United Kingdom": "ðŸ‡¬ðŸ‡§",
    "United States": "ðŸ‡ºðŸ‡¸",
    "Global": "ðŸŒ"
  };

  ON.getCountryFlag = (country = "") => ON.COUNTRY_FLAGS[country] || "ðŸŒ";

  ON.truncateDescription = (text = "", maxLength = 160) => {
    const clean = String(text).trim().replace(/\s+/g, " ");
    if (clean.length <= maxLength) return clean;
    // Cut at the last whole word before maxLength, then append an ellipsis.
    const sliced = clean.slice(0, maxLength);
    const lastSpace = sliced.lastIndexOf(" ");
    const safeCut = lastSpace > 80 ? sliced.slice(0, lastSpace) : sliced;
    return `${safeCut.replace(/[.,;:!?-]+$/, "")}â€¦`;
  };

  ON.escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  // Convert markdown-style descriptions to safe structured HTML.
  ON.renderMarkdown = (text = "") => {
    if (!text || !String(text).trim()) return "";
    const raw = String(text);

    // Split into blocks separated by blank lines.
    const blocks = raw.split(/\n{2,}/);
    const html = [];
    let inList = false;
    let listType = "";

    const inlineFormat = (line) => {
      return line
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    };

    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;

      // Check for headings.
      const h2Match = trimmed.match(/^##\s+(.+)$/m);
      if (h2Match && trimmed.split("\n").length === 1) {
        if (inList) { html.push(listType === "ul" ? "</ul>" : "</ol>"); inList = false; }
        html.push(`<h3>${inlineFormat(ON.escapeHtml(h2Match[1]))}</h3>`);
        continue;
      }

      const h3Match = trimmed.match(/^###\s+(.+)$/m);
      if (h3Match && trimmed.split("\n").length === 1) {
        if (inList) { html.push(listType === "ul" ? "</ul>" : "</ol>"); inList = false; }
        html.push(`<h4>${inlineFormat(ON.escapeHtml(h3Match[1]))}</h4>`);
        continue;
      }

      // Check for list blocks.
      const lines = trimmed.split("\n");
      const isUnordered = lines.every(l => /^[-*]\s+/.test(l.trim()) || !l.trim());
      const isOrdered = lines.every(l => /^\d+\.\s+/.test(l.trim()) || !l.trim());

      if (isUnordered && lines.some(l => /^[-*]\s+/.test(l.trim()))) {
        if (inList && listType !== "ul") { html.push("</ol>"); }
        if (!inList) { html.push("<ul>"); inList = true; listType = "ul"; }
        lines.forEach(l => {
          const m = l.trim().match(/^[-*]\s+(.+)$/);
          if (m) html.push(`<li>${inlineFormat(ON.escapeHtml(m[1]))}</li>`);
        });
        continue;
      }

      if (isOrdered && lines.some(l => /^\d+\.\s+/.test(l.trim()))) {
        if (inList && listType !== "ol") { html.push("</ul>"); }
        if (!inList) { html.push("<ol>"); inList = true; listType = "ol"; }
        lines.forEach(l => {
          const m = l.trim().match(/^\d+\.\s+(.+)$/);
          if (m) html.push(`<li>${inlineFormat(ON.escapeHtml(m[1]))}</li>`);
        });
        continue;
      }

      // Close any open list.
      if (inList) { html.push(listType === "ul" ? "</ul>" : "</ol>"); inList = false; }

      // Regular paragraph â€” may contain inline headings.
      const paragraphLines = lines.map(l => {
        const t = l.trim();
        if (!t) return "";
        return inlineFormat(ON.escapeHtml(t));
      }).filter(Boolean).join("<br>");

      if (paragraphLines) {
        html.push(`<p>${paragraphLines}</p>`);
      }
    }

    if (inList) { html.push(listType === "ul" ? "</ul>" : "</ol>"); }

    return html.join("\n");
  };

  // AdSense: Safe ad initialization â€” prevents duplicate pushes
  ON.pushAd = (selector) => {
    try {
      const el = document.querySelector(selector);
      if (el && !el.dataset.pushed) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        el.dataset.pushed = "true";
      }
    } catch (e) { /* AdSense may throw on empty slots â€” safe to ignore */ }
  };

  // AdSense: Generate a responsive ad unit HTML string
  ON.renderAdUnit = (slot) => `
    <div class="ad-container" aria-label="Advertisement">
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="ca-pub-4182963907868663"
           data-ad-slot="${slot || ''}"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>`;

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

  ON.isActiveOpportunity = (item) => ON.getDeadlineUrgency(item) !== "expired";

  ON.getSupabaseClient = () => {
    if (!window.supabase) {
      throw new Error("Supabase client could not be loaded. Check the CDN script tag.");
    }
    if (!supabaseClient) {
      supabaseClient = window.supabase.createClient(ON.SUPABASE_URL, ON.SUPABASE_PUBLISHABLE_KEY);
    }
    return supabaseClient;
  };

  ON.fetchOpportunityRows = async () => {
    const fields = "id,type,funding,title,country,level,field,deadline,deadline_status,description,link,slug,created_at";
    const cacheKey = `opportunitynest:opportunities:${fields}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.savedAt < 10 * 60 * 1000 && Array.isArray(parsed.rows)) {
          return parsed.rows;
        }
      }
    } catch (error) {
      try {
        sessionStorage.removeItem(cacheKey);
      } catch (_) {}
    }

    const response = await fetch(`${ON.SUPABASE_URL}/rest/v1/opportunities?select=${fields}&order=deadline.asc`, {
      headers: {
        apikey: ON.SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${ON.SUPABASE_PUBLISHABLE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Opportunity request failed with status ${response.status}.`);
    }

    const rows = await response.json();
    const activeRows = rows.map(ON.normalizeOpportunity).filter(ON.isActiveOpportunity);
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), rows: activeRows }));
    } catch (error) {
      // Storage can be unavailable in private modes; fetching still works.
    }
    return activeRows;
  };

  ON.cleanSlug = (value = "") => {
    const normalized = String(value)
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[''`]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");

    return normalized || "opportunity";
  };

  ON.slugify = ON.cleanSlug;

  ON.getOpportunityPath = (item) => `/opportunity/${encodeURIComponent(item.slug || ON.cleanSlug(`${item.title} ${item.country}`))}/`;

  ON.getOpportunityUrl = (item) => `${ON.SITE_URL}${ON.getOpportunityPath(item)}`;

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
    link: ON.OFFICIAL_URL_OVERRIDES[row.link] || row.link || "#",
    slug: row.slug || ON.cleanSlug(`${row.title || ""} ${row.country || ""}`).slice(0, 95),
    created_at: row.created_at || ""
  });

  ON.assignOpportunitySlugs = (items = []) => {
    const baseCounts = new Map();

    items.forEach((item) => {
      const base = item.slug || ON.cleanSlug(`${item.title} ${item.country}`);
      baseCounts.set(base, (baseCounts.get(base) || 0) + 1);
    });

    return items.map((item) => {
      const base = item.slug || ON.cleanSlug(`${item.title} ${item.country}`);
      const slug = baseCounts.get(base) > 1 ? `${base}-${ON.cleanSlug(item.id).slice(0, 8)}` : base;
      return { ...item, slug };
    });
  };

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
    slug: row.slug || "",
    logo_url: row.logo_url || "",
    organization: row.organization || "",
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

  ON.filterOpportunities = (items, { searchTerm = "", country = "", type = "", funding = "" } = {}) => {
    const query = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      const haystack = [item.title, item.country, item.field, item.description, item.type, item.funding, item.level]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesCountry = !country || item.country.toLowerCase() === country.toLowerCase();
      const matchesType = !type || item.type.toLowerCase() === type.toLowerCase();
      const matchesFunding = !funding || (item.funding || "").toLowerCase() === funding.toLowerCase();
      return matchesSearch && matchesCountry && matchesType && matchesFunding;
    });
  };

  ON.renderOpportunityCard = (item) => {
    const detailUrl = ON.getOpportunityUrl(item);
    const applyHref = item.link && item.link !== "#" ? item.link : detailUrl;
    const applyTarget = item.link && item.link !== "#" ? ' target="_blank" rel="noopener noreferrer"' : "";
    const urgency = ON.getDeadlineUrgency(item);
    const urgencyClass = urgency !== "none" ? ` deadline-${urgency}` : "";
    const isExpired = urgency === "expired";
    const expiredBadge = isExpired ? '<span class="badge badge-expired" aria-label="This opportunity has expired">Expired</span>' : "";
    const whoCanApply = item.level || "Open to eligible applicants";
    const fieldLabel = item.field && item.field !== "All Fields" ? item.field : "Multiple Fields";
    const cardClass = isExpired ? "live-opportunity-card compact-card card-expired" : "live-opportunity-card compact-card";

    return `
      <article class="${cardClass}">
        ${ON.getCountryLandmark(item.country)}
        <div class="opportunity-card-top">
          <p class="card-kicker">${ON.escapeHtml(item.type)} - ${ON.getCountryFlag(item.country)} ${ON.escapeHtml(item.country)}</p>
          ${expiredBadge}
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
          <a class="button button-primary" href="${ON.escapeHtml(applyHref)}"${applyTarget}>Apply Now <span aria-hidden="true">â†—</span></a>
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

  ON.fetchUniqueTypes = async () => {
    try {
      const client = ON.getSupabaseClient();
      const { data } = await client.from("opportunities").select("type").not("type", "is", null);

      const types = new Map();
      (data || []).forEach((row) => {
        if (row.type && row.type.trim()) {
          const type = row.type.trim();
          const key = type.toLowerCase();
          if (!types.has(key)) {
            types.set(key, type);
          }
        }
      });

      return Array.from(types.values()).sort((a, b) => a.localeCompare(b));
    } catch (error) {
      console.error("Error fetching types:", error);
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

  ON.populateTypeFilter = async (selectElement) => {
    if (!selectElement) return;
    
    const types = await ON.fetchUniqueTypes();
    
    selectElement.innerHTML = '<option value="">All types</option>';
    
    types.forEach(type => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
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

  // SEO: append the current year to a base keyword when the title does not already include a year.
  ON.resolveKeywordYear = (baseKeyword, item) => {
    const title = String(item.title || "");
    const yearMatch = title.match(/\b(202[5-9]|20\d\d)\b/);
    if (yearMatch) return `${baseKeyword} ${yearMatch[1]}`;
    return `${baseKeyword} ${new Date().getFullYear()}`;
  };

  // SEO overrides for high-value Google Search Console keywords.
  // Each override defines exact keyword targeting and rich content for a specific opportunity.
  ON.SEO_OVERRIDES = [
    {
      id: "ssrc-just-tech-fellowship",
      test: (title) => /SSRC\s+Just\s+Tech/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("SSRC Just Tech Fellowship", item),
      titleDescriptor: "Research Fellowship",
      h1Suffix: " (Fully Funded)",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” a fully funded research fellowship for scholars studying technology's social impact. Explore eligibility, funding, and deadlines.`,
      intro: (keyword, item) => `The ${keyword} supports researchers and practitioners examining how technology shapes society, equity, and governance. Open to scholars, journalists, legal experts, and technology professionals with a strong record in relevant fields, this fellowship provides funding, mentorship, and access to a global network of specialists working at the intersection of technology and the public interest. Fellows receive financial support to pursue independent research, collaborate with SSRC networks, and share findings that inform policy and public debate. Whether you are advancing academic scholarship or applied practice, this programme offers a rare opportunity to focus deeply on technology's social dimensions. The selection process is competitive, so applicants should prepare a clear research proposal, gather strong references, and submit all materials before the published deadline.`,
      h2: (keyword) => `Benefits and Eligibility for the ${keyword}`,
      faqs: (keyword) => [
        { question: `What is the ${keyword}?`, answer: `The ${keyword} is a fully funded research fellowship that supports scholars and practitioners studying the social, legal, and governance dimensions of technology.` },
        { question: `Who can apply for this fellowship?`, answer: `Researchers, social scientists, journalists, legal scholars, and technology practitioners with relevant experience and a strong project proposal are encouraged to apply.` },
        { question: `Is this fellowship fully funded?`, answer: `Yes, fellows receive financial support to carry out their research, along with mentorship and access to SSRC's professional network.` }
      ],
      imageAlt: (keyword) => `${keyword} official program banner`
    },
    {
      id: "geneva-challenge",
      test: (title) => /Geneva\s+Challenge/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("Geneva Challenge", item),
      titleDescriptor: "Competition",
      h1Suffix: "",
      metaDescription: (keyword, item) => `Join the ${keyword} â€” a global competition for master's teams with a CHF 25,000 prize pool and funded finals in Geneva. Check eligibility and apply.`,
      intro: (keyword, item) => `The ${keyword} is an annual international contest run by the Geneva Graduate Institute that invites interdisciplinary teams of master's students to develop proposals advancing global development goals. Each team must include students from at least two different academic disciplines and can come from any university worldwide. Finalist teams win a share of the CHF 25,000 prize pool and receive fully funded travel to Geneva to present their proposals before an international jury. The competition rewards originality, feasibility, and genuine potential to address development challenges. If you are a master's student passionate about interdisciplinary problem-solving and global impact, this contest offers a unique platform to showcase your ideas. Review the deadline and team requirements carefully before registering your group.`,
      h2: (keyword) => `Why Enter This Global Competition`,
      faqs: (keyword) => [
        { question: `What is the ${keyword}?`, answer: `The ${keyword} is an annual global competition for master's students to develop interdisciplinary proposals that advance international development goals.` },
        { question: `Who can enter this competition?`, answer: `Teams of 3-5 master's students from any university, spanning at least two different academic disciplines, are eligible to enter.` },
        { question: `What prizes does this contest offer?`, answer: `Finalist teams share a CHF 25,000 prize pool and receive fully funded travel to Geneva to present before a jury.` }
      ],
      imageAlt: (keyword) => `${keyword} official competition banner`
    },
    {
      id: "unicef-internship",
      test: (title) => /UNICEF\s+Internship/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("UNICEF Internship", item),
      titleDescriptor: "UN Internship",
      h1Suffix: " (Fully Funded)",
      metaDescription: (keyword, item) => `Apply for a ${keyword} â€” paid global placements with UNICEF for students and recent graduates. Explore eligibility, stipend, and application steps.`,
      intro: (keyword, item) => `The ${keyword} Programme places talented students and recent graduates inside UNICEF, the United Nations agency dedicated to child rights, education, health, and protection worldwide. Open to undergraduate, master's, and PhD students â€” as well as graduates within the past two years â€” these placements are available across UNICEF offices and country programmes around the globe. Interns receive a monthly stipend and, subject to available funding, a one-time contribution toward travel and visa costs. Whether your background is in development, communications, public health, education, or data, this programme offers direct exposure to global humanitarian work and a meaningful start to an international career. Positions are posted on a rolling basis, so check the official careers portal regularly and apply early.`,
      h2: (keyword) => `Why Apply for This UNICEF Opportunity`,
      faqs: (keyword) => [
        { question: `What is the ${keyword}?`, answer: `The ${keyword} is a paid placement programme that gives students and recent graduates hands-on experience with UNICEF's global child rights and development work.` },
        { question: `Who can apply for this programme?`, answer: `Current undergraduate, master's, or PhD students, and recent graduates within the past two years, who are proficient in English, French, or Spanish.` },
        { question: `Is this internship paid?`, answer: `Yes, UNICEF interns receive a monthly stipend and may also receive a contribution toward travel and visa costs, depending on available funding.` }
      ],
      imageAlt: (keyword) => `${keyword} official programme banner`
    },
    {
      id: "marshall-scholarship",
      test: (title) => /Marshall\s+Scholarship/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("Marshall Scholarship", item),
      titleDescriptor: "UK Master's",
      h1Suffix: " (Fully Funded)",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” a fully funded UK master's scholarship for US students covering tuition, living costs, and airfare. Learn more and apply.`,
      intro: (keyword, item) => `The ${keyword} is one of the most prestigious fully funded awards for US citizens who want to pursue a master's degree at any university in the United Kingdom. Awarded to up to 50 outstanding scholars each year, it covers full tuition, a living stipend, book and thesis grants, and airfare between the US and the UK. Candidates must be nominated by their undergraduate institution's Marshall campus committee and demonstrate exceptional academic achievement, leadership potential, and ambassadorial qualities. Almost any field of study is eligible, making this scholarship a flexible pathway for graduates seeking world-class education and international experience. If you are a final-year undergraduate or recent graduate with a strong academic record, begin your campus nomination process well before the national deadline.`,
      h2: (keyword) => `Benefits of This UK Master's Award`,
      faqs: (keyword) => [
        { question: `What is the ${keyword}?`, answer: `The ${keyword} is a fully funded award that allows US citizens to pursue a master's degree at any UK university, covering tuition, living expenses, and travel.` },
        { question: `Who can apply for this award?`, answer: `US citizens who are final-year undergraduates or recent graduates with outstanding academic records and strong leadership potential.` },
        { question: `Is this scholarship fully funded?`, answer: `Yes, it covers full tuition, a living stipend, book and thesis grants, and airfare to and from the United Kingdom.` }
      ],
      imageAlt: (keyword) => `${keyword} official scholarship banner`
    },
    {
      id: "daad-epos-scholarship",
      test: (title) => /DAAD\s+EPOS/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("DAAD EPOS Scholarship", item),
      titleDescriptor: "Germany",
      h1Suffix: " (Fully Funded)",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” a fully funded German master's or PhD programme for development professionals. Explore eligible courses and deadlines.`,
      intro: (keyword, item) => `The ${keyword} funds development-related postgraduate courses at approved German universities for professionals from developing and newly industrialising countries. Unlike general DAAD scholarships, EPOS supports a curated list of master's and PhD programmes in fields such as public policy, economics, engineering, and environmental management. Applicants need at least two years of relevant professional experience and must apply to a specific course on the official EPOS list. Scholars receive a monthly stipend, health and liability insurance, a travel allowance, and a study allowance, with possible additional support for family members and language courses, depending on individual circumstances. If you are a development professional seeking targeted, fully funded qualification in Germany, this scholarship is one of the strongest options available.`,
      h2: (keyword) => `Eligibility for This German Scholarship`,
      faqs: (keyword) => [
        { question: `What is the ${keyword}?`, answer: `The ${keyword} is a fully funded German award for professionals from developing countries to complete development-related postgraduate courses at approved universities.` },
        { question: `Who can apply for this scholarship?`, answer: `Graduates from developing or newly industrialising countries with at least two years of relevant professional experience and admission to an EPOS-listed course.` },
        { question: `Is this programme fully funded?`, answer: `Yes, it covers monthly living allowances, health insurance, travel, study materials, and may include family and language-course support.` }
      ],
      imageAlt: (keyword) => `${keyword} official scholarship banner`
    },
    {
      id: "mccall-macbain-scholarship",
      test: (title) => /McCall\s+MacBain/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("McCall MacBain Scholarship", item),
      titleDescriptor: "Award",
      h1Suffix: " (Fully Funded)",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” McGill's flagship fully funded master's award with leadership development, mentorship, and a living stipend.`,
      intro: (keyword, item) => `The ${keyword} is McGill University's flagship graduate leadership award for outstanding students and recent graduates from any country. It funds a full-time master's or eligible second-entry professional degree at McGill in Montreal, pairing academic study with a structured leadership development programme. Recipients receive full tuition and fees, a CAD 2,300 monthly living stipend during academic terms, up to CAD 5,000 in summer funding, and funded travel to the final interview stage in Montreal, with accommodation and logistics arranged for finalists. Selection weighs leadership, community engagement, and academic strength equally through essays, references, and multi-stage interviews. If you are an ambitious graduate seeking a fully funded Canadian master's degree with a leadership focus, this award offers one of the most comprehensive packages available.`,
      h2: (keyword) => `Why Apply for This McGill Award`,
      faqs: (keyword) => [
        { question: `What is the ${keyword}?`, answer: `The ${keyword} is McGill University's flagship fully funded master's award that combines graduate study with leadership development and mentorship.` },
        { question: `Who can apply for this award?`, answer: `Outstanding undergraduates or recent graduates of any nationality applying to an eligible full-time master's programme at McGill University.` },
        { question: `Is this scholarship fully funded?`, answer: `Yes, it covers full tuition and fees, a monthly living stipend, summer funding, and travel to the final interview stage.` }
      ],
      imageAlt: (keyword) => `${keyword} official scholarship banner`
    },
    {
      id: "franz-werfel-fellowship",
      test: (title) => /Franz\s+Werfel/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("Franz Werfel Fellowship", item),
      titleDescriptor: "Austria",
      h1Suffix: " (Fully Funded)",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” a fully funded residency at the University of Vienna for German-language writers, scholars, and translators. Explore eligibility and deadlines.`,
      intro: (keyword, item) => `The ${keyword} is a prestigious fully funded residency fellowship hosted by the University of Vienna's Franz Werfel Centre for German-language and literary studies. Open to established and emerging writers, translators, and scholars working in or on German-language literature, the fellowship provides a dedicated period of focused research, writing, or translation in Vienna. Fellows receive a monthly stipend, accommodation support, and access to the university's library and academic networks. The programme honours the legacy of Franz Werfel, the Austrian novelist and playwright known for his commitment to intellectual freedom and humanitarian values. Applicants should demonstrate a strong body of work in German-language literary scholarship, creative writing, or translation, along with a clear project proposal for their time in Vienna. The fellowship is highly competitive and attracts candidates from across Europe and beyond.`,
      h2: (keyword) => `Eligibility for This Austrian Literary Fellowship`,
      faqs: (keyword) => [
        { question: `What is the ${keyword}?`, answer: `The ${keyword} is a fully funded residency at the University of Vienna supporting writers, translators, and scholars working in German-language literature and literary studies.` },
        { question: `Who can apply for this fellowship?`, answer: `Established and emerging writers, translators, and academics with a strong record in German-language literary work and a clear project proposal for their residency period.` },
        { question: `Is this fellowship fully funded?`, answer: `Yes, it covers a monthly stipend, accommodation support, and access to the University of Vienna's library and academic resources.` }
      ],
      imageAlt: (keyword) => `${keyword} official fellowship banner`
    },
    {
      id: "gates-cambridge",
      test: (title) => /Gates\s+Cambridge/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("Gates Cambridge Scholarship", item),
      titleDescriptor: "UK Master's Award",
      h1Suffix: " (Fully Funded)",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” Cambridge University's flagship fully funded award for outstanding international postgraduates. Explore eligibility and deadlines.`,
      intro: (keyword, item) => `The ${keyword} is one of the most prestigious international graduate awards, funding up to 40 outstanding students from outside the UK each year to pursue a full-time postgraduate degree at the University of Cambridge. Founded in 2001 by the Bill and Melinda Gates Foundation, the scholarship covers full university fees, a generous living stipend, round-trip airfare, and additional funding for academic conferences and family allowances. Scholars are selected not only for academic excellence but for their leadership potential, commitment to improving the lives of others, and ability to think critically across disciplines. If you are a high-achieving student with a record of meaningful impact and a clear vision for how a Cambridge education will amplify your contribution to society, this scholarship offers an unmatched combination of financial support, intellectual community, and lifelong network.`,
      h2: (keyword) => `Why This Cambridge Award Stands Out`,
      faqs: (keyword) => [
        { question: `What does the ${keyword} cover?`, answer: `Full university fees, a living stipend of approximately Â£20,000 per year, round-trip airfare, and additional funding for academic development and family allowances.` },
        { question: `Who is eligible?`, answer: `Outstanding students from any country outside the UK who are applying to a full-time postgraduate degree at the University of Cambridge.` },
        { question: `How competitive is this scholarship?`, answer: `Extremely competitive â€” around 40 scholarships are awarded annually from thousands of applications worldwide. Selection weighs academic merit, leadership, and commitment to social impact equally.` }
      ],
      imageAlt: (keyword) => `${keyword} University of Cambridge banner`
    },
    {
      id: "erasmus-mundus",
      test: (title) => /Erasmus\s+Mundus/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("Erasmus Mundus Joint Master Degrees", item),
      titleDescriptor: "EU Programme",
      h1Suffix: " (Fully Funded)",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” EU-funded fully funded master's programmes at top European universities. Explore eligible fields, scholarships, and deadlines.`,
      intro: (keyword, item) => `The ${keyword} (EMJMD) are prestigious, integrated, international study programmes jointly delivered by consortia of higher education institutions across Europe and beyond. Each programme lasts one to two years and awards a joint or multiple degree. The European Union funds full scholarships for outstanding students worldwide, covering participation costs, a monthly living allowance of â‚¬1,400, travel expenses, and insurance. With over 150 programmes spanning fields from renewable energy to human rights, public health to data science, EMJMD offers a unique opportunity to study in at least two different countries, gain intercultural competence, and build a pan-European professional network. If you are a bachelor's graduate seeking a truly international master's experience with full financial support, this is one of the most comprehensive funded programmes available.`,
      h2: (keyword) => `What Makes This EU Programme Unique`,
      faqs: (keyword) => [
        { question: `How much funding does the ${keyword} provide?`, answer: `Full scholarships cover tuition, a â‚¬1,400 monthly allowance, travel costs, and insurance for the entire programme duration (1â€“2 years).` },
        { question: `Can I choose which countries to study in?`, answer: `Each EMJMD programme has a fixed mobility pattern â€” you study at a minimum of two different European universities as part of the consortium. You cannot pick individual institutions, but each programme publishes its exact mobility path.` },
        { question: `Who can apply?`, answer: `Graduates with a bachelor's degree from any country worldwide. Specific programmes may require relevant academic backgrounds, language proficiency, or professional experience.` }
      ],
      imageAlt: (keyword) => `${keyword} European universities banner`
    },
    {
      id: "mext-scholarship",
      test: (title) => /MEXT\s+Japanese/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("MEXT Japanese Government Scholarship", item),
      titleDescriptor: "Japan Scholarship",
      h1Suffix: " (Fully Funded)",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” Japan's flagship fully funded government award for international students. Explore eligibility, benefits, and application routes.`,
      intro: (keyword, item) => `The ${keyword} is the Japanese government's flagship programme for international students, offering full funding for undergraduate, master's, doctoral, and research students to study at Japanese universities. Established in 1954, the scholarship reflects Japan's commitment to global education and cultural exchange. Recipients receive full tuition coverage, a monthly stipend (approximately Â¥143,000â€“148,000 depending on level), round-trip airfare, and a preparatory Japanese language course if needed. The programme is available through two routes: embassy recommendation (applied through your local Japanese embassy) or university recommendation (nominated by a Japanese institution). If you are drawn to Japanese academic culture, eager to learn the language, and committed to building bridges between your home country and Japan, MEXT provides one of the most generous and long-standing government scholarship programmes in the world.`,
      h2: (keyword) => `Benefits of Studying in Japan on MEXT`,
      faqs: (keyword) => [
        { question: `What does the ${keyword} cover?`, answer: `Full tuition, a monthly stipend of Â¥143,000â€“148,000, round-trip airfare, and a Japanese language preparatory course if required.` },
        { question: `What are the two application routes?`, answer: `Embassy recommendation (apply through your local Japanese embassy or consulate) and university recommendation (a Japanese university nominates you directly).` },
        { question: `Do I need to speak Japanese?`, answer: `Not initially. Many MEXT scholarships include a 1â€“2 year Japanese language preparatory course before your degree begins. Some programmes at the graduate level are available in English.` }
      ],
      imageAlt: (keyword) => `${keyword} Japan study banner`
    },
    {
      id: "knight-hennessy",
      test: (title) => /Knight\s*[-â€“]?\s*Hennessy/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("Knight-Hennessy Scholars Program", item),
      titleDescriptor: "Stanford Award",
      h1Suffix: " (Fully Funded)",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” Stanford's flagship fully funded graduate scholarship with leadership development. Explore eligibility and how to apply.`,
      intro: (keyword, item) => `The ${keyword} is Stanford University's most ambitious graduate fellowship, funding up to 100 outstanding students each year to pursue any graduate degree at Stanford. Founded by Phil Knight and John Hennessy, the programme covers full tuition and fees, a living stipend, travel allowance, and additional academic expenses for up to three years. Beyond financial support, Knight-Hennessy provides a transformative leadership development programme including immersive workshops, global trips, one-on-one coaching, and a diverse community of scholars across all seven Stanford schools. Selection weighs academic excellence, leadership experience, civic contribution, and personal character through a multi-stage process including written essays and a two-day immersive assessment weekend. If you are an ambitious graduate student with a track record of meaningful impact and a vision for addressing the world's most pressing challenges, this programme offers an unparalleled combination of funding, community, and leadership training at one of the world's leading universities.`,
      h2: (keyword) => `Why This Stanford Programme Is Unique`,
      faqs: (keyword) => [
        { question: `What does the ${keyword} fund?`, answer: `Full tuition and fees for any Stanford graduate programme, plus a living stipend, travel allowance, and academic expenses for up to three years.` },
        { question: `Can I apply to any Stanford school?`, answer: `Yes â€” Knight-Hennessy Scholars can pursue any graduate degree across all seven Stanford schools: Business, Education, Engineering, Humanities & Sciences, Law, Medicine, and Earth Sustainability.` },
        { question: `How is the selection process structured?`, answer: `A holistic review of academic records, leadership experience, essays, and references, followed by an immersive assessment weekend for finalists that includes group activities, interviews, and presentations.` }
      ],
      imageAlt: (keyword) => `${keyword} Stanford University banner`
    },
    {
      id: "mastercard-foundation",
      test: (title) => /Mastercard\s+Foundation\s+Scholars/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("Mastercard Foundation Scholars Program", item),
      titleDescriptor: "Global Scholarship",
      h1Suffix: " (Fully Funded)",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” fully funded university education for young leaders from Africa. Explore partner universities, eligibility, and benefits.`,
      intro: (keyword, item) => `The ${keyword} is one of the largest scholarship programmes in the world, providing comprehensive funding for academically talented yet economically disadvantaged young people from Africa to access and complete university education. The programme partners with over 20 universities across Africa and select institutions worldwide, covering full tuition, accommodation, books, a living stipend, travel, and psychosocial support throughout your studies. Scholars also receive leadership development, mentoring, and access to a global network of over 20,000 alumni committed to giving back to their communities. The programme specifically targets students who would otherwise be unable to afford university â€” combining financial access with the tools, networks, and values needed to become transformational leaders. If you are a young African student with strong academic potential, financial need, and a genuine commitment to community impact, this programme offers a life-changing educational pathway.`,
      h2: (keyword) => `How This Programme Supports African Leaders`,
      faqs: (keyword) => [
        { question: `Who can apply for the ${keyword}?`, answer: `Young people from Africa who are academically talented, financially disadvantaged, and committed to giving back to their communities. Specific eligibility varies by partner university.` },
        { question: `What expenses does the scholarship cover?`, answer: `Full tuition, accommodation, books, a living stipend, travel costs, and psychosocial support throughout your studies. Some partners also provide laptops and health insurance.` },
        { question: `Which universities participate?`, answer: `Over 20 partner institutions across Africa and globally, including universities in Ghana, Kenya, South Africa, Rwanda, Uganda, Canada, and the United States. Check the official website for the current partner list.` }
      ],
      imageAlt: (keyword) => `${keyword} African scholars banner`
    },
    {
      id: "who-internship",
      test: (title) => /WHO\s+Internship/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("WHO Internship Programme", item),
      titleDescriptor: "UN Internship",
      h1Suffix: "",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” gain hands-on experience at the World Health Organization. Explore eligibility, stipend details, and application steps.`,
      intro: (keyword, item) => `The ${keyword} offers students and recent graduates the chance to work alongside WHO professionals at headquarters, regional, or country offices worldwide. Internships typically last six weeks to six months and cover areas such as public health, epidemiology, health policy, communications, data science, and programme management. Interns receive a monthly stipend to cover living expenses and, depending on the duty station, may also receive travel support. The programme provides direct exposure to global health operations, policy development, and emergency response â€” experience that is invaluable for careers in international public health. WHO welcomes applicants from diverse academic backgrounds including medicine, nursing, public health, economics, social sciences, and statistics. If you are passionate about global health and want to contribute to the organisation leading the world's health response, this internship offers a meaningful entry point.`,
      h2: (keyword) => `Why This WHO Experience Matters`,
      faqs: (keyword) => [
        { question: `Is the ${keyword} paid?`, answer: `Yes, WHO interns receive a monthly living stipend. Some duty stations may also provide travel support, though this varies by location and funding availability.` },
        { question: `How long does the internship last?`, answer: `Between six weeks and six months, depending on the specific opportunity and the needs of the host department.` },
        { question: `Who can apply?`, answer: `Students enrolled in a relevant degree programme or recent graduates (within six months) in fields such as public health, medicine, social sciences, statistics, communications, or health policy.` }
      ],
      imageAlt: (keyword) => `${keyword} World Health Organization banner`
    },
    {
      id: "rotary-peace",
      test: (title) => /Rotary\s+Peace\s+Fellowship/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("Rotary Peace Fellowship", item),
      titleDescriptor: "Peace Studies",
      h1Suffix: " (Fully Funded)",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” fully funded master's or career-development fellowship in peace and conflict studies at top universities worldwide.`,
      intro: (keyword, item) => `The ${keyword} is one of the most prestigious fully funded fellowships in peace and conflict studies, supporting up to 130 fellows each year to study at one of six Rotary Peace Centres located at leading universities across Japan, Sweden, England, Australia, Thailand, and the United States. Fellows pursue either a master's degree in peace and conflict studies or a career-development fellowship for experienced professionals. The programme covers tuition, fees, room and board, round-trip transportation, and internship expenses. Rotary Peace Fellows join a global network of over 1,600 alumni working in diplomacy, humanitarian aid, policy, and peacebuilding worldwide. If you are committed to advancing peace and have the academic background and professional drive to make an impact, this fellowship provides world-class education and a lifelong community of practice.`,
      h2: (keyword) => `What Sets This Peace Fellowship Apart`,
      faqs: (keyword) => [
        { question: `Where can I study with the ${keyword}?`, answer: `At one of six Rotary Peace Centres: University of Queensland (Australia), Uppsala University (Sweden), University of Bradford (UK), International Christian University (Japan), Chulalongkorn University (Thailand), or Duke University/UNC (USA).` },
        { question: `What does the fellowship cover?`, answer: `Full tuition, fees, room and board, round-trip transportation, and internship expenses for the duration of the programme.` },
        { question: `Do I need professional experience?`, answer: `For the master's degree track, relevant professional experience is recommended but not always required. The career-development fellowship requires a minimum of five years of relevant professional experience.` }
      ],
      imageAlt: (keyword) => `${keyword} peace studies banner`
    },
    {
      id: "google-swe-internship",
      test: (title) => /Google\s+Software\s+Engineering\s+Internship/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("Google Software Engineering Internship", item),
      titleDescriptor: "Tech Internship",
      h1Suffix: "",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” a competitive paid internship at Google for computer science students. Explore eligibility, stipend, and application tips.`,
      intro: (keyword, item) => `The ${keyword} is one of the most sought-after technical internships in the world, placing undergraduate, master's, and PhD students inside Google's engineering teams for a 12-week summer placement. Interns work on real projects alongside full-time engineers, receive a competitive salary and housing stipend, and gain exposure to Google's engineering culture, tools, and scale. The programme is open to students studying computer science, software engineering, or a closely related technical field at an accredited university. Selection is highly competitive and based on coding ability, problem-solving skills, and demonstrated interest in technology. The application process typically involves online assessments followed by technical interviews. If you are a CS student with strong programming fundamentals and a passion for building at scale, this internship provides an unmatched launchpad for a career in software engineering.`,
      h2: (keyword) => `How to Prepare for This Google Internship`,
      faqs: (keyword) => [
        { question: `How long is the ${keyword}?`, answer: `The internship runs for approximately 12 weeks during the summer, with start dates varying by office location.` },
        { question: `What is the selection process?`, answer: `An online application with coding assessments, followed by one or two technical interviews focused on data structures, algorithms, and problem-solving.` },
        { question: `Who can apply?`, answer: `Students enrolled in a bachelor's, master's, or PhD programme in computer science, software engineering, or a related technical field at an accredited university.` }
      ],
      imageAlt: (keyword) => `${keyword} Google engineering banner`
    },
    {
      id: "eth-zurich-excellence",
      test: (title) => /ETH\s+Zurich\s+Excellence/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("ETH Zurich Excellence Scholarship", item),
      titleDescriptor: "Swiss Scholarship",
      h1Suffix: " (Fully Funded)",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” a fully funded master's scholarship at one of the world's top technical universities in Switzerland. Explore eligibility and benefits.`,
      intro: (keyword, item) => `The ${keyword} (ESOP) supports outstanding master's students at ETH Zurich, one of the world's leading technical universities. Each year, a small number of top-performing students receive a scholarship covering full living and study expenses plus a tuition fee waiver for the duration of the master's programme. Scholars are selected based on exceptional academic performance, strong letters of recommendation, and a compelling motivation letter. The programme also pairs scholars with a faculty mentor who provides academic guidance throughout their studies. ETH Zurich is consistently ranked among the top 10 universities globally for engineering, computer science, and natural sciences. If you are a high-achieving student seeking a rigorous technical education in Switzerland with full financial support, ESOP offers a rare combination of academic excellence and institutional prestige.`,
      h2: (keyword) => `Why Study at ETH Zurich`,
      faqs: (keyword) => [
        { question: `What does the ${keyword} cover?`, answer: `A living and study expenses stipend plus a full tuition fee waiver for the entire master's programme duration.` },
        { question: `How are scholars selected?`, answer: `Based on exceptional academic performance (top 10% of your cohort), strong recommendation letters, and a compelling motivation letter. Shortlisted candidates may be interviewed.` },
        { question: `Do I need to speak German?`, answer: `Most master's programmes at ETH Zurich are taught in English, though some require German proficiency. Check the specific programme requirements on the ETH website.` }
      ],
      imageAlt: (keyword) => `${keyword} ETH Zurich banner`
    },
    {
      id: "world-bank-scholarship",
      test: (title) => /Joint\s+Japan\s+World\s+Bank/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("Joint Japan World Bank Graduate Scholarship", item),
      titleDescriptor: "Development Scholarship",
      h1Suffix: " (Fully Funded)",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” fully funded master's scholarships for students from developing countries at top universities worldwide.`,
      intro: (keyword, item) => `The ${keyword} (JJ/WBGSP) is a fully funded programme that enables outstanding students from developing countries to pursue a master's degree at one of the programme's partner universities worldwide. The scholarship covers full tuition, a monthly living stipend, round-trip airfare, health insurance, and a travel allowance. In return, scholars commit to returning to their home country after graduation to apply their skills in development-related work. The programme prioritises fields directly relevant to international development, including economics, public health, education, agriculture, environment, and urban planning. If you are from a developing country, have a strong academic record, and are committed to contributing to your country's development, this scholarship provides a world-class education with a clear purpose.`,
      h2: (keyword) => `Who Should Apply for This Development Scholarship`,
      faqs: (keyword) => [
        { question: `Who is eligible for the ${keyword}?`, answer: `Nationals of developing countries who have been admitted to a designated master's programme at a JJ/WBGSP partner university and have relevant professional development experience.` },
        { question: `What expenses does the scholarship cover?`, answer: `Full tuition, monthly living stipend, round-trip airfare, health insurance, and a travel allowance for the duration of the master's programme.` },
        { question: `Is there a return requirement?`, answer: `Yes, scholars are required to return to their home country after completing their studies and apply their knowledge to development-related work.` }
      ],
      imageAlt: (keyword) => `${keyword} World Bank development banner`
    },
    {
      id: "national-geographic-explorer",
      test: (title) => /National\s+Geographic\s+Explorer/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("National Geographic Explorer Grant", item),
      titleDescriptor: "Research Grant",
      h1Suffix: "",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” competitive research funding for explorers working in conservation, science, education, and storytelling. Explore eligibility and deadlines.`,
      intro: (keyword, item) => `The ${keyword} programme funds bold individuals and teams working to conserve, explore, and illuminate the world through research, storytelling, and innovation. Grants range from $10,000 to $100,000 and support projects in conservation, scientific research, archaeology, education, photography, filmmaking, and technology. The programme is open to researchers, educators, journalists, photographers, and changemakers from any country. Applicants must propose a project with clear objectives, measurable outcomes, and alignment with National Geographic's mission. Selection is competitive and based on the project's potential impact, innovation, and the applicant's track record. If you have a compelling project idea that advances exploration or conservation, this grant provides both funding and membership in a global community of National Geographic Explorers.`,
      h2: (keyword) => `What Types of Projects This Grant Supports`,
      faqs: (keyword) => [
        { question: `How much funding does the ${keyword} provide?`, answer: `Grants range from $10,000 to $100,000 depending on the scope, duration, and impact potential of the proposed project.` },
        { question: `Who can apply?`, answer: `Researchers, educators, journalists, photographers, filmmakers, and innovators from any country with a project aligned to National Geographic's mission of conservation, exploration, and education.` },
        { question: `What makes a strong application?`, answer: `A clear project plan with measurable outcomes, demonstrated alignment with National Geographic's priorities, relevant experience, and a realistic budget and timeline.` }
      ],
      imageAlt: (keyword) => `${keyword} exploration and conservation banner`
    },
    {
      id: "ted-fellows",
      test: (title) => /TED\s+Fellows/i.test(title),
      keyword: (item) => ON.resolveKeywordYear("TED Fellows Program", item),
      titleDescriptor: "Global Fellowship",
      h1Suffix: "",
      metaDescription: (keyword, item) => `Apply for the ${keyword} â€” a fellowship for exceptional innovators and changemakers worldwide. Explore benefits, eligibility, and how to apply.`,
      intro: (keyword, item) => `The ${keyword} identifies and supports extraordinary individuals from every field and region who are creating meaningful change in their communities and beyond. Each year, a new cohort of Fellows is selected from hundreds of nominations across more than 100 countries. Fellows receive a transformative package including a fully funded trip to the TED Conference, professional development workshops, media training, mentorship from the TED community, and a cash grant to support their projects. The fellowship is not limited to any specific field â€” past Fellows include scientists, artists, entrepreneurs, activists, journalists, and engineers. What unites them is bold thinking, tangible impact, and the potential to scale their work with TED's platform. If you are an exceptional individual working on an ambitious project with global relevance, this fellowship offers visibility, resources, and a network that can accelerate your impact.`,
      h2: (keyword) => `What Makes This Fellowship Different`,
      faqs: (keyword) => [
        { question: `What do TED Fellows receive?`, answer: `A funded trip to the TED Conference, professional development, media training, mentorship, a cash grant, and lifelong access to the TED community.` },
        { question: `Do I need to work in a specific field?`, answer: `No â€” TED Fellows come from every field: science, art, technology, activism, journalism, medicine, engineering, and more. The common thread is bold ideas and measurable impact.` },
        { question: `How are Fellows selected?`, answer: `Through a nomination and application process reviewed by the TED community. Selection weighs the ambition of the project, the applicant's track record, and the potential for global impact.` }
      ],
      imageAlt: (keyword) => `${keyword} innovation and ideas banner`
    }
  ];

  ON.getSEOOverride = (item) => {
    const title = String(item.title || "");
    return ON.SEO_OVERRIDES.find((override) => override.test(title));
  };

  ON.getPrimaryKeyword = (item) => {
    const override = ON.getSEOOverride(item);
    if (override) return override.keyword(item);
    return ON.extractPrimaryKeyword(item);
  };

  // SEO helpers: extract a search-friendly primary keyword from the opportunity title.
  ON.extractPrimaryKeyword = (item) => {
    const title = String(item.title || "").trim();
    if (!title) return "Opportunity";

    // Match the first recognized opportunity-type phrase in the title.
    const typePatterns = [
      /^(.+?\s(?:scholarship|scholarships))/i,
      /^(.+?\s(?:fellowship|fellowships))/i,
      /^(.+?\s(?:internship|internships))/i,
      /^(.+?\s(?:programme|program|programs))/i,
      /^(.+?\s(?:grant|grants|award|awards))/i,
      /^(.+?\s(?:competition|competitions|challenge|challenges))/i
    ];

    for (const pattern of typePatterns) {
      const match = title.match(pattern);
      if (match) {
        return match[1]
          .replace(/\s*(?:20\d\d|202[5-9])\s*$/i, "")
          .replace(/[\s.,;:!?]+$/, "")
          .trim();
      }
    }

    // Fallback: strip years, parentheticals, and trailing country/eligibility clauses.
    return title
      .replace(/\s*(?:20\d\d|202[5-9])\s*/g, "")
      .replace(/\s*\([^)]*\)\s*$/g, "")
      .replace(/\s*[â€“â€”-]\s*.*$/, "")
      .replace(/\s*\|.*$/, "")
      .replace(/\s+in\s+[^,]+(?:,.*)?$/i, "")
      .replace(/\s+for\s+.*$/i, "")
      .replace(/[\s.,;:!?]+$/, "")
      .trim() || title;
  };

  ON.countWords = (text = "") => String(text).trim().split(/\s+/).filter(Boolean).length;

  ON.fitWordCount = (text = "", min = 120, max = 180) => {
    const words = String(text).trim().split(/\s+/).filter(Boolean);
    if (words.length <= max) return text;

    let cut = words.slice(0, max);
    while (cut.length > min && /[.,;:!?]$/.test(cut[cut.length - 1])) {
      cut.pop();
    }
    return cut.join(" ").replace(/[.,;:!?]+$/, "") + ".";
  };

  // SEO: Generate optimized title using the primary keyword near the beginning.
  // Format: [Primary Keyword] | Fully Funded [Opportunity Type] 2026 | OpportunityNest
  ON.generateSEOTitle = (item) => {
    const override = ON.getSEOOverride(item);
    const keyword = ON.getPrimaryKeyword(item);
    if (override) {
      return `${keyword} | Fully Funded ${override.titleDescriptor} | OpportunityNest`;
    }
    const type = item.type || "Opportunity";
    const year = new Date().getFullYear();
    return `${keyword} | Fully Funded ${type} ${year} | OpportunityNest`;
  };

  // SEO: Generate optimized meta description (150-160 characters) containing the keyword once.
  ON.generateSEODescription = (item) => {
    const override = ON.getSEOOverride(item);
    const keyword = ON.getPrimaryKeyword(item);
    if (override) {
      const desc = override.metaDescription(keyword, item);
      if (desc.length <= 160) return desc;
      return desc.slice(0, 157).trim().replace(/[.,;:!?]+$/, "") + "...";
    }
    const type = (item.type || "opportunity").toLowerCase();
    const country = item.country || "Global";
    const funding = item.funding || "Full funding";
    const deadline = ON.formatDeadline(item);

    const keywordLower = keyword.toLowerCase();
    const typeFragment = keywordLower.includes(type) ? "" : ` ${type}`;
    const descVariants = [
      `Apply for the ${keyword}${typeFragment} in ${country}. ${funding}. Deadline: ${deadline}. Explore details and apply via OpportunityNest.`,
      `${keyword}${typeFragment} â€” ${country}. ${funding}. Deadline ${deadline}. Find full eligibility, funding details, and application steps on OpportunityNest.`,
      `Discover the ${keyword}${typeFragment} in ${country}. ${funding}, deadline ${deadline}. Read the full guide and apply through the official source.`,
      `${keyword}: ${funding} ${typeFragment} in ${country}. Application deadline ${deadline}. Check eligibility, required documents, and tips on OpportunityNest.`,
      `Looking for the ${keyword}${typeFragment}? Based in ${country}, ${funding}, deadline ${deadline}. OpportunityNest has the full breakdown.`
    ];
    let desc = ON.pickVariant(descVariants, item);

    if (desc.length > 160) {
      desc = desc.slice(0, 157).trim().replace(/[.,;:!?]+$/, "") + "...";
    }
    return desc;
  };

  // SEO: Generate optimized H1 using the exact primary keyword once.
  ON.generateDetailH1 = (item) => {
    const override = ON.getSEOOverride(item);
    const keyword = ON.getPrimaryKeyword(item);
    if (override && override.h1Suffix) {
      return `${keyword}${override.h1Suffix}`;
    }
    if (override) return keyword;
    const h1SuffixVariants = [" (Fully Funded)", " â€” Full Guide & Application", " â€” Eligibility, Funding & How to Apply", " (Application Guide)", " â€” Details, Deadline & Requirements"];
    const h1Suffix = ON.pickVariant(h1SuffixVariants, item);
    return `${keyword}${h1Suffix}`;
  };

  // Pick a variant from an array based on a stable hash of the item title
  ON.pickVariant = (variants, item) => {
    const str = item.title || item.id || "default";
    let hash = 0;
    for (let i = 0; i < str.length; i++) { hash = ((hash << 5) - hash) + str.charCodeAt(i); hash |= 0; }
    return variants[Math.abs(hash) % variants.length];
  };

  // SEO: Generate an opening paragraph (120-180 words) with the keyword in the first 50 words.
  ON.generateDetailIntro = (item) => {
    const override = ON.getSEOOverride(item);
    const keyword = ON.getPrimaryKeyword(item);
    if (override) {
      return ON.fitWordCount(override.intro(keyword, item), 120, 180);
    }
    const type = (item.type || "opportunity").toLowerCase();
    const country = item.country || "Global";
    const level = item.level || "eligible";
    const field = item.field || "various fields";
    const funding = item.funding || "comprehensive support";
    const deadline = ON.formatDeadline(item);
    const org = item.organization || "";
    const orgMention = org ? ` Offered by ${org},` : "";

    const introVariants = [
      // Variant 1: Direct and practical
      `The ${keyword} is a ${type} based in ${country}, open to ${level} candidates with an interest in ${field}.${orgMention} This programme offers ${funding}, enabling selected participants to focus fully on their studies, research, or professional development without financial pressure. Successful applicants join a cohort of driven individuals from around the world and gain access to academic mentors, networking events, and career-building resources throughout the programme. Whether your goal is to advance your education, gain international experience, or build specialised skills, this opportunity provides a structured path toward that objective. The application deadline is ${deadline}. Review all eligibility criteria carefully and submit your materials through the official programme website well before the closing date. OpportunityNest keeps this listing updated so you can apply with accurate deadline and funding information.`,
      // Variant 2: Aspirational and career-focused
      `If you are looking to take a significant step in your academic or professional journey, the ${keyword} deserves your attention. This ${type} in ${country} welcomes ${level} applicants working in ${field} and provides ${funding} to help participants make the most of the experience.${orgMention} Past participants have described the programme as transformative â€” not just for the funding, but for the mentorship, peer network, and exposure to new perspectives that come with it. The deadline is ${deadline}, and applications are submitted through the official programme website. OpportunityNest recommends starting your preparation early: review the eligibility criteria, gather your documents, and draft your motivation letter well before the closing date. This listing is kept up to date so you always have the latest information at hand.`,
      // Variant 3: Problem-solution framing
      `Finding a ${type} that combines strong funding, clear eligibility, and a reputable host institution is not easy â€” the ${keyword} checks all three. Based in ${country} and aimed at ${level} candidates in ${field}, this programme provides ${funding} alongside access to a global network of scholars, professionals, and alumni.${orgMention} The application deadline is ${deadline}. What makes this opportunity stand out is its combination of financial support and structured development: participants do not just receive funding, they gain mentorship, training, and long-term career connections. If you meet the eligibility criteria, we recommend preparing your application at least six to eight weeks in advance. OpportunityNest monitors this listing for updates to deadlines and requirements.`,
      // Variant 4: Comparative context
      `Among the many ${type}s available to ${level} candidates in ${field}, the ${keyword} is notable for its scope, funding, and institutional backing. Hosted in ${country}, the programme offers ${funding} and attracts applicants from diverse academic and professional backgrounds.${orgMention} The selection process is competitive, but well-prepared candidates with a clear motivation letter and strong references have a realistic chance of success. The deadline is ${deadline}. Before applying, confirm that you meet all eligibility requirements â€” nationality restrictions, degree level, and field-specific criteria can vary. OpportunityNest provides this summary to help you decide whether to invest time in your application, and links directly to the official programme page for submission.`,
      // Variant 5: Action-oriented
      `The ${keyword} is currently accepting applications from ${level} candidates interested in ${field}. This ${type}, based in ${country}, provides ${funding} and is designed for individuals who want to combine academic rigour with real-world impact.${orgMention} The deadline is ${deadline}, and all applications go through the official programme website â€” OpportunityNest does not process applications but keeps this listing current so you can apply with confidence. Successful participants typically describe the experience as a turning point: the funding removes financial barriers, while the programme structure â€” including mentorship, workshops, and peer collaboration â€” builds skills that last well beyond the programme itself. If this matches your goals, start preparing your documents now.`
    ];

    return ON.fitWordCount(ON.pickVariant(introVariants, item), 120, 180);
  };

  // SEO: Generate an H2 heading that contains a natural variation of the primary keyword.
  ON.generateDetailH2 = (item) => {
    const override = ON.getSEOOverride(item);
    const keyword = ON.getPrimaryKeyword(item);
    if (override) return override.h2(keyword);
    const variations = [
      `${keyword} Benefits and Eligibility`,
      `Why Apply for the ${keyword}`,
      `${keyword} Application Essentials`,
      `What to Know About the ${keyword}`,
      `${keyword} Funding and Timeline`
    ];
    const index = Math.abs((item.title || "").length) % variations.length;
    return variations[index];
  };

  // SEO: Generate three FAQ items using natural keyword variations.
  ON.generateDetailFAQs = (item) => {
    const override = ON.getSEOOverride(item);
    const keyword = ON.getPrimaryKeyword(item);
    if (override) return override.faqs(keyword);
    const type = (item.type || "opportunity").toLowerCase();
    const keywordLower = keyword.toLowerCase();
    const typeFragment = keywordLower.includes(type) ? "" : ` ${type}`;
    const country = item.country || "the host country";
    const level = item.level || "eligible";
    const field = item.field || "various fields";
    const funding = item.funding || "financial support";
    const deadline = ON.formatDeadline(item);
    const isFullyFunded = /fully\s*fund/i.test(funding);

    const eligibilityAnswers = [
      `The ${keyword}${typeFragment} is open to ${level} applicants with an interest in ${field}. Eligibility typically depends on your nationality, academic background, and the specific requirements set by the programme. Review the official criteria carefully â€” some programmes restrict by country of origin, age, or degree field, while others are open to all nationalities and disciplines.`,
      `Eligibility for the ${keyword}${typeFragment} depends on several factors: your nationality, current education level, and field of study. The programme welcomes ${level} candidates in ${field}, but specific restrictions may apply. Always check the official eligibility page before investing time in an application.`,
      `The ${keyword}${typeFragment} accepts applications from ${level} candidates working in ${field}. Nationality requirements vary â€” some programmes are open globally, while others target specific regions or countries. Read the full criteria on the official website to confirm you qualify.`
    ];
    const eligibilityAnswer = ON.pickVariant(eligibilityAnswers, { title: (item.title || "") + "_faq1" });

    const fundingAnswers = isFullyFunded ? [
      `Yes, the ${keyword}${typeFragment} is fully funded. This typically covers tuition fees, a living stipend, health insurance, and travel costs. The exact components may vary by year and recipient, so check the official programme page for the current funding breakdown.`,
      `The ${keyword}${typeFragment} provides full funding that covers tuition, living expenses, health insurance, and international travel. The specific amounts and payment schedule are published on the official website and may be adjusted each cycle.`,
      `Yes, this is a fully funded programme. Selected participants receive a comprehensive package including tuition waivers, a monthly stipend, and travel support. Funding details can change between years, so verify the current structure on the official page.`
    ] : [
      `The ${keyword}${typeFragment} provides ${funding}. The specific financial support depends on the programme structure â€” some cover tuition only, while others include living allowances, travel grants, or research funding. Check the official listing for the full details of what is included.`,
      `Funding for the ${keyword}${typeFragment} is ${funding}. The exact amount and coverage depend on the programme and your status. Review the funding section on the official website for a detailed breakdown of what is included.`,
      `The ${keyword}${typeFragment} offers ${funding}. What this covers varies â€” it may include partial tuition, a monthly stipend, or a one-time grant. Confirm the details on the official programme page before applying.`
    ];
    const fundingAnswer = ON.pickVariant(fundingAnswers, { title: (item.title || "") + "_faq2" });

    const applyAnswers = [
      `You can apply through the official programme website. The deadline is ${deadline}. Before applying, confirm your eligibility, prepare your motivation letter and CV, and arrange your references early. Most successful applicants start preparing at least 6â€“8 weeks before the deadline.`,
      `Applications are submitted via the official programme portal. The deadline is ${deadline}. Start by checking your eligibility, then gather your documents â€” transcripts, references, and motivation letter â€” well in advance. Early preparation gives you time to refine each component.`,
      `To apply, visit the official programme website and follow the application instructions. The closing date is ${deadline}. Give yourself at least six weeks to prepare: draft your motivation letter, request references, and collect your academic documents before the final submission.`
    ];
    const applyAnswer = ON.pickVariant(applyAnswers, { title: (item.title || "") + "_faq3" });

    const competitivenessAnswers = [
      `The ${keyword}${typeFragment} is competitive, as it attracts strong applicants from ${country} and internationally. To strengthen your application, focus on demonstrating clear goals, relevant experience in ${field}, and a well-prepared motivation letter that explains why this specific programme is the right fit for you.`,
      `Competition for the ${keyword}${typeFragment} is significant â€” it draws applications from ${country} and beyond. What separates successful candidates is specificity: a motivation letter that names the programme's unique features, connects them to your background, and shows a realistic plan for what comes next.`,
      `This ${type} receives strong applications from ${country} and around the world. To stand out, invest time in your motivation letter, secure references from people who know your work well, and demonstrate a clear connection between your experience in ${field} and the programme's objectives.`
    ];
    const competitivenessAnswer = ON.pickVariant(competitivenessAnswers, { title: (item.title || "") + "_faq4" });

    const afterAnswers = [
      `After selection, recipients typically receive an official offer letter with programme details, start dates, and any pre-arrival requirements such as visa applications, accommodation arrangements, or orientation materials. The programme team will guide you through the next steps.`,
      `Once selected, you will receive a formal acceptance with details about start dates, pre-arrival requirements, and any documentation you need to prepare â€” such as visa applications, health checks, or housing forms. The programme coordinators will walk you through each step.`,
      `After a successful application, the programme team contacts you with an offer letter outlining your start date, funding details, and any pre-departure steps. This typically includes visa applications, accommodation arrangements, and an orientation schedule.`
    ];
    const afterAnswer = ON.pickVariant(afterAnswers, { title: (item.title || "") + "_faq5" });

    // Select 4 most useful FAQs â€” vary which one is dropped based on the item
    const allFaqs = [
      { question: `Who is eligible for the ${keyword}?`, answer: eligibilityAnswer },
      { question: `What does the ${keyword} cover financially?`, answer: fundingAnswer },
      { question: `How do I apply for the ${keyword}?`, answer: applyAnswer },
      { question: `How competitive is this ${type}?`, answer: competitivenessAnswer },
      { question: `What happens after I am selected?`, answer: afterAnswer }
    ];

    // Drop a different FAQ based on the item's title hash so pages vary
    const dropIndex = Math.abs(ON.pickVariant([0, 1, 2, 3, 4], item)) % allFaqs.length;
    const selectedFaqs = allFaqs.filter((_, i) => i !== dropIndex);

    return selectedFaqs;
  };

  // SEO: Generate structured data for opportunity
  ON.generateStructuredData = (item, pageUrl) => {
    const schemaType = item.type === "Scholarship" ? "Scholarship" : 
                       item.type === "Fellowship" ? "Fellowship" : 
                       item.type === "Internship" ? "Internship" : 
                       "EducationalOccupationalCredential";
    
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": schemaType,
      "name": item.title,
      "description": item.description,
      "url": pageUrl,
      "provider": {
        "@type": "Organization",
        "name": item.country
      },
      "location": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": item.country
        }
      }
    };

    if (item.deadline) {
      baseSchema.validThrough = item.deadline;
    }

    if (item.level) {
      baseSchema.educationalLevel = item.level;
    }

    if (item.funding) {
      baseSchema.funding = item.funding;
    }

    return baseSchema;
  };

  // SEO: Generate breadcrumb schema
  ON.generateBreadcrumbSchema = (breadcrumbs) => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
  };

  // SEO: Generate FAQPage schema for the detail page
  ON.generateFAQSchema = (item) => {
    const faqs = ON.generateDetailFAQs(item);
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  };

  // SEO: Generate optimized image alt text using the primary keyword.
  ON.generateImageAlt = (item) => {
    const override = ON.getSEOOverride(item);
    const keyword = ON.getPrimaryKeyword(item);
    if (override) return override.imageAlt(keyword);
    return `${keyword} official program banner`;
  };

  // Generate dynamic "Who Should Apply" section based on opportunity attributes
  ON.generateWhoShouldApply = (item) => {
    const type = (item.type || "opportunity").toLowerCase();
    const level = item.level || "";
    const country = item.country || "Global";
    const field = item.field || "various fields";
    const funding = item.funding || "";
    const isFullyFunded = /fully\s*fund/i.test(funding);

    const levelVariants = {
      phd: [
        `This ${type} is ideal for researchers and doctoral candidates who have completed a master's degree and want to pursue original research in ${field}.`,
        `Doctoral candidates and early-career researchers working in ${field} will find this programme especially well-suited to their goals.`,
        `If you are a PhD candidate with a strong research background in ${field}, this programme offers the time, resources, and mentorship to complete a significant contribution to the field.`,
        `Designed for doctoral-level researchers, this ${type} supports scholars who are ready to undertake ambitious, original work in ${field}.`,
        `This opportunity targets PhD candidates who have a clear research plan in ${field} and want institutional support to carry it out at a high level.`
      ],
      master: [
        `This ${type} suits graduates who want to deepen their expertise in ${field} through advanced study at the master's level.`,
        `Master's graduates looking to specialise further in ${field} will find this programme a strong fit for their academic and career goals.`,
        `If you hold a bachelor's degree and want to build advanced knowledge in ${field}, this ${type} provides the structure and funding to do so.`,
        `This programme is designed for early-career graduates who see ${field} as central to their professional development and want rigorous training at the master's level.`,
        `Recent graduates with a passion for ${field} are the primary audience â€” this ${type} gives you the academic foundation and credentials to advance.`
      ],
      undergrad: [
        `This ${type} is designed for undergraduate students in ${field} who want to gain academic and professional experience early in their careers.`,
        `If you are currently studying at the undergraduate level in ${field}, this programme offers a valuable opportunity to build skills and connections before graduation.`,
        `Undergraduates in ${field} who are looking for hands-on experience, mentorship, and a competitive edge on their CV should consider this opportunity.`,
        `This ${type} welcomes bachelor's students who want to test their interest in ${field} through a structured, supported programme.`,
        `Students in the early years of their undergraduate degree in ${field} can benefit from the exposure and experience this programme provides.`
      ],
      postdoc: [
        `This ${type} targets postdoctoral scholars and early-career academics seeking dedicated research time in ${field}.`,
        `Postdoctoral researchers in ${field} who need protected time and institutional resources will find this programme well-aligned with their career stage.`,
        `If you have recently completed your PhD and are building your research profile in ${field}, this fellowship provides the space and support to publish, network, and develop your ideas.`,
        `This opportunity is aimed at postdoctoral scholars who want to deepen their expertise in ${field} while contributing to an active research community.`,
        `Early-career academics in ${field} who are transitioning from doctoral study to independent research are the ideal candidates for this ${type}.`
      ],
      general: [
        `This ${type} is open to motivated individuals with a strong interest in ${field}.`,
        `Anyone with a genuine commitment to ${field} and a clear sense of what they want to gain from this experience should consider applying.`,
        `This programme welcomes applicants from diverse backgrounds who share a common interest in ${field} and a drive to make the most of the opportunity.`,
        `Whether you are a student, early-career professional, or career-changer, this ${type} is relevant if ${field} is central to your goals.`,
        `The programme is open to a broad range of applicants â€” what matters most is a clear motivation and a realistic plan for how you will use the experience.`
      ]
    };

    const levelKey = level.match(/PhD|Doctoral/i) ? "phd" : level.match(/Master/i) ? "master" : level.match(/Undergraduate|Bachelor/i) ? "undergrad" : level.match(/Postdoc/i) ? "postdoc" : "general";
    const parts = [ON.pickVariant(levelVariants[levelKey], item)];

    const fundingVariants = [
      `Because this programme is fully funded, it is especially valuable for candidates who need financial support to study or work in ${country} â€” including those from low- and middle-income backgrounds.`,
      `Full funding means you can focus entirely on the programme without worrying about tuition, living costs, or travel â€” a significant advantage for international participants.`,
      `The fully funded nature of this ${type} removes the financial barriers that often prevent talented candidates from applying to programmes in ${country}.`,
      `With full funding covering tuition, living expenses, and travel, this opportunity is accessible to candidates regardless of their personal financial situation.`,
      `Fully funded programmes like this one are rare and competitive â€” if you qualify, the financial support allows you to commit fully to your studies or research in ${country}.`
    ];

    const intlVariants = [
      `If you are an international applicant considering ${country}, this programme offers a structured entry point with institutional support.`,
      `International candidates looking at ${country} should note that this programme is designed to accommodate participants from diverse national and educational backgrounds.`,
      `For applicants from outside ${country}, this ${type} provides the kind of institutional framework that makes an international transition manageable.`,
      `If you are applying from abroad, this programme has a track record of supporting international participants through arrival, orientation, and integration.`,
      `${country} is an increasingly popular destination for international students and professionals â€” this programme makes the process easier with dedicated support structures.`
    ];

    if (isFullyFunded) { parts.push(ON.pickVariant(fundingVariants, { title: (item.title || "") + "_fund" })); }
    if (country !== "Global" && country !== "Not specified") { parts.push(ON.pickVariant(intlVariants, { title: (item.title || "") + "_intl" })); }

    return parts.join(" ");
  };

  // Generate dynamic "Funding Explained" section
  ON.generateFundingExplained = (item) => {
    const funding = item.funding || "";
    const type = (item.type || "opportunity").toLowerCase();

    if (/fully\s*fund/i.test(funding)) {
      const variants = [
        `This ${type} covers the full cost of participation. For most recipients, this means tuition fees, a living stipend, health insurance, and travel costs are all included. The exact breakdown varies by programme â€” some cover accommodation directly, while others provide a monthly allowance that you manage yourself. Check the official programme page for the specific funding components, as they differ between recipients and may change from year to year.`,
        `Recipients of this fully funded ${type} do not pay tuition and receive a living stipend that covers accommodation, food, and day-to-day expenses in the host country. Health insurance and round-trip travel are typically included as well. The specific amounts and payment schedules are published on the official programme website and may be adjusted annually.`,
        `Full funding means the programme takes care of the major costs: tuition, a monthly stipend, health coverage, and international travel. You will not need to find separate housing funding or worry about insurance premiums. The exact stipend amount depends on the host city and cost of living, so review the funding breakdown on the official page.`,
        `This programme removes the financial barrier entirely. Selected participants receive a comprehensive package that includes tuition waivers, a monthly living allowance, health insurance, and a travel grant. Some programmes also provide settling-in allowances, book grants, or conference attendance funding. The official listing has the most current details on what is covered.`,
        `As a fully funded opportunity, this ${type} provides everything you need to focus on your work: no tuition fees, a regular stipend for living costs, comprehensive health insurance, and travel support. Additional benefits â€” such as research budgets, family allowances, or conference funding â€” may also be available depending on the programme. Always check the official source for the latest funding structure.`
      ];
      return ON.pickVariant(variants, item);
    }
    if (/partial/i.test(funding)) {
      const variants = [
        `This ${type} provides partial funding toward your costs. Depending on the programme, this may cover a percentage of tuition fees, a one-time grant, or a monthly contribution toward living expenses. You will likely need to secure additional funding for the remaining costs through personal savings, other scholarships, or university financial aid.`,
        `Partial funding means the programme contributes to â€” but does not fully cover â€” your expenses. Common structures include a tuition discount, a fixed-term stipend, or a one-off relocation grant. Plan ahead by identifying other funding sources to bridge the gap.`,
        `The financial support for this ${type} covers part of the overall cost. Some recipients use it to offset tuition while covering living expenses themselves; others combine it with external scholarships or part-time work where permitted. The official website lists the exact funding components and amounts.`,
        `This programme offers a meaningful but incomplete funding package. You can expect support for certain costs â€” often tuition or a monthly stipend â€” but should budget for expenses that fall outside the award. Many recipients successfully combine this with university bursaries, government loans, or crowdfunding.`,
        `Partial funding provides a financial foundation but requires you to plan for the rest. The programme typically covers one or two major cost categories â€” check the official listing to understand exactly which expenses are included and which you will need to fund independently.`
      ];
      return ON.pickVariant(variants, item);
    }
    if (/unpaid|volunteer/i.test(funding)) {
      const variants = [
        `This ${type} does not include a salary or stipend. However, unpaid positions at international organisations often provide other benefits: professional networking, mentorship, hands-on experience, and a strong credential for your CV. Some host organisations may offer travel reimbursements or help with visa costs â€” check the official listing for details.`,
        `While this opportunity is unpaid, the professional value can be substantial. Participants gain direct experience at a recognised organisation, build an international network, and develop skills that are difficult to acquire elsewhere. Some programmes assist with accommodation or visa costs even when they do not provide a salary.`,
        `This is an unpaid position, but the non-financial returns are significant: mentorship, real-world project experience, and a credential that opens doors in your field. Check whether the host organisation offers any logistical support such as housing assistance, travel reimbursement, or a certificate of completion.`,
        `No stipend or salary is provided for this ${type}. That said, many participants find the experience worthwhile for the professional connections, skill development, and career clarity it delivers. Some hosts may cover specific costs like local transport or provide a shared workspace.`,
        `This unpaid opportunity is best suited for those who can self-fund or have external support. The value lies in the experience itself: working alongside professionals, building your portfolio, and gaining a recognised name on your CV. Review the official listing for any ancillary support the host may offer.`
      ];
      return ON.pickVariant(variants, item);
    }
    if (/stipend|monthly/i.test(funding)) {
      const variants = [
        `Recipients of this ${type} receive a regular stipend to cover living expenses during the programme. The amount is designed to cover basic costs such as accommodation, food, and local transport in the host country. Additional benefits like health insurance, travel allowances, or research grants may also be included depending on the programme structure.`,
        `A monthly stipend is provided to help you cover day-to-day living costs while you participate in this programme. The exact amount varies by host location and is calibrated to local cost-of-living estimates. Some programmes also include health insurance or a separate travel budget on top of the stipend.`,
        `This programme pays a periodic stipend rather than a salary. It is intended to cover essentials â€” rent, meals, transport â€” during your time on the programme. Depending on the host city, the stipend may be modest, so budgeting carefully is advisable. Check the official page for the current rate and any supplementary benefits.`,
        `The stipend for this ${type} is structured to support participants through the programme duration without financial distraction. It covers basic living costs in the host country. Additional support â€” such as health coverage, research funds, or conference travel â€” may be available depending on the specific programme terms.`,
        `Participants receive a monthly living allowance that covers accommodation, food, and local transport. The stipend amount is set annually and may be adjusted based on the host city. Review the official funding details to understand exactly what is included and whether additional costs need separate planning.`
      ];
      return ON.pickVariant(variants, item);
    }
    const fallbackVariants = [
      `Funding for this ${type} varies by recipient and year. The official programme website provides the most current details on what is covered, payment schedules, and any conditions attached to the financial support. Review the funding section carefully before applying so you understand exactly what is included.`,
      `The financial structure of this ${type} depends on several factors including your status, the host institution, and the programme year. Visit the official website for the latest funding information and do not rely on summaries from previous years, as amounts and conditions can change.`,
      `Funding details for this programme are published on the official website and may differ depending on your eligibility category. Before investing time in an application, confirm what financial support is available and whether it meets your needs.`,
      `The programme's funding model is described on the official page. It may include tuition support, a living allowance, or other benefits depending on your level and status. Always check the most recent information rather than assumptions from past cycles.`,
      `This ${type} offers financial support, but the specifics depend on the programme year and your circumstances. The official website is the authoritative source for current funding details â€” review it carefully before applying.`
    ];
    return ON.pickVariant(fallbackVariants, item);
  };

  // Generate dynamic "Selection Process" section
  ON.generateSelectionProcess = (item) => {
    const type = (item.type || "opportunity").toLowerCase();
    const level = item.level || "";

    const processSets = {
      research: [
        ["Research proposal evaluation â€” your topic, methodology, and expected outcomes are assessed for originality and feasibility", "Academic references (typically two or three) from professors or supervisors who can speak to your research ability", "Interview with the selection committee (often by video call for international candidates)"],
        ["Review of your research proposal and academic record", "Assessment of your publications, conference presentations, or prior research output", "Panel interview to discuss your research interests and fit with the programme"],
        ["Initial screening of your academic CV and research proposal", "Evaluation of your references and any supporting materials", "In-depth interview where you present your research plan and answer committee questions"]
      ],
      master: [
        ["Academic transcript review â€” your grades, institution, and degree classification are assessed", "Motivation letter or statement of purpose explaining your goals and fit with the programme", "At least one reference from a professor or academic supervisor", "Interview (in person or online) to discuss your background and ambitions"],
        ["Evaluation of your academic record and degree relevance", "Review of your personal statement and any essays or writing samples", "Reference checks with your academic referees", "Selection interview â€” some programmes include a group activity or presentation"],
        ["Academic merit screening based on your transcripts and degree classification", "Assessment of your motivation letter, CV, and extracurricular involvement", "Reference verification from your academic supervisors", "Final interview round, which may include a short presentation or case study"]
      ],
      internship: [
        ["CV and cover letter screening â€” recruiters look for relevant coursework, projects, and motivation", "Competency-based interview (often two rounds) focusing on problem-solving and teamwork", "Possible written test or case study relevant to the role"],
        ["Application review focusing on your academic background and any relevant experience", "Behavioural interview assessing your communication skills and adaptability", "Technical assessment or task depending on the department"],
        ["Initial screening of your resume and cover letter", "Structured interview with one or two rounds", "Practical exercise or written assignment to test your skills in the role area"]
      ],
      competition: [
        ["Written submission or project proposal outlining your idea, approach, or solution", "Jury review and shortlisting based on innovation, feasibility, and impact", "Final presentation or pitch (for finalists) in front of a panel of judges"],
        ["Submission of your entry according to the competition brief and format requirements", "Expert review by a judging panel that scores entries against published criteria", "Shortlist announcement and final round â€” often involving a live presentation or demo"],
        ["Open call for entries with a detailed proposal or portfolio submission", "Multi-stage judging process with scores from independent experts", "Finalist stage including a presentation, interview, or public showcase of your work"]
      ],
      general: [
        ["Application form and supporting documents review â€” your CV, transcripts, and motivation letter are assessed", "Motivation letter assessment focusing on your goals, fit, and what you bring to the programme", "Interview with the selection panel to discuss your application in more depth"],
        ["Initial eligibility check and document verification", "Qualitative review of your personal statement and references", "Selection interview â€” in person or virtual â€” to assess your motivation and suitability"],
        ["Screening of your application against the published criteria", "Evaluation of your experience, references, and written statements", "Final interview or assessment day where you meet the selection committee"]
      ]
    };

    let setKey;
    if (level.match(/PhD|Doctoral|Postdoc|Research/i)) { setKey = "research"; }
    else if (level.match(/Master/i)) { setKey = "master"; }
    else if (type === "internship") { setKey = "internship"; }
    else if (type === "competition") { setKey = "competition"; }
    else { setKey = "general"; }

    const processes = ON.pickVariant(processSets[setKey], item);
    const listHtml = processes.map((p, i) => `<li><strong>Stage ${i + 1}:</strong> ${ON.escapeHtml(p)}</li>`).join("");

    const introVariants = [
      `While the exact process depends on the programme, competitive ${type}s at this level typically involve the following stages:`,
      `Most programmes of this type use a multi-stage selection process. Here is what you can generally expect:`,
      `The selection process for this ${type} usually follows a structured sequence designed to assess both your qualifications and your fit:`,
      `Successful candidates typically progress through several evaluation stages. Here is an overview of what the process involves:`,
      `Selection for this ${type} is competitive and multi-layered. The typical stages include:`
    ];

    const outroVariants = [
      `Start preparing for each stage well before the deadline. For interviews, practise articulating your goals and how this ${type} fits your trajectory.`,
      `Begin your preparation early. If there is an interview stage, rehearse explaining your motivation clearly and connecting your background to the programme's objectives.`,
      `Do not wait until the shortlist stage to think about interviews. Prepare your narrative now: why this programme, what you bring, and where you want to go next.`,
      `Each stage is designed to filter for commitment and fit. Treat every component â€” from the application form to the interview â€” as an opportunity to demonstrate your seriousness.`,
      `Preparation is the difference between a strong and a weak application. Start with the documents, move to the interview, and make sure every stage tells a consistent story about your goals.`
    ];

    return `<p>${ON.pickVariant(introVariants, item)}</p><ol>${listHtml}</ol><p>${ON.pickVariant(outroVariants, { title: (item.title || "") + "_outro" })}</p>`;
  };

  // SEO: Render "Continue Exploring" section with rich internal links
  ON.renderDetailExploreSection = (item, country, typeLabel, level, field) => {
    const countrySlug = ON.getCountrySlug(country);
    const countryLink = countrySlug ? `<a href="/country/${countrySlug}/">${ON.escapeHtml(country)}</a>` : "";
    const categoryLinks = {
      scholarship: '<a href="/scholarships.html">scholarships</a>',
      internship: '<a href="/internships.html">internships</a>',
      fellowship: '<a href="/fellowships.html">fellowships</a>'
    };
    const catLink = categoryLinks[typeLabel] || '<a href="/#opportunities">opportunities</a>';

    // Build country-specific links
    const countryGuides = [];
    if (countrySlug && country !== "Global" && country !== "Not specified") {
      countryGuides.push(`<a href="/country/${countrySlug}/">Studying in ${ON.escapeHtml(country)}: universities, fees &amp; visas</a>`);
    }
    // Always suggest top destinations
    const topDestinations = [
      { slug: "united-kingdom", name: "United Kingdom" },
      { slug: "germany", name: "Germany" },
      { slug: "united-states", name: "United States" },
      { slug: "canada", name: "Canada" },
      { slug: "australia", name: "Australia" }
    ];
    const otherDestinations = topDestinations
      .filter(d => d.name !== country)
      .slice(0, 3)
      .map(d => `<a href="/country/${d.slug}/">${d.name}</a>`);

    // Build category-specific links
    const categoryPages = [
      { url: "/fully-funded-scholarships/", label: "Fully funded scholarships" },
      { url: "/masters-scholarships/", label: "Master's scholarships" },
      { url: "/phd-scholarships/", label: "PhD scholarships" },
      { url: "/undergraduate-scholarships/", label: "Undergraduate scholarships" }
    ];
    const relevantCategoryPages = categoryPages.slice(0, 3);

    return `
      <section class="detail-section" aria-labelledby="explore-heading">
        <h2 id="explore-heading">Continue Exploring</h2>
        <p>Looking for more options? Here are related pages to help you find the right programme:</p>
        <div class="explore-links">
          <div class="explore-group">
            <h3>Same Country &amp; Region</h3>
            <ul>
              ${countryLink ? `<li>${countryLink} â€” all programmes in ${ON.escapeHtml(country)}</li>` : ""}
              <li>Explore opportunities in ${otherDestinations.join(", ")}</li>
            </ul>
          </div>
          <div class="explore-group">
            <h3>Same Category</h3>
            <ul>
              <li>Browse all ${catLink} on OpportunityNest</li>
              ${relevantCategoryPages.map(p => `<li><a href="${p.url}">${p.label}</a></li>`).join("")}
            </ul>
          </div>
          <div class="explore-group">
            <h3>Popular Destinations</h3>
            <ul>
              <li><a href="/scholarships/united-kingdom/">Scholarships in the UK</a> â€” Chevening, Gates Cambridge, Rhodes &amp; more</li>
              <li><a href="/scholarships/germany/">Scholarships in Germany</a> â€” DAAD, Deutschlandstipendium &amp; more</li>
              <li><a href="/internships.html">International internships</a> â€” UN, CERN, Google &amp; more</li>
            </ul>
          </div>
        </div>
      </section>
    `;
  };

  // Helper: get country slug from country name
  ON.getCountrySlug = (country) => {
    const map = {
      "Australia": "australia", "Austria": "austria", "Canada": "canada",
      "China": "china", "Germany": "germany", "India": "india",
      "Ireland": "ireland", "Japan": "japan", "Netherlands": "netherlands",
      "Singapore": "singapore", "South Africa": "south-africa",
      "South Korea": "south-korea", "Switzerland": "switzerland",
      "Thailand": "thailand", "United Kingdom": "united-kingdom",
      "United States": "united-states", "Global": "global"
    };
    return map[country] || null;
  };

  // SEO: Render enhanced detail content with structured sections
  ON.renderDetailContent = (item, urgencyClass, categoryPage, categoryType) => {
    const country = item.country || "Global";
    const level = item.level || "All levels";
    const field = item.field || item.internship_type || "Multiple fields";
    const funding = item.funding || "See official listing";
    const deadline = ON.formatDeadline(item);
    const organization = item.organization || "";
    const intro = ON.generateDetailIntro(item);
    const h1 = ON.generateDetailH1(item);
    const keywordH2 = ON.generateDetailH2(item);
    const faqs = ON.generateDetailFAQs(item);
    const imageAlt = ON.generateImageAlt(item);
    const typeLabel = (item.type || categoryType).toLowerCase();
    const whoApply = ON.generateWhoShouldApply(item);
    const fundingExplained = ON.generateFundingExplained(item);
    const selectionProcess = ON.generateSelectionProcess(item);
    const logoHtml = item.logo_url
      ? `<img class="detail-logo" src="${ON.escapeHtml(item.logo_url)}" alt="${ON.escapeHtml(imageAlt)}" loading="lazy" width="120" height="120">`
      : "";
    const faqHtml = faqs.map((faq) => `
      <details class="faq-item">
        <summary>${ON.escapeHtml(faq.question)}</summary>
        <p>${ON.escapeHtml(faq.answer)}</p>
      </details>
    `).join("");
    const isExpired = urgencyClass.includes("deadline-expired");
    const expiredBanner = isExpired
      ? '<div class="expired-notice" role="alert"><strong>This opportunity has expired.</strong> The deadline has passed. Please check the official website for updated dates or future intakes.</div>'
      : "";

    // Dynamic document list based on type/level
    const docs = [];
    docs.push("<li><strong>Valid passport or national ID</strong> â€” must remain valid for the full programme duration</li>");
    docs.push("<li><strong>Curriculum Vitae (CV)</strong> â€” highlight academic, professional, and volunteer experience relevant to this programme</li>");
    docs.push("<li><strong>Academic transcripts</strong> â€” from all post-secondary institutions attended</li>");
    docs.push("<li><strong>Motivation letter or statement of purpose</strong> â€” explain why this specific programme, how it aligns with your goals, and what you bring</li>");
    if (level.match(/PhD|Doctoral|Postdoc|Research|Master/i) || typeLabel === "fellowship") {
      docs.push("<li><strong>Research proposal</strong> â€” required for research-focused programmes; outline your topic, methodology, and expected outcomes</li>");
    }
    docs.push("<li><strong>Letters of recommendation</strong> â€” typically two or three; give your recommenders at least 3â€“4 weeks' notice</li>");
    if (country !== "Global" && country !== "Not specified") {
      docs.push("<li><strong>Proof of language proficiency</strong> â€” TOEFL, IELTS, or equivalent if the programme is not in your native language</li>");
    }
    if (typeLabel === "internship") {
      docs.push("<li><strong>Portfolio or work samples</strong> â€” if applicable to your field (design, writing, engineering, etc.)</li>");
    }
    const docsHtml = docs.join("");

    // Dynamic mistakes based on type
    const mistakes = [];
    mistakes.push("<li><strong>Submitting too close to the deadline</strong> â€” technical issues and time-zone differences cause last-minute failures. Aim to submit at least 48 hours early.</li>");
    if (typeLabel === "scholarship" || typeLabel === "fellowship") {
      mistakes.push("<li><strong>Writing a generic motivation letter</strong> â€” selection committees read hundreds of applications. Mention the specific programme by name, reference its unique features, and connect them to your background.</li>");
      mistakes.push("<li><strong>Not addressing the selection criteria</strong> â€” most programmes list what they evaluate. Structure your letter and CV to address each criterion directly.</li>");
    }
    if (typeLabel === "internship") {
      mistakes.push("<li><strong>Applying without researching the organisation</strong> â€” interviewers expect you to understand their mission, recent projects, and how your skills contribute.</li>");
    }
    mistakes.push("<li><strong>Ignoring eligibility requirements</strong> â€” nationality, age, degree level, and field restrictions are non-negotiable. Verify before investing time.</li>");
    mistakes.push("<li><strong>Asking for references at the last minute</strong> â€” give recommenders 3â€“4 weeks and share your CV and motivation letter so they write specific, strong references.</li>");
    const mistakesHtml = mistakes.join("");

    // Variant section headings so each page feels distinct
    const docsHeadingVariants = ["Documents You Will Likely Need", "Application Checklist", "Required Documents and Materials", "What You Need to Prepare", "Documents and Requirements"];
    const docsHeading = ON.pickVariant(docsHeadingVariants, item);
    const docsIntroVariants = [
      "Prepare these documents before starting your application. Requirements vary by programme, so always check the official website for the exact list.",
      "Gather these materials early. Having everything ready before you start writing gives you a significant advantage.",
      "Most programmes require a similar set of documents. Start collecting them now so you are not scrambling near the deadline.",
      "This is a practical checklist of what you will likely need. Confirm the exact requirements on the official programme page.",
      "Before you begin the application, make sure you have these documents prepared and up to date."
    ];
    const docsIntro = ON.pickVariant(docsIntroVariants, item);

    const mistakesHeadingVariants = ["Common Mistakes to Avoid", "Application Pitfalls Worth Avoiding", "Where Applicants Go Wrong", "Errors That Cost Candidates Their Chance", "Mistakes That Eliminate Strong Applications"];
    const mistakesHeading = ON.pickVariant(mistakesHeadingVariants, item);
    const mistakesIntroVariants = [
      `Competitive ${ON.escapeHtml(typeLabel)}s attract strong candidates. These mistakes are easy to avoid but frequently cost applicants their chance:`,
      `Even well-qualified candidates lose out when they make these preventable errors. Review each one before submitting:`,
      `The difference between a successful and unsuccessful application often comes down to avoiding these common traps:`,
      `Selection committees see these mistakes repeatedly. Avoiding them puts you ahead of many applicants:`,
      `Do not let a careless error undermine a strong application. Check each of these before you submit:`
    ];
    const mistakesIntro = ON.pickVariant(mistakesIntroVariants, item);

    const timelineHeadingVariants = ["Application Timeline", "When to Start Preparing", "Suggested Preparation Schedule", "Your Countdown to Submission", "Planning Your Application"];
    const timelineHeading = ON.pickVariant(timelineHeadingVariants, item);
    const timelineIntroVariants = [
      `The deadline for this ${ON.escapeHtml(typeLabel)} is <strong>${ON.escapeHtml(deadline)}</strong>. Here is a suggested preparation timeline:`,
      `With the deadline of <strong>${ON.escapeHtml(deadline)}</strong> approaching, here is a week-by-week guide to stay on track:`,
      `This ${ON.escapeHtml(typeLabel)} closes on <strong>${ON.escapeHtml(deadline)}</strong>. Use this timeline to pace your preparation:`,
      `Mark <strong>${ON.escapeHtml(deadline)}</strong> on your calendar. Then work backwards using this schedule:`,
      `The closing date is <strong>${ON.escapeHtml(deadline)}</strong>. Here is how to structure your preparation so nothing is left to the last minute:`
    ];
    const timelineIntro = ON.pickVariant(timelineIntroVariants, item);

    const applyHeadingVariants = ["How to Apply", "Application Process", "Next Steps", "Where and How to Submit", "Submitting Your Application"];
    const applyHeading = ON.pickVariant(applyHeadingVariants, item);
    const applyIntroVariants = [
      "Applications are submitted through the official programme website. Review all eligibility requirements, prepare your documents, and submit well before the deadline.",
      "To apply, visit the official programme portal. Confirm your eligibility, gather your documents, and submit your application before the closing date.",
      "All applications go through the official programme website. Start by reading the full eligibility criteria, then prepare your materials and submit early.",
      "The application is hosted on the official programme page. Review the requirements, prepare your documents, and aim to submit at least a few days before the deadline.",
      "Visit the official programme website to begin your application. Check the eligibility criteria, prepare your supporting documents, and submit well in advance of the deadline."
    ];
    const applyIntro = ON.pickVariant(applyIntroVariants, item);

    // Variant headings for remaining sections
    const whoHeadingVariants = ["Who Should Apply", "Ideal Candidates for This Programme", "Who This Opportunity Is For", "Eligibility and Target Audience", "Is This Programme Right for You?"];
    const whoHeading = ON.pickVariant(whoHeadingVariants, item);
    const fundingHeadingVariants = ["Funding Explained", "What the Funding Covers", "Financial Support Details", "Understanding the Funding Package", "Scholarship and Funding Breakdown"];
    const fundingHeading = ON.pickVariant(fundingHeadingVariants, item);
    const selectionHeadingVariants = ["What the Selection Process Typically Involves", "How Candidates Are Selected", "Selection Criteria and Stages", "The Evaluation Process", "What to Expect During Selection"];
    const selectionHeading = ON.pickVariant(selectionHeadingVariants, item);
    const faqHeadingVariants = ["Frequently Asked Questions", "Common Questions Answered", "Your Questions About This Programme", "Key Questions and Answers", "Answers to Popular Questions"];
    const faqHeading = ON.pickVariant(faqHeadingVariants, item);
    const detailsHeadingVariants = ["Program Details at a Glance", "Key Information", "Opportunity Overview", "Quick Facts and Details", "Essential Programme Information"];
    const detailsHeading = ON.pickVariant(detailsHeadingVariants, item);

    return `
      <nav class="breadcrumbs" aria-label="Breadcrumb navigation">
        <a href="/">Home</a>
        <span aria-hidden="true">/</span>
        <a href="${categoryPage}">${ON.escapeHtml(item.type || categoryType)}s</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">${ON.escapeHtml(item.title)}</span>
      </nav>

      ${expiredBanner}

      <div class="detail-header">
        <div class="detail-badges">
          <span class="badge badge-type">${ON.escapeHtml(item.type || categoryType)}</span>
          <span class="badge badge-country">${ON.escapeHtml(country)}</span>
          ${level && level !== "All levels" ? `<span class="badge badge-level">${ON.escapeHtml(level)}</span>` : ""}
        </div>
        <h1>${ON.escapeHtml(h1)}</h1>
        ${logoHtml}
        <p class="detail-intro">${ON.escapeHtml(intro)}</p>
        <div class="hero-actions">
          <a class="button button-primary" href="${ON.escapeHtml(item.link || item.official_url)}" target="_blank" rel="noopener noreferrer">Apply Now <span aria-hidden="true">â†—</span></a>
          <a class="button button-secondary" href="${categoryPage}">Browse more ${ON.escapeHtml(typeLabel)}s</a>
        </div>
        <p class="microcopy" style="margin-top:1rem">Listing verified by the OpportunityNest editorial team. Deadline and eligibility cross-referenced with the <a href="${ON.escapeHtml(item.link || item.official_url)}" target="_blank" rel="noopener noreferrer" style="color:inherit">official programme page</a>. Always confirm details before applying.</p>
      </div>

      <section class="detail-section" aria-labelledby="overview-heading">
        <h2 id="overview-heading">${ON.escapeHtml(keywordH2)}</h2>
        <div class="detail-description">${ON.renderMarkdown(item.description)}</div>
        ${organization ? `<p><strong>Organization:</strong> ${ON.escapeHtml(organization)}</p>` : ""}
      </section>

      <section class="detail-section" aria-labelledby="details-heading">
        <h2 id="details-heading">${ON.escapeHtml(detailsHeading)}</h2>
        <dl class="detail-grid">
          <div><dt>Country</dt><dd>${ON.escapeHtml(country)}</dd></div>
          <div><dt>Education Level</dt><dd>${ON.escapeHtml(level)}</dd></div>
          <div><dt>Field of Study</dt><dd>${ON.escapeHtml(field)}</dd></div>
          <div><dt>Funding</dt><dd>${ON.escapeHtml(funding)}</dd></div>
          <div><dt>Application Deadline</dt><dd><span class="deadline${urgencyClass}">${ON.escapeHtml(deadline)}</span></dd></div>
        </dl>
      </section>

      <section class="detail-section" aria-labelledby="who-heading">
        <h2 id="who-heading">${ON.escapeHtml(whoHeading)}</h2>
        <p>${ON.escapeHtml(whoApply)}</p>
      </section>

      <section class="detail-section" aria-labelledby="funding-heading">
        <h2 id="funding-heading">${ON.escapeHtml(fundingHeading)}</h2>
        <p>${ON.escapeHtml(fundingExplained)}</p>
      </section>

      <section class="detail-section" aria-labelledby="selection-heading">
        <h2 id="selection-heading">${ON.escapeHtml(selectionHeading)}</h2>
        ${selectionProcess}
      </section>

      <section class="detail-section" aria-labelledby="faq-heading">
        <h2 id="faq-heading">${ON.escapeHtml(faqHeading)}</h2>
        <div class="faq-list">
          ${faqHtml}
        </div>
      </section>

      <section class="detail-section" aria-labelledby="documents-heading">
        <h2 id="documents-heading">${ON.escapeHtml(docsHeading)}</h2>
        <p>${ON.escapeHtml(docsIntro)}</p>
        <ul>${docsHtml}</ul>
      </section>

      <section class="detail-section" aria-labelledby="mistakes-heading">
        <h2 id="mistakes-heading">${ON.escapeHtml(mistakesHeading)}</h2>
        <p>${mistakesIntro}</p>
        <ol>${mistakesHtml}</ol>
      </section>

      <section class="detail-section" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading">${ON.escapeHtml(timelineHeading)}</h2>
        <p>${timelineIntro}</p>
        <ul>
          <li><strong>8â€“10 weeks before:</strong> Read the full eligibility criteria and programme description. Confirm you qualify before investing time.</li>
          <li><strong>6â€“8 weeks before:</strong> Contact your referees and share your CV and draft motivation letter with them.</li>
          <li><strong>4â€“6 weeks before:</strong> Write your motivation letter, research proposal, or other essays. Get feedback from mentors or peers.</li>
          <li><strong>2â€“3 weeks before:</strong> Gather transcripts, certificates, language test scores, and any other required documents.</li>
          <li><strong>1 week before:</strong> Complete the online application form. Review every field. Upload all documents.</li>
          <li><strong>48 hours before:</strong> Submit your application. Do not wait until the final day â€” technical issues and time-zone differences cause missed deadlines every year.</li>
        </ul>
      </section>

      <section class="detail-section" aria-labelledby="apply-heading">
        <h2 id="apply-heading">${ON.escapeHtml(applyHeading)}</h2>
        <p>${applyIntro}</p>
        <a class="button button-primary" href="${ON.escapeHtml(item.link || item.official_url)}" target="_blank" rel="noopener noreferrer">Visit Official Website <span aria-hidden="true">â†—</span></a>
      </section>

      <p class="microcopy">OpportunityNest summarizes public information and directs applicants to the official programme website. Always verify requirements and deadlines before applying.</p>
      ${item.created_at ? `<p class="microcopy">Listing added: ${new Date(item.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}. Details may change â€” confirm on the official website.</p>` : ''}

      ${ON.renderDetailExploreSection(item, country, typeLabel, level, field)}

      <div id="related-opportunities" aria-live="polite"></div>
    `;
  };

  // SEO: Fetch and render related opportunities with multi-step fallback
  ON.renderRelatedOpportunities = async (item) => {
    const relatedContainer = document.getElementById("related-opportunities");
    if (!relatedContainer) return;

    try {
      const client = ON.getSupabaseClient();
      const tableName = item.isInternship ? "internships" : "opportunities";
      const normalize = r => item.isInternship ? ON.mapInternshipToOpportunity(r) : ON.normalizeOpportunity(r);
      let related = [];

      // Step 1: Try same country + same type
      if (item.country && item.type) {
        const { data, error } = await client.from(tableName).select("*").neq("id", item.id).eq("country", item.country).eq("type", item.type).limit(6);
        if (!error && data && data.length > 0) { related = data; }
      }

      // Step 2: Fallback â€” same country, any type
      if (related.length === 0 && item.country) {
        const { data, error } = await client.from(tableName).select("*").neq("id", item.id).eq("country", item.country).limit(6);
        if (!error && data && data.length > 0) { related = data; }
      }

      // Step 3: Fallback â€” same type, any country
      if (related.length === 0 && item.type) {
        const { data, error } = await client.from(tableName).select("*").neq("id", item.id).eq("type", item.type).limit(6);
        if (!error && data && data.length > 0) { related = data; }
      }

      // Step 4: Fallback â€” any 4 recent opportunities
      if (related.length === 0) {
        const { data, error } = await client.from(tableName).select("*").neq("id", item.id).order("created_at", { ascending: false }).limit(4);
        if (!error && data && data.length > 0) { related = data; }
      }

      const sliced = related.slice(0, 4);
      if (sliced.length === 0) {
        relatedContainer.innerHTML = "";
        return;
      }

      const normalizedRelated = sliced.map(normalize);
      const countrySlug = ON.getCountrySlug(item.country || "");
      const categoryPage = item.type === "Scholarship" ? "/scholarships.html" : item.type === "Fellowship" ? "/fellowships.html" : item.type === "Internship" ? "/internships.html" : "/#opportunities";

      relatedContainer.innerHTML = `
        <h2>Related Opportunities</h2>
        <div class="related-grid">
          ${normalizedRelated.map(r => ON.renderOpportunityCard(r)).join("")}
        </div>
        <p style="margin-top:1rem">
          Browse more <a href="${categoryPage}">${ON.escapeHtml((item.type || 'opportunity').toLowerCase())}s</a>${countrySlug && item.country !== 'Global' ? ` | <a href="/country/${countrySlug}/">Opportunities in ${ON.escapeHtml(item.country)}</a>` : ''} | <a href="/scholarships.html">All scholarships</a> | <a href="/internships.html">All internships</a>
        </p>
      `;
    } catch (error) {
      console.error("Error fetching related opportunities:", error);
      relatedContainer.innerHTML = `<h2>Related Opportunities</h2><p>Explore more: <a href="/scholarships.html">Scholarships</a> | <a href="/internships.html">Internships</a> | <a href="/fellowships.html">Fellowships</a></p>`;
    }
  };
})(window.OpportunityNest);

  // ─── Filter Chips Component ─────────────────────────────────────────────────
  ON.renderFilterChips = (containerId, items, type = "category") => {
    const container = document.getElementById(containerId);
    if (!container || !items.length) return;

    const isCountry = type === "country";
    const label = isCountry ? "Browse by Country" : "Browse Competition Categories";
    
    container.innerHTML = `<p class="chips-label">${ON.escapeHtml(label)}</p>`;
    
    const chipsContainer = document.createElement("div");
    chipsContainer.className = "chips-wrapper";
    chipsContainer.setAttribute("role", "group");
    chipsContainer.setAttribute("aria-label", label);

    items.forEach((item, index) => {
      const chip = document.createElement("button");
      chip.className = "filter-chip";
      chip.type = "button";
      chip.setAttribute("data-filter-type", type);
      chip.setAttribute("data-filter-value", item.value);
      chip.setAttribute("aria-label", `Filter by ${item.label || item.value}`);
      chip.setAttribute("tabindex", "0");
      
      const count = item.count > 0 ? ` (${item.count})` : "";
      const flag = isCountry && item.flag ? `${item.flag} ` : "";
      
      chip.innerHTML = `${ON.escapeHtml(flag)}${ON.escapeHtml(item.label || item.value)}${ON.escapeHtml(count)}`;
      
      chip.addEventListener("click", () => {
        const filterId = isCountry ? "country-filter" : "category-filter";
        const filterSelect = document.getElementById(filterId);
        if (filterSelect) {
          filterSelect.value = item.value;
          filterSelect.dispatchEvent(new Event("change"));
        }
        
        container.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
      });
      
      chip.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          chip.click();
        }
      });
      
      chipsContainer.appendChild(chip);
    });

    container.appendChild(chipsContainer);
  };

  ON.getFilterCounts = (items, field) => {
    const counts = new Map();
    items.forEach((item) => {
      const value = item[field]?.trim();
      if (!value) return;
      counts.set(value, (counts.get(value) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, label: value, count }))
      .sort((a, b) => b.count - a.count);
  };
