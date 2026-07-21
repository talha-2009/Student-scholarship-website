// ─── Logo injection ──────────────────────────────────────
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
    img.width = 44;
    img.height = 44;
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

// ─── SVG Icons ────────────────────────────────────────────
const ICONS = {
  globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  cap: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
  briefcase: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  award: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
  trophy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>',
  users: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  compass: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  book: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  lightbulb: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
  fileText: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  dollarSign: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
};

// ─── Navigation architecture ──────────────────────────────
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#nav-menu");
const MOBILE_NAV_BREAKPOINT = 767;

const megaMenuData = {
  "Study Abroad": [
    {
      title: "Top Destinations",
      icon: ICONS.globe,
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
      icon: ICONS.cap,
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
      icon: ICONS.briefcase,
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
      icon: ICONS.award,
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
      icon: ICONS.trophy,
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
      icon: ICONS.users,
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
      icon: ICONS.compass,
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
      icon: ICONS.book,
      links: [
        ["Fully Funded Scholarships", "/blog/top-fully-funded-scholarships.html"],
        ["Scholarship Interview Tips", "/blog/how-to-ace-scholarship-interview.html"],
        ["Winning Scholarship Essays", "/blog/how-to-write-winning-scholarship-essay.html"],
        ["Scholarships Without IELTS", "/guides/scholarships-without-ielts.html"]
      ]
    },
    {
      title: "Application Help",
      icon: ICONS.lightbulb,
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
      icon: ICONS.fileText,
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
      icon: ICONS.cap,
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
      icon: ICONS.briefcase,
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
      icon: ICONS.globe,
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
      icon: ICONS.book,
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
      icon: ICONS.dollarSign,
      links: [
        ["IELTS Guide", "/guides/ielts-guide.html"],
        ["TOEFL Guide", "/guides/toefl-guide.html"],
        ["GRE Guide", "/guides/gre-guide.html"],
        ["GMAT Guide", "/guides/gmat-guide.html"],
        ["Fellowships", "/fellowships/"],
        ["Grants", "/guides/grants.html"]
      ]
    }
  ]
};

const navItems = [
  { label: "Study Abroad", href: "/study-in-uk/", sections: megaMenuData["Study Abroad"] },
  { label: "Scholarships", href: "/scholarships/", sections: megaMenuData.Scholarships },
  { label: "Internships", href: "/internships/", sections: megaMenuData.Internships },
  { label: "Fellowships", href: "/fellowships/", sections: megaMenuData.Fellowships },
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
  iconSpan.innerHTML = icon;
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
  dropdown.setAttribute("data-cols", String(sections.length));
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

  // Adjust dropdown position if it would overflow viewport
  const dropdown = item.querySelector(".mega-menu");
  if (!dropdown) return;

  const rect = dropdown.getBoundingClientRect();
  const viewportWidth = window.innerWidth;

  // If dropdown overflows right edge, align to right
  if (rect.right > viewportWidth) {
    dropdown.style.left = "auto";
    dropdown.style.right = "0";
  } else {
    dropdown.style.left = "0";
    dropdown.style.right = "auto";
  }
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

  let hoverTimeout;
  const HOVER_DELAY = 200;

  navMenu.querySelectorAll(".nav-item.has-mega").forEach((item) => {
    const trigger = item.querySelector(".mega-trigger");
    if (!trigger) return;

    item.addEventListener("pointerenter", () => {
      if (!isMobileNav()) {
        clearTimeout(hoverTimeout);
        openMegaMenu(item);
      }
    });

    item.addEventListener("pointerleave", () => {
      if (!isMobileNav()) {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => closeMegaMenu(item), HOVER_DELAY);
      }
    });

    item.addEventListener("focusin", () => {
      if (!isMobileNav()) {
        clearTimeout(hoverTimeout);
        openMegaMenu(item);
      }
    });

    item.addEventListener("focusout", (event) => {
      if (!item.contains(event.relatedTarget)) {
        clearTimeout(hoverTimeout);
        closeMegaMenu(item);
      }
    });

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (item.classList.contains("is-open")) {
        closeMegaMenu(item);
        return;
      }
      openMegaMenu(item);
    });

    // Keyboard navigation
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (item.classList.contains("is-open")) {
          closeMegaMenu(item);
        } else {
          openMegaMenu(item);
          // Focus first link in dropdown
          const firstLink = item.querySelector(".mega-menu a");
          if (firstLink) firstLink.focus();
        }
      }
      if (event.key === "Escape") {
        closeMegaMenu(item);
        trigger.focus();
      }
    });

    // Trap focus within dropdown when open
    const dropdown = item.querySelector(".mega-menu");
    if (dropdown) {
      dropdown.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeMegaMenu(item);
          trigger.focus();
        }
        if (event.key === "Tab") {
          const focusableElements = dropdown.querySelectorAll("a");
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      });
    }
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

// ─── Footer SEO: enhance footer with additional internal links ────────────
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
