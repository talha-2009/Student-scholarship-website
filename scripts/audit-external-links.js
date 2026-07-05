const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CONCURRENCY = 8;
const TIMEOUT_MS = 12000;

function getHtmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", "brand-kit"].includes(entry.name)) return [];
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return getHtmlFiles(entryPath);
    return entry.name.endsWith(".html") ? [entryPath] : [];
  });
}

function getExternalUrls() {
  const urls = new Set();

  getHtmlFiles(ROOT).forEach((filePath) => {
    const html = fs.readFileSync(filePath, "utf8");
    for (const match of html.matchAll(/<a\b[^>]*href="(https?:\/\/[^"]+)"/g)) {
      try {
        const url = new URL(match[1].replaceAll("&amp;", "&"));
        if (/^(www\.)?opportunitynest\.org$/i.test(url.hostname)) continue;
        if (/(^|\.)((twitter|x)\.com)$/i.test(url.hostname)) continue;
        urls.add(url.href);
      } catch {
        // Invalid URLs are covered by the static page audit.
      }
    }
  });

  return [...urls];
}

async function checkUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const options = {
    method: "HEAD",
    redirect: "follow",
    signal: controller.signal,
    headers: { "user-agent": "Mozilla/5.0 OpportunityNest link audit" }
  };

  try {
    let response = await fetch(url, options);
    if (response.status >= 400) {
      response = await fetch(url, { ...options, method: "GET" });
    }
    return { url, status: response.status, finalUrl: response.url };
  } catch (error) {
    return { url, error: `${error.name}: ${error.message}` };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const urls = getExternalUrls();
  const results = [];
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < urls.length) {
      const url = urls[nextIndex++];
      results.push(await checkUrl(url));
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const failures = results.filter(
    (result) => result.error || result.status === 404 || result.status === 410 || result.status >= 500
  );

  console.log(`External URLs tested: ${results.length}`);
  console.log(`Definite failures: ${failures.length}`);
  failures.forEach((failure) => {
    console.log(`- ${failure.status || failure.error} ${failure.url}`);
  });

  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
