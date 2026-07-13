const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { assignOpportunitySlugs, getOpportunityDetailUrl } = require("./opportunity-slugs");

const ROOT = path.join(__dirname, "..");
const REPORT_DIR = path.join(ROOT, "reports");
const SUPABASE_URL = process.env.SUPABASE_URL || "https://rveunrzbeynaizitqanx.supabase.co";
const SUPABASE_READ_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || "sb_publishable_i_Hzb5vyGZhjIXWNprJ_Tg_FJTry3DD";
const SUPABASE_DELETE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ACCESS_TOKEN;
const PAGE_SIZE = 1000;
const TODAY = process.env.CLEANUP_CURRENT_DATE || new Date().toISOString().slice(0, 10);

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim());
}

function classifyDeadline(item) {
  const deadline = String(item.deadline || "").trim();
  const status = String(item.deadline_status || "fixed").trim();

  if (!deadline) return { state: "manual_review", reason: "missing deadline" };
  if (status && status !== "fixed") return { state: "active", reason: `non-fixed deadline status: ${status}` };
  if (!isIsoDate(deadline)) return { state: "manual_review", reason: `invalid deadline: ${deadline}` };
  if (deadline < TODAY) return { state: "expired", reason: `deadline ${deadline} is before ${TODAY}` };
  return { state: "active", reason: `deadline ${deadline} is on or after ${TODAY}` };
}

async function supabaseRequest(pathname, options = {}, key = SUPABASE_READ_KEY) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${pathname}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status} ${await response.text()}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

async function fetchAllOpportunities() {
  const rows = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const query = [
      "select=id,type,funding,title,country,level,field,deadline,deadline_status,description,link,slug,created_at",
      "order=created_at.desc",
      `limit=${PAGE_SIZE}`,
      `offset=${offset}`
    ].join("&");
    const batch = await supabaseRequest(`opportunities?${query}`);
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) return rows;
  }
}

async function deleteExpiredOpportunities(items) {
  const deleted = [];
  const errors = [];

  if (!SUPABASE_DELETE_KEY) {
    return {
      deleted,
      errors: items.length
        ? [{ message: "Set SUPABASE_SERVICE_ROLE_KEY before running cleanup so expired rows can be deleted safely." }]
        : []
    };
  }

  for (let index = 0; index < items.length; index += 100) {
    const batch = items.slice(index, index + 100);
    const ids = batch.map((item) => item.id).join(",");
    try {
      await supabaseRequest(`opportunities?id=in.(${ids})`, {
        method: "DELETE",
        headers: { Prefer: "return=representation" }
      }, SUPABASE_DELETE_KEY);
      deleted.push(...batch);
    } catch (error) {
      errors.push({ ids: batch.map((item) => item.id), message: error.message });
    }
  }

  return { deleted, errors };
}

function removeExpiredGeneratedPages(items) {
  const removed = [];
  const errors = [];

  for (const item of assignOpportunitySlugs(items)) {
    const detailPath = getOpportunityDetailUrl(item);
    const folder = path.join(ROOT, ...detailPath.split("/").filter(Boolean));
    try {
      if (fs.existsSync(folder)) {
        fs.rmSync(folder, { recursive: true, force: true });
        removed.push(detailPath);
      }
    } catch (error) {
      errors.push({ path: detailPath, message: error.message });
    }
  }

  return { removed, errors };
}

function regenerateSeoPages() {
  const pythonCandidates = [
    process.env.PYTHON,
    "python",
    "py"
  ].filter(Boolean);

  const errors = [];
  for (const python of pythonCandidates) {
    const result = spawnSync(python, ["scripts/generate-seo-pages.py"], {
      cwd: ROOT,
      encoding: "utf8",
      shell: false
    });

    if (result.status === 0) {
      return { ok: true, command: `${python} scripts/generate-seo-pages.py`, stdout: result.stdout.trim() };
    }

    errors.push({
      command: `${python} scripts/generate-seo-pages.py`,
      status: result.status,
      stderr: result.stderr.trim()
    });
  }

  return { ok: false, errors };
}

function writeReport(report) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(REPORT_DIR, `expired-opportunities-cleanup-${timestamp}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(report, null, 2)}\n`);
  return filePath;
}

async function main() {
  const report = {
    currentDate: TODAY,
    totalScanned: 0,
    totalExpiredDeleted: 0,
    totalActiveRemaining: 0,
    skippedManualReview: [],
    expiredDetected: [],
    deletedOpportunities: [],
    removedGeneratedPages: [],
    errors: []
  };

  try {
    const opportunities = await fetchAllOpportunities();
    const classified = opportunities.map((item) => ({ item, ...classifyDeadline(item) }));
    const expired = classified.filter((entry) => entry.state === "expired").map((entry) => entry.item);
    const active = classified.filter((entry) => entry.state === "active").map((entry) => entry.item);
    const manualReview = classified.filter((entry) => entry.state === "manual_review");

    report.totalScanned = opportunities.length;
    report.totalActiveRemaining = active.length + manualReview.length;
    report.skippedManualReview = manualReview.map(({ item, reason }) => ({
      id: item.id,
      title: item.title,
      country: item.country,
      deadline: item.deadline,
      reason
    }));
    report.expiredDetected = expired.map((item) => ({
      id: item.id,
      title: item.title,
      country: item.country,
      deadline: item.deadline,
      url: getOpportunityDetailUrl(item)
    }));

    const { deleted, errors: deleteErrors } = await deleteExpiredOpportunities(expired);
    report.totalExpiredDeleted = deleted.length;
    report.deletedOpportunities = deleted.map((item) => ({
      id: item.id,
      title: item.title,
      country: item.country,
      deadline: item.deadline,
      url: getOpportunityDetailUrl(item)
    }));
    report.errors.push(...deleteErrors);

    const { removed, errors: removeErrors } = removeExpiredGeneratedPages(deleted);
    report.removedGeneratedPages = removed;
    report.errors.push(...removeErrors);

    const regeneration = regenerateSeoPages();
    report.regeneration = regeneration;
    if (!regeneration.ok) report.errors.push({ message: "SEO page and sitemap regeneration failed.", details: regeneration.errors });
  } catch (error) {
    report.errors.push({ message: error.message });
  }

  const reportPath = writeReport(report);
  console.log(`Total opportunities scanned: ${report.totalScanned}`);
  console.log(`Total expired opportunities deleted: ${report.totalExpiredDeleted}`);
  console.log(`Total active opportunities remaining: ${report.totalActiveRemaining}`);
  console.log(`Opportunities skipped due to missing or invalid deadlines: ${report.skippedManualReview.length}`);
  console.log(`Errors encountered: ${report.errors.length}`);
  console.log(`Report: ${reportPath}`);

  if (report.errors.length) process.exit(1);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { classifyDeadline };
