(function injectLogo() {
  var marks = document.querySelectorAll(".brand-mark");
  if (!marks.length) return;
  marks.forEach(function (el) {
    el.textContent = "";
    var img = document.createElement("img");
    img.src = "/logo.svg";
    img.alt = "";
    img.width = 44;
    img.height = 44;
    img.setAttribute("aria-hidden", "true");
    img.setAttribute("decoding", "async");
    el.appendChild(img);
  });
  if (!document.querySelector('link[type="image/svg+xml"]')) {
    var svgFav = document.createElement("link");
    svgFav.rel = "icon";
    svgFav.type = "image/svg+xml";
    svgFav.href = "/favicon.svg";
    document.head.prepend(svgFav);
  }
})();

var S = {
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
  dollarSign: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
  chevron: '<svg class="nav-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>'
};

var NAV_ITEMS = [
  { label: "Scholarships", href: "/scholarships/", columns: [
    { title: "Browse by Country", icon: S.globe, links: [["USA","/scholarships/usa/"],["Canada","/scholarships/canada/"],["UK","/scholarships/united-kingdom/"],["Germany","/scholarships/germany/"],["Australia","/scholarships/australia/"]] },
    { title: "Browse by Level", icon: S.cap, links: [["Bachelor","/undergraduate-scholarships/"],["Master","/masters-scholarships/"],["PhD","/phd-scholarships/"],["Postdoctoral","/postdoctoral-scholarships/"]] },
    { title: "Browse by Funding", icon: S.dollarSign, links: [["Fully Funded","/fully-funded-scholarships/"],["Partial","/partially-funded-scholarships/"],["Merit Based","/merit-scholarships/"]] },
    { title: "Trending", icon: S.trophy, links: [["Latest","/scholarships/"],["Deadlines Soon","/scholarships/"],["Popular","/scholarships/"]] }
  ]},
  { label: "Internships", href: "/internships/", columns: [
    { title: "Browse by Type", icon: S.briefcase, links: [["Paid","/paid-internships/"],["Remote","/remote-internships/"],["Summer","/summer-internships/"],["International","/international-internships/"]] },
    { title: "Top Countries", icon: S.globe, links: [["USA","/internships/united-states/"],["UK","/internships/united-kingdom/"],["Canada","/internships/canada/"],["Germany","/internships/germany/"],["Switzerland","/internships/switzerland/"]] },
    { title: "Categories", icon: S.cap, links: [["Engineering","/internships/"],["IT & Tech","/internships/"],["Business","/internships/"],["Research","/internships/"]] }
  ]},
  { label: "Fellowships", href: "/fellowships/", columns: [
    { title: "Fellowship Types", icon: S.award, links: [["Fully Funded","/fully-funded-fellowships/"],["Research","/research-fellowships/"],["Leadership","/leadership-fellowships/"]] },
    { title: "Popular Programs", icon: S.trophy, links: [["Fulbright","/fellowships/"],["DAAD","/fellowships/"],["Rhodes","/fellowships/"],["Chevening","/fellowships/"]] }
  ]},
  { label: "Competitions", href: "/competitions/", columns: [
    { title: "Competition Types", icon: S.trophy, links: [["Programming","/programming-competitions/"],["AI","/ai-competitions/"],["Business","/business-competitions/"],["Essay","/essay-competitions/"]] }
  ]},
  { label: "Youth Programs", href: "/youth-programs/", columns: [
    { title: "Program Types", icon: S.users, links: [["Leadership","/leadership-programs/"],["Volunteer","/volunteer-programs/"],["Exchange","/exchange-programs/"],["Conferences","/conferences/"]] },
    { title: "Explore More", icon: S.compass, links: [["Grants","/grants/"],["Research","/research-opportunities/"]] }
  ]},
  { label: "Blog", href: "/blog/", columns: [
    { title: "Scholarship Advice", icon: S.book, links: [["Fully Funded","/blog/top-fully-funded-scholarships.html"],["Interview Tips","/blog/how-to-ace-scholarship-interview.html"],["Essay Guide","/blog/how-to-write-winning-scholarship-essay.html"],["No IELTS","/guides/scholarships-without-ielts.html"]] },
    { title: "Application Help", icon: S.lightbulb, links: [["SOP Guide","/guides/how-to-write-sop.html"],["Personal Statement","/guides/personal-statement.html"],["CV Writing","/guides/cv-writing.html"],["Checklist","/guides/application-checklist.html"]] }
  ], featured: [["Study in Australia Without IELTS","/guides/australia-scholarships-without-ielts-2026.html"]] },
  { label: "Resources", href: "/guides/application-checklist.html", columns: [
    { title: "Application Guides", icon: S.fileText, links: [["How to Write an SOP","/guides/how-to-write-sop.html"],["SOP Examples","/guides/sop-examples.html"],["Personal Statement","/guides/personal-statement.html"],["CV Writing","/guides/cv-writing.html"],["Cover Letter","/guides/cover-letter.html"]] },
    { title: "Scholarship Guides", icon: S.cap, links: [["Fully Funded","/blog/top-fully-funded-scholarships.html"],["Without IELTS","/guides/scholarships-without-ielts.html"],["Masters","/guides/masters-scholarships.html"],["PhD","/guides/phd-scholarships.html"]] },
    { title: "Study Abroad", icon: S.globe, links: [["USA","/guides/study-in-usa.html"],["UK","/guides/study-in-uk.html"],["Canada","/guides/study-in-canada.html"],["Germany","/guides/study-in-germany.html"],["Australia","/guides/study-in-australia.html"]] },
    { title: "Test Prep", icon: S.dollarSign, links: [["IELTS","/guides/ielts-guide.html"],["TOEFL","/guides/toefl-guide.html"],["GRE","/guides/gre-guide.html"],["GMAT","/guides/gmat-guide.html"]] }
  ]}
];

var navToggle = document.querySelector(".nav-toggle");
var navMenu = document.querySelector("#nav-menu");
var MOBILE_BP = 767;
var TABLET_BP = 1024;
var isMobile = function () { return window.matchMedia("(max-width: " + MOBILE_BP + "px)").matches; };
var isTablet = function () { return window.matchMedia("(min-width: " + (MOBILE_BP + 1) + "px) and (max-width: " + TABLET_BP + "px)").matches; };
var isDesktop = function () { return window.matchMedia("(min-width: " + (TABLET_BP + 1) + "px)").matches; };

function createCol(col) {
  var div = document.createElement("div");
  div.className = "mega-col";
  var heading = document.createElement("div");
  heading.className = "mega-col-heading";
  var iconSpan = document.createElement("span");
  iconSpan.className = "mega-col-icon";
  iconSpan.setAttribute("aria-hidden", "true");
  iconSpan.innerHTML = col.icon;
  heading.appendChild(iconSpan);
  var titleSpan = document.createElement("span");
  titleSpan.className = "mega-col-title";
  titleSpan.textContent = col.title;
  heading.appendChild(titleSpan);
  var chev = document.createElement("span");
  chev.className = "mega-col-chevron";
  chev.setAttribute("aria-hidden", "true");
  chev.innerHTML = S.chevron;
  heading.appendChild(chev);
  div.appendChild(heading);
  var list = document.createElement("ul");
  list.className = "mega-col-list";
  for (var i = 0; i < col.links.length; i++) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = col.links[i][1];
    a.textContent = col.links[i][0];
    li.appendChild(a);
    list.appendChild(li);
  }
  div.appendChild(list);
  return div;
}

function createNavItem(item) {
  var wrapper = document.createElement("div");
  wrapper.className = "nav-item";

  var trigger = document.createElement("a");
  trigger.href = item.href;
  trigger.className = "nav-link";
  trigger.setAttribute("aria-haspopup", "true");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-label", item.label + " menu");
  trigger.textContent = item.label;
  var tmp = document.createElement("span");
  tmp.innerHTML = S.chevron;
  trigger.appendChild(tmp.firstElementChild);

  wrapper.appendChild(trigger);

  var mega = document.createElement("div");
  mega.className = "mega";
  mega.setAttribute("role", "group");
  mega.setAttribute("aria-label", item.label + " links");

  var inner = document.createElement("div");
  inner.className = "mega-inner";

  if (item.featured && item.featured.length) {
    var featDiv = document.createElement("div");
    featDiv.className = "mega-featured";
    var featList = document.createElement("ul");
    for (var f = 0; f < item.featured.length; f++) {
      var fli = document.createElement("li");
      var fa = document.createElement("a");
      fa.href = item.featured[f][1];
      fa.className = "featured-link";

      var starSpan = document.createElement("span");
      starSpan.className = "featured-link-star";
      starSpan.textContent = "\u2B50";
      fa.appendChild(starSpan);

      var textSpan = document.createElement("span");
      textSpan.className = "featured-link-text";
      textSpan.textContent = item.featured[f][0];
      fa.appendChild(textSpan);

      var flagSpan = document.createElement("span");
      flagSpan.className = "featured-link-flag";
      flagSpan.textContent = "\uD83C\uDDE6\uD83C\uDDFA";
      fa.appendChild(flagSpan);

      var badgeSpan = document.createElement("span");
      badgeSpan.className = "featured-link-badge";
      badgeSpan.textContent = "Featured Guide";
      fa.appendChild(badgeSpan);

      fli.appendChild(fa);
      featList.appendChild(fli);
    }
    featDiv.appendChild(featList);
    inner.appendChild(featDiv);
  }

  for (var i = 0; i < item.columns.length; i++) {
    inner.appendChild(createCol(item.columns[i]));
  }

  mega.appendChild(inner);
  wrapper.appendChild(mega);

  return wrapper;
}

function buildNav() {
  if (!navMenu) return;
  navMenu.textContent = "";
  navMenu.dataset.navBuilt = "true";

  var frag = document.createDocumentFragment();
  for (var i = 0; i < NAV_ITEMS.length; i++) {
    frag.appendChild(createNavItem(NAV_ITEMS[i]));
  }

  frag.appendChild(createSearchMobile());

  var cta = document.createElement("a");
  cta.href = "/scholarships/";
  cta.className = "button button-primary nav-cta";
  cta.textContent = "Explore Opportunities";
  frag.appendChild(cta);

  navMenu.appendChild(frag);
}

function createSearchMobile() {
  var wrap = document.createElement("div");
  wrap.className = "nav-search-mobile";
  var form = document.createElement("form");
  form.className = "nav-search-form-mobile";
  form.setAttribute("role", "search");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = form.querySelector("input").value.trim();
    if (q) window.location.href = "/scholarships/?q=" + encodeURIComponent(q);
  });
  var input = document.createElement("input");
  input.type = "search";
  input.placeholder = "Search scholarships...";
  input.setAttribute("aria-label", "Search opportunities");
  form.appendChild(input);
  wrap.appendChild(form);
  return wrap;
}

var docClickListener;
var hoverTimer = null;

function clearHoverTimer() {
  if (hoverTimer) {
    clearTimeout(hoverTimer);
    hoverTimer = null;
  }
}

function closeAllMegas(except) {
  if (!navMenu) return;
  var items = navMenu.querySelectorAll(".nav-item.is-open");
  for (var i = 0; i < items.length; i++) {
    if (items[i] !== except) closeMega(items[i]);
  }
}

function closeMega(item) {
  if (!item) return;
  item.classList.remove("is-open");
  var trig = item.querySelector(".nav-link");
  if (trig) trig.setAttribute("aria-expanded", "false");
}

function openMega(item) {
  if (!item) return;
  closeAllMegas(item);
  item.classList.add("is-open");
  var trig = item.querySelector(".nav-link");
  if (trig) trig.setAttribute("aria-expanded", "true");
  if (!isMobile()) {
    positionMega(item);
    updateScrollIndicator(item);
  }
}

function updateScrollIndicator(item) {
  var mega = item.querySelector(".mega");
  var inner = item.querySelector(".mega-inner");
  if (!mega || !inner) return;
  function check() {
    var hasOverflow = inner.scrollHeight > inner.clientHeight;
    var isAtBottom = inner.scrollHeight - inner.scrollTop - inner.clientHeight < 16;
    mega.classList.toggle("has-overflow", hasOverflow && !isAtBottom);
  }
  check();
  inner.addEventListener("scroll", check, { passive: true });
}

function positionMega(item) {
  var mega = item.querySelector(".mega");
  if (!mega) return;
  mega.style.left = "";
  var nav = item.closest(".nav");
  if (!nav) return;
  var navRect = nav.getBoundingClientRect();
  var itemRect = item.getBoundingClientRect();
  var megaWidth = mega.offsetWidth;
  var itemCenter = (itemRect.left + itemRect.width / 2) - navRect.left;
  var left = Math.round(itemCenter - megaWidth / 2);
  var megaViewLeft = navRect.left + left;
  var megaViewRight = megaViewLeft + megaWidth;
  var vw = window.innerWidth;
  var pad = 16;
  if (megaViewRight > vw - pad) {
    left -= (megaViewRight - vw + pad);
  }
  if (megaViewLeft < pad) {
    left += (pad - megaViewLeft);
  }
  var maxLeft = navRect.width - megaWidth - pad;
  if (left > maxLeft) left = maxLeft;
  if (left < pad) left = pad;
  mega.style.left = left + "px";
  mega.style.transform = "none";
}

function closeNav() {
  if (!navToggle || !navMenu) return;
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.classList.remove("is-active");
  navMenu.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  closeAllMegas();
}

function initMobileAccordion() {
  if (!navMenu || !isMobile()) return;
  navMenu.querySelectorAll(".mega-col-heading").forEach(function (h) {
    h.addEventListener("click", function (e) {
      e.stopPropagation();
      var col = h.closest(".mega-col");
      if (col) col.classList.toggle("is-open");
    });
  });
}

function positionAllMegas() {
  if (isMobile()) return;
  navMenu.querySelectorAll(".nav-item.is-open").forEach(function (item) {
    positionMega(item);
  });
}

function setupInteractions() {
  if (!navMenu) return;

  navMenu.querySelectorAll(".nav-item").forEach(function (item) {
    var trigger = item.querySelector(".nav-link");
    if (!trigger) return;

    item.addEventListener("pointerenter", function () {
      clearHoverTimer();
      if (!isMobile()) openMega(item);
    });
    item.addEventListener("pointerleave", function (e) {
      if (!isMobile()) {
        clearHoverTimer();
        hoverTimer = setTimeout(function () {
          closeMega(item);
        }, 250);
      }
    });

    var mega = item.querySelector(".mega");
    if (mega) {
      mega.addEventListener("pointerenter", clearHoverTimer);
      mega.addEventListener("pointerleave", function () {
        clearHoverTimer();
        hoverTimer = setTimeout(function () {
          closeMega(item);
        }, 250);
      });
    }

    item.addEventListener("focusin", function () {
      if (!isMobile()) openMega(item);
    });
    item.addEventListener("focusout", function (e) {
      if (!item.contains(e.relatedTarget)) closeMega(item);
    });

    trigger.addEventListener("click", function (e) {
      if (isMobile()) {
        e.preventDefault();
        if (item.classList.contains("is-open")) {
          closeMega(item);
        } else {
          openMega(item);
          var firstCol = item.querySelector(".mega-col-heading");
          if (firstCol) setTimeout(function () { firstCol.focus(); }, 50);
        }
        return;
      }
      e.preventDefault();
      if (item.classList.contains("is-open")) {
        closeMega(item);
      } else {
        openMega(item);
      }
    });

    trigger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (item.classList.contains("is-open")) { closeMega(item); }
        else { openMega(item); var fl = item.querySelector(".mega a"); if (fl) fl.focus(); }
      }
      if (e.key === "Escape") { closeMega(item); trigger.focus(); }
    });

    if (mega) {
      mega.addEventListener("keydown", function (e) {
        if (e.key === "Escape") { closeMega(item); trigger.focus(); }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          var links = mega.querySelectorAll("a");
          var idx = Array.prototype.indexOf.call(links, document.activeElement);
          if (idx > -1 && idx < links.length - 1) links[idx + 1].focus();
          else if (links.length) links[0].focus();
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          var links = mega.querySelectorAll("a");
          var idx = Array.prototype.indexOf.call(links, document.activeElement);
          if (idx > 0) links[idx - 1].focus();
          else trigger.focus();
        }
        if (e.key === "Tab") {
          var fE = mega.querySelectorAll("a");
          var f = fE[0], l = fE[fE.length - 1];
          if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus(); }
          else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus(); }
        }
      });
    }
  });

  navMenu.addEventListener("click", function (e) {
    if (!(e.target instanceof Element)) return;
    var link = e.target.closest("a");
    if (!link) return;
    if (isMobile() && link.classList.contains("nav-link")) return;
    if (link.closest(".mega-col-heading")) return;
    closeNav();
  });

  if (docClickListener) document.removeEventListener("click", docClickListener);
  docClickListener = function (e) {
    if (!navMenu || !(e.target instanceof Node)) return;
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      closeAllMegas();
    }
  };
  document.addEventListener("click", docClickListener);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeNav(); if (navToggle) navToggle.focus(); }
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!isMobile()) {
        if (navMenu) navMenu.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        positionAllMegas();
      }
      closeAllMegas();
    }, 100);
  }, { passive: true });

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      navToggle.classList.toggle("is-active", !isOpen);
      navMenu.classList.toggle("is-open", !isOpen);
      document.body.classList.toggle("nav-open", !isOpen);
      if (isOpen) closeAllMegas();
      if (!isOpen) initMobileAccordion();
    });
  }

  initMobileAccordion();
  if (!isMobile()) positionAllMegas();
}

window.addDynamicNavLinks = function (types) {
  if (!navMenu) return;
  navMenu.querySelectorAll("[data-dynamic]").forEach(function (l) { l.remove(); });
};

if (navMenu) {
  window.closeNav = closeNav;
  var navBuilt = false;
  function initNav() {
    if (navBuilt) return;
    navBuilt = true;
    buildNav();
    setupInteractions();
    if (window.__opportunityTypes) window.addDynamicNavLinks(window.__opportunityTypes);
  }
  navMenu.addEventListener("pointerenter", initNav, { once: true });
  navMenu.addEventListener("touchstart", initNav, { once: true });
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(initNav, { timeout: 2000 });
  } else {
    setTimeout(initNav, 100);
  }
}

(function cookieConsent() {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(initCC, { timeout: 3000 });
  } else {
    setTimeout(initCC, 2000);
  }
  function initCC() {
    var saved = localStorage.getItem("on_consent");
    if (saved === "accepted" || saved === "rejected") return;
    var defaults = { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" };
    function apply(v) { if (typeof gtag === "function") gtag("consent", "update", v); }
    function save(v, label) { apply(v); localStorage.setItem("on_consent", label); banner.classList.remove("is-visible"); setTimeout(function () { banner.remove(); }, 350); }
    var banner = document.createElement("div");
    banner.className = "cookie-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Cookie consent");
    banner.innerHTML = '<div class="container"><p>We use cookies to personalise content, serve ads, and analyse traffic. You can accept all, reject all, or manage your preferences.</p><div class="cookie-consent-actions"><button class="button button-secondary" data-action="reject">Reject All</button><button class="button button-secondary" data-action="prefs">Manage Preferences</button><button class="button button-primary" data-action="accept">Accept All</button></div></div>';
    document.body.appendChild(banner);
    requestAnimationFrame(function () { banner.classList.add("is-visible"); });
    banner.querySelector('[data-action="accept"]').addEventListener("click", function () { save({ ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" }, "accepted"); });
    banner.querySelector('[data-action="reject"]').addEventListener("click", function () { save({ ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" }, "rejected"); });
    banner.querySelector('[data-action="prefs"]').addEventListener("click", function () {
      var bd = document.createElement("div");
      bd.className = "consent-backdrop";
      bd.setAttribute("role", "dialog");
      bd.setAttribute("aria-modal", "true");
      bd.setAttribute("aria-label", "Privacy preferences");
      bd.innerHTML = '<div class="consent-modal"><h2>Privacy Preferences</h2><p>Choose which cookies and tracking technologies you allow.</p><div class="consent-option"><label>Essential <small>Required for basic functionality. Always active.</small></label><span class="badge badge-essential">Always Active</span></div><div class="consent-option"><label for="consent-analytics">Analytics <small>Help us understand how visitors use the site.</small></label><input type="checkbox" id="consent-analytics" checked></div><div class="consent-option"><label for="consent-ads">Advertising <small>Personalised ads and measurement.</small></label><input type="checkbox" id="consent-ads" checked></div><div class="consent-modal-actions"><button class="button button-secondary" data-prefs-action="reject">Reject All</button><button class="button button-primary" data-prefs-action="save">Save Preferences</button><button class="button button-primary" data-prefs-action="accept">Accept All</button></div></div>';
      document.body.appendChild(bd);
      requestAnimationFrame(function () { bd.classList.add("is-visible"); });
      bd.addEventListener("click", function (e) { if (e.target === bd) { bd.classList.remove("is-visible"); setTimeout(function () { bd.remove(); }, 250); } });
      bd.querySelector('[data-prefs-action="accept"]').addEventListener("click", function () { bd.remove(); save({ ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" }, "accepted"); });
      bd.querySelector('[data-prefs-action="reject"]').addEventListener("click", function () { bd.remove(); save({ ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" }, "rejected"); });
      bd.querySelector('[data-prefs-action="save"]').addEventListener("click", function () {
        var a = document.getElementById("consent-analytics").checked;
        var ad = document.getElementById("consent-ads").checked;
        bd.remove();
        save({ ad_storage: ad ? "granted" : "denied", ad_user_data: ad ? "granted" : "denied", ad_personalization: ad ? "granted" : "denied", analytics_storage: a ? "granted" : "denied" }, a || ad ? "custom" : "rejected");
      });
    });
  }
})();
