const ON = window.OpportunityNest;

const detailContainer = document.querySelector("#opportunity-detail");
const detailStatus = document.querySelector("#detail-status");
const params = new URLSearchParams(window.location.search);
const opportunityId = params.get("id");
const pathParts = window.location.pathname.split("/").filter(Boolean);
const opportunitySlug = pathParts[0] === "opportunity" && pathParts[1] ? decodeURIComponent(pathParts[1]) : null;

const setStatus = (message, isError = false) => ON.setStatus(detailStatus, message, isError);

const renderDetail = (item) => {
  const pageTitle = `${item.title} | OpportunityNest`;
  const metaDesc = `${item.type} in ${item.country}: ${item.description.slice(0, 140)}...`;
  const pageUrl = opportunitySlug
    ? `https://opportunitynest.org/opportunity/${encodeURIComponent(item.slug)}/`
    : `https://opportunitynest.org/opportunity-detail.html?id=${encodeURIComponent(item.id)}`;

  document.title = pageTitle;
  ON.updateMetaDescription(metaDesc);

  // Update og:, twitter: tags, and canonical to be specific to this opportunity
  const setMeta = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
  setMeta('meta[property="og:title"]', "content", pageTitle);
  setMeta('meta[property="og:description"]', "content", metaDesc);
  setMeta('meta[property="og:url"]', "content", pageUrl);
  setMeta('meta[name="twitter:title"]', "content", pageTitle);
  setMeta('meta[name="twitter:description"]', "content", metaDesc);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", pageUrl);

  const urgency = ON.getDeadlineUrgency(item.deadline);
  const urgencyClass = urgency !== "none" ? ` deadline-${urgency}` : "";
  const categoryPage = getCategoryPage(item.type);
  const categoryName = item.type.toLowerCase();

  const schemaType = item.type === "Scholarship" ? "Scholarship" : item.type === "Fellowship" ? "Fellowship" : "EducationalOccupationalCredential";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": item.title,
    "description": item.description,
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
    },
    "educationalLevel": item.level,
    "validThrough": item.deadline,
    "url": pageUrl
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);

  detailContainer.innerHTML = `
    <nav class="breadcrumbs" aria-label="Breadcrumb navigation">
      <a href="index.html">Home</a>
      <span aria-hidden="true">/</span>
      <a href="${categoryPage}">${ON.escapeHtml(item.type)}s</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">${ON.escapeHtml(item.title)}</span>
    </nav>
    <div class="detail-header">
      <p class="eyebrow">${ON.escapeHtml(item.type)} • ${ON.escapeHtml(item.country)}</p>
      <h1>${ON.escapeHtml(item.title)}</h1>
      <p>${ON.escapeHtml(item.description)}</p>
      <div class="hero-actions">
        <a class="button button-primary" href="${ON.escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">View &amp; Apply <span aria-hidden="true">↗</span></a>
        <a class="button button-secondary" href="${categoryPage}">Browse more ${ON.escapeHtml(categoryName)}s</a>
      </div>
    </div>
    <dl class="detail-grid">
      <div>
        <dt>Country</dt>
        <dd>${ON.escapeHtml(item.country)}</dd>
      </div>
      <div>
        <dt>Level</dt>
        <dd>${ON.escapeHtml(item.level || "All levels")}</dd>
      </div>
      <div>
        <dt>Field</dt>
        <dd>${ON.escapeHtml(item.field || "Multiple fields")}</dd>
      </div>
      <div>
        <dt>Funding</dt>
        <dd>${ON.escapeHtml(item.funding || "See official listing")}</dd>
      </div>
      <div>
        <dt>Deadline</dt>
        <dd><span class="deadline${urgencyClass}">${ON.escapeHtml(ON.formatDeadline(item.deadline))}</span></dd>
      </div>
      <div>
        <dt>Type</dt>
        <dd>${ON.escapeHtml(item.type)}</dd>
      </div>
    </dl>
    <p class="microcopy">OpportunityNest summarizes public information and sends applicants to the official program website. Always confirm requirements and deadlines before applying.</p>
  `;
};

const getCategoryPage = (type) => {
  if (type === "Scholarship") return "scholarships.html";
  if (type === "Fellowship") return "fellowships.html";
  if (type === "Internship") return "internships.html";
  return "index.html#opportunities";
};

const loadOpportunityDetail = async () => {
  if (!opportunityId) {
    detailContainer.innerHTML = '<p class="empty-state">Missing opportunity id. Return to the listings and try again.</p>';
    setStatus("Missing opportunity id.", true);
    return;
  }

  detailContainer.innerHTML = ON.renderLoadingSkeleton(1).replace('class="live-opportunity-card', 'class="internship-detail');
  setStatus("Loading opportunity details...");

  try {
    const query = ON.getSupabaseClient().from("opportunities").select("id,type,funding,title,country,level,field,deadline,description,link,created_at,slug");
    if (opportunitySlug) {
      query.eq("slug", opportunitySlug);
    } else {
      query.eq("id", opportunityId);
    }
    const { data, error } = await query.single();

    if (error) throw error;
    renderDetail(ON.normalizeOpportunity(data));
    setStatus("Opportunity details loaded.");
  } catch (error) {
    console.error("Opportunity detail fetch failed:", error);
    detailContainer.innerHTML = ON.renderErrorWithRetry(
      error.message || "We could not load this opportunity. Please return to the listings and try again.",
      loadOpportunityDetail
    );
    ON.attachRetryListener(detailContainer, loadOpportunityDetail);
    setStatus(error.message || "We could not load this opportunity.", true);
  }
};

loadOpportunityDetail();
