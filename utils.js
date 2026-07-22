window.OpportunityNest = window.OpportunityNest || {};
window.ON = window.OpportunityNest;

(function (ON) {
  "use strict";

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

  const countryFlags = {
    Australia: "AU",
    Austria: "AT",
    Canada: "CA",
    Germany: "DE",
    Switzerland: "CH",
    "United Kingdom": "UK",
    "United States": "US",
    Global: "Global"
  };

  let supabaseClient;
  let opportunityRowsPromise;
  const typeRouteMap = {
    Scholarship: "/scholarships/",
    Internship: "/internships/",
    Fellowship: "/fellowships/",
    Competition: "/competitions.html",
    "Exchange Program": "/exchange-programs/",
    "Research Grant": "/grants/",
    "Youth Program": "/youth-programs/",
    "Volunteer Program": "/volunteer-programs/",
    Conference: "/conferences/",
    "Summer School": "/workshops/"
  };

  ON.typeRouteMap = typeRouteMap;
  ON.typeToUrl = (type) => typeRouteMap[type] || `/${type.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-").replace(/^-+|-+$/g, "")}/`;

  const text = (value = "") => String(value ?? "").trim();
  const lower = (value = "") => text(value).toLowerCase();
  const activeDeadlineStatuses = new Set(["rolling", "varies", "not_announced"]);

  ON.escapeHtml = (value = "") =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  ON.cleanSlug = (value = "") => {
    const slug = String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[''`]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-");
    return slug || "opportunity";
  };
  ON.slugify = ON.cleanSlug;
  ON.getCountrySlug = ON.cleanSlug;

  ON.getSupabaseClient = () => {
    if (!window.supabase) throw new Error("Supabase client could not be loaded.");
    if (!supabaseClient) {
      supabaseClient = window.supabase.createClient(ON.SUPABASE_URL, ON.SUPABASE_PUBLISHABLE_KEY);
    }
    return supabaseClient;
  };

  ON.normalizeOpportunity = (row = {}) => ({
    id: row.id || "",
    type: row.type || "",
    funding: row.funding || "",
    title: row.title || "Untitled opportunity",
    country: row.country || "Global",
    level: row.level || row.degree_level || "",
    field: row.field || row.internship_type || "",
    deadline: row.deadline || "",
    deadline_status: row.deadline_status || "fixed",
    description: row.description || "No description available.",
    link: ON.OFFICIAL_URL_OVERRIDES[row.link] || row.link || row.official_url || "#",
    created_at: row.created_at || "",
    slug: row.slug || ON.cleanSlug(`${row.title || ""} ${row.country || ""}`).slice(0, 95),
    organization: row.organization || row.host_organization || "",
    logo_url: row.logo_url || "",
    isInternship: Boolean(row.isInternship)
  });

  ON.mapInternshipToOpportunity = (row = {}) =>
    ON.normalizeOpportunity({
      ...row,
      type: "Internship",
      level: row.degree_level || row.level,
      field: row.internship_type || row.field,
      link: row.official_url || row.link,
      isInternship: true
    });

  ON.assignOpportunitySlugs = (items = []) => {
    const counts = new Map();
    items.forEach((item) => {
      const base = item.slug || ON.cleanSlug(`${item.title} ${item.country}`);
      counts.set(base, (counts.get(base) || 0) + 1);
    });
    return items.map((item) => {
      const base = item.slug || ON.cleanSlug(`${item.title} ${item.country}`);
      return { ...item, slug: counts.get(base) > 1 ? `${base}-${ON.cleanSlug(item.id).slice(0, 8)}` : base };
    });
  };

  ON.DEADLINE_STATUS_LABELS = {
    rolling: "Rolling / Ongoing",
    varies: "Varies by Institution",
    not_announced: "Deadline Not Announced"
  };

  ON.formatDeadline = (item = {}) => {
    const deadline = typeof item === "object" ? item.deadline : item;
    const status = typeof item === "object" ? item.deadline_status : "";
    if (status && status !== "fixed") return ON.DEADLINE_STATUS_LABELS[status] || "Deadline Not Announced";
    if (!deadline) return "Deadline Not Announced";
    const parsed = Date.parse(deadline);
    if (Number.isNaN(parsed)) return "Deadline Not Announced";
    return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(parsed));
  };

  ON.getDeadlineUrgency = (item = {}) => {
    if (activeDeadlineStatuses.has(item.deadline_status)) return "none";
    if (!item.deadline) return "none";
    const parsed = Date.parse(item.deadline);
    if (Number.isNaN(parsed)) return "none";
    const days = Math.ceil((parsed - Date.now()) / 86400000);
    if (days < 0) return "expired";
    if (days <= 7) return "urgent";
    if (days <= 30) return "soon";
    return "normal";
  };

  ON.isActiveOpportunity = (item) => ON.getDeadlineUrgency(item) !== "expired";
  ON.getOpportunityPath = (item) => `/opportunity/${encodeURIComponent(item.slug || ON.cleanSlug(`${item.title} ${item.country}`))}/`;
  ON.getOpportunityUrl = (item) => `${ON.SITE_URL}${ON.getOpportunityPath(item)}`;
  ON.getCountryFlag = (country = "") => countryFlags[country] || "Global";
  ON.getCountryLandmark = () => "";

  ON.setStatus = (element, message, isError = false) => {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("is-error", isError);
  };

  ON.updateMetaDescription = (description) => {
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute("content", description);
  };

  ON.renderMarkdown = (value = "") => {
    const blocks = String(value || "").split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
    return blocks.map((block) => `<p>${ON.escapeHtml(block).replace(/\n/g, "<br>")}</p>`).join("");
  };

  ON.fetchOpportunityRows = async () => {
    if (opportunityRowsPromise) return opportunityRowsPromise;
    opportunityRowsPromise = (async () => {
      const fields = "id,type,funding,title,country,level,field,deadline,deadline_status,description,link,slug,created_at";
      const cacheKey = `opportunitynest:opportunities:${fields}`;
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.savedAt < 600000 && Array.isArray(parsed.rows)) return parsed.rows;
        }
      } catch (_) {}
      const url = `${ON.SUPABASE_URL}/rest/v1/opportunities?select=${encodeURIComponent(fields)}&order=deadline.asc`;
      const response = await fetch(url, {
        headers: {
          apikey: ON.SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${ON.SUPABASE_PUBLISHABLE_KEY}`
        }
      });
      if (!response.ok) throw new Error(`Opportunity request failed with status ${response.status}.`);
      const rows = (await response.json()).map(ON.normalizeOpportunity).filter(ON.isActiveOpportunity);
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), rows }));
      } catch (_) {}
      return rows;
    })();
    return opportunityRowsPromise;
  };

  ON.normalizeValue = (value = "") =>
    lower(value)
      .replace(/programmes?/g, "program")
      .replace(/scholarships?/g, "scholarship")
      .replace(/internships?/g, "internship")
      .replace(/fellowships?/g, "fellowship")
      .replace(/\s+/g, " ")
      .trim();

  ON.matchCategory = (item, category = "") => {
    if (!category) return true;
    const needle = ON.normalizeValue(category);
    return [item.field, item.type, item.title, item.description].some((value) => ON.normalizeValue(value).includes(needle));
  };

  ON.filterOpportunities = (items = [], filters = {}) => {
    const query = lower(filters.searchTerm);
    const country = ON.normalizeValue(filters.country);
    const type = ON.normalizeValue(filters.type);
    const funding = ON.normalizeValue(filters.funding);
    const level = ON.normalizeValue(filters.level);
    return items.filter((item) => {
      const haystack = lower([item.title, item.country, item.field, item.description, item.type, item.funding, item.level].join(" "));
      return (!query || haystack.includes(query)) &&
        (!country || ON.normalizeValue(item.country).includes(country)) &&
        (!type || ON.matchCategory(item, type)) &&
        (!funding || ON.normalizeValue(item.funding).includes(funding)) &&
        (!level || ON.normalizeValue(item.level).includes(level));
    });
  };

  ON.compareOpportunities = (a, b, sortBy = "deadline") => {
    if (sortBy === "title") return text(a.title).localeCompare(text(b.title));
    if (sortBy === "newest") return text(b.created_at).localeCompare(text(a.created_at));
    const aDate = Date.parse(a.deadline || "");
    const bDate = Date.parse(b.deadline || "");
    if (!Number.isNaN(aDate) && !Number.isNaN(bDate) && aDate !== bDate) return aDate - bDate;
    if (!Number.isNaN(aDate)) return -1;
    if (!Number.isNaN(bDate)) return 1;
    return text(a.title).localeCompare(text(b.title));
  };

  ON.paginate = (items = [], currentPage = 1, pageSize = ON.PAGE_SIZE) => {
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    const page = Math.min(Math.max(1, currentPage), pageCount);
    return { page, pageCount, items: items.slice((page - 1) * pageSize, page * pageSize) };
  };

  ON.renderPagination = (container, pageCount, currentPage, onPageChange) => {
    if (!container) return;
    if (pageCount <= 1) {
      container.innerHTML = "";
      return;
    }
    container.innerHTML = Array.from({ length: pageCount }, (_, index) => {
      const page = index + 1;
      const isPage = page === currentPage;
      return `<button type="button" class="pagination-button${isPage ? " is-active" : ""}" data-page="${page}"${isPage ? ' aria-current="page"' : ""}>${page}</button>`;
    }).join("");
    container.querySelectorAll("[data-page]").forEach((button) => {
      button.addEventListener("click", () => onPageChange(Number(button.dataset.page)));
    });
  };

  ON.renderLoadingSkeleton = (count = 3) =>
    Array.from({ length: count }, () => `<article class="live-opportunity-card skeleton-card" aria-hidden="true">
        <div class="skeleton-card-top"><span class="skeleton skeleton-kicker"></span><span class="skeleton skeleton-deadline"></span></div>
        <span class="skeleton skeleton-title"></span>
        <span class="skeleton skeleton-text"></span>
        <span class="skeleton skeleton-text-short"></span>
        <ul class="card-overview compact-overview"><li><span class="skeleton skeleton-meta"></span></li><li><span class="skeleton skeleton-meta"></span></li><li><span class="skeleton skeleton-meta"></span></li></ul>
        <div class="card-actions"><span class="skeleton skeleton-button"></span><span class="skeleton skeleton-button"></span></div>
      </article>`).join("");

  ON.renderErrorWithRetry = (message, retryCall = "") =>
    `<div class="empty-state is-error"><p>${ON.escapeHtml(message)}</p>${retryCall ? `<button class="button button-secondary" type="button" onclick="${ON.escapeHtml(retryCall)}">Try again</button>` : ""}</div>`;

  ON.renderOpportunityCard = (item = {}) => {
    const url = ON.getOpportunityPath(item);
    const urgency = ON.getDeadlineUrgency(item);
    const urgencyClass = urgency !== "none" ? ` deadline-${urgency}` : "";
    return `
      <article class="live-opportunity-card compact-card">
        <div class="opportunity-card-top">
          <p class="card-kicker">${ON.escapeHtml(ON.getCountryFlag(item.country))} ${ON.escapeHtml(item.country || "Global")} / ${ON.escapeHtml(item.type || "Opportunity")}</p>
          <span class="deadline${urgencyClass}">${ON.escapeHtml(ON.formatDeadline(item))}</span>
        </div>
        <h3>${ON.escapeHtml(item.title || "Opportunity")}</h3>
        <p>${ON.escapeHtml(String(item.description || "").replace(/\s+/g, " ").slice(0, 180))}</p>
        <ul class="card-overview compact-overview">
          <li><strong>Field:</strong> ${ON.escapeHtml(item.field || "Multiple fields")}</li>
          <li><strong>Level:</strong> ${ON.escapeHtml(item.level || "Eligible applicants")}</li>
          <li><strong>Funding:</strong> ${ON.escapeHtml(item.funding || "See details")}</li>
        </ul>
        <div class="card-actions">
          <a class="button button-secondary" href="${ON.escapeHtml(url)}">View Details</a>
          <a class="button button-primary" href="${ON.escapeHtml(item.link || "#")}" target="_blank" rel="noopener noreferrer">Apply Now <span aria-hidden="true">↗</span></a>
        </div>
      </article>`;
  };

  ON.fetchUniqueCountries = async () => {
    const rows = await ON.fetchOpportunityRows();
    return [...new Set(rows.map((item) => item.country).filter(Boolean))].sort();
  };

  ON.fetchUniqueTypes = async () => {
    const rows = await ON.fetchOpportunityRows();
    return [...new Set(rows.map((item) => item.type).filter(Boolean))].sort();
  };

  ON.populateCountryFilter = async (select) => {
    if (!select) return;
    const selected = select.value;
    const countries = await ON.fetchUniqueCountries();
    select.innerHTML = '<option value="">All countries</option>' + countries.map((country) => `<option value="${ON.escapeHtml(country)}">${ON.escapeHtml(country)}</option>`).join("");
    if (countries.includes(selected)) select.value = selected;
  };

  ON.populateTypeFilter = async (select) => {
    if (!select) return;
    const selected = select.value;
    const types = await ON.fetchUniqueTypes();
    select.innerHTML = '<option value="">All types</option>' + types.map((type) => `<option value="${ON.escapeHtml(type)}">${ON.escapeHtml(type)}</option>`).join("");
    if (types.includes(selected)) select.value = selected;
  };

  ON.getFilterCounts = (items = [], field = "") => {
    const counts = new Map();
    items.forEach((item) => {
      const value = text(item[field]);
      if (value) counts.set(value, (counts.get(value) || 0) + 1);
    });
    return [...counts.entries()].map(([value, count]) => ({ value, label: value, count })).sort((a, b) => b.count - a.count);
  };

  ON.renderFilterChips = (containerId, items = [], type = "category") => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    if (!items.length) return;
    const wrapper = document.createElement("div");
    wrapper.className = "chips-wrapper";
    items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "filter-chip";
      button.textContent = `${item.label || item.value} (${item.count})`;
      button.addEventListener("click", () => {
        const target = document.getElementById(type === "country" ? "country-filter" : "category-filter");
        if (target) {
          target.value = item.value;
          target.dispatchEvent(new Event("input", { bubbles: true }));
        }
      });
      wrapper.appendChild(button);
    });
    container.appendChild(wrapper);
  };

  ON.pushAd = (selector) => {
    try {
      const el = document.querySelector(selector);
      if (el && !el.dataset.pushed) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        el.dataset.pushed = "true";
      }
    } catch (_) {}
  };

  ON.generateSEOTitle = (item) => `${item.title} | ${item.country || "Global"} ${item.type || "Opportunity"} | OpportunityNest`;
  ON.generateSEODescription = (item) =>
    `${item.title} details: deadline ${ON.formatDeadline(item)}, funding ${item.funding || "see official page"}, eligibility ${item.level || "eligible applicants"}.`;
  ON.generateImageAlt = (item) => `${item.title} opportunity in ${item.country || "Global"}`;
  ON.generateDetailH1 = (item) => `${item.title}`;
  ON.generateDetailH2 = (item) => `${item.title} overview`;
  ON.generateDetailIntro = (item) => item.description || ON.generateSEODescription(item);
  ON.generateDetailFAQs = (item) => {
    const questions = [
      { q: `Who is eligible for ${item.title}?`, a: `Review the official eligibility criteria on the provider page. Requirements typically cover ${item.level || "academic level"}, ${item.field || "field of study"}, and any nationality or residency rules.` },
      { q: `When does the ${item.title} application close?`, a: `The deadline is listed as ${ON.formatDeadline(item)}. Confirm the exact closing time on the official provider page, as dates can change.` },
      { q: "Where should I submit my application?", a: "Use the official application link on this page. OpportunityNest does not accept applications directly." }
    ];
    if (item.funding && item.funding !== "See official page") {
      questions.push({ q: `What does the funding for ${item.title} cover?`, a: `The listing states: ${item.funding}. Read the provider's own terms to confirm what is included and any conditions attached.` });
    }
    return questions;
  };
  ON.generateStructuredData = (item, url) => ({
    "@context": "https://schema.org",
    "@type": item.type === "Competition" ? "Course" : "EducationalOccupationalProgram",
    name: item.title,
    description: item.description,
    url,
    image: "https://www.opportunitynest.org/og-image.png",
    provider: { "@type": "Organization", name: item.organization || item.country || "Official provider", url: "https://www.opportunitynest.org" },
    inLanguage: "en"
  });
  ON.generateBreadcrumbSchema = (items = []) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url }))
  });
  ON.generateFAQSchema = (item) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ON.generateDetailFAQs(item).map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a }
    }))
  });
  ON.generateWhoShouldApply = (item) => {
    const parts = [];
    if (item.field && item.field !== "All Fields") parts.push(`background in ${item.field}`);
    if (item.level) parts.push(`at ${item.level} level`);
    if (item.country && item.country !== "Global") parts.push(`interested in ${item.country}`);
    return parts.length ? `Applicants with a ${parts.join(", ")} who meet the provider's eligibility rules should consider this program.` : `Applicants who meet the provider's eligibility criteria should review this program.`;
  };
  ON.generateFundingExplained = (item) => {
    if (item.funding && item.funding !== "See official page") return item.funding;
    return "Funding details are specified by the provider. Check the official page for the exact award amount, coverage, and conditions.";
  };
  ON.generateSelectionProcess = (item) => {
    const t = (item.type || "").toLowerCase();
    if (t === "internship") return "<p>The host organization manages the selection. Applications are reviewed based on qualifications, experience, and fit with the role. Some positions require interviews or skills assessments.</p>";
    if (t === "competition") return "<p>The competition organizers evaluate submissions against published criteria. Winners are selected by a panel or jury. Review the judging process on the official page.</p>";
    if (t === "fellowship") return "<p>Fellowship selection is typically conducted by a review committee. Applications are assessed on the candidate's qualifications, project proposal, and alignment with the program objectives.</p>";
    return "<p>The official provider manages the entire selection process. Applications are reviewed based on eligibility fit, document completeness, and relevance to the program.</p>";
  };
  ON.renderDetailExploreSection = (item) => {
    const country = item.country && item.country !== "Global" ? `<a href="/country/${ON.getCountrySlug(item.country)}/">More in ${ON.escapeHtml(item.country)}</a>` : "";
    const category = `<a href="${typeRouteMap[item.type] || "/#opportunities"}">More ${ON.escapeHtml((item.type || "opportunity").toLowerCase())} listings</a>`;
    return `<section class="detail-section"><h2>Explore related pages</h2><p>${[category, country].filter(Boolean).join(" | ")}</p></section>`;
  };

  ON.renderDetailContent = (item, urgencyClass = "", categoryPage = "/#opportunities", categoryType = "opportunity") => {
    const deadline = ON.formatDeadline(item);
    const faqs = ON.generateDetailFAQs(item).map((faq) => `<details><summary>${ON.escapeHtml(faq.q)}</summary><p>${ON.escapeHtml(faq.a)}</p></details>`).join("");
    const type = (item.type || categoryType).toLowerCase();
    const levelSection = item.level ? `<dt>Level</dt><dd>${ON.escapeHtml(item.level)}</dd>` : "";
    return `
      <nav class="breadcrumbs" aria-label="Breadcrumb navigation"><a href="/">Home</a><span aria-hidden="true">/</span><a href="${categoryPage}">${ON.escapeHtml(categoryType)}s</a><span aria-hidden="true">/</span><span aria-current="page">${ON.escapeHtml(item.title)}</span></nav>
      <div class="detail-header">
        <p class="eyebrow">${ON.escapeHtml(item.type || categoryType)} - ${ON.escapeHtml(item.country || "Global")}</p>
        <h1>${ON.escapeHtml(ON.generateDetailH1(item))}</h1>
        <p class="detail-intro">${ON.escapeHtml(ON.generateDetailIntro(item))}</p>
        <div class="hero-actions"><a class="button button-primary" href="${ON.escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Apply Now <span aria-hidden="true">↗</span></a><a class="button button-secondary" href="${categoryPage}">Browse more</a></div>
      </div>
      <section class="detail-section"><h2>${ON.escapeHtml(ON.generateDetailH2(item))}</h2>${ON.renderMarkdown(item.description)}</section>
      <section class="detail-section"><h2>Key information</h2><dl class="detail-grid"><div><dt>Country</dt><dd>${ON.escapeHtml(item.country)}</dd></div>${levelSection}<div><dt>Field</dt><dd>${ON.escapeHtml(item.field || "Multiple fields")}</dd></div><div><dt>Funding</dt><dd>${ON.escapeHtml(item.funding || "See official page")}</dd></div><div><dt>Deadline</dt><dd><span class="deadline${urgencyClass}">${ON.escapeHtml(deadline)}</span></dd></div></dl></section>
      <section class="detail-section"><h2>Applicant profile</h2><p>${ON.escapeHtml(ON.generateWhoShouldApply(item))}</p></section>
      <section class="detail-section"><h2>Funding details</h2><p>${ON.escapeHtml(ON.generateFundingExplained(item))}</p></section>
      <section class="detail-section"><h2>Selection and review</h2>${ON.generateSelectionProcess(item)}</section>
      <section class="detail-section"><h2>Questions and answers</h2><div class="faq-list">${faqs}</div></section>
      <section class="detail-section"><h2>Application instructions</h2><p>Submit through the official provider page. Verify the deadline, required documents, and eligibility rules on the provider's site before applying.</p><a class="button button-primary" href="${ON.escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Visit official website <span aria-hidden="true">↗</span></a></section>
      ${ON.renderDetailExploreSection(item)}
      <div id="related-opportunities" aria-live="polite"></div>`;
  };

  ON.renderRelatedOpportunities = async (item) => {
    const container = document.getElementById("related-opportunities");
    if (!container) return;
    try {
      const rows = await ON.fetchOpportunityRows();
      const related = rows
        .filter((row) => row.id !== item.id && row.country === item.country && row.type === item.type)
        .slice(0, 4);
      if (!related.length) return;
      container.innerHTML = `<h2>Related opportunities</h2><div class="related-grid">${related.map(ON.renderOpportunityCard).join("")}</div>`;
    } catch (_) {
      container.innerHTML = "";
    }
  };
})(window.OpportunityNest);
