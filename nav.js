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

// ─── Chatling AI Chatbot ─────────────────────────────────────────────────────
// Load the Chatling chatbot widget on every page (idempotent).
(function initChatling() {
  if (window.chtlConfig && window.chtlConfig.chatbotId) return; // already loaded
  window.chtlConfig = { chatbotId: "5432956922" };
  var s = document.createElement("script");
  s.async = true;
  s.setAttribute("data-id", "5432956922");
  s.id = "chtl-script";
  s.type = "text/javascript";
  s.src = "https://chatling.ai/js/embed.js";
  document.body.appendChild(s);
})();
