const ON = window.OpportunityNest;

const detailContainer = document.querySelector("#internship-detail");
const detailStatus = document.querySelector("#detail-status");
const params = new URLSearchParams(window.location.search);
const internshipId = params.get("id");

const setStatus = (message, isError = false) => ON.setStatus(detailStatus, message, isError);

const renderDetail = (item) => {
  const pageTitle = ON.generateSEOTitle(item);
  const metaDesc = ON.generateSEODescription(item);
  const pageUrl = window.location.href;

  document.title = pageTitle;
  ON.updateMetaDescription(metaDesc);

  // Update og: and twitter: tags
  const setMeta = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
  setMeta('meta[property="og:title"]', "content", pageTitle);
  setMeta('meta[property="og:description"]', "content", metaDesc);
  setMeta('meta[property="og:url"]', "content", pageUrl);
  setMeta('meta[property="og:image:alt"]', "content", ON.generateImageAlt(item));
  setMeta('meta[name="twitter:title"]', "content", pageTitle);
  setMeta('meta[name="twitter:description"]', "content", metaDesc);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", pageUrl);

  const urgency = ON.getDeadlineUrgency(item);
  const urgencyClass = urgency !== "none" ? ` deadline-${urgency}` : "";

  const structuredData = ON.generateStructuredData(item, pageUrl);
  const breadcrumbSchema = ON.generateBreadcrumbSchema([
    { name: "Home", url: "https://www.opportunitynest.org/" },
    { name: "Internships", url: "https://www.opportunitynest.org/internships/" },
    { name: item.title, url: pageUrl }
  ]);

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);

  const breadcrumbScript = document.createElement("script");
  breadcrumbScript.type = "application/ld+json";
  breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);
  document.head.appendChild(breadcrumbScript);

  const faqSchema = ON.generateFAQSchema(item);
  const faqScript = document.createElement("script");
  faqScript.type = "application/ld+json";
  faqScript.textContent = JSON.stringify(faqSchema);
  document.head.appendChild(faqScript);

  detailContainer.innerHTML = ON.renderDetailContent(item, urgencyClass, "/internships/", "internship");

  // Inject AdSense ad after main content (before related opportunities)
  const relatedDiv = document.getElementById('related-opportunities');
  if (relatedDiv) {
    const adEl = document.createElement('div');
    adEl.className = 'ad-container';
    adEl.setAttribute('aria-label', 'Advertisement');
    adEl.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4182963907868663" data-ad-slot="3000000002" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    relatedDiv.parentNode.insertBefore(adEl, relatedDiv);
    if (window.adsbygoogle) { ON.pushAd('.ad-container ins.adsbygoogle'); }
  }
  
  // Load related opportunities
  ON.renderRelatedOpportunities(item);
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
      .from("internships")
      .select("id,title,organization,country,city,internship_type,degree_level,duration,funding,deadline,official_url,description,logo_url,featured,created_at")
      .eq("id", internshipId)
      .single();

    if (error) throw error;
    renderDetail(ON.mapInternshipToOpportunity(data));
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
