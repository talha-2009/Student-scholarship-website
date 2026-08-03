import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const TYPE_NOUN = {
  scholarship: "scholarships",
  fellowships: "fellowships",
  internships: "internships",
  competitions: "competitions",
};

const COUNTRY_FACTS = {
  austria: "Austria, home to leading research institutes such as the Institute of Science and Technology Austria (ISTA) and the Austrian Academy of Sciences, offers fellowships that support international researchers at all career stages.",
  canada: "Canada is one of the most welcoming study destinations in the world, with prestigious programs funded by leading universities and foundations such as the Fulbright Commission and the Killam program.",
  china: "China has become a top destination for international students, with programs such as Schwarzman Scholars offering fully funded study at leading institutions like Tsinghua University.",
  france: "France is a global hub for research and higher education, home to internationally recognised institutions such as the École Normale Supérieure, Sorbonne University, and the CNRS.",
  germany: "Germany is one of the strongest research economies in Europe, with the German Academic Exchange Service (DAAD), Max Planck Society, and numerous foundations funding students and researchers from around the world.",
  india: "India's rapidly expanding higher-education sector includes leading institutions and international partnerships that offer opportunities to students across the region.",
  ireland: "Ireland is a growing destination for international study and research, with programs such as the Teagasc Walsh Scholars Programme supporting agricultural and food science research.",
  japan: "Japan is a world leader in technology and research, offering internships through organisations such as the Okinawa Institute of Science and Technology (OIST) and government-backed programs.",
  "saudi-arabia": "Saudi Arabia invests heavily in education and research, with programs such as the KAUST Global Fellowship supporting outstanding researchers with full funding.",
  singapore: "Singapore is a leading Asian hub for research and innovation, home to world-class institutions such as Nanyang Technological University and the Agency for Science, Technology and Research (A*STAR).",
  switzerland: "Switzerland is home to world-leading institutions such as ETH Zurich, the University of Geneva, and numerous international organisations, making it a prime destination for academic and professional growth.",
  "united-states": "The United States offers some of the most generous and competitive funding opportunities in the world, from Fulbright and Humphrey programs to university fellowships at Stanford, Harvard, and beyond.",
  australia: "Australia offers scholarships and internships through the Australian Government (Australia Awards), leading universities such as the University of Melbourne, and national research organisations.",
  netherlands: "The Netherlands is known for its international universities such as Leiden University, which offer generous scholarships to talented students from around the world.",
  "new-zealand": "New Zealand offers government-funded awards such as the Manaaki New Zealand Scholarships, which support international students with full tuition, living costs, and airfare.",
  thailand: "Thailand is a growing regional hub for international education, offering opportunities such as the Asian Institute of Technology scholarships for students across Asia.",
  global: "This page collects opportunities with a global scope that are open to applicants from multiple countries, allowing you to compare programs and deadlines in one place.",
};

const INTROS = {};

function writeIntro(path, type, country, h1) {
  const fact = COUNTRY_FACTS[country] || `This page lists ${type} open to international applicants, with verified deadlines and official application links.`;
  const noun = TYPE_NOUN[type] || "opportunities";
  const capType = type.charAt(0).toUpperCase() + type.slice(1, -1);
  const paragraphs = [
    `${fact}`,
    `This page brings together the latest verified ${type} for ${country === "global" ? "students worldwide" : "students interested in " + country}. Every listing is checked against the official provider before publication, so you can rely on accurate funding details, eligibility requirements, and deadlines.`,
    `How to use this page: review each ${type === "fellowships" ? "fellowship" : noun.replace(/s$/, "")} below, check whether you meet the eligibility criteria, note the application deadline, and click "Apply Now" to be taken directly to the official provider's application page. We recommend starting your applications at least four weeks before the deadline to allow time to prepare documents, obtain references, and proofread your submissions.`,
    `If you are unsure where to begin, explore our guides on how to apply for ${type}, how to write a strong motivation letter, and how to prepare for scholarship interviews. You can also browse opportunities by country or by funding type using the links in the navigation.`,
  ];
  return paragraphs.map((p) => `<p>${p}</p>`).join("\n");
}

for (const [dir, entries] of Object.entries({
  "competitions/global": ["competitions", "global"],
  "competitions/rotating-global": ["competitions", "global"],
  "competitions/switzerland": ["competitions", "switzerland"],
  "country/global-commonwealth-nations": ["fellowships", "global"],
  "country/global-eu-consortium": ["scholarships", "global"],
  "country/global-eu-partner-countries": ["internships", "global"],
  "country/rotating-global": ["competitions", "global"],
  "fellowships/austria": ["fellowships", "austria"],
  "fellowships/canada": ["fellowships", "canada"],
  "fellowships/china": ["fellowships", "china"],
  "fellowships/france": ["fellowships", "france"],
  "fellowships/germany": ["fellowships", "germany"],
  "fellowships/global": ["fellowships", "global"],
  "fellowships/india": ["fellowships", "india"],
  "fellowships/ireland": ["fellowships", "ireland"],
  "fellowships/saudi-arabia": ["fellowships", "saudi-arabia"],
  "fellowships/singapore": ["fellowships", "singapore"],
  "fellowships/united-states": ["fellowships", "united-states"],
  "internships/austria": ["internships", "austria"],
  "internships/france": ["internships", "france"],
  "internships/germany": ["internships", "germany"],
  "internships/india": ["internships", "india"],
  "internships/japan": ["internships", "japan"],
  "internships/switzerland": ["internships", "switzerland"],
  "internships/united-states": ["internships", "united-states"],
  "scholarships/australia": ["scholarships", "australia"],
  "scholarships/france": ["scholarships", "france"],
  "scholarships/global": ["scholarships", "global"],
  "scholarships/global-eu-consortium": ["scholarships", "global"],
  "scholarships/netherlands": ["scholarships", "netherlands"],
  "scholarships/new-zealand": ["scholarships", "new-zealand"],
  "scholarships/singapore": ["scholarships", "singapore"],
  "scholarships/switzerland": ["scholarships", "switzerland"],
  "scholarships/thailand": ["scholarships", "thailand"],
  "scholarships/united-states": ["scholarships", "united-states"],
})) {
  const [type, country] = entries;
  const file = join(ROOT, dir, "index.html");
  let c = readFileSync(file, "utf8");
  const h1 = (c.match(/<h1>([^<]+)<\/h1>/) || [])[1] || "";
  if (!c.includes("review each") && !c.includes("This page brings together")) {
    const intro = writeIntro(dir, type, country, h1);
    const marker = "in one place.</p>";
    if (c.includes(marker)) {
      c = c.split(marker).join(marker + "\n" + intro);
      writeFileSync(file, c, "utf8");
      console.log("OK", dir);
    } else {
      console.log("MARKER NOT FOUND", dir);
    }
  } else {
    console.log("SKIP (already expanded)", dir);
  }
}
