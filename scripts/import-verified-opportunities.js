const fs = require("fs");
const path = require("path");
const { slugify } = require("./opportunity-slugs");

const ROOT = path.join(__dirname, "..");
const DATA_FILE = path.join(ROOT, "data", "verified-opportunities-2026.json");
const REPORT_DIR = path.join(ROOT, "reports");
const SUPABASE_URL = process.env.SUPABASE_URL || "https://rveunrzbeynaizitqanx.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.argv.includes("--dry-run");
const VALID_TYPES = new Set([
  "Scholarship",
  "Internship",
  "Fellowship",
  "Conference",
  "Exchange Program",
  "Competition",
  "Summer Program",
  "Research Program",
  "Research Grant",
  "Grant",
  "Volunteer Program",
  "Youth Program",
  "Training Program"
]);
const VALID_DEADLINE_STATUS = new Set(["fixed", "rolling", "varies", "not_announced"]);

function readRecords() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function validateRecord(record, index, today) {
  const errors = [];
  const required = [
    "title",
    "country",
    "host_organization",
    "type",
    "funding",
    "eligibility_criteria",
    "level",
    "field",
    "duration",
    "benefits",
    "required_documents",
    "application_process",
    "important_notes",
    "deadline",
    "deadline_status",
    "description",
    "link",
    "seo_title",
    "seo_description",
    "verification_source",
    "verified_at"
  ];

  required.forEach((field) => {
    if (!record[field] || !String(record[field]).trim()) errors.push(`${field} is required`);
  });

  if (!VALID_TYPES.has(record.type)) errors.push(`unsupported type: ${record.type}`);
  if (!VALID_DEADLINE_STATUS.has(record.deadline_status)) errors.push(`unsupported deadline_status: ${record.deadline_status}`);
  if (record.deadline_status === "fixed" && !isIsoDate(record.deadline)) errors.push("fixed deadlines must use YYYY-MM-DD");
  if (record.deadline_status === "fixed" && record.deadline < today) errors.push(`deadline has passed: ${record.deadline}`);
  if (!/^https:\/\/.+/i.test(record.link || "")) errors.push("official link must be HTTPS");
  if (!/^https:\/\/.+/i.test(record.verification_source || "")) errors.push("verification source must be HTTPS");
  if ((record.seo_description || "").length < 145 || (record.seo_description || "").length > 165) {
    errors.push(`seo_description must be 145-165 characters, got ${(record.seo_description || "").length}`);
  }
  if ((record.description || "").split(/\s+/).filter(Boolean).length < 250) {
    errors.push("description is too thin; expected at least 250 words for import validation");
  }

  return errors.map((message) => ({ index, title: record.title || "(untitled)", message }));
}

async function checkUrl(url) {
  const response = await fetch(url, { method: "GET", redirect: "follow" });
  return {
    url,
    ok: response.ok,
    status: response.status,
    finalUrl: response.url
  };
}

async function fetchExistingKeys() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/opportunities?select=title,country,type`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`
    }
  });

  if (!response.ok) throw new Error(`Could not fetch existing opportunities: ${response.status} ${await response.text()}`);
  const rows = await response.json();
  return new Set(rows.map((row) => `${row.title}|||${row.country}|||${row.type}`.toLowerCase()));
}

async function insertRecords(records) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/opportunities?on_conflict=title,country,type`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=representation"
    },
    body: JSON.stringify(records)
  });

  if (!response.ok) throw new Error(`Import failed: ${response.status} ${await response.text()}`);
  return response.json();
}

function publicRecord(record) {
  return {
    type: record.type,
    funding: record.funding,
    title: record.title,
    country: record.country,
    level: record.level,
    field: record.field,
    deadline: record.deadline,
    deadline_status: record.deadline_status,
    description: record.description,
    link: record.link,
    slug: record.slug || slugify(`${record.title} ${record.country}`),
    seo_title: record.seo_title,
    seo_description: record.seo_description,
    tags: record.tags || [],
    host_organization: record.host_organization,
    duration: record.duration,
    eligibility_criteria: record.eligibility_criteria,
    benefits: record.benefits,
    required_documents: record.required_documents,
    application_process: record.application_process,
    selection_criteria: record.selection_criteria || "",
    important_notes: record.important_notes,
    verified_at: record.verified_at,
    verification_source: record.verification_source
  };
}

function writeReport(report) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(REPORT_DIR, `verified-opportunities-import-${stamp}.json`);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  return reportPath;
}

async function main() {
  if (!SERVICE_KEY && !DRY_RUN) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");

  const today = new Date().toISOString().slice(0, 10);
  const records = readRecords();
  const report = {
    generatedAt: new Date().toISOString(),
    totalOpportunitiesVerified: records.length,
    totalOpportunitiesSuccessfullyAdded: 0,
    countriesCovered: [],
    opportunityTypesCovered: [],
    skipped: [],
    linkChecks: []
  };

  const validationErrors = records.flatMap((record, index) => validateRecord(record, index, today));
  validationErrors.forEach((error) => report.skipped.push({ title: error.title, reason: error.message }));

  const existingKeys = SERVICE_KEY ? await fetchExistingKeys() : new Set();
  const candidates = [];
  for (const record of records) {
    if (validationErrors.some((error) => error.title === record.title)) continue;
    const key = `${record.title}|||${record.country}|||${record.type}`.toLowerCase();
    if (existingKeys.has(key)) {
      report.skipped.push({ title: record.title, reason: "duplicate existing record" });
      continue;
    }

    try {
      const linkCheck = await checkUrl(record.link);
      const sourceCheck = record.verification_source === record.link ? linkCheck : await checkUrl(record.verification_source);
      report.linkChecks.push(linkCheck, sourceCheck);
      if (!linkCheck.ok || !sourceCheck.ok) {
        report.skipped.push({ title: record.title, reason: `broken official link or source (${linkCheck.status}/${sourceCheck.status})` });
        continue;
      }
      candidates.push(publicRecord(record));
    } catch (error) {
      report.skipped.push({ title: record.title, reason: `link validation failed: ${error.message}` });
    }
  }

  if (candidates.length && !DRY_RUN) {
    const inserted = await insertRecords(candidates);
    report.totalOpportunitiesSuccessfullyAdded = inserted.length;
  } else if (DRY_RUN) {
    report.totalOpportunitiesSuccessfullyAdded = 0;
    report.dryRunCandidates = candidates.length;
  }

  report.countriesCovered = Array.from(new Set(candidates.map((record) => record.country))).sort();
  report.opportunityTypesCovered = Array.from(new Set(candidates.map((record) => record.type))).sort();
  const reportPath = writeReport(report);

  console.log(`Total opportunities verified: ${report.totalOpportunitiesVerified}`);
  console.log(`Total opportunities successfully added: ${report.totalOpportunitiesSuccessfullyAdded}`);
  console.log(`Countries covered: ${report.countriesCovered.join(", ")}`);
  console.log(`Opportunity types covered: ${report.opportunityTypesCovered.join(", ")}`);
  console.log(`Skipped: ${report.skipped.length}`);
  console.log(`Report: ${reportPath}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
