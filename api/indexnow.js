// IndexNow submission endpoint for OpportunityNest
// Protected: requires X-IndexNow-Secret header matching process.env.INDEXNOW_API_SECRET

import { URL } from 'url';

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function delay(ms){ return new Promise(r=>setTimeout(r, ms)); }

async function isUrlOk(url, timeout = 8000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal, redirect: 'follow' });
    clearTimeout(timer);
    return res.status === 200;
  } catch (e) {
    return false;
  }
}

async function submitBatch(domain, key, keyLocation, urls, maxRetries = 3) {
  const payload = {
    host: domain,
    key: key,
    keyLocation: keyLocation,
    urlList: urls
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timer);
      const text = await res.text();
      console.log(`[IndexNow] submitted ${urls.length} url(s) attempt=${attempt} status=${res.status}`);
      return { ok: res.ok, status: res.status, body: text };
    } catch (err) {
      console.warn(`[IndexNow] submit attempt ${attempt} failed: ${err && err.message ? err.message : err}`);
      if (attempt < maxRetries) await delay(2 ** attempt * 1000);
    }
  }
  return { ok: false, status: 0 };
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Require a configured secret to avoid public abuse
  const protectSecret = process.env.INDEXNOW_API_SECRET;
  if (protectSecret) {
    const header = req.headers['x-indexnow-secret'];
    if (!header || header !== protectSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const body = req.body || (await new Promise(r => { let data=''; req.on('data',c=>data+=c); req.on('end',()=>r(JSON.parse(data||'{}'))); }));
  let urls = Array.isArray(body.urls) ? body.urls.slice() : [];
  const sitemap = body.sitemap;

  if (!urls.length && !sitemap) return res.status(400).json({ error: 'Provide urls (array) or sitemap (string URL)' });

  if (sitemap && typeof sitemap === 'string') {
    // Accept sitemap submission by asking IndexNow for the sitemap URL
    urls.push(sitemap);
  }

  // Normalize and dedupe
  urls = urls.map(u => { try { return (new URL(u)).toString(); } catch(e){ return null } }).filter(Boolean);
  urls = [...new Set(urls)];

  // Only keep URLs that return 200
  const okUrls = [];
  for (const u of urls) {
    try {
      if (await isUrlOk(u)) okUrls.push(u);
      else console.log(`[IndexNow] skipping (non-200): ${u}`);
    } catch (e) {
      console.warn(`[IndexNow] error checking url ${u}: ${e && e.message ? e.message : e}`);
    }
  }

  if (!okUrls.length) return res.status(400).json({ error: 'No valid URLs to submit' });

  const domainEnv = process.env.SITE_DOMAIN || process.env.NEXT_PUBLIC_SITE_DOMAIN || (new URL(okUrls[0]).hostname);
  const key = process.env.INDEXNOW_KEY;
  if (!key) return res.status(500).json({ error: 'IndexNow key not configured in environment' });
  const keyLocation = `https://${domainEnv}/${key}.txt`;

  // Batch submit (safe chunk size)
  const batches = chunkArray(okUrls, 100);
  const results = [];
  for (const batch of batches) {
    const r = await submitBatch(domainEnv, key, keyLocation, batch, 3);
    results.push({ batchSize: batch.length, result: r });
  }

  return res.status(200).json({ submittedBatches: results.length, results });
}
