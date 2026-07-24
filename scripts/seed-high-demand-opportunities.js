/**
 * Seed 8 high-demand, high-search-volume opportunities into Supabase.
 * Usage: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-high-demand-opportunities.js
 */

var SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) { console.error("ERROR: SUPABASE_URL env var required"); process.exit(1); }
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  process.exit(1);
}

const opportunities = [
  {
    type: "Scholarship",
    funding: "Full tuition, monthly stipend, travel, health insurance, and research allowance",
    title: "Vanier Canada Graduate Scholarships",
    country: "Canada",
    level: "PhD",
    field: "Health research, natural sciences, engineering, humanities, and social sciences",
    deadline: "2026-11-01",
    description:
      "The Vanier Canada Graduate Scholarships (Vanier CGS) stand as Canada's most prestigious doctoral award, designed to attract world-class PhD students to Canadian institutions. Valued at $50,000 per year for three years, the scholarship is named after Governor General Georges P. Vanier and recognizes students who demonstrate both academic excellence and a high standard of doctoral research. Each year approximately 166 scholarships are awarded across all disciplines, making this one of the most competitive doctoral funding programs globally. Nomination is required through a Canadian university — students cannot apply directly — which means building a strong relationship with your prospective supervisor and department is essential from the outset. The selection committee evaluates candidates across three dimensions: academic achievement, research potential, and leadership qualities. Successful nominees typically hold a first-class average of at least A- (or equivalent) in each of the last two years of study and present a compelling research proposal that aligns with their supervisory team's expertise. The application cycle for the 2027-2028 academic year opens through university nominations, with internal deadlines varying by institution from August through October 2026. International students are fully eligible and strongly encouraged to begin the nomination process early.",
    link: "https://vanier.gc.ca/en/home-accueil.html",
    slug: "vanier-canada-graduate-scholarships"
  },
  {
    type: "Scholarship",
    funding: "Full tuition, monthly living stipend, accommodation, medical insurance, and research allowance",
    title: "Chinese Government Scholarship (CSC)",
    country: "China",
    level: "Bachelor's, Master's, PhD",
    field: "All fields offered at designated Chinese universities",
    deadline: "2027-04-01",
    description:
      "The Chinese Government Scholarship (CSC), administered by the China Scholarship Council under the Ministry of Education, is one of the largest government-funded scholarship programmes in the world, supporting tens of thousands of international students annually to study at over 280 designated Chinese universities. The programme covers full tuition waivers, free on-campus accommodation, a monthly living stipend ranging from 2,500 to 3,500 RMB depending on degree level, and comprehensive medical insurance. For the 2027-2028 academic year, applications are accepted through multiple channels: the Chinese Embassy in your home country (Bilateral Program), directly through Chinese universities (University Program), or through specialized agencies such as the Asian Development Bank or the Shanghai Government Scholarship. The CSC is particularly attractive because it removes virtually all financial barriers to studying in China, one of the world's fastest-growing research environments with rapidly climbing university rankings. Applicants for master's or doctoral programmes must hold the appropriate prior degree and be under the age limits (35 for master's, 40 for doctoral). The application window typically runs from January through early April each year, with results announced by July. Given the enormous volume of applications — particularly from South Asia, Africa, and Southeast Asia — submitting a complete, well-prepared application well before the deadline significantly improves your chances of receiving an award.",
    link: "https://www.cucas.cn/china_scholarship/about_chinascholarship",
    slug: "chinese-government-scholarship-csc"
  },
  {
    type: "Scholarship",
    funding: "Full tuition, return airfare, living allowance, establishment allowance, health cover, and research support",
    title: "Australia Awards Scholarships",
    country: "Australia",
    level: "Bachelor's, Master's, PhD",
    field: "Priority development fields including public policy, health, education, agriculture, engineering, and governance",
    deadline: "2027-04-30",
    description:
      "Australia Awards Scholarships, funded by the Australian Government through the Department of Foreign Affairs and Trade, are among the most comprehensive international development scholarships available anywhere in the world. These prestigious awards enable students from participating countries across Africa, Asia, the Pacific, and the Middle East to undertake full-time study at Australian universities and technical institutions. The scholarship package is exceptionally generous, covering full tuition fees, return air travel, an establishment allowance, a living expenses stipend (currently approximately AUD 31,000 per year), Overseas Student Health Cover, and supplementary academic support such as pre-course English training and fieldwork grants. What distinguishes Australia Awards from other scholarships is its explicit development focus: scholars are expected to return home and apply their new skills to contribute to their country's growth. The programme prioritizes fields aligned with each participating country's development needs, including public health, education, agriculture, water resources, governance, and infrastructure. Applications for the 2028 intake are expected to open in February 2027 through the Online Application System (OAS). Each participating country has its own specific closing date, typically falling between March and April. Prospective applicants should begin preparing their development impact statement early, as this is the most heavily weighted component of the selection criteria.",
    link: "https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships",
    slug: "australia-awards-scholarships"
  },
  {
    type: "Scholarship",
    funding: "Full tuition and college fees plus a generous living stipend",
    title: "Clarendon Fund Scholarships at Oxford",
    country: "United Kingdom",
    level: "Master's, PhD",
    field: "All graduate subjects offered by the University of Oxford",
    deadline: "2027-01-08",
    description:
      "The Clarendon Fund is the University of Oxford's flagship graduate scholarship scheme, providing approximately 200 fully funded awards each year to outstanding postgraduate students from every country and across all academic disciplines. Established in 2001 through a generous endowment from the Oxford University Press, the Clarendon Fund has become one of the most sought-after scholarships for graduate study at any university worldwide. There is no separate application process — every candidate who applies for a full-time or part-time graduate course at Oxford by the relevant January admissions deadline is automatically considered, making it one of the most accessible major scholarships in terms of application procedure. The awards cover full university and college fees plus a substantial living stipend, currently around £18,622 per year, for the entire duration of your course. Selection is based entirely on academic merit and potential, as assessed through your graduate application materials including your academic transcripts, research proposal, personal statement, and references. The competition is intense: Oxford receives over 30,000 graduate applications annually, and only a fraction of those are considered for Clarendon funding. For the 2027-2028 academic year, the critical deadline is either 2 December 2026 or 8 January 2027, depending on your chosen course. Students are strongly advised to prepare their Oxford application materials well in advance to ensure the highest quality submission.",
    link: "https://www.ox.ac.uk/admissions/graduate/fees-and-funding/funding/clarendon",
    slug: "clarendon-fund-scholarships-oxford"
  },
  {
    type: "Scholarship",
    funding: "Full tuition and college fees at Cambridge plus a maintenance allowance",
    title: "Churchill Scholarship at Cambridge",
    country: "United Kingdom",
    level: "Master's",
    field: "Engineering, mathematics, computer science, chemistry, physics, and related disciplines",
    deadline: "2026-11-02",
    description:
      "The Churchill Scholarship is one of the most prestigious postgraduate awards available to American students, funding one year of study at the University of Cambridge in any STEM-related master's programme. Established in 1958 through a bequest from the estate of Winston Churchill's mother, Jennie Jerome, the scholarship honours Sir Winston Churchill's legacy by supporting future American leaders in science, technology, engineering, and mathematics. Each year approximately 16 scholarships are awarded, each covering the full cost of tuition and college fees at Cambridge plus a generous maintenance allowance of approximately £30,000. The scholarship is open to US citizens who will hold a bachelor's degree from an accredited American institution by the time they begin study at Cambridge. Applicants must have been admitted to one of Cambridge's STEM master's programmes, which include courses across the Departments of Engineering, Computer Science and Technology, Chemistry, Physics, Mathematics, Chemical Engineering, and related fields. The selection committee places particular weight on academic distinction, research potential, and the applicant's vision for how the Cambridge programme will advance their long-term contributions to science and society. The national application deadline is November 2, 2026, with institutional nomination deadlines typically in October. Candidates should identify their Cambridge course and begin preparing their research proposal and personal statements well before the summer.",
    link: "https://www.churchillscholarship.org/",
    slug: "churchill-scholarship-cambridge"
  },
  {
    type: "Internship",
    funding: "Paid internship with competitive stipend and professional development opportunities",
    title: "World Bank Group WBG Pioneers Internship",
    country: "United States",
    level: "Master's, PhD",
    field: "Economics, finance, development, social sciences, data science, engineering, and communications",
    deadline: "2026-08-12",
    description:
      "The World Bank Group's WBG Pioneers Internship Programme offers a rare opportunity for graduate students to work at the heart of global development, contributing to projects that affect billions of people across developing nations. Based primarily at the World Bank headquarters in Washington, DC, with additional placements in country offices worldwide, the programme runs two cycles annually: a Summer/Fall cycle and a Fall/Winter cycle running approximately October through March. Interns are embedded in operational teams working on real-world challenges in poverty reduction, economic development, infrastructure, education, health, climate resilience, and governance. The programme is open to students currently enrolled in a master's or doctoral programme at an accredited university, as well as recent graduates who completed their degree within the past year. WBG Pioneers provides a competitive hourly wage, and interns gain direct exposure to the World Bank's research, policy analysis, and project implementation processes. The Fall/Winter 2026-2027 application window opens from July 13 to August 12, 2026. Selection is highly competitive, with the programme receiving thousands of applications from over 100 countries each cycle. Successful candidates typically demonstrate strong analytical skills, a commitment to international development, proficiency in quantitative methods, and the ability to work effectively in multicultural teams. Fluency in English is required; additional World Bank languages such as French, Spanish, Arabic, or Portuguese are a significant advantage.",
    link: "https://www.worldbank.org/ext/en/careers/talent-programs/wbg-pioneers",
    slug: "world-bank-wbg-pioneers-internship"
  },
  {
    type: "Fellowship",
    funding: "Three-year stipend, tuition fees, and generous research and travel support",
    title: "NSF Graduate Research Fellowship Program",
    country: "United States",
    level: "PhD",
    field: "All NSF-supported STEM fields including biology, engineering, computer science, geosciences, and social sciences",
    deadline: "2026-10-22",
    description:
      "The National Science Foundation Graduate Research Fellowship Program (NSF GRFP) is the oldest and most prestigious graduate fellowship in the United States, supporting outstanding early-career STEM students who demonstrate potential for significant research achievements. Each year approximately 2,500 fellowships are awarded from over 12,000 applications, making the acceptance rate roughly 20 percent — highly competitive by any standard. Fellows receive three years of support over a five-year window, including an annual stipend of $37,000, a $16,000 cost-of-education allowance paid to the institution, and extensive opportunities for international research, professional development, and leadership training. The fellowship is distinctive in that it follows the student rather than the institution, giving fellows the flexibility to change universities or research directions during their doctoral programme. Eligibility is limited to US citizens, nationals, or permanent residents who are pursuing or planning to pursue a research-based master's or doctoral degree in an NSF-supported STEM field. Applications are organized by disciplinary broad group, with deadlines staggered across October and November. For the 2027 cohort, the application portal is expected to open around September 2026, with discipline-specific deadlines falling in October. The review process evaluates intellectual merit and broader impacts — two criteria unique to NSF — and successful applications typically present a clear research vision, evidence of prior research experience, and a compelling narrative about how the fellowship will enable the applicant's long-term contributions to science and society.",
    link: "https://www.nsf.gov/funding/opportunities/grfp-nsf-graduate-research-fellowship-program",
    slug: "nsf-graduate-research-fellowship-program"
  },
  {
    type: "Scholarship",
    funding: "Full tuition, living allowance, return airfare, health insurance, and research support",
    title: "Manaaki New Zealand Scholarships",
    country: "New Zealand",
    level: "Bachelor's, Master's, PhD",
    field: "Agriculture, environment, renewable energy, disaster risk management, public policy, health, and education",
    deadline: "2027-03-31",
    description:
      "Manaaki New Zealand Scholarships, funded by the New Zealand Government through the Ministry of Foreign Affairs and Trade, provide fully funded study opportunities for students from eligible developing countries to pursue qualifications at New Zealand universities and tertiary institutions. The scholarship programme reflects New Zealand's commitment to sustainable development in the Pacific, Asia, Africa, and the Caribbean, and prioritises fields that directly contribute to participants' home country development priorities. The comprehensive funding package covers full tuition fees, a living allowance of approximately NZD 25,000 per year, an establishment allowance, return airfare, medical and travel insurance, and thesis or research allowances for postgraduate students. Applicants must be citizens of an eligible partner country and must commit to returning home for at least two years after completing their studies to apply their new knowledge and skills. The programme particularly encourages applications from women, people with disabilities, and those working in the public sector. For the 2027 intake, applications open in February-March 2027 through the online scholarship portal, with most country deadlines falling in late March. The selection process evaluates academic merit, the development relevance of the proposed study, and the applicant's potential to create positive change in their home country. Given New Zealand's reputation for world-class research in agriculture, environmental science, Māori studies, and disaster resilience, these scholarships are particularly valuable for students from Pacific Island nations and developing economies.",
    link: "https://www.nzscholarships.govt.nz/",
    slug: "manaaki-new-zealand-scholarships"
  }
];

async function seed() {
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

  console.log(`Database contains ${existing.length} existing opportunities.\n`);

  const newOpps = opportunities.filter((o) => {
    const key = `${o.title}|${o.country}|${o.type}`;
    if (existingKeys.has(key)) {
      console.log(`SKIP (duplicate): ${o.title} — ${o.country}`);
      return false;
    }
    return true;
  });

  if (newOpps.length === 0) {
    console.log("\nAll opportunities already exist. Nothing to insert.");
    return;
  }

  console.log(`\nInserting ${newOpps.length} new high-demand opportunities...\n`);

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
    console.log(`  ✓ ${o.title} — ${o.country} (${o.type}) [slug: ${o.slug}]`);
  });
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
