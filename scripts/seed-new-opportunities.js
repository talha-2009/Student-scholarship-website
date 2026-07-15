/**
 * Seed 5 new verified opportunities into Supabase.
 * Usage: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-new-opportunities.js
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
    funding: "Full tuition waiver, monthly stipend, health insurance, and travel allowance",
    title: "Swiss Government Excellence Scholarships",
    country: "Switzerland",
    level: "Master's, PhD, Postdoctoral",
    field: "All fields — arts, sciences, engineering, music, design, and research",
    deadline: "2026-12-31",
    description:
      "The Swiss Government Excellence Scholarships 2027-2028, administered by the State Secretariat for Education, Research and Innovation (SERI), represent one of Europe's most prestigious fully funded academic awards. Each year the Swiss Confederation grants scholarships to outstanding postgraduate researchers and artists from over 180 eligible countries to study or conduct research at Swiss cantonal universities, federal institutes of technology, and other recognized institutions. Scholarship holders join a vibrant international community in one of the world's leading research environments, benefiting from Switzerland's multilingual culture, world-class laboratories, and close collaboration between academia and industry. Research fellowship candidates pursue projects of 12 months or more under the supervision of an approved host professor, while master's students receive full financial support for one to three years of graduate study. The selection committee evaluates candidates on academic merit, research proposal quality, and the potential for meaningful contribution to their field. Applicants should begin preparing when the portal opens on 20 August 2026; country-specific deadlines range from October through December 2026.",
    link: "https://www.sbfi.admin.ch/en/swiss-government-excellence-scholarships",
    slug: "swiss-government-excellence-scholarships-2027"
  },
  {
    type: "Internship",
    funding: "Fully funded — round-trip airfare, monthly stipend, accommodation, and health insurance",
    title: "OIST Research Internship Program",
    country: "Japan",
    level: "Bachelor's, Master's",
    field: "All sciences — biology, chemistry, physics, mathematics, computer science, neuroscience, marine science",
    deadline: "2026-10-15",
    description:
      "The Okinawa Institute of Science and Technology (OIST) Research Internship Program offers a fully funded, immersive research experience at one of Asia's most innovative interdisciplinary science institutes, located in subtropical Okinawa, Japan. Selected interns work alongside OIST faculty and research groups for four to six months, gaining hands-on experience in cutting-edge laboratories equipped with state-of-the-art technology. The program is explicitly designed for students considering a future PhD, as it provides a realistic preview of doctoral-level research in a truly international environment where English is the working language. Interns receive a generous support package covering round-trip airfare, a monthly living stipend, on-campus housing, and health insurance, removing all financial barriers to participation. The Spring 2027 internship period runs from April through September 2027, with the application deadline on 15 October 2026. Candidates in the final two years of a bachelor's degree or currently enrolled in a master's program are eligible, regardless of nationality. The selection process weighs academic record, research potential, recommendation letters, and alignment between the applicant's interests and available OIST research units.",
    link: "https://www.oist.jp/admissions/research-internship",
    slug: "oist-research-internship-program-japan"
  },
  {
    type: "Fellowship",
    funding: "Monthly stipend, travel costs, accommodation, and full participation in OECD research programmes",
    title: "OECD Co-operative Research Programme Fellowship",
    country: "France",
    level: "Postdoctoral, Early-career researchers",
    field: "Agriculture, fisheries, food, forests, trade, water, biodiversity, climate change, and sustainable development",
    deadline: "2026-09-10",
    description:
      "The OECD Co-operative Research Programme (CRP) Research Fellowship 2027 provides a unique opportunity for early-career researchers to conduct policy-relevant research within one of the world's most influential intergovernmental economic organizations, based at the OECD headquarters in Paris, France. Funded by the governments of Australia, Ireland, the Netherlands, New Zealand, Norway, Sweden, and Switzerland, the CRP Fellowship programme enables researchers from member and partner countries to spend up to twelve months working alongside OECD economists and policy analysts on projects that directly inform global decision-making on food, agriculture, fisheries, forests, trade, water, and sustainable development. Fellows gain unparalleled access to OECD data, expert networks, and policy processes while contributing original research that shapes international standards. The application deadline for the 2027 fellowship cycle is 10 September 2026 at midnight Paris time. Proposals should address one or more of the CRP's priority research themes and demonstrate clear policy relevance. Successful candidates are selected through a competitive peer-review process that evaluates the scientific quality of the proposal, its alignment with CRP priorities, and the applicant's research track record.",
    link: "https://www.oecd.org/en/about/programmes/co-operative-research-programme/crp-applications-for-fellowships.html",
    slug: "oecd-crp-research-fellowship-france"
  },
  {
    type: "Fellowship",
    funding: "Fully funded — annual stipend, research budget, housing allowance, travel, and conference support for three years",
    title: "KAUST Global Fellowship Program",
    country: "Saudi Arabia",
    level: "Postdoctoral",
    field: "Water, food, health, energy, artificial intelligence, and Red Sea environmental research",
    deadline: "2026-10-01",
    description:
      "The King Abdullah University of Science and Technology (KAUST) Global Fellowship Program (KGFP) is a highly competitive three-year postdoctoral fellowship that empowers exceptional early-career scientists to pursue ambitious research at one of the Middle East's most well-resourced research universities, located on the shores of the Red Sea in Thuwal, Saudi Arabia. Fellows receive a generous annual stipend, a dedicated research budget, on-campus housing or housing allowance, full health coverage, and travel support for conferences and collaborations. The fellowship targets researchers who have earned their PhD within the past four years and who propose projects aligned with KAUST's core research missions: water security, food and agriculture, human health, energy sustainability, artificial intelligence, and Red Sea ecosystem science. The 2027 application cycle opens on 1 September 2026, with Stage 1 concept note submissions due by 1 October 2026. Applicants must identify up to two KAUST faculty members whose expertise matches their proposed research. Those who secure host principal investigator support advance to Stage 2, where full research proposals are accepted from 15 November 2026 to 15 January 2027. KAUST encourages applications from all nationalities and particularly welcomes female candidates to promote gender balance in science and engineering.",
    link: "https://kgfp.kaust.edu.sa/how-to-apply",
    slug: "kaust-global-fellowship-program-saudi-arabia"
  },
  {
    type: "Scholarship",
    funding: "Full tuition coverage, monthly living allowance, airfare, settlement allowance, and health insurance",
    title: "Singapore International Graduate Award",
    country: "Singapore",
    level: "PhD",
    field: "Science, technology, engineering, mathematics, and related interdisciplinary research areas",
    deadline: "2026-12-01",
    description:
      "The Singapore International Graduate Award (SINGA), administered by the Agency for Science, Technology and Research (A*STAR), is Singapore's flagship fully funded doctoral scholarship for outstanding international students. SINGA attracts top talent from around the world to pursue PhD studies at Singapore's leading research institutions, including the National University of Singapore (Nanyang Technological University), NUS Graduate School, and A*STAR research institutes. The scholarship covers the full duration of a PhD programme — typically four years — and provides a comprehensive financial package including full tuition fees, a generous monthly stipend, one-time airfare, a settlement allowance, and health insurance. Recipients join a cohort of some of the brightest minds in science and engineering, working on research that spans biomedical sciences, physical sciences, engineering, computing, and sustainability. The application window for the August 2027 intake is expected to open in June 2026, with a final deadline around 1 December 2026. Applicants must hold a good honours degree in a relevant discipline and demonstrate strong research potential. The selection process is highly competitive, evaluating academic excellence, research experience, publications, and the quality of the proposed research plan in alignment with a host supervisor at a Singapore institution.",
    link: "https://www.a-star.edu.sg/scholarships",
    slug: "singapore-international-graduate-award-singa"
  }
];

async function seed() {
  // First, check for duplicates by querying existing titles
  const checkResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/opportunities?select=title,country,type`,
    {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`
      }
    }
  );

  if (!checkResponse.ok) {
    console.error("Failed to check existing opportunities:", checkResponse.status);
    process.exit(1);
  }

  const existing = await checkResponse.json();
  const existingKeys = new Set(
    existing.map((r) => `${r.title}|${r.country}|${r.type}`)
  );

  const newOpps = opportunities.filter((o) => {
    const key = `${o.title}|${o.country}|${o.type}`;
    if (existingKeys.has(key)) {
      console.log(`SKIP (duplicate): ${o.title} — ${o.country}`);
      return false;
    }
    return true;
  });

  if (newOpps.length === 0) {
    console.log("All opportunities already exist. Nothing to insert.");
    return;
  }

  console.log(`\nInserting ${newOpps.length} new opportunities...\n`);

  const insertResponse = await fetch(
    `${SUPABASE_URL}/rest/v1/opportunities`,
    {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify(newOpps)
    }
  );

  if (!insertResponse.ok) {
    const body = await insertResponse.text();
    console.error("Insert failed:", insertResponse.status, body);
    process.exit(1);
  }

  const inserted = await insertResponse.json();
  console.log(`Successfully inserted ${inserted.length} opportunities:\n`);
  inserted.forEach((o) => {
    console.log(`  ✓ ${o.title} — ${o.country} (${o.type}) [id: ${o.id}]`);
  });
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
