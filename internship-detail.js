const ON = window.OpportunityNest;

const detailContainer = document.querySelector("#internship-detail");
const detailStatus = document.querySelector("#detail-status");
const params = new URLSearchParams(window.location.search);
const internshipId = params.get("id");

const setStatus = (message, isError = false) => ON.setStatus(detailStatus, message, isError);

const renderDetail = (item) => {
  const pageTitle = `${item.title} | OpportunityNest`;
  const metaDesc = `${item.type} in ${item.country}: ${(item.description || "").slice(0, 140)}...`;
  const pageUrl = `https://opportunitynest.org/opportunity-detail.html?id=${encodeURIComponent(item.id)}`;

  document.title = pageTitle;
  ON.updateMetaDescription(metaDesc);

  // Update og: and twitter: tags
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Internship",
    "title": item.title,
    "description": item.description,
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": item.country
      }
    },
    "validThrough": item.deadline
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);

  detailContainer.innerHTML = `
    <nav class="breadcrumbs" aria-label="Breadcrumb navigation">
      <a href="index.html">Home</a>
      <span aria-hidden="true">/</span>
      <a href="internships.html">Internships</a>
      <span aria-hidden="true">/</span>
      <span aria-current="page">${ON.escapeHtml(item.title)}</span>
    </nav>
    <div class="detail-header">
      <p class="eyebrow">Internship • ${ON.escapeHtml(item.country)}</p>
      <h1>${ON.escapeHtml(item.title)}</h1>
      <p>${ON.escapeHtml(item.description)}</p>
      <div class="hero-actions">
        <a class="button button-primary" href="${ON.escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Apply Now <span aria-hidden="true">↗</span></a>
        <a class="button button-secondary" href="internships.html">Browse more internships</a>
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
    </dl>
    <p class="microcopy">OpportunityNest summarizes public information and sends applicants to the official program website. Always confirm requirements and deadlines before applying.</p>
  `;
};

const loadInternshipDetail = async () => {
  if (!internshipId) {
    detailContainer.innerHTML = '<p class="empty-state">Missing internship id. Return to the listings and try again.</p>';
    setStatus("Missing internship id.", true);
    return;
  }

  detailContainer.innerHTML = ON.renderLoadingSkeleton(1);
  setStatus("Loading internship details...");

  try {
    const { data, error } = await ON.getSupabaseClient()
      .from("opportunities")
      .select("id,type,funding,title,country,level,field,deadline,description,link,created_at")
      .eq("id", internshipId)
      .single();

    if (error) throw error;
    renderDetail(ON.normalizeOpportunity(data));
    setStatus("Internship details loaded.");
  } catch (error) {
    console.error("Internship detail fetch failed:", error);
    detailContainer.innerHTML = ON.renderErrorWithRetry(
      error.message || "We could not load this internship. Please return to the listings and try again.",
      "loadInternshipDetail()"
    );
    setStatus(error.message || "We could not load this internship.", true);
  }
};

loadInternshipDetail();
