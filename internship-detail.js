const ON = window.OpportunityNest;

const detailContainer = document.querySelector("#internship-detail");
const detailStatus = document.querySelector("#detail-status");
const params = new URLSearchParams(window.location.search);
const internshipId = params.get("id");

const setStatus = (message, isError = false) => ON.setStatus(detailStatus, message, isError);

const renderDetail = (item) => {
  document.title = `${item.title} | OpportunityNest`;
  ON.updateMetaDescription(`Internship at ${item.organization}: ${(item.description || "").slice(0, 140)}...`);

  const urgency = ON.getDeadlineUrgency(item.deadline);
  const urgencyClass = urgency !== "none" ? ` deadline-${urgency}` : "";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Internship",
    "title": item.title,
    "description": item.description,
    "provider": {
      "@type": "Organization",
      "name": item.organization
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": item.country,
        "addressLocality": item.city || ""
      }
    },
    "employmentType": item.internship_type,
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
      <p class="eyebrow">${ON.escapeHtml(item.organization)}</p>
      <h1>${ON.escapeHtml(item.title)}</h1>
      <p>${ON.escapeHtml(item.description)}</p>
      <div class="hero-actions">
        <a class="button button-primary" href="${ON.escapeHtml(item.official_url)}" target="_blank" rel="noopener noreferrer">Apply Now <span aria-hidden="true">↗</span></a>
        <a class="button button-secondary" href="${ON.escapeHtml(item.official_url)}" target="_blank" rel="noopener noreferrer">Official Website <span aria-hidden="true">↗</span></a>
      </div>
    </div>
    <dl class="detail-grid">
      <div>
        <dt>Location</dt>
        <dd>${ON.escapeHtml([item.city, item.country].filter(Boolean).join(", ") || "Global")}</dd>
      </div>
      <div>
        <dt>Internship Type</dt>
        <dd>${ON.escapeHtml(item.internship_type || "General")}</dd>
      </div>
      <div>
        <dt>Degree Level</dt>
        <dd>${ON.escapeHtml(item.degree_level || "All levels")}</dd>
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
    <p class="microcopy">OpportunityNest summarizes public information and sends applicants to the official program website. Always confirm requirements and deadlines before applying.</p>
  `;
};

const loadInternshipDetail = async () => {
  if (!internshipId) {
    detailContainer.innerHTML = '<p class="empty-state">Missing internship id. Please return to the internships page.</p>';
    setStatus("Missing internship id.", true);
    return;
  }

  detailContainer.innerHTML = ON.renderLoadingSkeleton(1).replace('class="live-opportunity-card', 'class="internship-detail');
  setStatus("Loading internship details...");

  try {
    const { data, error } = await ON.getSupabaseClient()
      .from("internships")
      .select("id,title,organization,country,city,internship_type,degree_level,duration,funding,deadline,official_url,description,logo_url,featured,created_at")
      .eq("id", internshipId)
      .single();

    if (error) throw error;
    renderDetail(data);
    setStatus("Internship details loaded.");
  } catch (error) {
    console.error("Internship detail fetch failed:", error);
    detailContainer.innerHTML = ON.renderErrorWithRetry(
      error.message || "We could not load this internship. Please return to the internships page and try again.",
      "loadInternshipDetail()"
    );
    setStatus(error.message || "We could not load this internship.", true);
  }
};

loadInternshipDetail();
