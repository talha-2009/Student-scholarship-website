var SUPABASE_URL = process.env.SUPABASE_URL;
var SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) { console.error("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars required"); process.exit(1); }

const opps = [
  {
    type: "Scholarship",
    funding: "Full tuition, monthly stipend, accommodation, health insurance, and flight tickets",
    title: "Turkiye Burslari (Turkey Government Scholarships)",
    country: "Turkey",
    level: "Bachelor's, Master's, PhD",
    field: "All fields offered at Turkish universities",
    deadline: "2027-02-20",
    description: "The Turkiye Burslari (Turkey Scholarships) is the most prestigious government-funded scholarship programme in Turkey, administered by the Turkiye Burslari Office under the Presidency for Turks Abroad and Related Communities (YTB). Each year thousands of international students from over 180 countries receive this fully funded scholarship to pursue undergraduate, master's, or doctoral studies at Turkey's leading universities including Istanbul Technical University, Middle East Technical University, Bogazici University, and Ankara University. The scholarship covers monthly stipends ranging from USD 900 for bachelor's to USD 3,000 for doctoral programmes, full tuition fees, on-campus accommodation, a one-time flight ticket, comprehensive health insurance, and a mandatory one-year Turkish language course prior to the start of academic studies. What makes Turkiye Burslari uniquely attractive is its combination of generous financial support and the opportunity to study in a country that bridges Europe and Asia with a rapidly expanding higher education sector. The programme does not require applicants to have a prior acceptance letter from a Turkish university — selections are made centrally and scholars are placed at institutions based on their academic background and preferences. Applications open annually on January 10 and close on February 20, with results announced by August. The selection process evaluates academic performance (70 percent weight), social achievements (25 percent), and the quality of the applicant's letter of intent and research proposal (5 percent for doctoral candidates). Candidates should prepare their documents well in advance, including a letter of intent, a detailed CV, academic transcripts, and passport copies.",
    link: "https://www.turkiyeburslari.gov.tr/",
    slug: "turkiye-burslari-turkey-government-scholarships"
  },
  {
    type: "Scholarship",
    funding: "Monthly allowance of EUR 1,181 for master's and EUR 1,700 for doctoral students, plus tuition waiver",
    title: "France Excellence Eiffel Scholarship Programme",
    country: "France",
    level: "Master's, PhD",
    field: "Science and engineering, law, economics, political science, history, and management",
    deadline: "2027-01-08",
    description: "The France Excellence Eiffel Scholarship Programme, established by the French Ministry for Europe and Foreign Affairs, is one of Europe's most competitive merit-based scholarships designed to attract top international students to French higher education institutions. The programme awards approximately 650 scholarships annually across master's and doctoral levels, with the explicit goal of strengthening France's position as a leading destination for global talent. Eiffel scholars receive a monthly allowance of EUR 1,181 for master's students or EUR 1,700 for doctoral candidates, covering living expenses for the duration of their studies. Additional benefits include priority access to campus housing, reduced public transport fares, cultural activities, and health insurance coverage. Unlike many government scholarships, Eiffel does not cover tuition fees at institutions that charge differential fees, though most partner universities waive these for Eiffel recipients. The application process is distinctive: candidates cannot apply directly but must be nominated by a French higher education institution, which means building a relationship with your prospective programme coordinator is essential. French institutions submit nominations to Campus France, which manages the selection process. The call for applications typically opens in October each year, with institutional nomination deadlines falling in late November or early December. Results are published in late March. Selection is based entirely on academic excellence, with the committee evaluating the candidate's academic record, the quality of the proposed study programme, and the applicant's potential for future professional impact. The programme is particularly valuable for students interested in French-language academic environments, as it provides access to France's world-class Grandes Ecoles and research universities.",
    link: "https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program",
    slug: "france-excellence-eiffel-scholarship-programme"
  }
];

async function seed() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/opportunities?select=title,country,type`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` }
  });
  const existing = await res.json();
  const keys = new Set(existing.map(r => `${r.title}|${r.country}|${r.type}`));

  const fresh = opps.filter(o => !keys.has(`${o.title}|${o.country}|${o.type}`));
  if (!fresh.length) { console.log("Both already exist."); return; }

  console.log(`Inserting ${fresh.length} new opportunities...`);
  const ins = await fetch(`${SUPABASE_URL}/rest/v1/opportunities`, {
    method: "POST",
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(fresh)
  });
  if (!ins.ok) { console.error("Insert failed:", ins.status, await ins.text()); process.exit(1); }
  const data = await ins.json();
  data.forEach(o => console.log(`  ✓ ${o.title} — ${o.country} [${o.slug}]`));
  console.log(`\nTotal in DB: ${existing.length + fresh.length}`);
}

seed().catch(e => { console.error(e); process.exit(1); });
