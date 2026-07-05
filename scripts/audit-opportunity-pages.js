const fs = require("fs");
const http = require("http");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SITE_URL = "https://www.opportunitynest.org";
const NAV_TARGETS = new Map([
  ["Home", "/"],
  ["Scholarships", "/scholarships.html"],
  ["Internships", "/internships.html"],
  ["Fellowships", "/fellowships.html"],
  ["Competitions", "/competitions.html"],
  ["About", "/about.html"],
  ["Contact", "/contact.html"],
  ["FAQ", "/faq.html"]
]);

function getOpportunityPaths() {
  return fs.readdirSync(path.join(ROOT, "opportunity"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(ROOT, "opportunity", entry.name, "index.html")))
    .map((entry) => `/opportunity/${entry.name}/`)
    .sort();
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js") return "text/javascript; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".ico") return "image/x-icon";
  return "text/html; charset=utf-8";
}

function resolveFile(urlPath) {
  const pathname = decodeURIComponent(urlPath.split("?")[0]);
  const cleanPath = pathname === "/" ? "/index.html" : pathname;
  const relativePath = cleanPath.endsWith("/") ? `${cleanPath}index.html` : cleanPath;
  const filePath = path.resolve(ROOT, relativePath.replace(/^\/+/, ""));
  if (!filePath.startsWith(ROOT)) return null;
  return filePath;
}

function startServer() {
  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, "http://127.0.0.1").pathname;

    if (pathname === "/index.html") {
      response.writeHead(308, { location: "/" });
      response.end();
      return;
    }

    const indexMatch = pathname.match(/^\/(opportunity|country|scholarships|internships|fellowships|competitions)\/(.+)\/index\.html$/);
    if (indexMatch) {
      response.writeHead(308, { location: `/${indexMatch[1]}/${indexMatch[2]}/` });
      response.end();
      return;
    }

    const filePath = resolveFile(pathname);
    if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      response.end(fs.readFileSync(path.join(ROOT, "404.html")));
      return;
    }

    response.writeHead(200, { "content-type": contentType(filePath) });
    response.end(fs.readFileSync(filePath));
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function getAttrs(html, tagName, attrName) {
  const tags = [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, "gi"))].map((match) => match[0]);
  return tags
    .map((tag) => tag.match(new RegExp(`${attrName}=["']([^"']+)["']`, "i"))?.[1])
    .filter(Boolean);
}

function getAnchors(html) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => ({
    attrs: match[1],
    text: match[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
    href: match[1].match(/href=["']([^"']+)["']/i)?.[1] || ""
  }));
}

function isExternal(url) {
  return /^(https?:|mailto:|tel:|#)/i.test(url);
}

async function assertFetch(baseUrl, urlPath, label, failures) {
  if (isExternal(urlPath)) return;
  const response = await fetch(`${baseUrl}${urlPath}`);
  if (response.status !== 200) {
    failures.push(`${label} failed: ${urlPath} returned ${response.status}`);
  }
}

async function auditPage(baseUrl, pagePath) {
  const failures = [];
  const response = await fetch(`${baseUrl}${pagePath}`);
  if (response.status !== 200) return [`${pagePath} returned ${response.status}`];
  const html = await response.text();

  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1];
  if (canonical !== `${SITE_URL}${pagePath}`) failures.push(`canonical mismatch: ${canonical}`);
  if (html.includes("/index.html") || html.includes('href="index.html')) failures.push("contains index.html link");

  const stylesheetPaths = getAttrs(html, "link", "href").filter((href) => href.endsWith(".css"));
  const scriptPaths = getAttrs(html, "script", "src").filter((src) => !src.startsWith("https://www.googletagmanager.com"));
  const imagePaths = [
    ...getAttrs(html, "img", "src"),
    ...getAttrs(html, "link", "href").filter((href) => /\.(svg|png|ico)$/i.test(href))
  ];

  if (!stylesheetPaths.includes("/styles.css")) failures.push("missing /styles.css");
  if (!scriptPaths.includes("/nav.js")) failures.push("missing /nav.js");
  if (!fs.readFileSync(path.join(ROOT, "nav.js"), "utf8").includes('img.src = "/logo.svg"')) {
    failures.push("logo injection is not root-relative");
  }

  for (const asset of [...stylesheetPaths, ...scriptPaths, ...imagePaths, "/logo.svg"]) {
    await assertFetch(baseUrl, asset, "asset", failures);
  }

  const anchors = getAnchors(html);
  const brand = anchors.find((anchor) => anchor.attrs.includes("class=\"brand\""));
  if (!brand || brand.href !== "/") failures.push("brand/logo link is not /");

  for (const [label, expectedHref] of NAV_TARGETS.entries()) {
    const match = anchors.find((anchor) => anchor.text === label && anchor.href === expectedHref);
    if (!match) failures.push(`nav link missing or wrong: ${label} -> ${expectedHref}`);
  }

  const breadcrumbHome = anchors.find((anchor) => anchor.text === "Home" && anchor.href === "/");
  if (!breadcrumbHome) failures.push("breadcrumb Home link missing or wrong");

  const applyLinks = anchors.filter((anchor) => /Apply|View & Apply|Apply Now/i.test(anchor.text));
  if (!applyLinks.length) failures.push("missing apply button");
  for (const link of applyLinks) {
    if (!/^https?:\/\//i.test(link.href)) failures.push(`apply link is not external: ${link.href}`);
  }

  const relatedLinks = anchors.filter((anchor) => anchor.text === "View Details" && anchor.href.startsWith(`${SITE_URL}/opportunity/`));
  if (!relatedLinks.length) failures.push("missing related opportunity links");
  for (const link of relatedLinks) {
    const relatedPath = new URL(link.href).pathname;
    await assertFetch(baseUrl, relatedPath, "related opportunity", failures);
  }

  if (!anchors.some((anchor) => anchor.href.startsWith("https://twitter.com/intent/tweet"))) failures.push("missing Twitter share link");
  if (!anchors.some((anchor) => anchor.href.startsWith("mailto:?subject="))) failures.push("missing email share link");

  const jsonLdBlocks = [...html.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
  if (!jsonLdBlocks.length) failures.push("missing structured data");
  for (const block of jsonLdBlocks) {
    try {
      JSON.parse(block);
    } catch (error) {
      failures.push(`invalid structured data: ${error.message}`);
    }
  }

  return failures;
}

async function main() {
  const opportunityPaths = getOpportunityPaths();
  const server = await startServer();
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const failures = [];

  try {
    for (const pagePath of opportunityPaths) {
      const pageFailures = await auditPage(baseUrl, pagePath);
      pageFailures.forEach((failure) => failures.push(`${pagePath}: ${failure}`));
    }

    const cleanHome = await fetch(`${baseUrl}/index.html`, { redirect: "manual" });
    if (![301, 302, 307, 308].includes(cleanHome.status) || cleanHome.headers.get("location") !== "/") {
      failures.push(`/index.html redirect failed: ${cleanHome.status} ${cleanHome.headers.get("location")}`);
    }

    const cleanOpportunity = await fetch(`${baseUrl}${opportunityPaths[0]}index.html`, { redirect: "manual" });
    if (![301, 302, 307, 308].includes(cleanOpportunity.status)) {
      failures.push(`opportunity index redirect failed: ${cleanOpportunity.status}`);
    }

    console.log(`Opportunity pages checked: ${opportunityPaths.length}`);
    console.log(`Broken images/assets found: ${failures.filter((failure) => failure.includes("asset")).length}`);
    console.log(`Broken navigation issues found: ${failures.filter((failure) => failure.includes("nav") || failure.includes("brand") || failure.includes("breadcrumb")).length}`);
    console.log(`Total failures: ${failures.length}`);

    if (failures.length) {
      failures.forEach((failure) => console.error(`- ${failure}`));
      process.exitCode = 1;
      return;
    }

    console.log("Opportunity page audit passed.");
  } finally {
    server.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
