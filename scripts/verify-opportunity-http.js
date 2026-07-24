const http = require("http");
const fs = require("fs");
const path = require("path");
const { assignOpportunitySlugs, getOpportunityDetailUrl } = require("./opportunity-slugs");

var SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) { console.error("ERROR: SUPABASE_URL env var required"); process.exit(1); }
var SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_PUBLISHABLE_KEY) { console.error("ERROR: SUPABASE_PUBLISHABLE_KEY env var required"); process.exit(1); }
const ROOT = path.join(__dirname, "..");

async function fetchOpportunities() {
  const url = `${SUPABASE_URL}/rest/v1/opportunities?select=id,title,country,slug&order=created_at.desc`;
  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status} ${await response.text()}`);
  }

  return assignOpportunitySlugs(await response.json());
}

function startServer() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    const relativePath = /^\/opportunity\/[^/]+\/?$/.test(pathname)
      ? "opportunity-detail.html"
      : pathname === "/"
        ? "index.html"
        : pathname.replace(/^\/+/, "");
    const filePath = path.resolve(ROOT, relativePath);

    if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      response.end(fs.readFileSync(path.join(ROOT, "404.html")));
      return;
    }

    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(fs.readFileSync(filePath));
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  const opportunities = await fetchOpportunities();
  const server = await startServer();
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const failures = [];
    for (const item of opportunities) {
      const url = `${baseUrl}${getOpportunityDetailUrl(item)}`;
      const response = await fetch(url);
      if (response.status !== 200) {
        failures.push(`${response.status} ${getOpportunityDetailUrl(item)} ${item.title}`);
      }
    }

    const invalidResponse = await fetch(`${baseUrl}/definitely-not-a-real-page`);
    if (invalidResponse.status !== 404) {
      failures.push(`Expected invalid static URL to return 404, got ${invalidResponse.status}`);
    }

    console.log(`HTTP opportunity pages tested: ${opportunities.length}`);
    console.log(`HTTP opportunity pages returning 200: ${opportunities.length - failures.length}`);
    console.log(`Invalid static URL status: ${invalidResponse.status}`);

    if (failures.length) {
      console.error("HTTP verification failed:");
      failures.forEach((failure) => console.error(`- ${failure}`));
      process.exitCode = 1;
      return;
    }

    console.log("HTTP verification passed: every generated opportunity URL returns 200.");
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
