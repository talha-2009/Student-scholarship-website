// â”€â”€â”€ Logo injection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Replace the "ON" text brand-mark with the SVG logo on every page.
// Determine the correct relative path based on current page location.
(function injectLogo() {
  const marks = document.querySelectorAll(".brand-mark");
  if (!marks.length) return;

  // Use an absolute asset path so the logo also works on nested generated pages.
  marks.forEach((el) => {
    el.textContent = "";
    const img = document.createElement("img");
    img.src = "/logo.svg";
    img.alt = "";
    img.width = 38;
    img.height = 38;
    img.setAttribute("aria-hidden", "true");
    img.setAttribute("decoding", "async");
    el.appendChild(img);
  });

  // Prefer the SVG favicon in modern browsers (falls back to existing .ico)
  if (!document.querySelector('link[type="image/svg+xml"]')) {
    const svgFav = document.createElement("link");
    svgFav.rel = "icon";
    svgFav.type = "image/svg+xml";
    svgFav.href = "/favicon.svg";
    document.head.prepend(svgFav);
  }
})();

// â”€â”€â”€ Navigation architecture â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#nav-menu");
const MOBILE_NAV_BREAKPOINT = 767;

const megaMenuData = {
  "Study Abroad": [
    {
      title: "Top Destinations",
      icon: "",
      links: [
        ["Study in UK", "/study-in-uk/"],
        ["Study in USA", "/study-in-usa/"],
        ["Study in Canada", "/study-in-canada/"],
        ["Study in Australia", "/study-in-australia/"],
        ["Study in Germany", "/study-in-germany/"],
        ["Study in Europe", "/study-in-europe/"]
      ]
    }
  ],
  Scholarships: [
    {
      title: "Scholarship Types",
      icon: "",
      links: [
        ["Fully Funded Scholarships", "/fully-funded-scholarships/"],
        ["Undergraduate Scholarships", "/undergraduate-scholarships/"],
        ["Master's Scholarships", "/masters-scholarships/"],
        ["PhD Scholarships", "/phd-scholarships/"],
        ["Government Scholarships", "/government-scholarships/"]
      ]
    }
  ],
  Internships: [
    {
      title: "Internship Types",
      icon: "",
      links: [
        ["Paid Internships", "/paid-internships/"],
        ["Remote Internships", "/remote-internships/"],
        ["Summer Internships", "/summer-internships/"],
        ["International Internships", "/international-internships/"]
      ]
    }
  ],
  Fellowships: [
    {
      title: "Fellowship Types",
      icon: "",
      links: [
        ["Fully Funded Fellowships", "/fully-funded-fellowships/"],
        ["Research Fellowships", "/research-fellowships/"],
        ["Leadership Fellowships", "/leadership-fellowships/"]
      ]
    }
  ],
  Competitions: [
    {
      title: "Competition Types",
      icon: "",
      links: [
        ["Programming Competitions", "/programming-competitions/"],
        ["AI Competitions", "/ai-competitions/"],
        ["Business Competitions", "/business-competitions/"],
        ["Essay Competitions", "/essay-competitions/"]
      ]
    }
  ],
  "Youth Programs": [
    {
      title: "Program Types",
      icon: "ðŸ¤",
      links: [
        ["Leadership Programs", "/leadership-programs/"],
        ["Volunteer Programs", "/volunteer-programs/"],
        ["Exchange Programs", "/exchange-programs/"],
        ["Cultural Programs", "/cultural-programs/"],
        ["Leadership Camps", "/leadership-camps/"],
        ["Global Conferences", "/global-conferences/"]
      ]
    },
    {
      title: "Explore More",
      icon: "ðŸŒ±",
      links: [
        ["Youth Programs Feed", "/?type=Youth+Program#opportunities"],
        ["Research Opportunities", "/research-opportunities/"],
        ["Conferences", "/conferences/"],
        ["Grants", "/grants/"]
      ]
    }
  ],
  Blog: [
    {
      title: "Scholarship Advice",
      icon: "ðŸ“",
      links: [
        ["Fully Funded Scholarships", "/blog/top-fully-funded-scholarships.html"],
        ["Scholarship Interview Tips", "/blog/how-to-ace-scholarship-interview.html"],
        ["Winning Scholarship Essays", "/blog/how-to-write-winning-scholarship-essay.html"],
        ["Scholarships Without IELTS", "/guides/scholarships-without-ielts.html"]
      ]
    },
    {
      title: "Application Help",
      icon: "ðŸ’¡",
      links: [
        ["Statement of Purpose", "/guides/how-to-write-sop.html"],
        ["Personal Statement", "/guides/personal-statement.html"],
        ["Motivation Letter", "/guides/motivation-letter.html"],
        ["CV Writing", "/guides/cv-writing.html"],
        ["Application Checklist", "/guides/application-checklist.html"]
      ]
    }
  ],
  "Resource Center": [
    {
      title: "Application Guides",
      icon: "âœŽ",
      links: [
        ["How to Write an SOP", "/guides/how-to-write-sop.html"],
        ["SOP Examples", "/guides/sop-examples.html"],
        ["Personal Statement", "/guides/personal-statement.html"],
        ["Motivation Letter", "/guides/motivation-letter.html"],
        ["Cover Letter Guide", "/guides/cover-letter.html"],
        ["CV Writing Guide", "/guides/cv-writing.html"]
      ]
    },
    {
      title: "Scholarship Guides",
      icon: "ðŸŽ“",
      links: [
        ["Fully Funded Scholarships", "/blog/top-fully-funded-scholarships.html"],
        ["Without IELTS", "/guides/scholarships-without-ielts.html"],
        ["Masters Scholarships", "/guides/masters-scholarships.html"],
        ["PhD Scholarships", "/guides/phd-scholarships.html"],
        ["Government Scholarships", "/guides/government-scholarships.html"],
        ["University Scholarships", "/guides/university-scholarships.html"]
      ]
    },
    {
      title: "Internship Guides",
      icon: "ðŸ’¼",
      links: [
        ["How to Get an Internship", "/guides/how-to-get-internship.html"],
        ["Application Guide", "/guides/internship-application.html"],
        ["Internship Resume", "/guides/internship-resume.html"],
        ["Interview Questions", "/guides/internship-interview.html"],
        ["Remote Internships", "/guides/remote-internships.html"],
        ["Paid Internships", "/guides/paid-internships.html"]
      ]
    },
    {
      title: "Study Abroad",
      icon: "ðŸŒ",
      links: [
        ["Study in USA", "/guides/study-in-usa.html"],
        ["Study in Canada", "/guides/study-in-canada.html"],
        ["Study in UK", "/guides/study-in-uk.html"],
        ["Study in Germany", "/guides/study-in-germany.html"],
        ["Study in Australia", "/guides/study-in-australia.html"],
        ["Student Visa Guide", "/guides/student-visa.html"]
      ]
    },
    {
      title: "Career Resources",
      icon: "ðŸ“š",
      links: [
        ["Career Planning", "/guides/career-planning.html"],
        ["LinkedIn Optimization", "/guides/linkedin-profile.html"],
        ["Networking Guide", "/guides/networking.html"],
        ["Online Certifications", "/guides/online-certifications.html"],
        ["Best Skills for Students", "/guides/best-skills.html"],
        ["Research Opportunities", "/guides/research-opportunities.html"]
      ]
    },
    {
      title: "Tests and Funding",
      icon: "ðŸ’°",
      links: [
        ["IELTS Guide", "/guides/ielts-guide.html"],
        ["TOEFL Guide", "/guides/toefl-guide.html"],
        ["GRE Guide", "/guides/gre-guide.html"],
        ["GMAT Guide", "/guides/gmat-guide.html"],
        ["Fellowships", "/fellowships.html"],
        ["Grants", "/guides/grants.html"]
      ]
    }
  ]
};

const navItems = [
  { label: "Study Abroad", href: "/study-in-uk/", sections: megaMenuData["Study Abroad"] },
  { label: "Scholarships", href: "/scholarships.html", sections: megaMenuData.Scholarships },
  { label: "Internships", href: "/internships.html", sections: megaMenuData.Internships },
  { label: "Fellowships", href: "/fellowships.html", sections: megaMenuData.Fellowships },
  { label: "Competitions", href: "/competitions.html", sections: megaMenuData.Competitions },
  { label: "Youth Programs", href: "/?type=Youth+Program#opportunities", sections: megaMenuData["Youth Programs"] },
  { label: "Blog", href: "/blog/", sections: megaMenuData.Blog },
  { label: "Resource Center", href: "/guides/application-checklist.html", sections: megaMenuData["Resource Center"] }
];

const isMobileNav = () => window.matchMedia(`(max-width: ${MOBILE_NAV_BREAKPOINT}px)`).matches;

const createMegaColumn = ({ title, icon, links }) => {
  const column = document.createElement("section");
  column.className = "mega-column";

  const heading = document.createElement("h3");
  const iconSpan = document.createElement("span");
  iconSpan.className = "mega-column-icon";
  iconSpan.setAttribute("aria-hidden", "true");
  iconSpan.textContent = icon;
  heading.append(iconSpan, document.createTextNode(` ${title}`));
  column.appendChild(heading);

  const list = document.createElement("ul");
  links.forEach(([label, href]) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    item.appendChild(link);
    list.appendChild(item);
  });
  column.appendChild(list);
  return column;
};

const createMegaItem = ({ label, href, sections }) => {
  const item = document.createElement("div");
  item.className = "nav-item has-mega";

  const trigger = document.createElement("a");
  trigger.href = href;
  trigger.className = "nav-link mega-trigger";
  trigger.setAttribute("aria-haspopup", "true");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-label", `${label} menu`);

  const triggerLabel = document.createElement("span");
  triggerLabel.textContent = label;

  const caret = document.createElement("span");
  caret.className = "nav-caret";
  caret.setAttribute("aria-hidden", "true");

  trigger.append(triggerLabel, caret);

  const dropdown = document.createElement("div");
  dropdown.className = "mega-menu";
  dropdown.setAttribute("role", "group");
  dropdown.setAttribute("aria-label", `${label} links`);
  dropdown.append(...sections.map(createMegaColumn));

  item.append(trigger, dropdown);
  return item;
};

const buildNavigation = () => {
  if (!navMenu) return;

  navMenu.textContent = "";
  navMenu.dataset.navBuilt = "true";

  navItems.forEach((item) => {
    navMenu.appendChild(createMegaItem(item));
  });

  const cta = document.createElement("a");
  cta.href = "/#opportunities";
  cta.className = "button button-primary nav-cta";
  cta.textContent = "Explore Opportunities";
  navMenu.appendChild(cta);
};

const closeMegaMenu = (item) => {
  if (!item) return;
  item.classList.remove("is-open");
  item.querySelector(".mega-trigger")?.setAttribute("aria-expanded", "false");
};

const closeAllMegaMenus = (exceptItem = null) => {
  navMenu?.querySelectorAll(".nav-item.has-mega.is-open").forEach((item) => {
    if (item !== exceptItem) closeMegaMenu(item);
  });
};

const openMegaMenu = (item) => {
  if (!item) return;
  closeAllMegaMenus(item);
  item.classList.add("is-open");
  item.querySelector(".mega-trigger")?.setAttribute("aria-expanded", "true");
};

const closeNav = () => {
  if (!navToggle || !navMenu) return;
  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  closeAllMegaMenus();
};

const setupNavigationInteractions = () => {
  if (!navMenu) return;

  navMenu.querySelectorAll(".nav-item.has-mega").forEach((item) => {
    const trigger = item.querySelector(".mega-trigger");
    if (!trigger) return;

    item.addEventListener("pointerenter", () => {
      if (!isMobileNav()) openMegaMenu(item);
    });

    item.addEventListener("pointerleave", () => {
      if (!isMobileNav()) closeMegaMenu(item);
    });

    item.addEventListener("focusin", () => {
      if (!isMobileNav()) openMegaMenu(item);
    });

    item.addEventListener("focusout", (event) => {
      if (!item.contains(event.relatedTarget)) closeMegaMenu(item);
    });

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (item.classList.contains("is-open")) {
        closeMegaMenu(item);
        return;
      }
      openMegaMenu(item);
    });
  });

  navMenu.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest("a");
    if (!link) return;

    if (isMobileNav() && link.classList.contains("mega-trigger")) {
      return;
    }

    closeNav();
  });

  document.addEventListener("click", (event) => {
    if (!navMenu || !(event.target instanceof Node)) return;
    if (!navMenu.contains(event.target) && !navToggle?.contains(event.target)) {
      closeAllMegaMenus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
      navToggle?.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (!isMobileNav()) {
      navMenu?.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    }
    closeAllMegaMenus();
  });

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navMenu.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("nav-open", !isOpen);
      if (isOpen) {
        closeAllMegaMenus();
      }
    });
  }
};

if (navMenu) {
  buildNavigation();
  setupNavigationInteractions();
  window.closeNav = closeNav;
}

// â”€â”€â”€ Footer SEO: enhance footer with additional internal links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
(function enhanceFooter() {
  const footerNav = document.querySelector(".footer-links");
  if (!footerNav) return;

  // Only add extra links if they are not already present
  if (footerNav.querySelector("[data-seo-enhanced]")) return;

  const extraLinks = [
    { href: "/fully-funded-scholarships/", text: "Fully Funded" },
    { href: "/masters-scholarships/", text: "Master's Scholarships" },
    { href: "/phd-scholarships/", text: "PhD Scholarships" },
    { href: "/undergraduate-scholarships/", text: "Undergraduate" },
    { href: "/country/united-kingdom/", text: "Study in UK" },
    { href: "/country/germany/", text: "Study in Germany" },
    { href: "/country/united-states/", text: "Study in US" },
    { href: "/country/canada/", text: "Study in Canada" },
    { href: "/country/australia/", text: "Study in Australia" },
    { href: "/blog/", text: "Blog" },
    { href: "/editorial-policy.html", text: "Editorial Policy" },
    { href: "/fact-checking-policy.html", text: "Fact Checking" },
    { href: "/verification-process.html", text: "Verification Process" }
  ];

  extraLinks.forEach(function(link) {
    // Don't duplicate if already present
    if (footerNav.querySelector('a[href="' + link.href + '"]')) return;
    var a = document.createElement("a");
    a.href = link.href;
    a.textContent = link.text;
    a.setAttribute("data-seo-enhanced", "1");
    footerNav.appendChild(a);
  });
})();

