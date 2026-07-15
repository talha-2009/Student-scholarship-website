// ─── Logo injection ───────────────────────────────────────────────────────────
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

// ─── Mobile nav toggle ────────────────────────────────────────────────────────
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#nav-menu");

const megaMenuData = {
  Scholarships: [
    {
      title: "Popular Countries",
      icon: "🌐",
      links: [
        ["Scholarships in USA", "/scholarships-in-usa/"],
        ["Scholarships in Canada", "/scholarships-in-canada/"],
        ["Scholarships in UK", "/scholarships-in-uk/"],
        ["Scholarships in Germany", "/scholarships-in-germany/"],
        ["Scholarships in Australia", "/scholarships-in-australia/"],
        ["Scholarships in Japan", "/scholarships-in-japan/"],
        ["Scholarships in South Korea", "/scholarships-in-south-korea/"],
        ["Scholarships in China", "/scholarships-in-china/"],
        ["Scholarships in Italy", "/scholarships-in-italy/"],
        ["Scholarships in France", "/scholarships-in-france/"],
        ["Scholarships in Netherlands", "/scholarships-in-netherlands/"],
        ["Scholarships in Switzerland", "/scholarships-in-switzerland/"],
        ["Scholarships in Turkey", "/scholarships-in-turkey/"],
        ["Scholarships in Malaysia", "/scholarships-in-malaysia/"],
        ["Scholarships in Saudi Arabia", "/scholarships-in-saudi-arabia/"],
        ["Scholarships in UAE", "/scholarships-in-uae/"]
      ]
    },
    {
      title: "Study Level",
      icon: "🎓",
      links: [
        ["High School Scholarships", "/high-school-scholarships/"],
        ["Undergraduate Scholarships", "/undergraduate-scholarships/"],
        ["Master's Scholarships", "/masters-scholarships/"],
        ["PhD Scholarships", "/phd-scholarships/"],
        ["Postdoctoral Scholarships", "/postdoctoral-scholarships/"]
      ]
    },
    {
      title: "Funding Type",
      icon: "💰",
      links: [
        ["Fully Funded Scholarships", "/fully-funded-scholarships/"],
        ["Partial Scholarships", "/partial-scholarships/"],
        ["Merit Scholarships", "/merit-scholarships/"],
        ["Need-Based Scholarships", "/need-based-scholarships/"]
      ]
    },
    {
      title: "Special Categories",
      icon: "✨",
      links: [
        ["Scholarships Without IELTS", "/scholarships-without-ielts/"],
        ["Government Scholarships", "/government-scholarships/"],
        ["University Scholarships", "/university-scholarships/"],
        ["Exchange Scholarships", "/exchange-scholarships/"],
        ["Research Scholarships", "/research-scholarships/"]
      ]
    }
  ],
  Internships: [
    {
      title: "Popular Countries",
      icon: "🌍",
      links: [
        ["Internships in USA", "/internships-in-usa/"],
        ["Internships in Canada", "/internships-in-canada/"],
        ["Internships in UK", "/internships-in-uk/"],
        ["Internships in Germany", "/internships-in-germany/"],
        ["Internships in Australia", "/internships-in-australia/"],
        ["Internships in Japan", "/internships-in-japan/"],
        ["Internships in South Korea", "/internships-in-south-korea/"]
      ]
    },
    {
      title: "Categories",
      icon: "🧭",
      links: [
        ["Paid Internships", "/paid-internships/"],
        ["Remote Internships", "/remote-internships/"],
        ["Summer Internships", "/summer-internships/"],
        ["Graduate Internships", "/graduate-internships/"],
        ["Engineering Internships", "/engineering-internships/"],
        ["IT Internships", "/it-internships/"],
        ["Medical Internships", "/medical-internships/"],
        ["Business Internships", "/business-internships/"],
        ["Marketing Internships", "/marketing-internships/"],
        ["NGO Internships", "/ngo-internships/"]
      ]
    }
  ],
  Fellowships: [
    {
      title: "Countries",
      icon: "🏛",
      links: [
        ["USA", "/fellowships-in-usa/"],
        ["UK", "/fellowships-in-uk/"],
        ["Germany", "/fellowships-in-germany/"],
        ["Canada", "/fellowships-in-canada/"],
        ["Australia", "/fellowships-in-australia/"],
        ["Japan", "/fellowships-in-japan/"]
      ]
    },
    {
      title: "Categories",
      icon: "🧪",
      links: [
        ["Fully Funded Fellowships", "/fully-funded-fellowships/"],
        ["Research Fellowships", "/research-fellowships/"],
        ["Leadership Fellowships", "/leadership-fellowships/"],
        ["Government Fellowships", "/government-fellowships/"],
        ["Youth Fellowships", "/youth-fellowships/"],
        ["Professional Fellowships", "/professional-fellowships/"]
      ]
    }
  ],
  Competitions: [
    {
      title: "Competition Types",
      icon: "🏆",
      links: [
        ["Programming", "/programming-competitions/"],
        ["Hackathons", "/hackathons/"],
        ["Business Competitions", "/business-competitions/"],
        ["Essay Competitions", "/essay-competitions/"],
        ["Photography", "/photography-competitions/"],
        ["Design", "/design-competitions/"],
        ["Innovation Challenges", "/innovation-challenges/"],
        ["Startup Competitions", "/startup-competitions/"],
        ["Science Competitions", "/science-competitions/"],
        ["AI Competitions", "/ai-competitions/"],
        ["Robotics", "/robotics-competitions/"]
      ]
    }
  ],
  Opportunities: [
    {
      title: "Explore Opportunities",
      icon: "🔎",
      links: [
        ["Scholarships", "/scholarships/"],
        ["Internships", "/internships/"],
        ["Fellowships", "/fellowships/"],
        ["Competitions", "/competitions.html"],
        ["Youth Programs", "/youth-programs/"],
        ["Conferences", "/conferences/"],
        ["Workshops", "/workshops/"],
        ["Exchange Programs", "/exchange-programs/"],
        ["Volunteer Programs", "/volunteer-programs/"],
        ["Research Opportunities", "/research-opportunities/"],
        ["Jobs", "/jobs/"],
        ["Grants", "/grants/"]
      ]
    }
  ],
  "Youth Programs": [
    {
      title: "Program Types",
      icon: "🤝",
      links: [
        ["Leadership Programs", "/leadership-programs/"],
        ["Volunteer Programs", "/volunteer-programs/"],
        ["Exchange Programs", "/exchange-programs/"],
        ["Cultural Programs", "/cultural-programs/"],
        ["UN Programs", "/un-programs/"],
        ["Youth Summits", "/youth-summits/"],
        ["Training Programs", "/training-programs/"],
        ["Leadership Camps", "/leadership-camps/"],
        ["Global Conferences", "/global-conferences/"]
      ]
    }
  ]
};

const createMegaColumn = ({ title, icon, links }) => {
  const column = document.createElement("section");
  column.className = "mega-column";

  const heading = document.createElement("h3");
  heading.innerHTML = `<span aria-hidden="true">${icon}</span> ${title}`;
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

const enhanceMegaNavigation = () => {
  if (!navMenu || navMenu.dataset.megaEnhanced === "true") return;
  navMenu.dataset.megaEnhanced = "true";

  const existingLinks = Array.from(navMenu.querySelectorAll(":scope > a"));
  const opportunitiesLink = document.createElement("a");
  opportunitiesLink.href = "/#opportunities";
  opportunitiesLink.textContent = "Opportunities";

  const youthLink = document.createElement("a");
  youthLink.href = "/youth-programs/";
  youthLink.textContent = "Youth Programs";

  const insertBefore = existingLinks.find((link) => link.textContent.trim() === "About");
  if (insertBefore && !existingLinks.some((link) => link.textContent.trim() === "Youth Programs")) {
    navMenu.insertBefore(youthLink, insertBefore);
  }
  if (insertBefore && !existingLinks.some((link) => link.textContent.trim() === "Opportunities")) {
    navMenu.insertBefore(opportunitiesLink, insertBefore);
  }

  Array.from(navMenu.querySelectorAll(":scope > a")).forEach((link) => {
    const label = link.textContent.trim();
    const sections = megaMenuData[label];
    if (!sections) return;

    const item = document.createElement("div");
    item.className = "mega-item";
    const trigger = link.cloneNode(true);
    trigger.classList.add("mega-trigger");
    trigger.setAttribute("aria-haspopup", "true");
    trigger.setAttribute("aria-expanded", "false");

    const dropdown = document.createElement("div");
    dropdown.className = "mega-menu";
    dropdown.setAttribute("role", "menu");
    dropdown.append(...sections.map(createMegaColumn));

    const toggle = (isOpen) => {
      trigger.setAttribute("aria-expanded", String(isOpen));
      item.classList.toggle("is-open", isOpen);
    };

    item.addEventListener("mouseenter", () => {
      if (window.matchMedia("(min-width: 821px)").matches) toggle(true);
    });
    item.addEventListener("mouseleave", () => {
      if (window.matchMedia("(min-width: 821px)").matches) toggle(false);
    });
    item.addEventListener("focusin", () => {
      if (window.matchMedia("(min-width: 821px)").matches) toggle(true);
    });
    trigger.addEventListener("click", (event) => {
      if (window.matchMedia("(max-width: 820px)").matches) {
        event.preventDefault();
        toggle(!item.classList.contains("is-open"));
      }
    });
    item.addEventListener("focusout", (event) => {
      if (!item.contains(event.relatedTarget)) toggle(false);
    });
    item.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        toggle(false);
        trigger.focus();
      }
    });

    item.append(trigger, dropdown);
    link.replaceWith(item);
  });
};

// enhanceMegaNavigation(); // Disabled - mega dropdown structure is now hardcoded in HTML

// Mobile mega menu accordion functionality
const setupMobileMegaMenus = () => {
  const megaTriggers = document.querySelectorAll('.mega-trigger');
  
  megaTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (window.matchMedia('(max-width: 900px)').matches) {
        e.preventDefault();
        const megaItem = trigger.closest('.mega-item');
        const isOpen = megaItem.classList.contains('is-open');
        
        // Close all other mega menus
        document.querySelectorAll('.mega-item.is-open').forEach(item => {
          if (item !== megaItem) {
            item.classList.remove('is-open');
          }
        });
        
        // Toggle current mega menu
        megaItem.classList.toggle('is-open');
      }
    });
  });
};

setupMobileMegaMenus();

const closeNav = () => {
  if (!navToggle || !navMenu) return;
  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  navMenu.querySelectorAll(".mega-item.is-open").forEach((item) => {
    item.classList.remove("is-open");
    item.querySelector(".mega-trigger")?.setAttribute("aria-expanded", "false");
  });
};

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navMenu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });
}

// ─── Footer SEO: enhance footer with additional internal links ────────────────
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
    { href: "/blog/", text: "Blog" }
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

// ── Resources Mega Dropdown injection ─────────────────────────────────────
(function injectMegaDropdown() {
  var navMenu = document.querySelector("#nav-menu");
  if (!navMenu) return;
  // Skip if already injected
  if (navMenu.querySelector(".nav-resources")) return;

  // Find the Blog link or About link to insert before
  var blogLink = navMenu.querySelector('a[href="/blog/"]');
  var aboutLink = navMenu.querySelector('a[href="/about.html"]');
  var insertBefore = blogLink ? blogLink.nextElementSibling : (aboutLink || null);

  var html = '<div class="nav-resources" role="navigation" aria-label="Resources">' +
    '<button class="nav-link-trigger" aria-expanded="false" aria-haspopup="true">Resources <span class="chevron" aria-hidden="true"></span></button>' +
    '<div class="mega-bridge" aria-hidden="true"></div>' +
    '<div class="mega-dropdown" role="menu" aria-label="Resources menu">' +
    '<div class="mega-grid">' +
    '<div class="mega-col"><div class="mega-col-title"><span class="mega-icon" aria-hidden="true">\u270E</span> Application Guides</div><ul class="mega-links">' +
    '<li><a href="/guides/how-to-write-sop.html" role="menuitem">How to Write an SOP</a></li>' +
    '<li><a href="/guides/sop-examples.html" role="menuitem">SOP Examples</a></li>' +
    '<li><a href="/guides/personal-statement.html" role="menuitem">Personal Statement</a></li>' +
    '<li><a href="/guides/motivation-letter.html" role="menuitem">Motivation Letter</a></li>' +
    '<li><a href="/guides/cover-letter.html" role="menuitem">Cover Letter Guide</a></li>' +
    '<li><a href="/guides/cv-writing.html" role="menuitem">CV Writing Guide</a></li>' +
    '<li><a href="/guides/ats-resume.html" role="menuitem">ATS Resume Guide</a></li>' +
    '<li><a href="/guides/resume-templates.html" role="menuitem">Resume Templates</a></li>' +
    '<li><a href="/guides/recommendation-letter.html" role="menuitem">Recommendation Letter</a></li>' +
    '<li><a href="/guides/email-professors.html" role="menuitem">Email Professors</a></li>' +
    '<li><a href="/guides/application-checklist.html" role="menuitem">Application Checklist</a></li></ul></div>' +
    '<div class="mega-col"><div class="mega-col-title"><span class="mega-icon" aria-hidden="true">\uD83C\uDF93</span> Scholarship Guides</div><ul class="mega-links">' +
    '<li><a href="/blog/top-fully-funded-scholarships.html" role="menuitem">Fully Funded Scholarships</a></li>' +
    '<li><a href="/guides/scholarships-without-ielts.html" role="menuitem">Without IELTS</a></li>' +
    '<li><a href="/guides/undergraduate-scholarships.html" role="menuitem">Undergraduate</a></li>' +
    '<li><a href="/guides/masters-scholarships.html" role="menuitem">Masters Scholarships</a></li>' +
    '<li><a href="/guides/phd-scholarships.html" role="menuitem">PhD Scholarships</a></li>' +
    '<li><a href="/guides/government-scholarships.html" role="menuitem">Government Scholarships</a></li>' +
    '<li><a href="/guides/university-scholarships.html" role="menuitem">University Scholarships</a></li>' +
    '<li><a href="/blog/how-to-ace-scholarship-interview.html" role="menuitem">Interview Tips</a></li>' +
    '<li><a href="/blog/how-to-write-winning-scholarship-essay.html" role="menuitem">Essay Guide</a></li>' +
    '<li><a href="/guides/scholarship-deadlines.html" role="menuitem">Deadlines Calendar</a></li></ul></div>' +
    '<div class="mega-col"><div class="mega-col-title"><span class="mega-icon" aria-hidden="true">\uD83D\uDCBC</span> Internship Guides</div><ul class="mega-links">' +
    '<li><a href="/guides/how-to-get-internship.html" role="menuitem">How to Get an Internship</a></li>' +
    '<li><a href="/guides/internship-application.html" role="menuitem">Application Guide</a></li>' +
    '<li><a href="/guides/internship-cover-letter.html" role="menuitem">Internship Cover Letter</a></li>' +
    '<li><a href="/guides/internship-resume.html" role="menuitem">Internship Resume</a></li>' +
    '<li><a href="/guides/internship-interview.html" role="menuitem">Interview Questions</a></li>' +
    '<li><a href="/guides/remote-internships.html" role="menuitem">Remote Internships</a></li>' +
    '<li><a href="/guides/paid-internships.html" role="menuitem">Paid Internships</a></li>' +
    '<li><a href="/guides/summer-internships.html" role="menuitem">Summer Internships</a></li></ul>' +
    '<div class="mega-col-title" style="margin-top:16px"><span class="mega-icon" aria-hidden="true">\uD83C\uDF10</span> Study Abroad</div><ul class="mega-links">' +
    '<li><a href="/guides/study-in-usa.html" role="menuitem">Study in USA</a></li>' +
    '<li><a href="/guides/study-in-canada.html" role="menuitem">Study in Canada</a></li>' +
    '<li><a href="/guides/study-in-uk.html" role="menuitem">Study in UK</a></li>' +
    '<li><a href="/guides/study-in-germany.html" role="menuitem">Study in Germany</a></li>' +
    '<li><a href="/guides/study-in-australia.html" role="menuitem">Study in Australia</a></li></ul></div>' +
    '<div class="mega-col"><div class="mega-col-title"><span class="mega-icon" aria-hidden="true">\uD83C\uDF0F</span> Study Abroad</div><ul class="mega-links">' +
    '<li><a href="/guides/study-in-japan.html" role="menuitem">Study in Japan</a></li>' +
    '<li><a href="/guides/study-in-south-korea.html" role="menuitem">Study in South Korea</a></li>' +
    '<li><a href="/guides/study-in-italy.html" role="menuitem">Study in Italy</a></li>' +
    '<li><a href="/guides/student-visa.html" role="menuitem">Student Visa Guide</a></li>' +
    '<li><a href="/guides/university-admissions.html" role="menuitem">University Admissions</a></li></ul>' +
    '<div class="mega-col-title" style="margin-top:16px"><span class="mega-icon" aria-hidden="true">\uD83D\uDCDA</span> Career Resources</div><ul class="mega-links">' +
    '<li><a href="/guides/career-planning.html" role="menuitem">Career Planning</a></li>' +
    '<li><a href="/guides/linkedin-profile.html" role="menuitem">LinkedIn Optimization</a></li>' +
    '<li><a href="/guides/networking.html" role="menuitem">Networking Guide</a></li>' +
    '<li><a href="/guides/online-certifications.html" role="menuitem">Online Certifications</a></li>' +
    '<li><a href="/guides/best-skills.html" role="menuitem">Best Skills for Students</a></li></ul></div>' +
    '<div class="mega-col"><div class="mega-col-title"><span class="mega-icon" aria-hidden="true">\uD83D\uDCAC</span> English Tests</div><ul class="mega-links">' +
    '<li><a href="/guides/ielts-guide.html" role="menuitem">IELTS Guide</a></li>' +
    '<li><a href="/guides/toefl-guide.html" role="menuitem">TOEFL Guide</a></li>' +
    '<li><a href="/guides/gre-guide.html" role="menuitem">GRE Guide</a></li>' +
    '<li><a href="/guides/gmat-guide.html" role="menuitem">GMAT Guide</a></li>' +
    '<li><a href="/guides/sat-guide.html" role="menuitem">SAT Guide</a></li>' +
    '<li><a href="/guides/act-guide.html" role="menuitem">ACT Guide</a></li>' +
    '<li><a href="/guides/duolingo-english-test.html" role="menuitem">Duolingo English Test</a></li></ul></div>' +
    '<div class="mega-col"><div class="mega-col-title"><span class="mega-icon" aria-hidden="true">\uD83D\uDCB0</span> Funding</div><ul class="mega-links">' +
    '<li><a href="/fellowships.html" role="menuitem">Fellowships</a></li>' +
    '<li><a href="/guides/grants.html" role="menuitem">Grants</a></li>' +
    '<li><a href="/guides/exchange-programs.html" role="menuitem">Exchange Programs</a></li>' +
    '<li><a href="/guides/conferences.html" role="menuitem">Conferences</a></li>' +
    '<li><a href="/competitions.html" role="menuitem">Competitions</a></li>' +
    '<li><a href="/?type=Youth+Program#opportunities" role="menuitem">Youth Programs</a></li>' +
    '<li><a href="/guides/volunteer-programs.html" role="menuitem">Volunteer Programs</a></li>' +
    '<li><a href="/guides/research-opportunities.html" role="menuitem">Research Opportunities</a></li></ul></div>' +
    '</div></div></div>';

  var wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  var el = wrapper.firstElementChild;
  navMenu.insertBefore(el, insertBefore);

  // ── Mega dropdown interaction ──
  var trigger = el.querySelector(".nav-link-trigger");
  var dropdown = el.querySelector(".mega-dropdown");
  if (!trigger || !dropdown) return;

  var closeTimeout;

  function openMega() {
    clearTimeout(closeTimeout);
    el.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
  }

  function closeMega() {
    el.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  }

  function scheduleClose() {
    closeTimeout = setTimeout(closeMega, 200);
  }

  el.addEventListener("mouseenter", function() { clearTimeout(closeTimeout); openMega(); });
  el.addEventListener("mouseleave", scheduleClose);
  trigger.addEventListener("click", function(e) { e.preventDefault(); el.classList.contains("is-open") ? closeMega() : openMega(); });
  trigger.addEventListener("keydown", function(e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.classList.contains("is-open") ? closeMega() : openMega(); } if (e.key === "Escape") closeMega(); });

  // Close on click outside
  document.addEventListener("click", function(e) { if (!el.contains(e.target)) closeMega(); });

  // Close dropdown when mobile nav closes
  var origClose = window.closeNav;
  window.closeNav = function() { closeMega(); if (typeof origClose === "function") origClose(); };
})();
