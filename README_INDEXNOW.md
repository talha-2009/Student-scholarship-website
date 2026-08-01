IndexNow integration — OpportunityNest

Overview

This document explains the IndexNow integration added on branch `seo/search-console-audit-fixes`.
It includes: a public verification file, a serverless secure API endpoint, and a safe, non-fatal build-time sitemap submission.

Files added

- ed824e562bd0438a94a3c1b6ab24178f.txt — public verification file (committed to repository root). This file must be publicly reachable at https://<your-domain>/<INDEXNOW_KEY>.txt.
- api/indexnow.js — serverless endpoint (POST) that accepts on-demand submissions and forwards batched requests to https://api.indexnow.org/indexnow.
- build.js — updated to optionally submit sitemap to IndexNow during build when `INDEXNOW_KEY` is present in environment.
- scripts/indexnow-test.mjs — test script to run a verification and sanity test suite against a Preview or Production deployment.

Security & Secrets

- Do NOT commit secret API keys into source control. The IndexNow API key (INDEXNOW_KEY) is intentionally the same string as the verification filename and is considered public for verification purposes, but the actual IndexNow HTTP submissions still require it. Store this value as an environment variable in Vercel (INDEXNOW_KEY).
- Protect the serverless endpoint with a secret header. Set an environment variable in Vercel: INDEXNOW_API_SECRET. The endpoint requires header `x-indexnow-secret` to match the environment value.
- Never paste or print INDEXNOW_API_SECRET in any public place or chat. The test script will use it from environment but will not display it.

Environment variables (Vercel)

Set the following in Project Settings → Environment Variables for Preview and Production (as appropriate):

- INDEXNOW_KEY = ed824e562bd0438a94a3c1b6ab24178f
- INDEXNOW_API_SECRET = <your-secure-64-character-secret>
- SITE_DOMAIN = opportunitynest.org

How the automatic submission flow works

1. Build-time: When Vercel runs the build, `build.js` will generate sitemap.xml with accurate per-file <lastmod> values. If `INDEXNOW_KEY` is present in the environment at build time, `build.js` will submit the sitemap URL (https://<SITE_DOMAIN>/sitemap.xml) to IndexNow. This submission is non-fatal: build errors are not caused by IndexNow failures.

2. On-demand submissions: The serverless endpoint `/api/indexnow` accepts POST requests with either:
   - JSON `{ "sitemap": "https://.../sitemap.xml" }` — IndexNow will be asked to process the sitemap
   - JSON `{ "urls": ["https://.../path/", "https://.../other/"] }` — a list of specific URLs to submit

   The endpoint performs these safety checks:
   - Requires header `x-indexnow-secret` (if INDEXNOW_API_SECRET is set) to protect from abuse
   - Validates each URL returns HTTP 200 (HEAD request) before submission
   - Deduplicates URLs
   - Batches requests (100 URLs per batch) and retries failed batches with exponential backoff
   - Logs results to server logs (console) without exposing secret keys

Deployment instructions

1. Push branch `seo/search-console-audit-fixes` to your remote (already done).
2. In Vercel, ensure this repo is connected and preview deploys are enabled.
3. Add environment variables (Preview environment):
   - INDEXNOW_KEY = ed824e562bd0438a94a3c1b6ab24178f
   - INDEXNOW_API_SECRET = <secure-64-char-secret> (generate locally and paste into Vercel)
   - SITE_DOMAIN = opportunitynest.org
4. Deploy the Preview build (Vercel will run `node build.js` during the build). Check the build logs for IndexNow messages. If INDEXNOW_KEY is set, the build will attempt to submit sitemap — the logs will show `[IndexNow] sitemap submission` messages (non-fatal).

Verification steps (after preview deploy)

1. Verification file:
   - Visit: https://<preview-domain>/ed824e562bd0438a94a3c1b6ab24178f.txt
   - Should return HTTP 200 and the body should be exactly `ed824e562bd0438a94a3c1b6ab24178f` (no extra newline or HTML).
2. API endpoint:
   - Call the serverless endpoint with the secret header and a sample sitemap or URLs (see example curl commands below in this README and in `scripts/indexnow-test.mjs`).
3. Sitemap:
   - Ensure sitemap.xml is valid XML and contains `<urlset>` entries with `<loc>` and `<lastmod>`.
4. robots.txt:
   - Ensure robots.txt includes `Sitemap: https://opportunitynest.org/sitemap.xml` and does not block important assets (CSS/JS/images) required for rendering.
5. Basic site health:
   - Load key pages and ensure HTTP 200 and titles/meta present.
6. Run the included test script (details below).

Troubleshooting

- Build-time submission not happening: ensure INDEXNOW_KEY is set in the environment for the build; `build.js` checks for its presence.
- API returning unauthorized: verify `INDEXNOW_API_SECRET` in Vercel matches the `x-indexnow-secret` header provided by the caller.
- IndexNow rejects requests: check the submitted payload and ensure the `host`, `key`, `keyLocation`, and `urlList` follow IndexNow guidelines; check logs for HTTP status.
- Git history not available in CI: `build.js` uses `git log` to compute lastmod. If CI performs shallow clones, fallback to file mtime is used. To always get git dates, ensure CI uses full clone or fetches history.

Rollback procedure

If any problem is detected after deploying this branch to Preview or Production:

1. Disable IndexNow quickly: remove `INDEXNOW_KEY` from environment variables in Vercel (build-time submission will be disabled on next deploy).
2. Disable the serverless endpoint: remove or unset `INDEXNOW_API_SECRET` to prevent external calls, or disable the function in Vercel if required.
3. Revert code: revert the `seo/search-console-audit-fixes` branch or deploy the previous commit to production/preview.
4. If needed, re-open the previous PR and run additional QA before attempting re-deploy.

Support

If you want me to run the test suite against a Preview deployment once you configure the Vercel environment variables, say so and provide the Preview URL (or allow me to detect it from the PR preview environment). I will NOT request or print the secret — the environment variable is used only inside the deployment.


---

README created for IndexNow integration. Follow the test instructions in scripts/indexnow-test.mjs to verify deployment.