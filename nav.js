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

const closeNav = () => {
  if (!navToggle || !navMenu) return;
  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("is-open");
  document.body.classList.remove("nav-open");
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
    { href: "/country/australia/", text: "Study in Australia" }
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
