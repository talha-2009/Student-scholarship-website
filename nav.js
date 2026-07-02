// ─── Logo injection ───────────────────────────────────────────────────────────
// Replace the "ON" text brand-mark with the SVG logo on every page.
// Determine the correct relative path based on current page location.
(function injectLogo() {
  const marks = document.querySelectorAll(".brand-mark");
  if (!marks.length) return;

  // All pages are at the repo root, so logo.svg is always a sibling.
  marks.forEach((el) => {
    el.textContent = "";
    const img = document.createElement("img");
    // Resolve logo path relative to the script's location so nested pages load correctly
    const scriptEl = document.currentScript || document.querySelector('script[src$="nav.js"]');
    try {
      const base = scriptEl && scriptEl.src ? scriptEl.src : window.location.href;
      img.src = new URL('logo.svg', base).href;
    } catch (e) {
      img.src = "logo.svg"; // fallback
    }
    img.alt = "";
    img.width = 22;
    img.height = 22;
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

// Adjust navigation links for nested pages so anchors point to the site root
(function normalizeNavLinks() {
  const anchors = document.querySelectorAll('.nav-menu a, .footer-links a');
  if (!anchors.length) return;

  // Compute directory depth for current page
  const parts = window.location.pathname.split('/').filter(Boolean);
  const isFile = parts.length && parts[parts.length - 1].includes('.');
  const dirParts = isFile ? parts.slice(0, -1) : parts;
  const depth = dirParts.length;
  const prefix = '../'.repeat(depth);

  anchors.forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
    // If href already starts with ../ or ./ leave it
    if (href.startsWith('..') || href.startsWith('.')) return;
    // Otherwise prefix it to reach the root
    a.setAttribute('href', prefix + href);
  });
})();
