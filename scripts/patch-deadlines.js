/**
 * Fix missing deadlines and update expired deadlines.
 */
var SUPABASE_URL = process.env.SUPABASE_URL;
var SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars required"); process.exit(1); }

const deadlineFixes = {
  "GREAT Scholarships": "2026-11-30",
  "University of Western Australia Global Excellence Scholarship": "2027-02-28",
  "University of British Columbia International Scholars Program": "2026-12-15",
  "Deutschlandstipendium": "2026-10-31",
  "UNIDO Internship Programme": "2026-12-31",
  "UNDP Internship Programme": "2026-12-31",
  "UNCTAD Internship Programme": "2026-12-31",
  "United Nations Internship Programme": "2026-12-31",
  "Urban Studies Foundation International Fellowships": "2027-01-15",
  "U.S. Commercial Service Germany Internship": "2027-03-01",
  "BMW Group Change Maker Fellowship": "2027-01-31",
  "CERN Administrative Student Programme": "2026-12-15",
  "CERN Technical Student Programme": "2026-12-15",
  "Max Planck Research Internship": "2026-11-30",
  "UNICEF Internship Programme": "2026-12-31",
  "AIESEC Global Talent": "2026-12-31",
  "Max Planck School Matter to Life URO": "2027-01-15",
  "IAESTE Internship Programme": "2026-12-31",
  "Commonwealth PhD Scholarship (Least Developed Countries and Fragile States)": "2027-03-31",
  "Yenching Scholarship (Yenching Academy of Peking University)": "2027-01-15",
  "Global Korea Scholarship (GKS)": "2027-02-28",
  "Fulbright Foreign Student Program": "2027-02-28",
  "Hubert H. Humphrey Fellowship Program": "2026-10-01",
  "Mastercard Foundation Scholars Program": "2027-01-31",
  "Asian Institute of Technology Scholarship": "2027-03-31",
  "MEXT Japanese Government Scholarship": "2027-04-30",
  "Teagasc Walsh Scholars Programme": "2027-01-31",
  "TED Fellows Program": "2026-10-31",
  "Harvard Pre-College Summer Program": "2027-02-15",
  "Google Software Engineering Internship": "2027-01-31",
  "UN Volunteers Programme": "2026-12-31",
  "Microsoft Explore Internship Program": "2027-01-15",
  "Global Undergraduate Exchange Program (Global UGRAD)": "2026-10-15",
  "MIT Research Science Institute (RSI)": "2026-11-15",
  "Erasmus+ Youth Exchange": "2026-12-31",
  "World Economic Forum Global Shapers Community": "2026-12-31",
  "National Geographic Explorer Grant": "2027-03-01",
  "AIESEC Global Volunteer": "2026-12-31",
  "Duke of Edinburgh International Award": "2026-12-31",
  "Global Undergraduate Awards": "2026-10-31",
  "Harvard WorldMUN": "2026-10-31",
  "UNESCO-Japan Prize on Education for Sustainable Development": "2027-02-28",
  "Cambridge Summer School Programme": "2027-03-15",
  "Fulbright Foreign Language Teaching Assistant Program": "2027-01-15",
  "Boren Awards for International Study": "2027-01-31",
  "Clinton Global Initiative University (CGI U)": "2026-11-15",
  "Fulbright-Nehru Master's Fellowship": "2027-04-15",
  "Salzburg Global Seminar Fellowship": "2026-12-31",
  "Amnesty International Human Rights Internship": "2027-01-31",
  "International Chemistry Olympiad (IChO)": "2027-02-28",
  "UNESCO Associate Expert Programme": "2026-12-31",
  "Joint Japan World Bank Graduate Scholarship Program": "2027-03-31",
  "Global Youth Ambassador Programme (Commonwealth)": "2026-12-31",
  "Stanford Data Science Summer Institute": "2027-02-01",
  "Erasmus Mundus Joint Master Degrees": "2027-02-15",
  "Peace Corps Volunteer Program": "2026-12-31",
  "Harvard Model United Nations (HMUN)": "2026-10-15",
  "WHO Internship Programme": "2026-12-31",
  "Rotary Peace Fellowship": "2026-10-31",
  "DAAD Research Grants for Doctoral Candidates and Young Academics": "2026-11-15",
  "DAAD EPOS (Development-Related Postgraduate Courses)": "2026-10-31",
  "DAAD Helmut-Schmidt-Programme (Public Policy and Good Governance)": "2026-10-15",
  "DAAD Bi-nationally Supervised Doctoral Degrees": "2026-11-30",
  "DAAD STEM Study Scholarship": "2026-10-31",
  "DAAD Study Scholarship": "2026-10-31",
  "Heinrich Böll Foundation Scholarship": "2026-11-01",
  "Rosa Luxemburg Stiftung Scholarship": "2026-11-01",
  "Konrad-Adenauer-Stiftung (KAS) International Scholarship Programme": "2027-03-31",
  "ETH Zurich Excellence Scholarship and Opportunity Programme": "2026-12-15",
  "Leiden University Excellence Scholarship": "2027-02-01",
  "Monash Graduate Scholarship (Research Training Program)": "2026-12-31",
  "ANU PhD Scholarship": "2026-12-31",
  "University of Melbourne Graduate Scholarship": "2026-12-31",
  "University of Sydney International Scholarships": "2027-02-28",
  "Pierre Elliott Trudeau Foundation Doctoral Scholarship": "2026-11-01",
  "McCall MacBain Scholarship": "2026-09-30",
  "Marshall Scholarship": "2026-10-15",
  "Weidenfeld-Hoffmann Scholarships and Leadership Programme": "2027-01-15",
  "Richard Plaschka Fellowship": "2026-11-30",
  "Franz Werfel Fellowship": "2026-12-31",
  "IMU-Simons Research Fellowship Program for Developing Countries": "2027-03-31",
  "A*STAR Research Attachment Programme (ARAP)": "2026-12-31",
  "DAAD WISE Research Internship": "2027-01-31",
  "Killam Fellowships Program": "2026-11-01",
  "Ellison Undergraduate Scholars Program": "2027-01-15",
  "The Geneva Challenge: Advancing Development Goals Contest": "2027-03-31",
  "James Dyson Award": "2027-03-31"
};

async function run() {
  const res = await fetch(SUPABASE_URL + "/rest/v1/opportunities?select=id,title", {
    headers: { apikey: SERVICE_KEY, Authorization: "Bearer " + SERVICE_KEY }
  });
  const all = await res.json();
  const titleToId = {};
  all.forEach(function(r) { titleToId[r.title] = r.id; });

  let fixed = 0, failed = 0, skipped = 0;

  for (const title in deadlineFixes) {
    const newDeadline = deadlineFixes[title];
    const id = titleToId[title];
    if (!id) { console.log("SKIP: " + title); skipped++; continue; }

    const patchRes = await fetch(SUPABASE_URL + "/rest/v1/opportunities?id=eq." + id, {
      method: "PATCH",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: "Bearer " + SERVICE_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({ deadline: newDeadline })
    });

    if (patchRes.ok) { fixed++; }
    else { console.log("FAIL: " + title + " (" + patchRes.status + ")"); failed++; }
  }

  console.log("\n=== DEADLINE FIX SUMMARY ===");
  console.log("Fixed: " + fixed);
  console.log("Failed: " + failed);
  console.log("Skipped: " + skipped);
}

run().catch(function(e) { console.error(e); process.exit(1); });
