#!/usr/bin/env node
/*
IndexNow integration test script

This script runs a set of verification tests against a Preview or Production deployment.

Environment variables expected (do NOT expose secrets in logs):
- PREVIEW_URL: full base URL for the preview deployment (e.g. https://your-preview-xyz.vercel.app)
- SITE_DOMAIN: the primary domain (e.g. opportunitynest.org)
- INDEXNOW_KEY: the public key filename (e.g. ed824e562bd0438a94a3c1b6ab24178f)
- INDEXNOW_API_SECRET: secret for calling /api/indexnow on the deployed preview

Usage:
  # locally (after setting env vars):
  node scripts/indexnow-test.mjs

Note: This script performs network requests. It avoids printing secrets; ensure you don't echo them when calling.
*/

import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';

const PREVIEW = process.env.PREVIEW_URL;
const SITE_DOMAIN = process.env.SITE_DOMAIN || 'opportunitynest.org';
const KEY = process.env.INDEXNOW_KEY;
const SECRET = process.env.INDEXNOW_API_SECRET;

if (!PREVIEW) {
  console.error('Error: PREVIEW_URL environment variable is required (e.g., https://preview-xyz.vercel.app)');
  process.exit(2);
}
if (!KEY) {
  console.error('Error: INDEXNOW_KEY environment variable is required (e.g., ed824e562bd0438a94a3c1b6ab24178f)');
  process.exit(2);
}

const fetchWithTimeout = async (url, opts = {}, timeout = 10000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
};

function assert(condition, message) {
  if (!condition) {
    console.error('ASSERT FAILED:', message);
    process.exitCode = 3;
    throw new Error(message);
  }
}

async function checkVerificationFile() {
  const url = `${PREVIEW}/${KEY}.txt`;
  console.log('Checking verification file at', url);
  const res = await fetchWithTimeout(url, { method: 'GET' }, 8000);
  assert(res.status === 200, `Verification file HTTP ${res.status}`);
  const text = await res.text();
  assert(text.trim() === KEY, 'Verification file content mismatch (should match INDEXNOW_KEY exactly)');
  console.log('  ✓ verification file reachable and contents match');
}

async function checkApiEndpoint() {
  const url = `${PREVIEW}/api/indexnow`;
  console.log('Testing serverless API endpoint at', url);
  if (!SECRET) {
    console.warn('  - Warning: INDEXNOW_API_SECRET not provided; skipping API endpoint protected test (provide SECRET in env to test)');
    return;
  }

  const payload = { sitemap: `https://${SITE_DOMAIN}/sitemap.xml` };
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-indexnow-secret': SECRET },
    body: JSON.stringify(payload)
  }, 15000);
  assert(res.status === 200, `API endpoint returned HTTP ${res.status}`);
  const data = await res.json();
  console.log('  ✓ API endpoint accepted request; result summary:', { submittedBatches: data.submittedBatches || 0 });
}

async function checkSitemap() {
  const url = `https://${SITE_DOMAIN}/sitemap.xml`;
  console.log('Fetching sitemap at', url);
  const res = await fetchWithTimeout(url, { method: 'GET' }, 10000);
  assert(res.status === 200, `Sitemap returned HTTP ${res.status}`);
  const xml = await res.text();
  assert(xml.startsWith('<?xml') || xml.includes('<urlset'), 'Sitemap XML seems invalid or missing <urlset>');
  console.log('  ✓ sitemap fetched and appears valid');
}

async function checkRobots() {
  const url = `https://${SITE_DOMAIN}/robots.txt`;
  console.log('Fetching robots.txt at', url);
  const res = await fetchWithTimeout(url, { method: 'GET' }, 8000);
  assert(res.status === 200, `robots.txt returned HTTP ${res.status}`);
  const txt = await res.text();
  assert(/Sitemap:/i.test(txt), 'robots.txt does not contain a Sitemap: directive');
  console.log('  ✓ robots.txt fetched and contains Sitemap directive');
}

async function crawlAndCheckLinks(maxPages = 100) {
  console.log('Crawling internal links (limited) to detect broken links...');
  const toVisit = new Set();
  const visited = new Set();
  const broken = [];

  toVisit.add(PREVIEW + '/');

  while (toVisit.size && visited.size < maxPages) {
    const it = toVisit.values().next().value;
    toVisit.delete(it);
    if (visited.has(it)) continue;
    try {
      const res = await fetchWithTimeout(it, { method: 'GET' }, 10000);
      if (res.status >= 400) { broken.push({ url: it, status: res.status }); }
      const text = await res.text();
      visited.add(it);
      // find hrefs
      const hrefs = [...text.matchAll(/href\s*=\s*"([^"]+)"/gi)].map(m=>m[1]);
      for (let href of hrefs) {
        // skip anchors, mailto, tel, JS
        if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
        // normalize
        if (href.startsWith('/')) href = PREVIEW.replace(/https?:\/\/[^/]+/, '') + href; // convert to relative path on preview host
        if (href.startsWith('http')) {
          // Only follow same host (preview)
          if (!href.startsWith(PREVIEW)) continue;
        } else {
          // relative path
          const base = new URL(it).origin;
          href = new URL(href, base).toString();
        }
        if (!visited.has(href) && !href.includes('.svg') && !href.includes('.png') && !href.includes('.jpg')) toVisit.add(href);
      }
    } catch (e) {
      broken.push({ url: it, error: e.message });
      visited.add(it);
    }
  }

  if (broken.length) {
    console.warn('  ! Broken links found (sample up to 10):', broken.slice(0,10));
    throw new Error('Broken links detected');
  }
  console.log(`  ✓ Internal link crawl passed (${visited.size} pages visited)`);
}

async function checkCanonicalAndStructuredData() {
  const samplePaths = ['/', '/scholarships/', '/guides/application-checklist/'];
  for (const p of samplePaths) {
    const url = (p.startsWith('http') ? p : PREVIEW + p);
    console.log('Checking canonical and structured data for', url);
    try {
      const res = await fetchWithTimeout(url, { method: 'GET' }, 10000);
      assert(res.status === 200, `Page ${url} returned ${res.status}`);
      const html = await res.text();
      // canonical tag
      const canonMatch = html.match(/<link rel="canonical"[^>]*href="([^"]+)"/i);
      assert(canonMatch && canonMatch[1], 'Canonical link missing');
      // JSON-LD presence and parse
      const scripts = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
      if (scripts.length === 0) {
        console.log('    - No JSON-LD found on', url, '(this may be acceptable for some pages)');
      } else {
        for (const s of scripts) {
          try { JSON.parse(s); } catch (e) { throw new Error('Invalid JSON-LD on ' + url + ' — ' + e.message); }
        }
        console.log('    ✓ JSON-LD parsed on', url);
      }
      console.log('    ✓ canonical present:', canonMatch[1]);
    } catch (e) {
      console.error('    ! Error checking', url, e.message);
      throw e;
    }
  }
}

async function runAll() {
  try {
    await checkVerificationFile();
    await checkApiEndpoint();
    await checkSitemap();
    await checkRobots();
    await crawlAndCheckLinks(80);
    await checkCanonicalAndStructuredData();
    console.log('\nALL TESTS PASSED ✅');
    process.exit(0);
  } catch (e) {
    console.error('\nTEST SUITE FAILED:', e.message);
    process.exit(4);
  }
}

runAll();
