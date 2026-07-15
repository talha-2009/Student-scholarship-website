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
