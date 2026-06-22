const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const internships = [
  {
    title: "UNICEF Internship Programme",
    organization: "UNICEF",
    country: "Global",
    city: "Multiple locations and remote options",
    internship_type: "Humanitarian",
    degree_level: "Undergraduate, Graduate, PhD, Recent graduates",
    duration: "6 to 26 weeks; full-time or part-time depending on office needs",
    funding: "Paid monthly stipend; travel and visa contribution may be available when funding allows",
    deadline: "Rolling - opportunities open throughout the year",
    official_url: "https://www.unicef.org/careers/internships",
    description:
      "UNICEF offers students and recent graduates practical experience in the humanitarian and development sector through internship opportunities across offices worldwide. Applicants should be at least 18 and enrolled in or recently graduated from an undergraduate, graduate, or PhD program.",
    logo_url: "",
    featured: true
  },
  {
    title: "AIESEC Global Talent",
    organization: "AIESEC",
    country: "Global",
    city: "Multiple host countries",
    internship_type: "Professional",
    degree_level: "Undergraduate, Graduate, Recent graduates",
    duration: "Varies by host organization and internship listing",
    funding: "Varies by opportunity; many placements include local support and practical workplace experience",
    deadline: "Rolling - depends on selected opportunity",
    official_url: "https://aiesec.org/global-talent",
    description:
      "AIESEC Global Talent connects young people with international professional internships across business, technology, marketing, engineering, finance, and other fields. The program emphasizes cross-cultural workplace experience and leadership development.",
    logo_url: "",
    featured: true
  },
  {
    title: "Max Planck Research Internship",
    organization: "Max Planck Society - Computer and Information Science",
    country: "Germany",
    city: "Multiple Max Planck institutes",
    internship_type: "Research",
    degree_level: "Undergraduate, Graduate, Master's",
    duration: "Varies by research group and project",
    funding: "Funding varies by institute, project, and host group; applicants should confirm support details before applying",
    deadline: "Application portal availability varies",
    official_url: "https://apply.cis.mpg.de/register/internship",
    description:
      "The Max Planck Society Computer and Information Science application system supports internship registration for research opportunities connected to Max Planck institutes. Applicants create an account and follow the portal process for available internship projects.",
    logo_url: "",
    featured: false
  },
  {
    title: "Max Planck School Matter to Life URO",
    organization: "Max Planck School Matter to Life",
    country: "Germany",
    city: "Labs across the Matter to Life network",
    internship_type: "Research",
    degree_level: "Undergraduate",
    duration: "10 weeks",
    funding: "Fully funded support for travel, accommodation, and living expenses",
    deadline: "Next application cycle to be announced - check official website",
    official_url: "https://mattertolife.maxplanckschools.org/uro-research-internship",
    description:
      "The Matter to Life Undergraduate Research Opportunities program offers bachelor's students a funded 10-week research internship with faculty fellows in Germany, focused on interdisciplinary life sciences and research training.",
    logo_url: "",
    featured: true
  },
  {
    title: "DAAD RISE Professional",
    organization: "DAAD / Research in Germany",
    country: "Germany",
    city: "German companies and non-university research institutions",
    internship_type: "Industry Research",
    degree_level: "Master's, PhD, RISE Germany alumni",
    duration: "3 months, with 10 weeks minimum, up to 6 months",
    funding:
      "Monthly scholarship of 861 euros for bachelor's/master's students and 1,200 euros for PhD students; travel expenses and insurance support included",
    deadline: "Annual application cycle - check official website",
    official_url:
      "https://www.research-in-germany.org/research-funding/funding-programmes/daad-rise-professional-summer-internships-with-german-companies.html",
    description:
      "RISE Professional offers research internships in Germany for eligible students from the USA, Canada, the United Kingdom, or Ireland who want practical science and engineering experience with German companies or industry-linked research institutions.",
    logo_url: "",
    featured: true
  }
];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this script.");
  process.exit(1);
}

const assertActiveUrls = async () => {
  for (const internship of internships) {
    const response = await fetch(internship.official_url, { method: "GET", redirect: "follow" });
    if (!response.ok) {
      throw new Error(`${internship.title} URL returned ${response.status}: ${internship.official_url}`);
    }
  }
};

const seed = async () => {
  await assertActiveUrls();

  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/internships?on_conflict=title,organization`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(internships)
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.error(payload);
    throw new Error(`Supabase insert failed with ${response.status}`);
  }

  console.log(`Seeded ${payload?.length || internships.length} internship records.`);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
