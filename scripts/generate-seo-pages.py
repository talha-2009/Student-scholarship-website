#!/usr/bin/env python3
import json
import os
import pathlib
import re
import urllib.request
from datetime import datetime

SITE_URL = "https://opportunitynest.org"
SUPABASE_URL = "https://rveunrzbeynaizitqanx.supabase.co/rest/v1/opportunities"
SUPABASE_KEY = "sb_publishable_i_Hzb5vyGZhjIXWNprJ_Tg_FJTry3DD"
ROOT = pathlib.Path(__file__).resolve().parent.parent
GENERATED_DIRS = [ROOT / "country", ROOT / "scholarships", ROOT / "internships", ROOT / "fellowships", ROOT / "opportunity"]

CATEGORY_TYPES = ["Scholarship", "Internship", "Fellowship", "Competition"]
PAGE_TYPES = {
    "Scholarship": "Scholarships",
    "Internship": "Internships",
    "Fellowship": "Fellowships",
    "Competition": "Competitions"
}

FAQ_TEMPLATES = {
    "Scholarship": [
        {
            "q": "What makes a scholarship listing verified on OpportunityNest?",
            "a": "Each scholarship entry is matched to a public application source and checked for deadline and funding details before it is listed."
        },
        {
            "q": "How do I apply to a scholarship on OpportunityNest?",
            "a": "Click the official application link on the scholarship page to go directly to the program provider."
        },
        {
            "q": "Can I filter scholarships by country and subject?",
            "a": "Yes. Scholarship landing pages include filters and the category search interface lets you narrow results by country, field, and deadline."
        }
    ],
    "Internship": [
        {
            "q": "Are internship opportunities on OpportunityNest paid?",
            "a": "Funding details are shown on the internship page. Some internships are fully funded, while others list stipend or partial support."
        },
        {
            "q": "How often is the internship listing updated?",
            "a": "OpportunityNest refreshes internship listings daily and removes items when the official deadline passes."
        },
        {
            "q": "Can I save internship programs and return later?",
            "a": "Yes. Use the bookmark or details page to keep track of internships you plan to revisit."
        }
    ],
    "Fellowship": [
        {
            "q": "What information is included on a fellowship page?",
            "a": "Each fellowship page includes eligibility, funding, deadline, country, field, application process, and official links."
        },
        {
            "q": "Can I browse fellowships by country?",
            "a": "Yes. Country landing pages group fellowship programs with other opportunity types for that region."
        },
        {
            "q": "Is OpportunityNest responsible for fellowship applications?",
            "a": "No. OpportunityNest only lists opportunities and links to the official application portal."
        }
    ],
    "Competition": [
        {
            "q": "What kinds of competitions are featured on OpportunityNest?",
            "a": "Competition listings include awards, contests, and challenge programs open to students, professionals, and researchers."
        },
        {
            "q": "How can I apply to a competition listed here?",
            "a": "Visit the official competition page through the provided application link and follow the entry instructions."
        },
        {
            "q": "Are competition deadlines kept up to date?",
            "a": "OpportunityNest updates competition deadlines regularly, but always verify the final date on the provider's official page."
        }
    ],
    "Country": [
        {
            "q": "How does OpportunityNest organize country pages?",
            "a": "Country pages gather scholarships, internships, fellowships, and competitions available for that location."
        },
        {
            "q": "Can I find global opportunities on country pages?",
            "a": "Global opportunities are listed on their own landing pages and also appear when no country filter is applied."
        },
        {
            "q": "How are related countries selected?",
            "a": "Related countries are chosen based on available opportunity categories and common student searches."
        }
    ]
}

HEADER_NAV = [
    ("index.html", "Home"),
    ("scholarships.html", "Scholarships"),
    ("internships.html", "Internships"),
    ("fellowships.html", "Fellowships"),
    ("competitions.html", "Competitions"),
    ("about.html", "About"),
    ("contact.html", "Contact"),
    ("faq.html", "FAQ")
]


def slugify(value: str) -> str:
    value = str(value or "").strip().lower()
    value = re.sub(r"[^a-z0-9\s-]", "", value)
    value = re.sub(r"[\s-]+", "-", value)
    return value.strip("-")


def escape_html(value: str) -> str:
    return (str(value or "")
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&#039;"))


def fetch_opportunities() -> list[dict]:
    query = "?select=id,type,funding,title,country,level,field,deadline,deadline_status,description,link,slug,created_at"
    request = urllib.request.Request(f"{SUPABASE_URL}{query}", headers={
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Accept": "application/json"
    })
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def build_breadcrumbs(items: list[tuple[str, str | None]]) -> str:
    parts = []
    for label, href in items:
        if href:
            parts.append(f'<a href="{href}">{escape_html(label)}</a>')
        else:
            parts.append(f'<span aria-current="page">{escape_html(label)}</span>')
    return '<nav class="breadcrumbs" aria-label="Breadcrumb navigation">' + ' <span aria-hidden="true">/</span> '.join(parts) + '</nav>'


def build_nav() -> str:
    return "\n".join([
        f'<a href="{href}">{escape_html(label)}</a>'
        for href, label in HEADER_NAV
    ])


def build_footer() -> str:
    return """<footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <a class="brand" href="index.html">
            <span class="brand-mark" aria-hidden="true">ON</span>
            <span>OpportunityNest.org</span>
          </a>
          <p>The central hub where students discover life-changing opportunities worldwide.</p>
        </div>
        <nav class="footer-links" aria-label="Footer navigation">
          <a href="index.html#opportunities">Opportunities</a>
          <a href="scholarships.html">Scholarships</a>
          <a href="internships.html">Internships</a>
          <a href="fellowships.html">Fellowships</a>
          <a href="competitions.html">Competitions</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
          <a href="faq.html">FAQ</a>
          <a href="privacy.html">Privacy</a>
          <a href="terms.html">Terms</a>
          <a href="disclaimer.html">Disclaimer</a>
        </nav>
      </div>
      <div class="container copyright">
        <p>&copy; 2026 OpportunityNest.org. All rights reserved.</p>
      </div>
    </footer>"""


def page_head(title: str, description: str, url: str, og_image_alt: str, additional_head: str = "") -> str:
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{escape_html(title)}</title>
    <meta name="description" content="{escape_html(description)}">
    <meta name="theme-color" content="#0f766e">
    <link rel="canonical" href="{escape_html(url)}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
    <meta property="og:title" content="{escape_html(title)}">
    <meta property="og:description" content="{escape_html(description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{escape_html(url)}">
    <meta property="og:image" content="{SITE_URL}/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{escape_html(og_image_alt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{escape_html(title)}">
    <meta name="twitter:description" content="{escape_html(description)}">
    <meta name="twitter:image" content="{SITE_URL}/og-image.png">
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-WKVTVB0X4X"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', 'G-WKVTVB0X4X');
    </script>
    <link rel="stylesheet" href="/styles.css">
    {additional_head}
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" aria-label="Primary navigation">
      <nav class="nav container">
        <a class="brand" href="index.html" aria-label="OpportunityNest.org home">
          <span class="brand-mark" aria-hidden="true">ON</span>
          <span>OpportunityNest.org</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu">
          <span class="sr-only">Toggle navigation</span>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="nav-menu" id="nav-menu">
          {build_nav()}
        </div>
      </nav>
    </header>
    <main id="main">
"""


def page_footer(file_script: str = "") -> str:
    script_html = ""
    if file_script:
        script_html = f'    <script src="{file_script}" defer></script>\n'
    return f"""    </main>
    {build_footer()}
    {script_html}  <script src="/nav.js" defer></script>
  </body>
</html>"""


def build_opportunity_card(item: dict, label: str = None) -> str:
    detail_href = item.get("slug") and f"{SITE_URL}/opportunity/{slugify(item['slug'])}/" or f"/opportunity-detail.html?id={escape_html(item['id'])}"
    funding = item.get("funding") or "See official listing"
    return f"""<article class=\"live-opportunity-card compact-card\">
      {country_landmark(item.get('country'))}
      <div class=\"opportunity-card-top\">
        <p class=\"card-kicker\">{escape_html(item.get('type'))} - {country_flag(item.get('country'))} {escape_html(item.get('country'))}</p>
        <span class=\"deadline\">{escape_html(format_deadline(item))}</span>
      </div>
      <h3>{escape_html(item.get('title'))}</h3>
      <ul class=\"card-overview compact-overview\">
        <li><strong>Field:</strong> {escape_html(item.get('field') or 'Multiple fields')}</li>
        <li><strong>Level:</strong> {escape_html(item.get('level') or 'Open to eligible applicants')}</li>
        <li><strong>Funding:</strong> {escape_html(funding)}</li>
      </ul>
      <div class=\"card-actions\">
        <a class=\"button button-secondary\" href=\"{detail_href}\">View Details</a>
        <a class=\"button button-primary\" href=\"{escape_html(item.get('link') or detail_href)}\" target=\"_blank\" rel=\"noopener noreferrer\">Apply Now <span aria-hidden=\"true\">↗</span></a>
      </div>
    </article>"""


def country_flag(value: str) -> str:
    flags = {
        "Australia": "🇦🇺",
        "Austria": "🇦🇹",
        "Canada": "🇨🇦",
        "Germany": "🇩🇪",
        "Switzerland": "🇨🇭",
        "United Kingdom": "🇬🇧",
        "United States": "🇺🇸",
        "Global": "🌍"
    }
    return flags.get(value, "🌍")


def country_landmark(value: str) -> str:
    return ""


def format_deadline(item: dict) -> str:
    deadline = item.get("deadline") or ""
    status = item.get("deadline_status") or "fixed"
    if status != "fixed":
        mapping = {"rolling": "Rolling / Ongoing", "varies": "Varies by provider", "not_announced": "Deadline not announced"}
        return mapping.get(status, "Deadline not announced")
    if not deadline:
        return "Deadline not announced"
    try:
        parsed = datetime.fromisoformat(deadline)
        return parsed.strftime("%d %b %Y")
    except ValueError:
        return deadline


def build_item_list_schema(items: list[dict], page_url: str) -> str:
    elements = []
    for index, item in enumerate(items[:10], 1):
        elements.append({
            "@type": "ListItem",
            "position": index,
            "url": f"{SITE_URL}/opportunity/{slugify(item['slug'])}/"
        })
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "url": page_url,
        "numberOfItems": len(elements),
        "itemListElement": elements
    }, indent=2)


def build_faq_schema(faqs: list[dict]) -> str:
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": faq['q'],
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq['a']
                }
            }
            for faq in faqs
        ]
    }, indent=2)


def write_page(path: pathlib.Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"Wrote {path.relative_to(ROOT)}")


def build_category_page(category: str, items: list[dict], country_counts: dict) -> str:
    title = f"{PAGE_TYPES[category]} | OpportunityNest"
    description = f"Browse verified {category.lower()} programs, funding details, deadlines, and country-specific opportunities on OpportunityNest."
    url = f"{SITE_URL}/{slugify(PAGE_TYPES[category])}.html"
    intro = (
        f"{PAGE_TYPES[category]} on OpportunityNest bring together curated programs from trusted providers across multiple countries. "
        f"Each listing includes a clear deadline, country, eligibility level, and the official application path so you can move from search to application faster."
    )
    breadcrumbs = build_breadcrumbs([("Home", "index.html"), (PAGE_TYPES[category], None)])

    sections = []
    if items:
        sections.append("<div class=\"section-heading\"><p class=\"eyebrow\">Category</p><h1>{}</h1><p>{}</p></div>".format(PAGE_TYPES[category], escape_html(intro)))
        sections.append("<div class=\"related-links\"><p><strong>Top country pages:</strong></p><ul>{}</ul></div>".format(
            "".join([f'<li><a href=\"/{slugify(PAGE_TYPES[category])}/{slugify(country)}/\">{escape_html(country)} {escape_html(PAGE_TYPES[category].rstrip("s"))}</a></li>' for country in sorted({item['country'] for item in items if item.get('country')})][:6])
        ))
        sections.append("<div class=\"opportunity-results grid three\">{} </div>".format("".join(build_opportunity_card(item) for item in items[:12])))
    else:
        sections.append("<div class=\"section-heading\"><p class=\"eyebrow\">Category</p><h1>{}</h1><p>{}</p></div>".format(PAGE_TYPES[category], escape_html(intro)))
        sections.append("<p class=\"empty-state\">No current listings are available for this category.</p>")

    faq = build_faq_schema(FAQ_TEMPLATES[category])
    item_list_schema = build_item_list_schema(items, url)
    breadcrumb_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://opportunitynest.org/"},
            {"@type": "ListItem", "position": 2, "name": PAGE_TYPES[category], "item": url}
        ]
    }, indent=2)

    page = page_head(
      title,
      description,
      url,
      f"OpportunityNest {PAGE_TYPES[category]}",
      additional_head=f"<script type=\"application/ld+json\">{item_list_schema}</script><script type=\"application/ld+json\">{breadcrumb_schema}</script><script type=\"application/ld+json\">{faq}</script>"
    ) + (
      "\n      <section class=\"page-hero section-pad\">\n"
      f"        <div class=\"container\">{breadcrumbs}\n"
      "          <div class=\"section-heading\">\n"
      f"            <p class=\"eyebrow\">Category</p>\n"
      f"            <h1>{escape_html(PAGE_TYPES[category])}</h1>\n"
      f"            <p>{escape_html(intro)}</p>\n"
      "          </div>\n"
      f"          <div class=\"opportunity-status\"><p>{len(items)} listings available.</p></div>\n"
      "        </div>\n"
      "      </section>\n"
      "      <section class=\"section-pad live-opportunities\">\n"
      "        <div class=\"container\">\n"
      f"          {sections[1] if len(sections) > 1 else ''}\n"
      f"          <div class=\"opportunity-results grid three\">{''.join(build_opportunity_card(item) for item in items[:12])}</div>\n"
      "          <div class=\"final-panel\">\n"
      f"            <h2>Why browse {escape_html(PAGE_TYPES[category].lower())} on OpportunityNest?</h2>\n"
      f"            <p>Each {escape_html(category.lower())} listing is organized with deadlines, eligibility guidance, and the official application link in one place. That makes it easier to compare programs and keep your search focused.</p>\n"
      "          </div>\n"
      "        </div>\n"
      "      </section>\n"
    ) + page_footer("/category.js")
    return page


def build_country_page(country: str, items: list[dict], related_countries: list[str]) -> str:
    title = f"{country} Opportunities | OpportunityNest"
    description = f"Discover scholarships, internships, fellowships, and competitions in {country}. Compare deadlines, funding, and eligibility on OpportunityNest."
    path = f"{SITE_URL}/country/{slugify(country)}/"
    breadcrumbs = build_breadcrumbs([("Home", "index.html"), ("Country", "country/index.html"), (country, None)])
    country_items = sorted(items, key=lambda item: item.get('deadline') or '', reverse=False)
    sections = []
    sections.append(f"<div class=\"section-heading\"><p class=\"eyebrow\">Country</p><h1>{escape_html(country)} Opportunities</h1><p>Find scholarships, internships, fellowships, and competitions available for {escape_html(country)}. Each opportunity links to the official application source.</p></div>")
    categories = {category: [item for item in country_items if item.get('type') == category] for category in CATEGORY_TYPES}
    if country_items:
        sections.append("<div class=\"opportunity-results grid three\">" + ''.join(build_opportunity_card(item) for item in country_items[:12]) + "</div>")
    else:
        sections.append("<p class=\"empty-state\">There are no active programs for this country right now.</p>")
    related_html = "".join([f'<li><a href=\"/country/{slugify(name)}/\">{escape_html(name)} opportunities</a></li>' for name in related_countries[:6]])
    faq = build_faq_schema(FAQ_TEMPLATES["Country"])
    item_list_schema = build_item_list_schema(country_items, path)
    breadcrumb_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://opportunitynest.org/"},
            {"@type": "ListItem", "position": 2, "name": "Country", "item": f"{SITE_URL}/country/"},
            {"@type": "ListItem", "position": 3, "name": country, "item": path}
        ]
    }, indent=2)

    page = page_head(
      title,
      description,
      path,
      f"OpportunityNest {country} opportunities",
      additional_head=f"<script type=\"application/ld+json\">{item_list_schema}</script><script type=\"application/ld+json\">{breadcrumb_schema}</script><script type=\"application/ld+json\">{faq}</script>"
    ) + (
      "\n      <section class=\"page-hero section-pad\">\n"
      f"        <div class=\"container\">{breadcrumbs}\n"
      "          <div class=\"section-heading\">\n"
      f"            <p class=\"eyebrow\">Country</p>\n"
      f"            <h1>{escape_html(country)} Opportunities</h1>\n"
      f"            <p>Explore the best scholarships, internships, fellowships, and competitions available for students and professionals in {escape_html(country)}.</p>\n"
      "          </div>\n"
      "          <div class=\"final-panel\">\n"
      f"            <h2>Latest {escape_html(country)} listings</h2>\n"
      f"            <p>Browse current opportunities with active deadlines and clear application links. Use the category sections below to find programs that match your field and level.</p>\n"
      "          </div>\n"
      "        </div>\n"
      "      </section>\n"
      "      <section class=\"section-pad\">\n"
      "        <div class=\"container\">\n"
      f"          <div class=\"final-panel\">\n"
      f"            <h2>Opportunity categories in {escape_html(country)}</h2>\n"
      f"            <ul class=\"benefit-list\">{''.join('<li>' + escape_html(category) + ': ' + str(len(lst)) + ' listings</li>' for category, lst in categories.items() if lst)}</ul>\n"
      "          </div>\n"
      f"          {sections[1]}\n"
      "          <div class=\"final-panel\">\n"
      f"            <h2>Related countries</h2>\n"
      f"            <ul>{related_html}</ul>\n"
      "          </div>\n"
      "        </div>\n"
      "      </section>\n"
    ) + page_footer()
    return page


def build_opportunity_page(item: dict, related_items: list[dict], previous_item: dict | None, next_item: dict | None) -> str:
    title = f"{item['title']} | OpportunityNest"
    description = f"Apply for the {item['title']} in {item['country']}. Funding, deadline, eligibility, and application details for this {item['type'].lower()}."
    page_url = f"{SITE_URL}/opportunity/{slugify(item['slug'])}/"
    breadcrumbs = build_breadcrumbs([("Home", "index.html"), (f"{PAGE_TYPES.get(item['type'], item['type'])}", f"{slugify(PAGE_TYPES.get(item['type'], item['type']))}.html"), (item['title'], None)])
    eligibility = []
    if item.get('level'):
        eligibility.append(f"Level: {item['level']}")
    if item.get('field'):
        eligibility.append(f"Field: {item['field']}")
    if item.get('country'):
        eligibility.append(f"Country: {item['country']}")
    eligibility_html = '<ul>' + ''.join(f'<li>{escape_html(value)}</li>' for value in eligibility) + '</ul>' if eligibility else '<p>Eligibility details are available on the official program page.</p>'
    benefits = item.get('funding') or "Funding information is provided on the official listing page."
    related_html = ''
    if related_items:
        related_html = '<div class="opportunity-results grid three">' + ''.join(build_opportunity_card(rel) for rel in related_items[:4]) + '</div>'
    prevnext_html = ''
    if previous_item or next_item:
        prevnext_html = '<div class="card-actions">'
        if previous_item:
            prevnext_html += f'<a class="button button-secondary" href="{SITE_URL}/opportunity/{slugify(previous_item["slug"])}/">← {escape_html(previous_item["title"])}</a>'
        if next_item:
            prevnext_html += f'<a class="button button-secondary" href="{SITE_URL}/opportunity/{slugify(next_item["slug"])}/">{escape_html(next_item["title"])} →</a>'
        prevnext_html += '</div>'

    related_country_links = '<ul>' + ''.join(f'<li><a href="/country/{slugify(country)}/">More opportunities in {escape_html(country)}</a></li>' for country in {item['country']} if country) + '</ul>'
    item_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "EducationalOccupationalProgram" if item['type'] != 'Competition' else "Course",
        "name": item['title'],
        "description": item['description'],
        "url": page_url,
        "provider": {
            "@type": "Organization",
            "name": item['country']
        },
        "educationalCredentialAwarded": item['type'],
        "learningResourceType": item['type'],
        "timeRequired": item['deadline'] or 'Varies'
    }, indent=2)
    article_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": item['title'],
        "description": description,
        "url": page_url,
        "datePublished": item['created_at'] or datetime.utcnow().isoformat(),
        "author": {"@type": "Organization", "name": "OpportunityNest"}
    }, indent=2)
    breadcrumb_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://opportunitynest.org/"},
            {"@type": "ListItem", "position": 2, "name": PAGE_TYPES.get(item['type'], item['type']), "item": f"{SITE_URL}/{slugify(PAGE_TYPES.get(item['type'], item['type']))}.html"},
            {"@type": "ListItem", "position": 3, "name": item['title'], "item": page_url}
        ]
    }, indent=2)
    faq = build_faq_schema([
        {"q": "How do I apply for this opportunity?", "a": "Use the official application button on this page to visit the provider's website and confirm the latest requirements."},
        {"q": "How current is this information?", "a": "OpportunityNest displays the latest available public details, but always verify deadlines and eligibility on the official program page."},
        {"q": "Is this opportunity fully funded?", "a": f"Funding details are shown here as: {escape_html(benefits)}. The official program page has the final funding terms."
        }
    ])

    page = page_head(
        title,
        description,
        page_url,
        item['title'],
        additional_head=f"<script type=\"application/ld+json\">{item_schema}</script><script type=\"application/ld+json\">{article_schema}</script><script type=\"application/ld+json\">{breadcrumb_schema}</script><script type=\"application/ld+json\">{faq}</script>"
    ) + (
        "\n      <section class=\"page-hero section-pad\">\n"
        f"        <div class=\"container\">{breadcrumbs}\n"
        "          <div class=\"detail-header\">\n"
        f"            <p class=\"eyebrow\">{escape_html(item['type'])} • {escape_html(item['country'])}</p>\n"
        f"            <h1>{escape_html(item['title'])}</h1>\n"
        f"            <p>{escape_html(item['description'])}</p>\n"
        "            <div class=\"hero-actions\">\n"
        f"              <a class=\"button button-primary\" href=\"{escape_html(item['link'])}\" target=\"_blank\" rel=\"noopener noreferrer\">View &amp; Apply <span aria-hidden=\"true\">↗</span></a>\n"
        f"              <a class=\"button button-secondary\" href=\"{SITE_URL}/{slugify(PAGE_TYPES.get(item['type'], item['type']))}.html\">Back to {escape_html(PAGE_TYPES.get(item['type'], item['type']))}</a>\n"
        "            </div>\n"
        "          </div>\n"
        "        </div>\n"
        "      </section>\n"
        "      <section class=\"section-pad\">\n"
        "        <div class=\"container internship-detail\">\n"
        "          <div class=\"detail-grid\">\n"
        f"            <div><dt>Country</dt><dd>{escape_html(item['country'])}</dd></div>\n"
        f"            <div><dt>Field</dt><dd>{escape_html(item['field'] or 'Multiple fields')}</dd></div>\n"
        f"            <div><dt>Level</dt><dd>{escape_html(item['level'] or 'Open to eligible applicants')}</dd></div>\n"
        f"            <div><dt>Funding</dt><dd>{escape_html(benefits)}</dd></div>\n"
        f"            <div><dt>Deadline</dt><dd>{escape_html(format_deadline(item))}</dd></div>\n"
        f"            <div><dt>Type</dt><dd>{escape_html(item['type'])}</dd></div>\n"
        "          </div>\n"
        "          <div class=\"final-panel\">\n"
        "            <h2>Eligibility</h2>\n"
        f"            {eligibility_html}\n"
        "          </div>\n"
        "          <div class=\"final-panel\">\n"
        "            <h2>Benefits</h2>\n"
        f"            <p>{escape_html(benefits)}</p>\n"
        "          </div>\n"
        "          <div class=\"final-panel\">\n"
        "            <h2>Application Process</h2>\n"
        "            <p>Follow the official program link and confirm the application requirements, deadline, and supporting documents before submitting.</p>\n"
        "          </div>\n"
        "          <div class=\"final-panel\">\n"
        "            <h2>Share this opportunity</h2>\n"
        "            <div class=\"card-actions\">\n"
        f"              <a class=\"button button-secondary\" href=\"https://twitter.com/intent/tweet?text={escape_html(item['title'])}+-+{escape_html(page_url)}\" target=\"_blank\" rel=\"noopener noreferrer\">Share on Twitter</a>\n"
        f"              <a class=\"button button-secondary\" href=\"mailto:?subject={escape_html(item['title'])}&body={escape_html(page_url)}\">Email link</a>\n"
        "            </div>\n"
        "          </div>\n"
        f"          {prevnext_html}\n"
        "          <div class=\"final-panel\">\n"
        "            <h2>Related opportunities</h2>\n"
        f"            {related_html if related_html else '<p>Explore similar landing pages for opportunities in the same country or category.</p>'}\n"
        "          </div>\n"
        "        </div>\n"
        "      </section>\n"
    ) + page_footer()
    return page


def build_page_url(path: str) -> str:
    return f"{SITE_URL}/{path.lstrip('/') }"


def build_sitemap(entries: list[dict]) -> str:
    lines = ["<?xml version=\"1.0\" encoding=\"UTF-8\"?>", '<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">']
    for entry in entries:
        lines.append("  <url>")
        lines.append(f"    <loc>{escape_html(entry['loc'])}</loc>")
        if entry.get('lastmod'):
            lines.append(f"    <lastmod>{entry['lastmod']}</lastmod>")
        if entry.get('changefreq'):
            lines.append(f"    <changefreq>{entry['changefreq']}</changefreq>")
        if entry.get('priority') is not None:
            lines.append(f"    <priority>{entry['priority']:.1f}</priority>")
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines)


def main():
    opportunities = fetch_opportunities()
    opportunities = [op for op in opportunities if op.get('title')]
    for op in opportunities:
        if not op.get('slug'):
            op['slug'] = slugify(f"{op['title']} {op.get('country','')}")[:95]
    opportunities.sort(key=lambda op: (op.get('type') or '', op.get('country') or '', op.get('title') or ''))

    country_groups = {}
    category_groups = {cat: [] for cat in CATEGORY_TYPES}
    for item in opportunities:
        country = item.get('country') or 'Global'
        country_groups.setdefault(country, []).append(item)
        if item.get('type') in CATEGORY_TYPES:
            category_groups[item['type']].append(item)

    # Generate category and country pages
    for category, items in category_groups.items():
        if category == 'Competition' and not items:
            continue
        page_file = ROOT / f"{slugify(PAGE_TYPES[category])}.html"
        content = build_category_page(category, items, {})
        write_page(page_file, content)

    country_names = sorted(country_groups.keys())
    for country, items in country_groups.items():
        related = [name for name in country_names if name != country][:6]
        path = ROOT / "country" / slugify(country) / "index.html"
        content = build_country_page(country, items, related)
        write_page(path, content)

    # Generate category-country pages for available combinations
    for category, items in category_groups.items():
        available_countries = sorted({item['country'] for item in items if item.get('country')})
        for country in available_countries:
            folder = ROOT / slugify(PAGE_TYPES[category]) / slugify(country)
            page = folder / "index.html"
            title = f"{country} {PAGE_TYPES[category]} | OpportunityNest"
            description = f"Find {category.lower()} opportunities in {country}. Published deadlines, funding, and application links for {category.lower()}s in {country}."
            url = f"{SITE_URL}/{slugify(PAGE_TYPES[category])}/{slugify(country)}/"
            items_for_page = [item for item in items if item.get('country') == country]
            # Simple country-category page generation
            breadcrumbs = build_breadcrumbs([("Home", "index.html"), (PAGE_TYPES[category], f"{slugify(PAGE_TYPES[category])}.html"), (country, None)])
            item_list_schema = build_item_list_schema(items_for_page, url)
            breadcrumb_schema = json.dumps({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://opportunitynest.org/"},
                    {"@type": "ListItem", "position": 2, "name": PAGE_TYPES[category], "item": f"{SITE_URL}/{slugify(PAGE_TYPES[category])}.html"},
                    {"@type": "ListItem", "position": 3, "name": country, "item": url}
                ]
            }, indent=2)
            faq = build_faq_schema([
                {"q": f"What kinds of {category.lower()}s are available in {country}?", "a": f"This page lists current {category.lower()}s open to applicants in {country}."},
                {"q": "How do I know if a listing is still active?", "a": "Check the deadline field and visit the official application page to confirm the latest status."},
                {"q": "Can I browse other countries?", "a": "Yes — use the country navigation links at the bottom of the page to discover similar programs in other regions."}
            ])
            listing_html = '<div class="opportunity-results grid three">' + ''.join(build_opportunity_card(item) for item in items_for_page[:12]) + '</div>'
            content = page_head(title, description, url, f"{country} {PAGE_TYPES[category]}", additional_head=f"<script type=\"application/ld+json\">{item_list_schema}</script><script type=\"application/ld+json\">{breadcrumb_schema}</script><script type=\"application/ld+json\">{faq}</script>") + f"\n      <section class=\"page-hero section-pad\">\n        <div class=\"container\">{breadcrumbs}\n          <div class=\"section-heading\">\n            <p class=\"eyebrow\">Category</p>\n            <h1>{escape_html(country)} {escape_html(PAGE_TYPES[category])}</h1>\n            <p>Browse verified {category.lower()} listings for {escape_html(country)} with funding and deadline details in one place.</p>\n          </div>\n        </div>\n      </section>\n      <section class=\"section-pad live-opportunities\">\n        <div class=\"container\">\n          {listing_html}\n        </div>\n      </section>\n" + page_footer("/category.js")
            write_page(page, content)

    # Generate opportunity pages
    all_opportunities = [item for item in opportunities if item.get('slug')]
    for index, item in enumerate(all_opportunities):
        slug = slugify(item['slug'])
        folder = ROOT / "opportunity" / slug
        path = folder / "index.html"
        related = [x for x in opportunities if x['id'] != item['id'] and (x['country'] == item['country'] or x['type'] == item['type'])][:4]
        previous_item = all_opportunities[index - 1] if index > 0 else None
        next_item = all_opportunities[index + 1] if index < len(all_opportunities) - 1 else None
        content = build_opportunity_page(item, related, previous_item, next_item)
        write_page(path, content)

    # Generate sitemap
    sitemap_entries = [
        {"loc": f"{SITE_URL}/", "changefreq": "daily", "priority": 1.0},
        {"loc": f"{SITE_URL}/scholarships.html", "changefreq": "daily", "priority": 0.9},
        {"loc": f"{SITE_URL}/internships.html", "changefreq": "daily", "priority": 0.9},
        {"loc": f"{SITE_URL}/fellowships.html", "changefreq": "daily", "priority": 0.9},
        {"loc": f"{SITE_URL}/competitions.html", "changefreq": "daily", "priority": 0.8},
        {"loc": f"{SITE_URL}/about.html", "changefreq": "monthly", "priority": 0.7},
        {"loc": f"{SITE_URL}/contact.html", "changefreq": "monthly", "priority": 0.6},
        {"loc": f"{SITE_URL}/faq.html", "changefreq": "monthly", "priority": 0.6},
        {"loc": f"{SITE_URL}/privacy.html", "changefreq": "yearly", "priority": 0.5},
        {"loc": f"{SITE_URL}/terms.html", "changefreq": "yearly", "priority": 0.5},
        {"loc": f"{SITE_URL}/disclaimer.html", "changefreq": "yearly", "priority": 0.5}
    ]
    for country in country_groups:
        sitemap_entries.append({"loc": f"{SITE_URL}/country/{slugify(country)}/", "changefreq": "weekly", "priority": 0.7})
    for category, items in category_groups.items():
        sitemap_entries.append({"loc": f"{SITE_URL}/{slugify(PAGE_TYPES[category])}.html", "changefreq": "weekly", "priority": 0.8})
        for country in sorted({item['country'] for item in items if item.get('country')}):
            sitemap_entries.append({"loc": f"{SITE_URL}/{slugify(PAGE_TYPES[category])}/{slugify(country)}/", "changefreq": "weekly", "priority": 0.7})
    for item in opportunities:
        if item.get('slug'):
            sitemap_entries.append({"loc": f"{SITE_URL}/opportunity/{slugify(item['slug'])}/", "lastmod": (item.get('created_at') or datetime.utcnow().date().isoformat()), "changefreq": "weekly", "priority": 0.8})
    sitemap = build_sitemap(sitemap_entries)
    write_page(ROOT / "sitemap.xml", sitemap)

    print("Generated SEO pages and sitemap.")


if __name__ == '__main__':
    main()
