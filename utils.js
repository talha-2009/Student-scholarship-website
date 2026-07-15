/**
 * Shared helpers for OpportunityNest — Supabase client, formatting, rendering, pagination.
 */
window.OpportunityNest = window.OpportunityNest || {};

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

      // Regular paragraph — may contain inline headings.
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

  // AdSense: Safe ad initialization — prevents duplicate pushes
  ON.pushAd = (selector) => {
    try {
      const el = document.querySelector(selector);
      if (el && !el.dataset.pushed) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        el.dataset.pushed = "true";
      }
    } catch (e) { /* AdSense may throw on empty slots — safe to ignore */ }
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
    return rows.map(ON.normalizeOpportunity).filter(ON.isActiveOpportunity);
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
      metaDescription: (keyword, item) => `Apply for the ${keyword} — a fully funded research fellowship for scholars studying technology's social impact. Explore eligibility, funding, and deadlines.`,
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
      metaDescription: (keyword, item) => `Join the ${keyword} — a global competition for master's teams with a CHF 25,000 prize pool and funded finals in Geneva. Check eligibility and apply.`,
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
      metaDescription: (keyword, item) => `Apply for a ${keyword} — paid global placements with UNICEF for students and recent graduates. Explore eligibility, stipend, and application steps.`,
      intro: (keyword, item) => `The ${keyword} Programme places talented students and recent graduates inside UNICEF, the United Nations agency dedicated to child rights, education, health, and protection worldwide. Open to undergraduate, master's, and PhD students — as well as graduates within the past two years — these placements are available across UNICEF offices and country programmes around the globe. Interns receive a monthly stipend and, subject to available funding, a one-time contribution toward travel and visa costs. Whether your background is in development, communications, public health, education, or data, this programme offers direct exposure to global humanitarian work and a meaningful start to an international career. Positions are posted on a rolling basis, so check the official careers portal regularly and apply early.`,
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
      metaDescription: (keyword, item) => `Apply for the ${keyword} — a fully funded UK master's scholarship for US students covering tuition, living costs, and airfare. Learn more and apply.`,
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
      metaDescription: (keyword, item) => `Apply for the ${keyword} — a fully funded German master's or PhD programme for development professionals. Explore eligible courses and deadlines.`,
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
      metaDescription: (keyword, item) => `Apply for the ${keyword} — McGill's flagship fully funded master's award with leadership development, mentorship, and a living stipend.`,
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
      metaDescription: (keyword, item) => `Apply for the ${keyword} — a fully funded residency at the University of Vienna for German-language writers, scholars, and translators. Explore eligibility and deadlines.`,
      intro: (keyword, item) => `The ${keyword} is a prestigious fully funded residency fellowship hosted by the University of Vienna's Franz Werfel Centre for German-language and literary studies. Open to established and emerging writers, translators, and scholars working in or on German-language literature, the fellowship provides a dedicated period of focused research, writing, or translation in Vienna. Fellows receive a monthly stipend, accommodation support, and access to the university's library and academic networks. The programme honours the legacy of Franz Werfel, the Austrian novelist and playwright known for his commitment to intellectual freedom and humanitarian values. Applicants should demonstrate a strong body of work in German-language literary scholarship, creative writing, or translation, along with a clear project proposal for their time in Vienna. The fellowship is highly competitive and attracts candidates from across Europe and beyond.`,
      h2: (keyword) => `Eligibility for This Austrian Literary Fellowship`,
      faqs: (keyword) => [
        { question: `What is the ${keyword}?`, answer: `The ${keyword} is a fully funded residency at the University of Vienna supporting writers, translators, and scholars working in German-language literature and literary studies.` },
        { question: `Who can apply for this fellowship?`, answer: `Established and emerging writers, translators, and academics with a strong record in German-language literary work and a clear project proposal for their residency period.` },
        { question: `Is this fellowship fully funded?`, answer: `Yes, it covers a monthly stipend, accommodation support, and access to the University of Vienna's library and academic resources.` }
      ],
      imageAlt: (keyword) => `${keyword} official fellowship banner`
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
      .replace(/\s*[–—-]\s*.*$/, "")
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
    let desc = `Apply for the ${keyword}${typeFragment} in ${country}. ${funding}. Deadline: ${deadline}. Explore details and apply via OpportunityNest.`;

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
    return `${keyword} (Fully Funded)`;
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

    const sentences = [
      `The ${keyword} is a ${type} based in ${country}, open to ${level} candidates with an interest in ${field}.`,
      `This programme offers ${funding}, enabling selected participants to focus fully on their studies, research, or professional development without financial pressure.`,
      `Successful applicants join a cohort of driven individuals from around the world and gain access to academic mentors, networking events, and career-building resources throughout the programme.`,
      `Whether your goal is to advance your education, gain international experience, or build specialised skills, this opportunity provides a structured path toward that objective.`,
      `The application deadline is ${deadline}. Review all eligibility criteria carefully and submit your materials through the official programme website well before the closing date.`,
      `OpportunityNest keeps this listing updated so you can apply with accurate deadline and funding information.`
    ];

    return ON.fitWordCount(sentences.join(" "), 120, 180);
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

    const eligibilityAnswer = `The ${keyword}${typeFragment} is open to ${level} applicants with an interest in ${field}. Eligibility typically depends on your nationality, academic background, and the specific requirements set by the programme. Review the official criteria carefully — some programmes restrict by country of origin, age, or degree field, while others are open to all nationalities and disciplines.`;

    const fundingAnswer = isFullyFunded
      ? `Yes, the ${keyword}${typeFragment} is fully funded. This typically covers tuition fees, a living stipend, health insurance, and travel costs. The exact components may vary by year and recipient, so check the official programme page for the current funding breakdown.`
      : `The ${keyword}${typeFragment} provides ${funding}. The specific financial support depends on the programme structure — some cover tuition only, while others include living allowances, travel grants, or research funding. Check the official listing for the full details of what is included.`;

    const applyAnswer = `You can apply through the official programme website. The deadline is ${deadline}. Before applying, confirm your eligibility, prepare your motivation letter and CV, and arrange your references early. Most successful applicants start preparing at least 6–8 weeks before the deadline.`;

    const competitivenessAnswer = `The ${keyword}${typeFragment} is competitive, as it attracts strong applicants from ${country} and internationally. To strengthen your application, focus on demonstrating clear goals, relevant experience in ${field}, and a well-prepared motivation letter that explains why this specific programme is the right fit for you.`;

    const afterAnswer = `After selection, recipients typically receive an official offer letter with programme details, start dates, and any pre-arrival requirements such as visa applications, accommodation arrangements, or orientation materials. The programme team will guide you through the next steps.`;

    // Select 4 most useful FAQs based on opportunity attributes
    const allFaqs = [
      { question: `Who is eligible for the ${keyword}?`, answer: eligibilityAnswer },
      { question: `What does the ${keyword} cover financially?`, answer: fundingAnswer },
      { question: `How do I apply for the ${keyword}?`, answer: applyAnswer },
      { question: `How competitive is this ${type}?`, answer: competitivenessAnswer },
      { question: `What happens after I am selected?`, answer: afterAnswer }
    ];

    return allFaqs.slice(0, 4);
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
    const parts = [];

    if (level.match(/PhD|Doctoral/i)) {
      parts.push(`This ${type} is ideal for researchers and doctoral candidates who have completed a master's degree and want to pursue original research in ${field}.`);
    } else if (level.match(/Master/i)) {
      parts.push(`This ${type} suits graduates who want to deepen their expertise in ${field} through advanced study at the master's level.`);
    } else if (level.match(/Undergraduate|Bachelor/i)) {
      parts.push(`This ${type} is designed for undergraduate students in ${field} who want to gain academic and professional experience early in their careers.`);
    } else if (level.match(/Postdoc/i)) {
      parts.push(`This ${type} targets postdoctoral scholars and early-career academics seeking dedicated research time in ${field}.`);
    } else {
      parts.push(`This ${type} is open to motivated individuals with a strong interest in ${field}.`);
    }

    if (isFullyFunded) {
      parts.push(`Because this programme is fully funded, it is especially valuable for candidates who need financial support to study or work in ${country} — including those from low- and middle-income backgrounds.`);
    }

    if (country !== "Global" && country !== "Not specified") {
      parts.push(`If you are an international applicant considering ${country}, this programme offers a structured entry point with institutional support.`);
    }

    return parts.join(" ");
  };

  // Generate dynamic "Funding Explained" section
  ON.generateFundingExplained = (item) => {
    const funding = item.funding || "";
    const type = (item.type || "opportunity").toLowerCase();

    if (/fully\s*fund/i.test(funding)) {
      return `This ${type} covers the full cost of participation. For most recipients, this means tuition fees, a living stipend, health insurance, and travel costs are all included. The exact breakdown varies by programme — some cover accommodation directly, while others provide a monthly allowance that you manage yourself. Check the official programme page for the specific funding components, as they differ between recipients and may change from year to year.`;
    }
    if (/partial/i.test(funding)) {
      return `This ${type} provides partial funding toward your costs. Depending on the programme, this may cover a percentage of tuition fees, a one-time grant, or a monthly contribution toward living expenses. You will likely need to secure additional funding for the remaining costs through personal savings, other scholarships, or university financial aid.`;
    }
    if (/unpaid|volunteer/i.test(funding)) {
      return `This ${type} does not include a salary or stipend. However, unpaid positions at international organisations often provide other benefits: professional networking, mentorship, hands-on experience, and a strong credential for your CV. Some host organisations may offer travel reimbursements or help with visa costs — check the official listing for details.`;
    }
    if (/stipend|monthly/i.test(funding)) {
      return `Recipients of this ${type} receive a regular stipend to cover living expenses during the programme. The amount is designed to cover basic costs such as accommodation, food, and local transport in the host country. Additional benefits like health insurance, travel allowances, or research grants may also be included depending on the programme structure.`;
    }
    return `Funding for this ${type} varies by recipient and year. The official programme website provides the most current details on what is covered, payment schedules, and any conditions attached to the financial support. Review the funding section carefully before applying so you understand exactly what is included.`;
  };

  // Generate dynamic "Selection Process" section
  ON.generateSelectionProcess = (item) => {
    const type = (item.type || "opportunity").toLowerCase();
    const level = item.level || "";
    const processes = [];

    if (level.match(/PhD|Doctoral|Postdoc|Research/i)) {
      processes.push("Research proposal evaluation");
      processes.push("Academic references (typically two or three)");
      processes.push("Interview with the selection committee (often by video call for international candidates)");
    } else if (level.match(/Master/i)) {
      processes.push("Academic transcript review");
      processes.push("Motivation letter or statement of purpose");
      processes.push("At least one reference from a professor or academic supervisor");
      processes.push("Interview (in person or online)");
    } else if (type === "internship") {
      processes.push("CV and cover letter screening");
      processes.push("Competency-based interview (often two rounds)");
      processes.push("Possible written test or case study");
    } else if (type === "competition") {
      processes.push("Written submission or project proposal");
      processes.push("Jury review and shortlisting");
      processes.push("Final presentation or pitch (for finalists)");
    } else {
      processes.push("Application form and supporting documents review");
      processes.push("Motivation letter assessment");
      processes.push("Interview with the selection panel");
    }

    const listHtml = processes.map((p, i) => `<li><strong>Stage ${i + 1}:</strong> ${ON.escapeHtml(p)}</li>`).join("");
    return `<p>While the exact process depends on the programme, competitive ${type}s at this level typically involve the following stages:</p><ol>${listHtml}</ol><p>Start preparing for each stage well before the deadline. For interviews, practise articulating your goals and how this ${type} fits your trajectory.</p>`;
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
    docs.push("<li><strong>Valid passport or national ID</strong> — must remain valid for the full programme duration</li>");
    docs.push("<li><strong>Curriculum Vitae (CV)</strong> — highlight academic, professional, and volunteer experience relevant to this programme</li>");
    docs.push("<li><strong>Academic transcripts</strong> — from all post-secondary institutions attended</li>");
    docs.push("<li><strong>Motivation letter or statement of purpose</strong> — explain why this specific programme, how it aligns with your goals, and what you bring</li>");
    if (level.match(/PhD|Doctoral|Postdoc|Research|Master/i) || typeLabel === "fellowship") {
      docs.push("<li><strong>Research proposal</strong> — required for research-focused programmes; outline your topic, methodology, and expected outcomes</li>");
    }
    docs.push("<li><strong>Letters of recommendation</strong> — typically two or three; give your recommenders at least 3–4 weeks' notice</li>");
    if (country !== "Global" && country !== "Not specified") {
      docs.push("<li><strong>Proof of language proficiency</strong> — TOEFL, IELTS, or equivalent if the programme is not in your native language</li>");
    }
    if (typeLabel === "internship") {
      docs.push("<li><strong>Portfolio or work samples</strong> — if applicable to your field (design, writing, engineering, etc.)</li>");
    }
    const docsHtml = docs.join("");

    // Dynamic mistakes based on type
    const mistakes = [];
    mistakes.push("<li><strong>Submitting too close to the deadline</strong> — technical issues and time-zone differences cause last-minute failures. Aim to submit at least 48 hours early.</li>");
    if (typeLabel === "scholarship" || typeLabel === "fellowship") {
      mistakes.push("<li><strong>Writing a generic motivation letter</strong> — selection committees read hundreds of applications. Mention the specific programme by name, reference its unique features, and connect them to your background.</li>");
      mistakes.push("<li><strong>Not addressing the selection criteria</strong> — most programmes list what they evaluate. Structure your letter and CV to address each criterion directly.</li>");
    }
    if (typeLabel === "internship") {
      mistakes.push("<li><strong>Applying without researching the organisation</strong> — interviewers expect you to understand their mission, recent projects, and how your skills contribute.</li>");
    }
    mistakes.push("<li><strong>Ignoring eligibility requirements</strong> — nationality, age, degree level, and field restrictions are non-negotiable. Verify before investing time.</li>");
    mistakes.push("<li><strong>Asking for references at the last minute</strong> — give recommenders 3–4 weeks and share your CV and motivation letter so they write specific, strong references.</li>");
    const mistakesHtml = mistakes.join("");

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
          <a class="button button-primary" href="${ON.escapeHtml(item.link || item.official_url)}" target="_blank" rel="noopener noreferrer">Apply Now <span aria-hidden="true">↗</span></a>
          <a class="button button-secondary" href="${categoryPage}">Browse more ${ON.escapeHtml(typeLabel)}s</a>
        </div>
      </div>

      <section class="detail-section" aria-labelledby="overview-heading">
        <h2 id="overview-heading">${ON.escapeHtml(keywordH2)}</h2>
        <div class="detail-description">${ON.renderMarkdown(item.description)}</div>
        ${organization ? `<p><strong>Organization:</strong> ${ON.escapeHtml(organization)}</p>` : ""}
      </section>

      <section class="detail-section" aria-labelledby="details-heading">
        <h2 id="details-heading">Program Details at a Glance</h2>
        <dl class="detail-grid">
          <div><dt>Country</dt><dd>${ON.escapeHtml(country)}</dd></div>
          <div><dt>Education Level</dt><dd>${ON.escapeHtml(level)}</dd></div>
          <div><dt>Field of Study</dt><dd>${ON.escapeHtml(field)}</dd></div>
          <div><dt>Funding</dt><dd>${ON.escapeHtml(funding)}</dd></div>
          <div><dt>Application Deadline</dt><dd><span class="deadline${urgencyClass}">${ON.escapeHtml(deadline)}</span></dd></div>
        </dl>
      </section>

      <section class="detail-section" aria-labelledby="who-heading">
        <h2 id="who-heading">Who Should Apply</h2>
        <p>${ON.escapeHtml(whoApply)}</p>
      </section>

      <section class="detail-section" aria-labelledby="funding-heading">
        <h2 id="funding-heading">Funding Explained</h2>
        <p>${ON.escapeHtml(fundingExplained)}</p>
      </section>

      <section class="detail-section" aria-labelledby="selection-heading">
        <h2 id="selection-heading">What the Selection Process Typically Involves</h2>
        ${selectionProcess}
      </section>

      <section class="detail-section" aria-labelledby="faq-heading">
        <h2 id="faq-heading">Frequently Asked Questions</h2>
        <div class="faq-list">
          ${faqHtml}
        </div>
      </section>

      <section class="detail-section" aria-labelledby="documents-heading">
        <h2 id="documents-heading">Documents You Will Likely Need</h2>
        <p>Prepare these documents before starting your application. Requirements vary by programme, so always check the official website for the exact list.</p>
        <ul>${docsHtml}</ul>
      </section>

      <section class="detail-section" aria-labelledby="mistakes-heading">
        <h2 id="mistakes-heading">Common Mistakes to Avoid</h2>
        <p>Competitive ${ON.escapeHtml(typeLabel)}s attract strong candidates. These mistakes are easy to avoid but frequently cost applicants their chance:</p>
        <ol>${mistakesHtml}</ol>
      </section>

      <section class="detail-section" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading">Application Timeline</h2>
        <p>The deadline for this ${ON.escapeHtml(typeLabel)} is <strong>${ON.escapeHtml(deadline)}</strong>. Here is a suggested preparation timeline:</p>
        <ul>
          <li><strong>8–10 weeks before:</strong> Read the full eligibility criteria and programme description. Confirm you qualify before investing time.</li>
          <li><strong>6–8 weeks before:</strong> Contact your referees and share your CV and draft motivation letter with them.</li>
          <li><strong>4–6 weeks before:</strong> Write your motivation letter, research proposal, or other essays. Get feedback from mentors or peers.</li>
          <li><strong>2–3 weeks before:</strong> Gather transcripts, certificates, language test scores, and any other required documents.</li>
          <li><strong>1 week before:</strong> Complete the online application form. Review every field. Upload all documents.</li>
          <li><strong>48 hours before:</strong> Submit your application. Do not wait until the final day — technical issues and time-zone differences cause missed deadlines every year.</li>
        </ul>
      </section>

      <section class="detail-section" aria-labelledby="apply-heading">
        <h2 id="apply-heading">How to Apply</h2>
        <p>Applications are submitted through the official programme website. Review all eligibility requirements, prepare your documents, and submit well before the deadline.</p>
        <a class="button button-primary" href="${ON.escapeHtml(item.link || item.official_url)}" target="_blank" rel="noopener noreferrer">Visit Official Website <span aria-hidden="true">↗</span></a>
      </section>

      <p class="microcopy">OpportunityNest summarizes public information and directs applicants to the official programme website. Always verify requirements and deadlines before applying.</p>
      ${item.created_at ? `<p class="microcopy">Listing added: ${new Date(item.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}. Details may change — confirm on the official website.</p>` : ''}

      <div id="related-opportunities" aria-live="polite"></div>
    `;
  };

  // SEO: Fetch and render related opportunities
  ON.renderRelatedOpportunities = async (item) => {
    const relatedContainer = document.getElementById("related-opportunities");
    if (!relatedContainer) return;

    try {
      const client = ON.getSupabaseClient();
      const tableName = item.isInternship ? "internships" : "opportunities";
      
      let query = client.from(tableName).select("*").neq("id", item.id).limit(6);
      
      if (item.country) {
        query = query.eq("country", item.country);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const related = (data || []).slice(0, 4);
      
      if (related.length === 0) {
        relatedContainer.innerHTML = "";
        return;
      }
      
      const normalizedRelated = related.map(r => 
        item.isInternship ? ON.mapInternshipToOpportunity(r) : ON.normalizeOpportunity(r)
      );
      
      relatedContainer.innerHTML = `
        <h2>Related Opportunities</h2>
        <div class="related-grid">
          ${normalizedRelated.map(r => ON.renderOpportunityCard(r)).join("")}
        </div>
      `;
    } catch (error) {
      console.error("Error fetching related opportunities:", error);
      relatedContainer.innerHTML = "";
    }
  };
})(window.OpportunityNest);
