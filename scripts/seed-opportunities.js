/**
 * Seed opportunities table via Supabase REST API.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.
 * Usage: node scripts/seed-opportunities.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL || "https://rveunrzbeynaizitqanx.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  process.exit(1);
}

const opportunities = [
  {
    type: "Scholarship",
    funding: "Fully funded tuition and living allowance",
    title: "Australia Awards Scholarships",
    country: "Australia",
    level: "Master's, PhD",
    field: "All fields of study",
    deadline: "2026-04-30",
    description:
      "Australia Awards Scholarships support students from eligible developing countries to study at participating Australian universities.",
    link: "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships"
  },
  {
    type: "Scholarship",
    funding: "Partial to full tuition support",
    title: "Vanier Canada Graduate Scholarships",
    country: "Canada",
    level: "PhD",
    field: "Health research, natural sciences, engineering, humanities, social sciences",
    deadline: "2026-10-31",
    description: "The Vanier CGS program helps Canadian institutions attract highly qualified doctoral students.",
    link: "https://vanier.gc.ca/en/home-accueil.html"
  },
  {
    type: "Scholarship",
    funding: "Full tuition and maintenance grant",
    title: "Chevening Scholarships",
    country: "UK",
    level: "Master's",
    field: "Any subject at a UK university",
    deadline: "2026-11-05",
    description: "Chevening Scholarships are the UK government's global scholarship programme.",
    link: "https://www.chevening.org/scholarships/"
  },
  {
    type: "Scholarship",
    funding: "Monthly stipend and travel allowance",
    title: "DAAD Scholarships for Development-Related Postgraduate Courses",
    country: "Germany",
    level: "Master's",
    field: "Development-related fields",
    deadline: "2026-08-15",
    description: "DAAD supports international graduates with scholarship opportunities for development-related postgraduate courses in Germany.",
    link: "https://www.daad.de/en/study-and-research-in-germany/scholarships/"
  },
  {
    type: "Fellowship",
    funding: "Living allowance and research support",
    title: "Alexander von Humboldt Research Fellowship",
    country: "Germany",
    level: "Postdoctoral, Experienced researchers",
    field: "All research fields",
    deadline: "Rolling",
    description: "The Humboldt Research Fellowship enables highly qualified researchers from abroad to conduct research in Germany.",
    link: "https://www.humboldt-foundation.de/en/apply/sponsorship/humboldt-research-fellowship"
  },
  {
    type: "Fellowship",
    funding: "Stipend and professional development",
    title: "Commonwealth Professional Fellowships",
    country: "UK",
    level: "Mid-career professionals",
    field: "Development and public sector fields",
    deadline: "2026-07-14",
    description: "Commonwealth Professional Fellowships support mid-career professionals from low and middle income Commonwealth countries.",
    link: "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-professional-fellowships/"
  },
  {
    type: "Fellowship",
    funding: "Research grant and mentorship",
    title: "Australia Research Council Discovery Early Career Researcher Award",
    country: "Australia",
    level: "Early career researchers",
    field: "All research disciplines",
    deadline: "2026-06-30",
    description: "DECRA fellowships provide focused research support for early career researchers in Australia.",
    link: "https://www.arc.gov.au/funding-research/funding-schemes/discovery-program/discovery-early-career-researcher-award-decr"
  },
  {
    type: "Fellowship",
    funding: "Research stipend and project funding",
    title: "Marie Sklodowska-Curie Actions Postdoctoral Fellowship",
    country: "UK",
    level: "Postdoctoral",
    field: "All research fields",
    deadline: "2026-09-14",
    description: "MSCA Postdoctoral Fellowships support researchers to carry out research activities abroad and acquire new skills.",
    link: "https://marie-sklodowska-curie-actions.ec.europa.eu/actions/postdoctoral-fellowships"
  }
];

async function seed() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/opportunities?on_conflict=title,country,type`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(opportunities)
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Seed failed:", response.status, body);
    process.exit(1);
  }

  const data = await response.json();
  console.log(`Seeded ${data.length} opportunities successfully.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
