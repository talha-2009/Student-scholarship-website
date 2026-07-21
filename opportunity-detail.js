const ON = window.OpportunityNest;

const detailContainer = document.querySelector("#opportunity-detail");
const detailStatus = document.querySelector("#detail-status");
const params = new URLSearchParams(window.location.search);
const opportunityId = params.get("id");
const pathParts = window.location.pathname.split("/").filter(Boolean);
const opportunitySlug = pathParts[0] === "opportunity" && pathParts[1]
  ? ON.cleanSlug(decodeURIComponent(pathParts[1]))
  : null;

const setStatus = (message, isError = false) => ON.setStatus(detailStatus, message, isError);

const renderDetail = (item) => {
  const pageTitle = ON.generateSEOTitle(item);
  const metaDesc = ON.generateSEODescription(item);
  const pageUrl = window.location.href;

  document.title = pageTitle;
  ON.updateMetaDescription(metaDesc);

  // Update og:, twitter: tags, and canonical to be specific to this opportunity
  const setMeta = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
  setMeta('meta[property="og:title"]', "content", pageTitle);
  setMeta('meta[property="og:description"]', "content", metaDesc);
  setMeta('meta[property="og:url"]', "content", pageUrl);
  setMeta('meta[property="og:type"]', "content", "article");
  setMeta('meta[property="og:image:alt"]', "content", ON.generateImageAlt(item));
  setMeta('meta[name="twitter:title"]', "content", pageTitle);
  setMeta('meta[name="twitter:description"]', "content", metaDesc);
  // Update canonical — use the clean canonical path, not query-string URLs
  const canonicalUrl = ON.getOpportunityUrl(item);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", canonicalUrl);

  const urgency = ON.getDeadlineUrgency(item);
  const urgencyClass = urgency !== "none" ? ` deadline-${urgency}` : "";
  const categoryPage = getCategoryPage(item.type);

  const structuredData = ON.generateStructuredData(item, pageUrl);
  const breadcrumbSchema = ON.generateBreadcrumbSchema([
    { name: "Home", url: "https://www.opportunitynest.org/" },
    { name: `${item.type}s`, url: `https://www.opportunitynest.org${categoryPage}` },
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

  detailContainer.innerHTML = ON.renderDetailContent(item, urgencyClass, categoryPage, item.type);

  // Inject AdSense ad after main content (before related opportunities)
  const relatedDiv = document.getElementById('related-opportunities');
  if (relatedDiv) {
    const adEl = document.createElement('div');
    adEl.className = 'ad-container';
    adEl.setAttribute('aria-label', 'Advertisement');
    adEl.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4182963907868663" data-ad-slot="3000000001" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    relatedDiv.parentNode.insertBefore(adEl, relatedDiv);
    if (window.adsbygoogle) { ON.pushAd('.ad-container ins.adsbygoogle'); }
  }
  
  // Load related opportunities
  ON.renderRelatedOpportunities(item);
};

const getCategoryPage = (type) => {
  if (type === "Scholarship") return "/scholarships/";
  if (type === "Fellowship") return "/fellowships/";
  if (type === "Internship") return "/internships/";
  return "/#opportunities";
};

const loadOpportunityDetail = async () => {
  if (!opportunityId && !opportunitySlug) {
    window.location.replace("/404.html");
    return;
  }

  detailContainer.innerHTML = ON.renderLoadingSkeleton(1).replace('class="live-opportunity-card', 'class="internship-detail');
  setStatus("Loading opportunity details...");

  try {
    const query = ON.getSupabaseClient().from("opportunities").select("id,type,funding,title,country,level,field,deadline,deadline_status,description,link,created_at,slug");
    if (opportunitySlug) {
      query.eq("slug", opportunitySlug);
    } else {
      query.eq("id", opportunityId);
    }
    const { data, error } = await query.single();

    if (error && error.code === "PGRST116") {
      window.location.replace("/404.html");
      return;
    }
    if (error) throw error;
    const item = ON.normalizeOpportunity(data);

    if (!item || ON.getDeadlineUrgency(item) === "expired") {
      window.location.replace("/404.html");
      return;
    }

    const canonicalPath = ON.getOpportunityPath(item);
    if (window.location.pathname !== canonicalPath) {
      window.history.replaceState({}, "", canonicalPath);
    }

    renderDetail(item);
    setStatus("Opportunity details loaded.");
  } catch (error) {
    console.error("Opportunity detail fetch failed:", error);
    detailContainer.innerHTML = ON.renderErrorWithRetry(
      error.message || "We could not load this opportunity. Please return to the listings and try again.",
      "loadOpportunityDetail()"
    );
    setStatus(error.message || "We could not load this opportunity.", true);
  }
};

loadOpportunityDetail();
