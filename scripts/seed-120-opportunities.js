/**
 * Seed 120 new high-quality opportunities into the Supabase database.
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable.
 * Usage: node scripts/seed-120-opportunities.js
 */

var SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_URL) { console.error("ERROR: SUPABASE_URL env var required"); process.exit(1); }
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  process.exit(1);
}

const opportunities = [
  // ===== BATCH 1: Fully Funded Scholarships (1–20) =====
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Rhodes Scholarship", country: "United Kingdom",
    level: "Master's, PhD", field: "All Fields",
    deadline: "31 Jul 2026",
    link: "https://www.rhodeshouse.ox.ac.uk/scholarships/apply-for-a-scholarship/",
    description: "The Rhodes Scholarship is the oldest and one of the most prestigious international graduate scholarships in the world, established in 1902 by Cecil John Rhodes. Each year, approximately 100 exceptional students from constituencies worldwide are selected to study at the University of Oxford. The scholarship covers all university and college fees, provides an annual stipend of at least £18,180, and includes a settling-in allowance for the first term. Rhodes Scholars pursue a full-time postgraduate degree of their choice at Oxford — whether a taught Master's, a research degree, or a second undergraduate degree. The selection criteria emphasise not just academic excellence but also character, leadership, empathy, and a commitment to making a positive difference in the world. Applicants must be between 18 and 24 years old (age limits vary by constituency) and hold an undergraduate degree with outstanding academic results. Each constituency has its own application process and timeline, typically involving an online application, academic references, a personal statement, and interviews at the national and final selection stages. Rhodes Scholars join a global community of over 8,000 living alumni who have gone on to become heads of state, Nobel laureates, Supreme Court justices, scientists, artists, and social entrepreneurs. The scholarship's founding vision — to unite outstanding young people from across the world in shared study at Oxford — remains as relevant today as it was over a century ago. If you are a driven, intellectually curious individual with a track record of leadership and service, the Rhodes Scholarship offers an unparalleled opportunity to deepen your knowledge, expand your network, and grow as a leader committed to the public good."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Gates Cambridge Scholarship", country: "United Kingdom",
    level: "Master's, PhD", field: "All Fields",
    deadline: "04 Dec 2026",
    link: "https://www.gatescambridge.org/apply",
    description: "The Gates Cambridge Scholarship, established by the Bill and Melinda Gates Foundation in 2000, funds outstanding postgraduate students from countries outside the United Kingdom to pursue full-cost postgraduate degrees at the University of Cambridge. Each year, approximately 55 new scholars are selected from thousands of applicants worldwide. The scholarship covers the full cost of tuition at Cambridge, a maintenance stipend of approximately £20,000 per year, a single economy airfare at the beginning and end of the course, and additional funding for academic development, family allowances, and hardship support. Gates Cambridge Scholars are selected on the basis of four criteria: academic excellence, reasons for choice of course, a commitment to improving the lives of others, and leadership potential. Applicants must apply for a full-time postgraduate degree at Cambridge — this includes most Master's degrees, PhDs, and certain research degrees. The application process involves submitting your Cambridge postgraduate application by the relevant deadline (early October for US applicants, early December for all others) and then completing a separate Gates Cambridge application. Shortlisted candidates are invited to interview, either in person or online, typically in January or February. The Gates Cambridge community is one of the most diverse and accomplished scholarship networks in the world, with over 2,000 living alumni across 120 countries. Scholars benefit from a rich programme of academic, social, and leadership development activities throughout their time at Cambridge."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Clarendon Fund Scholarships", country: "United Kingdom",
    level: "Master's, PhD", field: "All Fields",
    deadline: "January 2027",
    link: "https://www.clarendon.ox.ac.uk/",
    description: "The Clarendon Fund is the University of Oxford's flagship graduate scholarship programme, funded by Oxford University Press. Each year, approximately 140 new Clarendon Scholarships are awarded to outstanding graduate students from all countries, covering university and college fees in full and providing a generous grant for living expenses of approximately £18,622 per year. Clarendon Scholarships are available for both Master's and doctoral programmes across all academic departments at Oxford. What makes the Clarendon Fund unique is its automatic consideration process — all applicants who submit a graduate application to Oxford by the relevant January deadline are automatically considered for a Clarendon Scholarship; there is no separate application form. Selection is based entirely on academic merit and potential, as assessed through the graduate admissions process. The scholarship is tenable for the full duration of your course, whether that is one year for a taught Master's or three to four years for a doctoral programme. Clarendon Scholars join a vibrant intellectual community that includes workshops, networking events, and an active alumni network spanning academia, government, the private sector, and civil society. The Clarendon Fund has transformed the graduate experience at Oxford since its establishment in 2001, enabling some of the world's brightest minds to pursue their studies without financial barriers. If you are applying to Oxford for graduate study, your application is automatically in the running for one of the most competitive and generous scholarship packages available anywhere in the world."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Schwarzman Scholars Program", country: "China",
    level: "Master's", field: "Public Policy, Economics, International Affairs, Business",
    deadline: "22 Sep 2026",
    link: "https://www.schwarzmanscholars.org/apply/",
    description: "The Schwarzman Scholars Program, modelled on the Rhodes Scholarship, is a fully funded one-year Master's programme at Tsinghua University in Beijing, China. Established by Stephen A. Schwarzman, the programme selects up to 200 scholars annually from around the world to study alongside top Chinese students in one of three tracks: Public Policy, Economics and Business, or International Studies. The scholarship covers tuition, room and board, travel to and from Beijing, an in-country study tour, and a personal stipend for incidental expenses. Schwarzman Scholars develop their academic expertise while cultivating leadership skills through a curriculum that combines rigorous coursework, practical internships, and interactions with China's leading political, business, and academic figures. The programme is designed to prepare the next generation of global leaders who can bridge understanding between China and the rest of the world. Applicants must be between 18 and 28 years old, hold an undergraduate degree, and demonstrate English proficiency (Chinese proficiency is not required, as courses are taught in English). The application process includes an online form, three recommendation letters, a personal essay, and a leadership essay. Shortlisted candidates are invited to a Selection Day involving interviews and group exercises. The programme's diverse cohort, world-class faculty, and unparalleled access to China's institutions make it a transformative experience for aspiring global leaders."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Knight-Hennessy Scholars Program", country: "United States",
    level: "Master's, PhD", field: "All Fields",
    deadline: "08 Oct 2026",
    link: "https://knight-hennessy.stanford.edu/apply",
    description: "The Knight-Hennessy Scholars Program at Stanford University is one of the most generous and comprehensive graduate scholarship programmes in the world. Funded by a $750 million endowment from Phil Knight and family, the programme supports up to 100 scholars annually from any country to pursue any graduate degree at Stanford — including Master's, MBA, JD, MD, and PhD programmes. The scholarship covers full tuition for up to three years, a stipend for living and academic expenses, a travel allowance, and a graduate housing stipend. Beyond financial support, Knight-Hennessy Scholars participate in a distinctive leadership development programme featuring workshops, retreats, mentorship from Stanford faculty and industry leaders, and collaborative projects that address real-world challenges. The programme emphasises seven leadership attributes: independent thought, purposeful engagement, imaginative preparation, civic contribution, deep curiosity, creative confidence, and a collegial spirit. Applicants must hold a bachelor's degree earned within the past seven years and apply simultaneously to a Stanford graduate programme and to Knight-Hennessy. The application includes essays, recommendation letters, and a video submission. Finalists attend an immersive weekend at Stanford for interviews and team activities. Knight-Hennessy Scholars join a multidisciplinary community of extraordinary individuals committed to using their education to address complex global challenges. The programme's combination of full funding, leadership development, and Stanford's academic resources makes it an unparalleled opportunity for aspiring leaders."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Swiss Government Excellence Scholarships", country: "Switzerland",
    level: "PhD, Postdoctoral, Research", field: "All Fields",
    deadline: "30 Nov 2026",
    link: "https://www.sbfi.admin.ch/sbfi/en/education/scholarships-and-grants/swiss-government-excellence-scholarships.html",
    description: "The Swiss Government Excellence Scholarships, administered by the State Secretariat for Education, Research and Innovation (SERI), are among the most competitive postgraduate awards in Europe. The programme offers three categories of scholarships: research scholarships for doctoral candidates, postdoctoral research fellowships, and arts scholarships for Master's-level study in the arts. Each year, approximately 750 scholarships are awarded to outstanding researchers and artists from over 180 countries. Research scholarships provide a monthly stipend of CHF 1,920 for doctoral candidates and CHF 3,500 for postdoctoral researchers, plus a housing allowance and health insurance contributions. The scholarships are tenable at any Swiss cantonal university, federal institute of technology (ETH), or recognised research institution. Applicants must hold a Master's degree (for PhD scholarships) or a doctoral degree (for postdoctoral fellowships), be nationals of an eligible country, and have a research proposal endorsed by a host professor at a Swiss institution. The application process varies by country, with most national deadlines falling between September and December. Candidates are evaluated on academic excellence, the quality of their research proposal, and the feasibility of their project in the Swiss academic context. Scholarship holders gain access to Switzerland's world-class research infrastructure, a multilingual academic environment, and a vibrant international community. The Swiss Government Excellence Scholarships have supported groundbreaking research across disciplines since 1999, fostering academic exchange between Switzerland and the global research community."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Swedish Institute Scholarships for Global Professionals", country: "Sweden",
    level: "Master's", field: "All Fields",
    deadline: "10 Feb 2027",
    link: "https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/",
    description: "The Swedish Institute Scholarships for Global Professionals (SISGP) is a fully funded scholarship programme offered by the Swedish Institute to outstanding master's students from eligible countries. The scholarship targets working professionals who demonstrate leadership experience and a commitment to contributing to sustainable development in their home countries. SISGP covers full tuition fees at participating Swedish universities, a monthly living allowance of SEK 12,000, a travel grant of SEK 15,000, and insurance coverage through Kammarkollegiet. The scholarship is tenable for the full duration of a one- or two-year master's programme at any of Sweden's participating universities. Applicants must be citizens of one of the eligible countries, have a minimum of 3,000 hours of work experience (approximately 18 months full-time), and demonstrate leadership experience through their professional or civic activities. The application is submitted through the national university admissions portal, universityadmissions.se, alongside the master's programme application. Selection is based on academic merit, leadership potential, and the relevance of the chosen programme to the applicant's country's development priorities. Sweden offers a unique combination of academic excellence, innovation-driven research, and a strong commitment to sustainability and equality. SISGP scholars join a global alumni network of over 130,000 former scholarship holders who have gone on to become leaders in government, business, academia, and civil society."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Erasmus Mundus Joint Master Degrees", country: "Global",
    level: "Master's", field: "All Fields",
    deadline: "15 Feb 2027",
    link: "https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en",
    description: "The Erasmus Mundus Joint Master Degrees (EMJMD) programme, funded by the European Union, offers fully funded scholarships for outstanding students worldwide to pursue joint master's degrees at consortia of European universities. Each EMJMD programme is designed and delivered by an international consortium of at least three higher education institutions from three different European countries, ensuring a truly multicultural academic experience. The scholarship covers participation costs (tuition), a monthly living allowance of €1,400 for up to 24 months, travel costs of €3,000 per year, and insurance coverage. Over 150 EMJMD programmes are available across all academic disciplines, from engineering and environmental science to humanities, social sciences, and public health. Applicants must hold a bachelor's degree, meet the specific entry requirements of the chosen programme, and demonstrate English proficiency. Applications are submitted directly to the individual programme consortia, with deadlines typically falling between December and February. Selection is highly competitive, based on academic excellence, motivation, and the relevance of the applicant's background. Erasmus Mundus scholars study in at least two different European countries during their programme, gaining not only academic qualifications but also intercultural competencies, language skills, and a professional network spanning the continent. The programme has supported over 60,000 students since its inception, creating a global community of graduates equipped to address complex challenges through international collaboration."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Norwegian Quota Scheme (Quota Programmet)", country: "Norway",
    level: "Master's, PhD", field: "All Fields",
    deadline: "01 Dec 2026",
    link: "https://www.si.no/en/scholarships/scholarships-for-higher-education-in-norway/",
    description: "The Norwegian Quota Scheme is a scholarship programme offered by the Norwegian government through the Norwegian Centre for International Cooperation in Education (SI/NORAGRIC) that enables students from developing countries and countries in transition to pursue full-time master's and doctoral studies at Norwegian universities and university colleges completely free of charge. The programme covers tuition fees — which are already waived at public Norwegian universities for all students — and additionally provides a monthly stipend of approximately NOK 13,700 (around €1,200), travel expenses, and a settling-in grant. Norway's higher education system is consistently ranked among the best in the world, with strong programmes in environmental science, marine biology, development studies, energy, peace and conflict research, and public policy. Applicants must be nationals of eligible developing or transition countries, hold a relevant bachelor's degree for master's applications or a master's degree for PhD applications, and demonstrate English proficiency. Applications are submitted through the Norwegian national application portal, Samordna Opptak, with a deadline of 1 December for the following autumn semester. The Quota Scheme has supported thousands of students since its establishment in 1989, building academic capacity in developing countries and fostering long-term institutional partnerships between Norwegian and international universities. Scholars benefit from Norway's high standard of living, world-class research facilities, and a society committed to equality, sustainability, and international cooperation."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Danish Government Scholarships for Non-EU Students", country: "Denmark",
    level: "Master's", field: "All Fields",
    deadline: "15 Jan 2027",
    link: "https://studyindenmark.dk/scholarships",
    description: "The Danish Government Scholarships, administered through individual Danish universities, provide tuition waivers and living expense grants to highly qualified non-EU/EEA students pursuing master's degrees at Danish higher education institutions. While Denmark offers free tuition to EU/EEA students, the government allocates scholarships specifically to attract top talent from outside Europe. Each participating university — including the University of Copenhagen, Aarhus University, Technical University of Denmark (DTU), University of Southern Denmark, and Aalborg University — offers a varying number of scholarships covering full or partial tuition waivers, with some programmes also providing a monthly stipend of approximately DKK 6,000–8,000 for living expenses. Applicants must apply for admission to a master's programme at a Danish university through the national portal, optin.denmark.dk, and then indicate their interest in a scholarship on the university's scholarship application form. Deadlines typically fall in January for the autumn intake. Selection is based on academic excellence, with universities evaluating GPA, motivation letters, and the overall strength of the admission application. Denmark is home to a thriving research community, innovative teaching methods, and a strong tradition of interdisciplinary education. Danish universities consistently rank among the top in Europe for student satisfaction and employability. Scholarship recipients join a diverse international student community in one of the world's most progressive and sustainable societies."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "University of Melbourne Graduate Research Scholarships", country: "Australia",
    level: "PhD", field: "All Fields",
    deadline: "31 Oct 2026",
    link: "https://study.unimelb.edu.au/find/scholarships/graduate-research",
    description: "The University of Melbourne Graduate Research Scholarships, formerly known as the Research Training Program (RTP), are among Australia's most prestigious doctoral funding packages. The University of Melbourne, consistently ranked as Australia's top university, offers these scholarships to outstanding domestic and international students pursuing research higher degrees — Master's by research or PhD — across all faculties. The scholarship package includes full tuition fee offset for up to four years (PhD) or two years (Master's), a living allowance stipend of approximately AUD 37,000 per year, relocation assistance of up to AUD 2,000 for eligible students, and overseas student health cover (OSHC) for international scholars. Additional supplements may be available for students from underrepresented backgrounds or those undertaking fieldwork overseas. Applicants must apply for admission to a graduate research programme at the University of Melbourne and be nominated by their department for scholarship consideration. Selection is based on academic merit, research potential, and the quality of the research proposal. The University of Melbourne provides world-class research infrastructure, including state-of-the-art laboratories, extensive library collections, and access to leading research centres across disciplines. Doctoral candidates benefit from a supportive supervisory model, regular progress reviews, and professional development workshops. Melbourne's vibrant research community and the city's cultural richness make it an ideal destination for doctoral study."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "University of Toronto Lester B. Pearson International Scholarship",
    country: "Canada", level: "Bachelor's", field: "All Fields",
    deadline: "07 Nov 2026",
    link: "https://future.utoronto.ca/pearson/",
    description: "The Lester B. Pearson International Scholarship Programme at the University of Toronto is one of the most prestigious undergraduate scholarships in the world, named after the Canadian Nobel Peace Prize laureate and former Prime Minister. Each year, approximately 37 international students are selected to receive this transformative award, which covers full tuition, books, incidental fees, and full residence support for four years of undergraduate study at the University of Toronto — one of the world's leading public research universities. The scholarship recognises exceptional international students who demonstrate outstanding academic achievement, creativity, and leadership in their school communities. Applicants must be international students (non-Canadian citizens or permanent residents) who will be in their final year of secondary school or graduating in the current academic year. Nominations are submitted by the applicant's school; students cannot apply directly. Each school may nominate one student. After nomination, candidates must complete the University of Toronto's admission application and a separate scholarship application including essays and a list of extracurricular activities. Selection is based on the strength of the nomination, academic record, personal essays, and evidence of leadership and creative achievement. Lester B. Pearson Scholars join a community of driven, globally minded students at a university that consistently ranks among the top 25 worldwide. The scholarship removes all financial barriers to studying at one of the world's finest institutions, allowing scholars to focus entirely on their academic and personal growth."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "ETH Zurich Excellence Masters Scholarships", country: "Switzerland",
    level: "Master's", field: "All Fields",
    deadline: "15 Dec 2026",
    link: "https://ethz.ch/en/studies/financing/scholarships/excellence-scholarships.html",
    description: "The ETH Zurich Excellence Masters Scholarships support outstanding students pursuing a Master's degree at ETH Zurich, one of the world's leading technical universities consistently ranked among the top 10 globally. The scholarship programme awards approximately 80 Excellence Scholarships each year to top-performing students from Switzerland and abroad. The scholarship covers full study and living costs, providing a stipend of CHF 12,000 per semester plus a tuition fee waiver. Excellence Masters Scholarships are available across all Master's programmes offered by ETH Zurich, including engineering, natural sciences, mathematics, architecture, and management. Applicants must demonstrate exceptional academic performance, ranking in the top 10% of their bachelor's degree cohort. The application is submitted alongside the ETH Zurich Master's admission application and requires additional documents including a research proposal (for thesis-oriented programmes), letters of recommendation, and evidence of extracurricular achievements. Selection is based on academic merit, the quality of the application documents, and the assessment by the relevant department. ETH Zurich offers a rigorous academic environment, cutting-edge research facilities, and a diverse international community. Located in Zurich — consistently ranked among the world's most liveable cities — students benefit from Switzerland's strong economy, multilingual culture, and proximity to international organisations and industry leaders. Excellence Scholarship holders join a prestigious cohort of scholars and gain access to dedicated mentoring, networking events, and career development support."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Trudeau Foundation Scholarships", country: "Canada",
    level: "PhD", field: "Social Sciences, Humanities",
    deadline: "01 Nov 2026",
    link: "https://tfdn.ca/en/scholarships/",
    description: "The Pierre Elliott Trudeau Foundation Scholarship is one of Canada's most prestigious doctoral awards, supporting outstanding PhD students in the social sciences and humanities. The scholarship provides up to CAD 60,000 per year for three years of doctoral research, making it one of the most generous doctoral funding packages in Canada. Trudeau Scholars are selected not only for their academic excellence but also for their commitment to engaged research that addresses issues of public importance in Canada and globally. The Foundation supports four pillars of leadership: personal, intellectual, professional, and civic. Scholars participate in an innovative leadership development programme that includes annual workshops, mentorship from a network of over 150 Trudeau mentors, community engagement projects, and opportunities to connect with policymakers, artists, and community leaders. Eligible fields include law, political science, economics, sociology, history, philosophy, literature, education, public policy, Indigenous studies, environmental studies, and related interdisciplinary fields. Applicants must be enrolled or accepted in a PhD programme at a Canadian university and their research must engage with at least one of the Foundation's thematic priorities: Indigenous rights, responsible citizenship, human dignity, and Canada and the world. The application process involves nomination by the applicant's university, a detailed research proposal, reference letters, and evidence of leadership and community engagement. Trudeau Scholars join a vibrant community of scholars, mentors, and alumni dedicated to creating positive social change through rigorous, engaged research."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Auckland International Doctoral Scholarships", country: "New Zealand",
    level: "PhD", field: "All Fields",
    deadline: "15 Sep 2026",
    link: "https://www.auckland.ac.nz/en/study/scholarships-and-awards/scholarship-types/university-of-auckland-doctoral-scholarships.html",
    description: "The University of Auckland International Doctoral Scholarships (UoAIDS) are fully funded scholarships for outstanding international students pursuing a PhD at New Zealand's largest and highest-ranked university. The scholarship covers full tuition fees at the domestic rate — which is significantly lower than international fees — and provides a living stipend of approximately NZD 28,000 per year, plus a one-off relocation grant of NZD 1,500. The scholarship is tenable for up to 36 months for full-time doctoral study. The University of Auckland offers doctoral programmes across all faculties, including Arts, Business, Creative Arts and Industries, Education and Social Work, Engineering, Law, Medical and Health Sciences, and Science. Applicants must hold a relevant Master's degree with first-class honours or equivalent, demonstrate strong research potential, and have a supervisor willing to support their application. The selection process evaluates academic achievement, research proposal quality, referee reports, and any relevant publications or professional experience. New Zealand offers a unique doctoral study experience: international PhD students pay domestic tuition fees, enjoy the same rights as domestic students, and can work part-time during their studies. The University of Auckland's beautiful city campus, world-class research facilities, and Auckland's vibrant multicultural environment make it an ideal destination for doctoral study. Scholarship holders benefit from dedicated research support, professional development workshops, and a thriving postgraduate community."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "MEXT Japanese Government Research Scholarships", country: "Japan",
    level: "PhD", field: "All Fields",
    deadline: "17 Apr 2027",
    link: "https://www.studyinjapan.go.jp/en/planning/mext-scholarships.html",
    description: "The MEXT (Ministry of Education, Culture, Sports, Science and Technology) Research Scholarships are the Japanese government's flagship programme for international graduate students, offering fully funded doctoral and master's research study at Japanese universities. Each year, approximately 250 research scholarships are awarded to outstanding students from around the world. The scholarship covers full tuition at national and public universities, a monthly stipend of approximately JPY 143,000–145,000, round-trip airfare to Japan, and settlement allowance. The programme typically includes 18 months of Japanese language training and preparatory research before beginning the formal degree programme. Applicants must be under 35 years old, hold a Master's degree (for PhD candidates) or a bachelor's degree (for Master's candidates), and be willing to learn Japanese. There are two application routes: embassy recommendation, where applicants apply through the Japanese embassy in their home country, and university recommendation, where a Japanese university nominates the candidate. The embassy route involves a document screening, a written examination, and an interview conducted locally. Japan offers a unique research environment combining cutting-edge technology with deep cultural traditions. Japanese universities excel in robotics, materials science, environmental engineering, social sciences, and humanities. MEXT scholars gain fluency in Japanese, access to world-class laboratories, and a deep understanding of Japanese society — skills that are increasingly valuable in today's globalised world."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Korean Government Scholarship Program (KGSP)", country: "South Korea",
    level: "Bachelor's, Master's, PhD", field: "All Fields",
    deadline: "28 Feb 2027",
    link: "https://www.niied.go.kr/",
    description: "The Korean Government Scholarship Program (KGSP), formerly known as the Global Korea Scholarship (GKS), is the South Korean government's most prestigious international student programme, administered by the National Institute for International Education (NIIED). The scholarship provides comprehensive funding for bachelor's, master's, and doctoral study at Korean universities, covering round-trip airfare, full tuition, a monthly allowance of approximately KRW 900,000, medical insurance, a one-time settlement allowance of KRW 200,000, and Korean language training for one year. The programme duration includes one year of Korean language training followed by the degree programme (four years for bachelor's, two for master's, three for doctoral). Applicants must be under 25 (bachelor's) or under 40 (master's/PhD), in good health, and hold the required academic qualifications. There are two application tracks: embassy track, where candidates apply through the Korean embassy in their country, and university track, where they apply directly to a designated Korean university. South Korea has emerged as a global leader in technology, culture, and innovation, with world-class universities including Seoul National University, KAIST, Yonsei University, and Korea University. KGSP scholars gain not only academic qualifications but also fluency in Korean and deep cultural understanding. The programme has supported over 20,000 international students since 1967, creating a global network of Korea-knowledgeable professionals in government, academia, and industry."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Fulbright Foreign Student Program", country: "United States",
    level: "Master's, PhD", field: "All Fields",
    deadline: "01 Oct 2026",
    link: "https://foreign.fulbrightonline.org/",
    description: "The Fulbright Foreign Student Program is the United States government's flagship international educational exchange programme, enabling graduate students, young professionals, and artists from abroad to study and conduct research at US universities. Established in 1946 under legislation introduced by Senator J. William Fulbright, the programme operates in over 160 countries and has supported more than 50,000 international students since its inception. The scholarship covers full tuition, a living stipend, health insurance, round-trip airfare, and a book allowance. Fulbright grants are typically for one academic year, with the possibility of renewal for a second year. Applicants must apply through the US Embassy or Fulbright Commission in their home country. The selection process typically involves a local application, an interview with a binational review committee, and nomination to the US Department of State for final selection. Candidates are evaluated on academic merit, leadership potential, and the potential to serve as cultural ambassadors between their home country and the United States. The programme is open to students in all fields, though some countries have specific priorities. Fulbright alumni include over 60 heads of state or government, more than 60 Nobel laureates, and hundreds of leaders across every sector. The Fulbright experience extends beyond the classroom, encompassing community service, cultural exchange, and professional networking. As the world's most recognised and respected international exchange programme, the Fulbright offers an unparalleled opportunity to study in the United States while building lifelong cross-cultural connections."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "New Zealand Government International Doctoral Research Scholarships",
    country: "New Zealand", level: "PhD", field: "All Fields",
    deadline: "01 Mar 2027",
    link: "https://www.educationnz.org.nz/study-in-new-zealand/scholarships/international-doctoral-research-scholarships/",
    description: "The New Zealand Government International Doctoral Research Scholarships (NZIDRS) attract high-calibre international doctoral students to conduct research at New Zealand tertiary institutions. The scholarship recognises that New Zealand's research environment — combining world-class universities with a unique natural and cultural setting — offers exceptional conditions for doctoral study. The NZIDRS covers full tuition and domestic fees, a living stipend of NZD 25,000 per year, establishment costs of NZD 3,000, medical and travel insurance, and a book and travel allowance. The scholarship is tenable for up to 36 months. New Zealand universities offer doctoral programmes across all disciplines, with particular strengths in agriculture, environmental science, marine biology, Māori and Pacific studies, engineering, and health sciences. Applicants must be international students who have not previously resided in New Zealand, hold a relevant master's degree with first-class honours or equivalent, and have secured a supervisor at a New Zealand tertiary institution. Selection is based on academic excellence, the quality of the research proposal, and the potential for the research to contribute to New Zealand's knowledge base. New Zealand offers international PhD students a unique advantage: they pay domestic tuition fees, the same as New Zealand citizens, making it one of the most affordable destinations for doctoral study in the English-speaking world. Scholars also enjoy work rights during their studies and post-study work visas upon completion."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Amsterdam Merit Scholarships", country: "Netherlands",
    level: "Master's", field: "All Fields",
    deadline: "01 Feb 2027",
    link: "https://www.uva.nl/en/education/master-s/scholarships-and-financing/amsterdam-merit-scholarships/ams.html",
    description: "The Amsterdam Merit Scholarships (AMS) are the University of Amsterdam's most prestigious scholarship programme for outstanding international students enrolling in a full-time Master's degree. Funded by the University of Amsterdam and the Amsterdam University Fund, the scholarships cover full tuition fees and living expenses for one year of Master's study, with the possibility of extension for a second year based on academic performance. The AMS programme is open to students from outside the EU/EEA who have been admitted to a full-time Master's programme at the University of Amsterdam. The university offers over 80 Master's programmes across seven faculties, including Economics and Business, Humanities, Science, Social and Behavioural Sciences, and Law. Applicants must demonstrate exceptional academic performance, typically ranking in the top 5% of their graduating class, and submit a motivation letter along with their Master's programme application. Selection is based on academic excellence, the quality of the motivation letter, and the strength of the overall application. The University of Amsterdam, founded in 1632, is one of Europe's largest and most research-intensive universities, consistently ranked among the top 100 globally. Located in the heart of Amsterdam — a vibrant, multicultural city and a hub for international business and culture — students benefit from a dynamic academic environment, extensive library resources, and strong connections to industry and government. AMS scholars join an elite community of top-performing students and gain access to exclusive networking events and career development opportunities."
  },
  // ===== BATCH 2: Partially Funded & Regional Scholarships (21–40) =====
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "Eiffel Excellence Scholarship Program", country: "France",
    level: "Master's, PhD", field: "Engineering, Sciences, Law, Economics, Political Science",
    deadline: "10 Jan 2027",
    link: "https://www.campusfrance.org/en/eiffel-scholarship-program-of-excellence",
    description: "The Eiffel Excellence Scholarship Program, established by the French Ministry for Europe and Foreign Affairs, is one of France's most prestigious scholarship programmes for international students. It targets top-tier candidates from around the world who wish to pursue Master's or PhD studies at French higher education institutions. The scholarship provides a monthly allowance of €1,181 for Master's students and €1,700 for doctoral candidates, an international travel grant, housing assistance, cultural activities, and health coverage. For Master's programmes, the scholarship is tenable for 12 to 36 months; for PhD programmes, 12 to 36 months. Eiffel Scholars must study in priority fields: science and engineering, mathematics, physics, chemistry, life sciences, ICT, environmental sciences, engineering sciences, law, economics, management, history, and political and social sciences. Applications are submitted by French higher education institutions on behalf of the candidate — students cannot apply directly. The host institution must nominate the candidate and submit the application to Campus France. Selection is based on academic excellence, the coherence of the study plan, and the candidate's potential to contribute to their field. France offers a world-class higher education system with tuition fees significantly lower than those in the US or UK, making the Eiffel Scholarship an exceptionally good value. Scholars benefit from France's rich cultural heritage, its position as a global leader in science and innovation, and access to a network of over 7,000 Eiffel alumni in more than 160 countries."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Singapore International Graduate Award (SINGA)", country: "Singapore",
    level: "PhD", field: "Science, Engineering, Technology",
    deadline: "01 Jun 2027",
    link: "https://www.a-star.edu.sg/scholarships/for-graduate-studies/singapore-international-graduate-award-singa",
    description: "The Singapore International Graduate Award (SINGA) is a prestigious fully funded PhD scholarship offered by the Agency for Science, Technology and Research (A*STAR) in collaboration with leading Singapore universities — the National University of Singapore (NUS), Nanyang Technological University (NTU), Singapore University of Technology and Design (SUTD), and Singapore Management University (SMU). The scholarship attracts outstanding international students to conduct cutting-edge research in science and engineering at Singapore's world-class research institutions. SINGA covers full tuition fees, a monthly stipend of SGD 2,700 (increasing to SGD 3,200 after passing the qualifying examination), a one-time settling-in allowance of SGD 1,000, a one-time airfare grant of up to SGD 1,500, and a generous conference travel grant. The scholarship is tenable for up to four years. Research areas span biomedical sciences, physical sciences and engineering, information and communication technologies, and manufacturing technology. Applicants must hold a good honours degree in a relevant science or engineering discipline, demonstrate strong research potential, and have achieved good GRE or TOEFL/IELTS scores (where applicable). The application process involves submitting an online application with research proposals, academic transcripts, and reference letters. Shortlisted candidates are interviewed by A*STAR and the host university. Singapore has emerged as one of Asia's premier research destinations, offering state-of-the-art laboratories, competitive salaries for researchers, and a multicultural, English-speaking environment. SINGA scholars join a diverse international community and gain access to A*STAR's extensive research network spanning over 20 research institutes."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "NSF Graduate Research Fellowship Program (GRFP)", country: "United States",
    level: "Master's, PhD", field: "STEM Fields",
    deadline: "24 Oct 2026",
    link: "https://www.nsfgrfp.org/",
    description: "The National Science Foundation Graduate Research Fellowship Program (NSF GRFP) is the oldest and most prestigious graduate fellowship in the United States for students pursuing research-based Master's and PhD degrees in STEM fields. Each year, approximately 2,000 fellowships are awarded from over 12,000 applicants, making it one of the most competitive science fellowships in the world. The fellowship provides three years of support over a five-year tenure: an annual stipend of USD 37,000, a cost-of-education allowance of USD 16,000 paid to the institution, and access to a USD 5,000 travel allowance for international research. Fellows have the freedom to pursue their research at any accredited US university and can change institutions or research areas during the fellowship period. Eligible fields include biology, chemistry, computer science, engineering, geosciences, mathematics, physics, astronomy, psychology, social sciences (STEM-relevant), and interdisciplinary STEM fields. Applicants must be US citizens, nationals, or permanent residents who are enrolled in or accepted to a research-based Master's or PhD programme. The application requires a personal statement, research plan, graduate research plan, and three reference letters. Selection is based on intellectual merit and broader impacts — NSF's dual review criteria. NSF GRFP Fellows join an elite community that includes over 50 Nobel laureates and thousands of leaders in academia, industry, and government. The fellowship's flexibility, generous funding, and prestige make it the gold standard for STEM graduate funding in the United States."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "LPDP Scholarship Indonesia", country: "Indonesia",
    level: "Master's, PhD", field: "All Fields",
    deadline: "15 Jun 2027",
    link: "https://lpdp.kemenkeu.go.id/",
    description: "The LPDP (Lembaga Pengelola Dana Pendidikan) Scholarship is the Indonesian government's flagship scholarship programme, funded by the Endowment Fund for Education. It supports outstanding Indonesian students to pursue master's and doctoral degrees at top universities in Indonesia and abroad. The scholarship covers full tuition fees, a monthly living allowance, book allowance, health insurance, airfare, and a settling-in grant. For overseas study, the monthly allowance ranges from IDR 11 million to IDR 17 million depending on the destination country. The scholarship is tenable for up to two years (Master's) or four years (PhD). LPDP partners with over 200 destination universities worldwide, including Harvard, Oxford, Cambridge, MIT, and other top-ranked institutions. Applicants must be Indonesian citizens under 35 (Master's) or 40 (PhD), hold a relevant bachelor's or master's degree with a minimum GPA, and demonstrate leadership potential and a commitment to returning to Indonesia after their studies. The selection process includes academic assessment, leadership evaluation, and an interview. LPDP has supported over 25,000 scholars since its establishment in 2012, making it one of the largest government-funded scholarship programmes in the world. The programme prioritises fields aligned with Indonesia's development priorities, including engineering, energy, health, education, agriculture, and governance. LPDP alumni form a powerful network of professionals contributing to Indonesia's economic and social development."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Commonwealth Scholarships for Developing Countries", country: "United Kingdom",
    level: "Master's", field: "All Fields",
    deadline: "17 Oct 2026",
    link: "https://cscuk.fcdo.gov.uk/scholarships/commonwealth-master-s-scholarships/",
    description: "The Commonwealth Scholarships for citizens of developing Commonwealth countries fund one year of full-time Master's study at a UK university. Funded by the UK Foreign, Commonwealth and Development Office (FCDO), these scholarships are among the most established and respected international scholarship programmes, having supported over 35,000 scholars since 1959. The scholarship covers approved airfare, approved tuition fees, a stipend of approximately £1,345 per month (or £1,652 at London institutions), a warm clothing allowance, a thesis grant, and study leave travel. Commonwealth Scholars must study at a UK university and their chosen programme must align with one of six development themes: science and technology for development, health and well-being, global prosperity, peace, security and governance, strengthening global systems, and access and opportunity. Applicants must be citizens of an eligible Commonwealth country, hold a first or upper second-class honours degree (or equivalent), and be unable to afford to study in the UK without the scholarship. Applications are submitted through the nominating body in the applicant's home country — typically a scholarship commission or ministry of education. Selection is based on academic merit, the quality of the study plan, and the potential development impact. Commonwealth Scholars join a global alumni network of over 35,000 professionals who have made significant contributions to international development. The programme's emphasis on development impact and its rigorous selection process ensure that scholars are not just academically excellent but also committed to using their education to create positive change."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Holland Scholarship for Non-EEA Students", country: "Netherlands",
    level: "Bachelor's, Master's", field: "All Fields",
    deadline: "01 Feb 2027",
    link: "https://www.studyinholland.nl/finances/scholarships/holland-scholarship",
    description: "The Holland Scholarship is a one-time grant of €5,000 offered by the Dutch Ministry of Education, Culture and Science to outstanding non-EEA students beginning their studies at participating Dutch research universities and universities of applied sciences. While not a full scholarship, it significantly reduces the cost of studying in the Netherlands and is one of the most widely available Dutch scholarships for international students. The Holland Scholarship is available at over 30 participating institutions, including the University of Amsterdam, Utrecht University, Leiden University, Erasmus University Rotterdam, Delft University of Technology, and many others. Applicants must be non-EEA nationals who do not hold a Dutch degree, have excellent academic results (typically the top 10–20% of their cohort), and have been admitted to a full-degree programme at a participating institution. Applications are submitted directly to the host university, with deadlines typically falling between February and April. Selection is based on academic merit and, in some cases, a motivation letter or additional essays. The Netherlands offers one of the best value propositions in European higher education: English-taught programmes at world-class universities, tuition fees significantly lower than the UK or US, and a vibrant, multicultural society. Dutch universities consistently rank among the top in continental Europe for student satisfaction and research quality. The Holland Scholarship, combined with the Netherlands' affordable cost of living and strong post-study work opportunities, makes it an attractive option for ambitious international students."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "MEXT Japanese Government Undergraduate Scholarships", country: "Japan",
    level: "Bachelor's", field: "All Fields",
    deadline: "17 Apr 2027",
    link: "https://www.studyinjapan.go.jp/en/planning/mext-scholarships.html",
    description: "The MEXT Undergraduate Student Scholarship, offered by the Japanese Ministry of Education, Culture, Sports, Science and Technology, provides full funding for international students to pursue a bachelor's degree at a Japanese university. The scholarship covers full tuition, a monthly allowance of approximately JPY 117,000, round-trip airfare, and an entrance examination fee exemption. The programme duration is five years, including one year of Japanese language preparatory education followed by four years of undergraduate study. Applicants must be between 17 and 24 years old, have completed or be on track to complete 12 years of formal education, and be willing to learn Japanese. There are two application routes: embassy recommendation and university recommendation. The embassy route involves document screening, a written examination in Japanese and English (or other subjects), and an interview at the Japanese embassy or consulate. Fields of study include social sciences and humanities, natural sciences (including agriculture, engineering, and mathematics), and teacher training. Japan offers a unique undergraduate experience combining academic rigour with cultural immersion. Japanese universities excel in engineering, natural sciences, robotics, and social sciences. MEXT scholars gain fluency in Japanese — one of the world's most economically significant languages — and develop deep cross-cultural understanding. The programme has supported thousands of international undergraduates, many of whom have gone on to become leaders in their home countries and bridge-builders between Japan and the rest of the world."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "DAAD Helmut-Schmidt-Programme (Public Policy)", country: "Germany",
    level: "Master's", field: "Public Policy, Governance, Public Administration",
    deadline: "15 Aug 2026",
    link: "https://www.daad.de/en/study-and-research-in-germany/scholarships/daad-scholarships-in-germany/",
    description: "The DAAD Helmut-Schmidt-Programme (HSP), also known as the Master's Scholarships for Public Policy and Good Governance (PPGG), is a prestigious fully funded scholarship programme named after the former German Chancellor. It supports outstanding graduates from eligible developing countries who wish to pursue a Master's degree in public policy, governance, or public administration at participating German universities. The scholarship covers a monthly payment of €934, health insurance, travel allowance, and a study allowance. Participating universities include the University of Duisburg-Essen, University of Erfurt (Willy Brandt School of Governance), Hertie School in Berlin, University of Kassel, University of Potsdam, and the Zeppelin University. Programmes are taught in English and cover fields such as public policy, development studies, European governance, and public management. Applicants must hold a relevant bachelor's degree, have at least one year of professional experience in a field related to public policy, and be from an eligible developing country. The application is submitted to the first-choice university and must include a motivation letter, CV, academic transcripts, two reference letters, and evidence of professional experience. Selection is based on academic merit, professional experience, and the relevance of the chosen programme to the applicant's career goals and their country's development needs. The programme has supported over 1,000 scholars since 2003, building a global network of public policy professionals committed to good governance and sustainable development."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Oxford-Weidenfield and Hoffmann Scholarships", country: "United Kingdom",
    level: "Master's", field: "All Fields",
    deadline: "03 Jan 2027",
    link: "https://www.gsa.ox.ac.uk/weidenfield-scholarships",
    description: "The Oxford-Weidenfeld and Hoffmann Scholarships are fully funded awards for outstanding graduate students from developing and emerging-economy countries to pursue a Master's degree at the University of Oxford. Established by Lord Weidenfeld and the Hoffmann family, the scholarships combine financial support with a comprehensive leadership development programme. Each year, approximately 10–15 scholars are selected from a competitive global pool. The scholarship covers full university and college fees, a living stipend of approximately £18,622 per year, and access to the Weidenfeld Leadership Programme, which includes mentoring, workshops, networking events, and a summer school. Scholars must demonstrate not only academic excellence but also a commitment to returning to their home region and contributing to its development. Eligible regions include Africa, Asia, Latin America, the Middle East, and Southeast Europe. Applicants must hold a first-class honours degree or equivalent and apply for an eligible Master's programme at Oxford. The application is submitted alongside the Oxford graduate application, with a separate scholarship application including a personal statement, leadership essay, and reference letters. Selection is based on academic merit, leadership potential, and the potential for positive impact in the scholar's home region. The Weidenfeld community is a close-knit group of intellectually driven, socially engaged individuals who support each other during their time at Oxford and beyond. The programme's combination of full funding, leadership development, and a powerful alumni network makes it one of the most impactful scholarships for students from developing countries."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Cambridge Trust Scholarships", country: "United Kingdom",
    level: "Master's, PhD", field: "All Fields",
    deadline: "04 Dec 2026",
    link: "https://www.cambridgetrust.org.uk/",
    description: "The Cambridge Trust is the University of Cambridge's central scholarship fund, providing fully funded awards to outstanding international students at all levels of postgraduate study. The Trust awards approximately 150 scholarships each year, covering full tuition fees and a maintenance allowance of approximately £18,000 per year. Cambridge Trust Scholarships are available for any postgraduate course at the University of Cambridge across all departments and faculties. The awards are made on the basis of academic merit, research potential, and, in some cases, financial need. Some Cambridge Trust scholarships are linked to specific criteria — such as country of origin, field of study, or research area — while others are open to all applicants. There is no separate application for most Cambridge Trust scholarships; eligible candidates are automatically considered when they apply for a postgraduate programme at Cambridge. The application deadline is early December for most courses, with some departments having earlier deadlines. The University of Cambridge, founded in 1209, is the second-oldest university in the English-speaking world and one of the most prestigious academic institutions globally. Scholars benefit from a collegiate system that provides academic and social support, world-class libraries and laboratories, and a vibrant intellectual community. Cambridge Trust Scholars join a diverse network of over 2,000 current scholars and a global alumni community spanning every continent and discipline."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "University of Bologna Study Grants and Scholarships", country: "Italy",
    level: "Bachelor's, Master's", field: "All Fields",
    deadline: "31 Mar 2027",
    link: "https://www.unibo.it/en/study/fees-and-scholarships/scholarships-and-grants",
    description: "The University of Bologna — the oldest university in the Western world, founded in 1088 — offers a range of study grants and scholarships to outstanding international students enrolling in bachelor's and master's degree programmes. The main scholarship, the Unibo Action 1 & 2, provides tuition fee waivers and cash grants of up to €11,000 for the duration of the programme. Additional scholarships are available through the Italian Ministry of Foreign Affairs (MAECI), regional bodies (ER.GO), and specific departmental funds. The Unibo scholarship programme targets high-achieving international students, with selection based on standardized test scores (TOLC for bachelor's, GRE/GMAT for master's) or academic records. Applicants must be non-EU citizens residing abroad and hold the required academic qualifications for their chosen programme. Applications are submitted through the university's online portal, with deadlines typically falling between March and May. The University of Bologna offers over 100 degree programmes, many taught in English, across campuses in Bologna, Forlì, Cesena, Ravenna, and Rimini. Italy offers one of the most affordable higher education experiences in Western Europe, with tuition fees at public universities significantly lower than in the UK, US, or Australia. Students benefit from Italy's rich cultural heritage, world-renowned cuisine, and a strategic location for travel across Europe. Bologna itself is a vibrant university city with a low cost of living and a strong international student community."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "KAIST International Student Scholarship", country: "South Korea",
    level: "Bachelor's, Master's, PhD", field: "Engineering, Science, Technology",
    deadline: "15 May 2027",
    link: "https://admission.kaist.ac.kr/en/scholarship",
    description: "The KAIST International Student Scholarship provides full funding for outstanding international students pursuing degrees at the Korea Advanced Institute of Science and Technology, South Korea's leading science and technology university. The scholarship covers full tuition, a monthly allowance of approximately KRW 350,000–900,000 (depending on degree level), health insurance, and round-trip airfare for the first time. KAIST, located in Daejeon, is consistently ranked as the top university in South Korea and among the top 50 globally for engineering and technology. The university offers programmes in computer science, electrical engineering, mechanical engineering, biological sciences, physics, chemistry, mathematics, and business and technology management — all taught in English at the graduate level. Undergraduate students must demonstrate strong performance in mathematics and science; graduate applicants must hold a relevant degree and show research potential. The application is submitted through the KAIST online portal, with deadlines in February for the autumn intake and September for the spring intake. Selection is based on academic excellence, English proficiency, and research potential (for graduate applicants). KAIST provides a unique research environment with state-of-the-art facilities, strong industry connections (including Samsung, LG, and SK), and a dynamic campus culture. South Korea's position as a global technology leader, combined with KAIST's research output and innovation ecosystem, makes it an ideal destination for students in STEM fields. International scholars benefit from a supportive environment, Korean language courses, and a growing international student community."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Austrian Government Development Cooperation Scholarships", country: "Austria",
    level: "Master's, PhD", field: "Development Studies, Social Sciences",
    deadline: "01 Sep 2026",
    link: "https://www.oead.at/en/to-austria/scholarships-and-grants/",
    description: "The Austrian Government Development Cooperation Scholarships, administered by the OeAD (Austrian Agency for Education and Internationalisation), support outstanding students from developing countries pursuing master's and doctoral studies at Austrian universities in development-related fields. The scholarship programme covers a monthly allowance of approximately €1,175, health insurance, and a travel allowance. The scholarships are tenable for up to 24 months (Master's) or 36 months (PhD). Eligible fields include development studies, environmental sciences, public health, social sciences, agricultural sciences, and related disciplines that contribute to sustainable development. Applicants must be citizens of eligible developing countries, hold a relevant degree, and demonstrate a commitment to development work in their home country. Applications are submitted through the OeAD online portal, with the deadline typically in September for the following academic year. Austria offers a high-quality academic environment with strong programmes in development studies, environmental policy, and social sciences. Austrian universities, including the University of Vienna, BOKU Vienna, and the University of Graz, provide rigorous research training and access to European academic networks. Vienna, consistently ranked among the world's most liveable cities, offers a rich cultural environment and a strategic location at the crossroads of Central and Eastern Europe. The scholarship programme has supported hundreds of scholars from Africa, Asia, and Latin America, building a network of development professionals committed to sustainable and equitable progress."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "Belgian Government Scholarships for Developing Countries", country: "Belgium",
    level: "Master's", field: "Development Studies, Public Health, Agriculture",
    deadline: "01 Mar 2027",
    link: "https://www.enabel.be/en/what-we-do/scholarships",
    description: "The Belgian Government Scholarships for Developing Countries, managed by Enabel (the Belgian development agency), provide funding for students from eligible developing countries to pursue master's programmes at Belgian universities in fields relevant to international development. The scholarship covers a monthly allowance of approximately €1,300, tuition fees, health insurance, travel costs, and a settling-in allowance. Scholarships are typically tenable for 12 to 24 months. Belgian universities offering these programmes include KU Leuven, Ghent University, University of Antwerp, Université catholique de Louvain (UCLouvain), and the Institute of Tropical Medicine in Antwerp. Eligible fields include public health, tropical medicine, agriculture, food security, environment, water management, governance, and development economics. Applicants must be nationals of an eligible developing country, hold a relevant bachelor's degree, and have at least two years of professional experience in a development-related field. Applications are submitted through the Belgian embassy or consulate in the applicant's home country, or directly through Enabel's online portal. Selection is based on academic merit, professional experience, and the relevance of the chosen programme to the applicant's country's development priorities. Belgium's central location in Europe, multilingual environment (French, Dutch, and German), and its role as the de facto capital of the European Union make it an ideal base for studying international development. The scholarship programme has supported thousands of development professionals who have gone on to lead policy, research, and programme implementation in their home countries."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Turkish Burslari (Turkish Government Scholarships)", country: "Turkey",
    level: "Bachelor's, Master's, PhD", field: "All Fields",
    deadline: "20 Feb 2027",
    link: "https://www.turkiyeburslari.gov.tr/",
    description: "Türkiye Bursları (Turkey Scholarships) is the Turkish government's comprehensive fully funded scholarship programme for international students at all academic levels. Administered by the Turkish Scholarship Administration (Türkiye Bursları), the programme attracts over 150,000 applications annually from more than 180 countries, making it one of the most sought-after government scholarships in the world. The scholarship covers full tuition, monthly stipend (approximately TRY 4,500 for bachelor's, TRY 6,000 for master's, TRY 9,000 for PhD), accommodation, health insurance, round-trip airfare, and a one-year Turkish language course. The programme is open to students at all levels: bachelor's (for high school graduates under 21), master's (for bachelor's graduates under 30), and PhD (for master's graduates under 35). Applicants must demonstrate academic excellence and, for graduate students, research potential. The application is submitted through the Türkiye Bursları online portal and requires academic transcripts, a letter of intent, a letter of recommendation, and a statement of research interest (for graduate applicants). Selection is based on academic merit, with additional points for candidates from countries with lower higher education access rates. Turkey offers a unique position at the crossroads of Europe and Asia, with a rich historical heritage and rapidly growing higher education system. Turkish universities, including Boğaziçi University, Middle East Technical University (METU), and Istanbul Technical University, provide quality education at a fraction of the cost of Western alternatives. Scholars benefit from Turkey's vibrant culture, strategic location, and growing research infrastructure."
  },
  // ===== BATCH 3: Fellowships (41–55) =====
  {
    type: "Fellowship", funding: "Fully Funded",
    title: "Ford Foundation Fellowship", country: "United States",
    level: "PhD", field: "Social Sciences, Humanities, STEM",
    deadline: "15 Dec 2026",
    link: "https://www.fordfoundation.org/work/our-work/challenges/equity-and-justice/ford-fellowships/",
    description: "The Ford Foundation Fellowship Programs support outstanding doctoral students who have demonstrated the ability to make significant contributions to academic research in their chosen fields. Administered by the National Academies of Sciences, Engineering, and Medicine, the programme offers three types of fellowships: Predoctoral Fellowships for students in the early stages of their doctoral programme, Dissertation Year Fellowships for students completing their dissertations, and Postdoctoral Fellowships for recent PhD recipients. Predoctoral and Dissertation Fellows receive an annual stipend of USD 28,000 plus institutional allowances. Postdoctoral Fellows receive USD 52,000 annually. The programme specifically seeks to increase the diversity of the academic workforce by supporting students from underrepresented backgrounds. Eligible applicants must demonstrate a commitment to diversity and inclusion in academia, show evidence of academic excellence, and be enrolled in or accepted to a PhD programme at an accredited US institution. The application requires a personal statement, research statement, CV, and three reference letters. Selection is based on academic achievement, leadership potential, and the potential to contribute to diversity in the academic field. Ford Fellows join a network of over 4,000 alumni who have made significant contributions across every discipline in the social sciences, humanities, and STEM fields."
  },
  {
    type: "Fellowship", funding: "Fully Funded",
    title: "Obama Foundation Leaders: Africa", country: "Global",
    level: "Mid-Career Professionals", field: "Civic Leadership, Public Service",
    deadline: "30 Jun 2027",
    link: "https://www.obama.org/leaders/africa/",
    description: "The Obama Foundation Leaders: Africa programme identifies and supports emerging leaders from across the African continent who are driving impact in their communities. The programme offers a fully funded six-month fellowship that includes a residential experience in the United States, leadership development workshops, community project support, and ongoing mentorship. Fellows engage with the Obama Foundation's leadership curriculum, which focuses on empowering leaders to mobilise their communities, navigate challenges, and build sustainable solutions. The programme is designed for leaders aged 24–35 who have a track record of creating positive change in their communities through civic engagement, public service, entrepreneurship, or nonprofit work. There are no formal education requirements — the programme values demonstrated impact and leadership potential over academic credentials. Applicants must be citizens of an African country, be between 24 and 35 years old, and demonstrate a commitment to community impact. The application process includes a written application, video submission, and interviews. The Obama Foundation Leaders programme has supported over 500 leaders from across Africa since its inception, creating a powerful network of change-makers who continue to receive support through the Foundation's alumni programming. Fellows gain access to a global network of Obama Foundation alumni, mentorship from senior leaders, and resources to scale their community projects."
  },
  {
    type: "Fellowship", funding: "Fully Funded",
    title: "YALI (Young African Leaders Initiative) Fellowship", country: "United States",
    level: "Young Professionals", field: "Civic Engagement, Business, Public Management",
    deadline: "15 Oct 2026",
    link: "https://yali.state.gov/",
    description: "The Young African Leaders Initiative (YALI) Fellowship, funded by the US Department of State, brings outstanding young African leaders to the United States for a six-week leadership development programme. The fellowship includes academic coursework at a US university, community engagement activities, leadership training, and a summit in Washington, DC. YALI Fellows are selected in three tracks: Civic Leadership, Business and Entrepreneurship, and Public Management. Each track includes a four-week academic residency at a US university, a one-week leadership summit in Washington, DC, and opportunities for professional engagement with American organisations. The fellowship covers all costs including international travel, accommodation, meals, a stipend for incidental expenses, and health insurance. Applicants must be citizens of a sub-Saharan African country, between 25 and 35 years old, with at least two years of leadership experience in their chosen track. The programme is not a degree programme — it is a professional development experience designed to build leadership skills and cross-cultural understanding. Applications are submitted through the US Embassy or Consulate in the applicant's home country. Selection is based on leadership achievements, commitment to public service, and the potential to apply skills and knowledge to benefit the applicant's community. Since its launch in 2010, YALI has empowered over 2,500 young African leaders, creating a vibrant alumni network that continues to drive positive change across the continent."
  },
  {
    type: "Fellowship", funding: "Fully Funded",
    title: "Echoing Green Fellowship", country: "Global",
    level: "Early-Career Social Entrepreneurs", field: "Social Entrepreneurship",
    deadline: "25 Jan 2027",
    link: "https://echoinggreen.org/fellowship/",
    description: "The Echoing Green Fellowship is one of the world's most prestigious awards for early-stage social entrepreneurs, providing seed funding and support to launch new organisations that address pressing social and environmental challenges. Each year, Echoing Green awards approximately 15 fellowships, each providing USD 80,000 in stipend support over 18 months, along with leadership development, mentorship, and access to a global network of social innovators. Fellows receive funding to work full-time on their social enterprise idea, allowing them to focus entirely on building their organisation during the critical early stages. The fellowship is open to individuals from any country who have a bold, innovative idea for social change and are committed to building a new organisation to address it. There are no restrictions on the specific issue area — past fellows have worked on education, health, economic justice, environmental sustainability, criminal justice reform, and human rights. The application process requires a detailed proposal for the proposed organisation, a personal statement, and reference letters. Semi-finalists are invited to pitch their ideas to a selection committee. Echoing Green alumni have launched over 800 social enterprises that have collectively raised over USD 2 billion in follow-on funding and impacted millions of lives worldwide. The fellowship's combination of unrestricted funding, expert mentorship, and a powerful peer network makes it the gold standard for launching social enterprises."
  },
  {
    type: "Fellowship", funding: "Fully Funded",
    title: "Mandela Washington Fellowship for Young African Leaders", country: "United States",
    level: "Young Professionals", field: "Civic Engagement, Public Management, Business",
    deadline: "15 Oct 2026",
    link: "https://thelpi.org/mandela-washington-fellowship/",
    description: "The Mandela Washington Fellowship is the flagship programme of the Young African Leaders Initiative (YALI), bringing 1,000 young African leaders to the United States each summer for a six-week Leadership Institute. The fellowship includes academic and leadership training at US universities, a summit in Washington, DC, and a six-week Professional Development Experience with American organisations. Fellows are placed in one of three tracks: Business and Entrepreneurship, Civic Engagement, or Public Management. The programme covers all expenses including international travel, accommodation, meals, a stipend, and health insurance. Applicants must be between 25 and 35 years old, be citizens of a sub-Saharan African country, and demonstrate a record of leadership and community impact. The fellowship is not a degree programme but rather an intensive professional development experience that builds leadership skills and connects fellows with American peers and mentors. Applications are submitted through the US Embassy or through the YALI online platform. Selection is highly competitive, with emphasis on leadership achievements, commitment to public service, and the potential for long-term impact. Mandela Washington Fellows join the YALI Alumni Network of over 18,000 leaders across sub-Saharan Africa, gaining access to ongoing professional development, mentoring, and funding opportunities. The fellowship honours the legacy of Nelson Mandela by investing in the next generation of African leaders."
  },
  {
    type: "Fellowship", funding: "Fully Funded",
    title: "Hult Prize", country: "Global",
    level: "University Students, Recent Graduates", field: "Social Entrepreneurship",
    deadline: "01 Mar 2027",
    link: "https://www.hultprize.org/",
    description: "The Hult Prize is the world's largest student competition for social entrepreneurship, challenging university students and recent graduates to develop innovative solutions to pressing global issues. The competition awards USD 1 million in seed capital to the winning team, with additional funding and acceleration support for regional finalists. The Hult Prize is launched each year with a new challenge theme — past challenges have focused on education, energy, food security, health, and economic opportunity. Teams of up to four members from any university worldwide can participate, regardless of their field of study. The competition progresses through several stages: an online application, regional summits, a global acceleration programme, and a final pitch to a panel of judges including world leaders, business executives, and social entrepreneurs. The Hult Prize is affiliated with the Clinton Foundation and is supported by Hult International Business School. Applicants must be currently enrolled in a university programme or have graduated within the past 24 months. There are no restrictions on nationality or field of study. The competition emphasises innovative, sustainable business models that can scale to address global challenges at scale. Past winners have launched social enterprises operating in over 30 countries, addressing issues from clean water access to refugee employment. The Hult Prize provides not just funding but also mentorship, media exposure, and access to a global network of social entrepreneurs and impact investors."
  },
  {
    type: "Fellowship", funding: "Fully Funded",
    title: "National Geographic Society Grants", country: "Global",
    level: "Researchers, Explorers", field: "Conservation, Science, Exploration, Education",
    deadline: "15 Sep 2026",
    link: "https://www.nationalgeographic.org/apply-for-funding/",
    description: "The National Geographic Society offers a range of grants and fellowships to researchers, explorers, educators, and storytellers working to advance exploration and conservation around the world. The Society's grant programmes support projects in conservation, scientific research, exploration, storytelling, education, and technology. Grant amounts range from USD 10,000 to USD 200,000 depending on the programme and scope of the project. The Society offers several specific funding opportunities: the Explorer Grant for early-career researchers, the Research and Exploration Grant for established scientists, the storytelling grant for journalists and filmmakers, and the education grant for innovative educators. Applicants must propose a project that aligns with the Society's mission to illuminate and protect the wonder of our world. There are no nationality restrictions, and applications are accepted from individuals and teams worldwide. The application process requires a detailed project proposal, budget, timeline, and supporting materials (such as preliminary data or previous work samples). Selection is based on the project's potential for impact, innovation, feasibility, and alignment with the Society's strategic priorities. National Geographic Explorers join a community of over 400 active explorers working in more than 130 countries, gaining access to the Society's global platform, scientific resources, and communications network. The grants have supported groundbreaking discoveries in archaeology, marine biology, climate science, and conservation."
  },
  {
    type: "Fellowship", funding: "Fully Funded",
    title: "MacArthur Fellowship", country: "United States",
    level: "Mid-Career Professionals", field: "All Fields",
    deadline: "Rolling",
    link: "https://www.macfound.org/programs/fellows/",
    description: "The MacArthur Fellowship, commonly known as the 'Genius Grant', is one of the most prestigious and unconventional awards in the world. Each year, the John D. and Catherine T. MacArthur Foundation awards approximately 24 fellowships to extraordinary individuals who have shown exceptional creativity and promise for important future advances based on their accomplishments. The fellowship provides an unrestricted grant of USD 800,000, paid in quarterly instalments over five years, with no requirements for reporting, teaching, or specific project outcomes. Fellows are selected through a confidential nomination process — individuals cannot apply directly. Nominators, who are anonymous, propose candidates who are then evaluated by an independent selection committee. The fellowship recognises creativity, originality, and the potential to make significant contributions in any field — from the arts and humanities to science, technology, social justice, and public health. Past fellows have included scientists, writers, composers, filmmakers, mathematicians, social entrepreneurs, journalists, and public interest lawyers. The MacArthur Fellowship is unique in its trust in the individual's vision and judgement, providing unrestricted funding that allows fellows to pursue their work in the way they believe is most effective. The fellowship has supported over 1,100 individuals since 1981, creating a community of some of the most creative and impactful minds of our time."
  },
  {
    type: "Fellowship", funding: "Fully Funded",
    title: "World Bank Group Internship Programme", country: "Global",
    level: "Master's, PhD", field: "Economics, Finance, Development, Social Sciences",
    deadline: "28 Feb 2027",
    link: "https://www.worldbank.org/en/about/careers/programs-and-internships/internship",
    description: "The World Bank Group Internship Programme offers paid internships to outstanding graduate students and recent graduates who are passionate about international development. Interns work on World Bank projects alongside staff members, gaining firsthand experience in the Bank's operations across areas such as poverty reduction, economic development, infrastructure, education, health, and climate change. The programme is open to students currently enrolled in a master's or PhD programme, or those who have graduated within the past 12 months. Interns receive a daily stipend of approximately USD 100, and the World Bank covers travel expenses for those travelling from outside the duty station country. Internship duration ranges from four weeks to six months, with placements available at World Bank offices in Washington, DC, and field offices worldwide. Applicants must be nationals of a World Bank member country, be proficient in English (additional languages are an asset), and have relevant academic backgrounds in economics, finance, public policy, engineering, environmental science, social sciences, or related fields. The application is submitted through the World Bank's online portal and requires a CV, cover letter, academic transcripts, and a statement of interest. Selection is competitive, with preference given to candidates with relevant coursework, research experience, and a demonstrated commitment to international development. The programme has served as a pipeline for future World Bank employees, with many former interns returning as full-time staff."
  },
  {
    type: "Fellowship", funding: "Fully Funded",
    title: "United Nations Internship Programme", country: "Global",
    level: "Bachelor's, Master's, PhD", field: "All Fields",
    deadline: "Rolling",
    link: "https://careers.un.org/lbw/internships.aspx",
    description: "The United Nations Internship Programme provides students and recent graduates with the opportunity to gain practical experience with the UN system in various duty stations worldwide. Interns work in departments and agencies across the UN Secretariat, including the Department of Political Affairs, the Department of Economic and Social Affairs, UNICEF, UNDP, UNHCR, and others. The programme is open to students currently enrolled in a bachelor's, master's, or doctoral programme, or those who have graduated within the past 12 months. Internships typically last two to six months and are available at UN offices in New York, Geneva, Vienna, Nairobi, and other duty stations. While the UN does not provide a salary or stipend for interns, some agencies (including UNICEF and UNDP) offer a monthly stipend to help cover living expenses. Applicants must be nationals of a UN member state, be proficient in English or French (additional UN languages are an asset), and have relevant academic backgrounds. The application is submitted through the UN's Inspira portal and requires a CV, cover letter, and academic transcripts. Selection is based on academic performance, relevant skills, and alignment with the department's needs. The UN Internship Programme offers a unique opportunity to contribute to the UN's mission of maintaining international peace and security, promoting sustainable development, and protecting human rights."
  },
  {
    type: "Internship", funding: "Paid",
    title: "Google Summer of Code", country: "Global",
    level: "University Students", field: "Computer Science, Software Engineering",
    deadline: "22 Aug 2026",
    link: "https://summerofcode.withgoogle.com/",
    description: "Google Summer of Code (GSoC) is a global programme that offers university students the opportunity to contribute to open-source software projects during their summer break. Participants work remotely with mentor organisations on real-world software development projects, gaining hands-on experience in coding, collaboration, and open-source community engagement. The programme runs from May to August and provides a stipend of USD 1,500–6,600 depending on the participant's country of residence. GSoC is open to students aged 18 and older who are enrolled in an accredited post-secondary institution. Participants are matched with one of over 200 open-source organisations working on projects ranging from machine learning and web development to scientific computing and robotics. The application process involves submitting a project proposal to a participating organisation, demonstrating coding skills through sample contributions, and passing a technical review. Selection is competitive, with approximately 1,200 participants accepted from over 10,000 applicants annually. Google Summer of Code has contributed to over 800 open-source projects since its inception in 2005, with many participants continuing as long-term contributors and maintainers. The programme provides an exceptional entry point into the open-source community, offering mentorship, real-world experience, and a stipend — all while working on projects that impact millions of users worldwide."
  },
  {
    type: "Internship", funding: "Paid",
    title: "CERN Summer Student Programme", country: "Switzerland",
    level: "Bachelor's, Master's", field: "Physics, Engineering, Computer Science",
    deadline: "15 Jan 2027",
    link: "https://careers.cern/students",
    description: "The CERN Summer Student Programme offers undergraduate and master's students in physics, engineering, and computer science the opportunity to spend two months working at CERN, the European Organization for Nuclear Research and home of the Large Hadron Collider. The programme includes a combination of hands-on work in a CERN department and a series of lectures and workshops covering particle physics, accelerator technology, and computing. Summer students receive a monthly stipend of approximately CHF 2,900 and travel allowance. The programme runs from June to August each year and accepts approximately 200 students from CERN member states and associate member states. Participants work alongside CERN scientists and engineers on real research projects, gaining experience in experimental physics, detector technology, software development, or engineering. Applicants must be enrolled in a relevant degree programme at a university in a CERN member or associate member state, be proficient in English, and have completed at least two years of study. The application requires a CV, academic transcripts, a motivation letter, and a reference from a university professor. Selection is based on academic excellence, motivation, and the relevance of the applicant's studies to CERN's work. CERN, located near Geneva, is the world's largest particle physics laboratory and one of the most important scientific research centres on the planet. Summer students gain access to cutting-edge facilities, world-leading researchers, and a multicultural environment that fosters scientific discovery and innovation."
  },
  {
    type: "Internship", funding: "Paid",
    title: "NASA OSTEM Internships", country: "United States",
    level: "Bachelor's, Master's, PhD", field: "STEM Fields",
    deadline: "Rolling",
    link: "https://stemgateway.nasa.gov/external/s/login",
    description: "NASA's Office of STEM Engagement (OSTEM) offers internship opportunities to students at all levels of their STEM education at NASA centres across the United States. These internships provide hands-on experience with NASA's missions, research, and operations in fields including aerospace engineering, astrophysics, Earth science, planetary science, robotics, computer science, and life sciences. Internships are available at NASA centres including Johnson Space Center, Jet Propulsion Laboratory, Goddard Space Flight Center, Ames Research Center, and others. The programme offers three types of internships: summer (10 weeks), fall (16 weeks), and spring (16 weeks). Interns receive a stipend that varies by academic level. Applicants must be US citizens or permanent residents, be at least 16 years old, and be enrolled in an accredited STEM degree programme. The application is submitted through NASA's OSTEM Internship portal and requires a CV, academic transcripts, and a statement of interest. Selection is based on academic performance, relevant coursework, and alignment with the available projects. NASA internships offer a unique opportunity to contribute to humanity's exploration of space, from developing technologies for the Artemis missions to studying Earth's climate system. Many former NASA interns have gone on to careers at NASA, in the aerospace industry, and in academic research."
  },
  {
    type: "Internship", funding: "Paid",
    title: "European Central Bank Internship Programme", country: "Germany",
    level: "Master's, Recent Graduates", field: "Economics, Finance, Law, Statistics",
    deadline: "15 Feb 2027",
    link: "https://www.ecb.europa.eu/careers/student-opportunities/html/index.en.html",
    description: "The European Central Bank (ECB) Internship Programme offers graduate students and recent graduates the opportunity to gain practical experience at one of the world's most important financial institutions. Interns work in departments covering monetary policy, banking supervision, financial stability, economics, legal services, and corporate functions. The programme offers two types of internships: graduate internships for students who have completed at least a bachelor's degree, and doctoral internships for PhD candidates. Graduate interns receive a monthly stipend of approximately €1,200, while doctoral interns receive approximately €1,900. Internships last between three and six months and are based at the ECB in Frankfurt, Germany. Applicants must be nationals of an EU member state, have excellent command of English (knowledge of another EU language is an asset), and be enrolled in or have recently completed a relevant degree programme. The application requires a CV, motivation letter, academic transcripts, and reference letters. Selection is based on academic excellence, relevant skills, and motivation. The ECB Internship Programme offers a unique opportunity to work at the heart of European monetary policy, contributing to the stability of the euro and the European financial system. Interns gain exposure to high-level policy discussions, cutting-edge economic research, and the operations of a major central bank."
  },
  {
    type: "Internship", funding: "Paid",
    title: "IMF Internship Programme", country: "United States",
    level: "Master's, PhD", field: "Economics, Finance, Statistics, Public Policy",
    deadline: "Rolling",
    link: "https://www.imf.org/en/About/Recruitment/Internships",
    description: "The International Monetary Fund (IMF) Internship Programme offers outstanding graduate students the opportunity to work alongside IMF economists and policy experts in Washington, DC. Interns contribute to the Fund's core work in macroeconomic surveillance, financial sector analysis, capacity development, and research. The programme is open to students currently enrolled in a master's or PhD programme in economics, finance, statistics, public policy, or a related field. Interns receive a daily stipend of approximately USD 125 and the IMF covers travel expenses for those travelling from outside the United States. Internships typically last 10 to 14 weeks during the summer (June to September), though some positions are available throughout the year. Applicants must be nationals of an IMF member country, be proficient in English, and have strong quantitative and analytical skills. The application requires a CV, academic transcripts, a statement of interest, and a reference letter from a faculty member. Selection is highly competitive, with preference given to candidates with strong academic records and relevant coursework in macroeconomics, international finance, and econometrics. The IMF Internship Programme offers unparalleled exposure to global economic policy, providing interns with the opportunity to contribute to the Fund's mission of promoting international monetary cooperation, financial stability, and sustainable economic growth."
  },
  {
    type: "Fellowship", funding: "Fully Funded",
    title: "TED Fellowship", country: "Global",
    level: "Mid-Career Professionals", field: "All Fields",
    deadline: "01 Aug 2026",
    link: "https://www.ted.com/about/our-organization/programs-events/ted-fellowship",
    description: "The TED Fellowship programme brings together exceptional individuals from around the world who are creating positive change in their communities and fields. Fellows are selected for their extraordinary achievements, innovative thinking, and commitment to making a difference. The fellowship includes attendance at the annual TED Conference, where fellows join the global TED community of leaders, thinkers, and doers. Fellows receive support for their work through the TED network, media exposure, and access to TED's platform for sharing their ideas with a global audience. The programme is open to individuals from any field — science, technology, entertainment, design, business, the arts, social entrepreneurship, and more. There are no formal education or age requirements. The selection process values originality, impact, and the potential to contribute to the TED community's collective mission of spreading ideas that matter. Applicants must be nominated or apply through the TED Fellowship application process, which includes a detailed application form, video submission, and interviews. TED Fellows join a diverse community of over 800 fellows from more than 80 countries, including scientists, artists, entrepreneurs, activists, and innovators. The fellowship provides a platform for amplifying ideas, connecting with collaborators, and accessing TED's resources and network."
  },
  {
    type: "Fellowship", funding: "Fully Funded",
    title: "Chevening Fellowships", country: "United Kingdom",
    level: "Mid-Career Professionals", field: "All Fields",
    deadline: "05 Nov 2026",
    link: "https://www.chevening.org/fellowships/",
    description: "The Chevening Fellowships programme, funded by the UK Foreign, Commonwealth and Development Office, supports mid-career professionals from Chevening-eligible countries to undertake short fellowships at UK institutions. Unlike the Chevening Scholarships (which fund full master's degrees), the Fellowships are designed for experienced professionals who want to enhance their skills and knowledge through a focused period of study, research, or professional development in the UK. Fellowships typically last between two and six months and cover travel costs to and from the UK, a monthly stipend, and programme costs at the host institution. There are several fellowship streams, including the Chevening-Fulbright Fellowship (for US citizens), the Chevening-Mitchell Fellowship (for Northern Ireland), and sector-specific fellowships in fields such as media, human rights, and health. Applicants must have at least five years of work experience, be from a Chevening-eligible country, and demonstrate leadership potential and a clear plan for how the fellowship will advance their professional goals. The application requires a CV, a personal statement, reference letters, and a detailed fellowship proposal. Chevening Fellows join the global Chevening alumni network of over 50,000 professionals, gaining access to UK institutions, policymakers, and industry leaders."
  },
  {
    type: "Fellowship", funding: "Fully Funded",
    title: "Research in Germany – DAAD WISE Research Internship", country: "Germany",
    level: "Bachelor's", field: "Engineering, Natural Sciences",
    deadline: "01 Nov 2026",
    link: "https://www.daad.de/en/study-and-research-in-germany/scholarships/daad-scholarships/",
    description: "The DAAD WISE (Working Internships in Science and Engineering) Research Internship programme offers outstanding undergraduate students from select countries the opportunity to conduct research at leading German universities and research institutions. The programme provides a monthly scholarship of approximately €1,000, travel support, and health insurance for a research stay of two to three months during the summer. WISE internships are available in engineering, natural sciences, mathematics, and computer science at participating German universities and Max Planck, Fraunhofer, and Helmholtz research centres. Applicants must be enrolled in a bachelor's programme at a university in an eligible country, have strong academic records, and demonstrate research interest in their chosen field. The application requires a CV, academic transcripts, a research proposal, a motivation letter, and reference letters. Selection is based on academic excellence, research potential, and the quality of the application. Germany offers world-class research infrastructure, a strong tradition of scientific excellence, and a welcoming environment for international researchers. WISE interns gain hands-on experience in cutting-edge research, work alongside leading scientists, and build connections that can lead to future graduate study or career opportunities. The programme has supported hundreds of students since its inception, many of whom have returned to Germany for graduate study or research positions."
  },
  // ===== BATCH 4: Internships, Research, Exchange (61–80) =====
  {
    type: "Internship", funding: "Paid",
    title: "EPFL Summer Research Program", country: "Switzerland",
    level: "Bachelor's, Master's", field: "Engineering, Computer Science, Life Sciences",
    deadline: "15 Feb 2027",
    link: "https://summer.epfl.ch/",
    description: "The EPFL Summer Research Program (SPR) at the Swiss Federal Institute of Technology in Lausanne offers outstanding undergraduate and master's students the opportunity to conduct cutting-edge research at one of Europe's top technical universities. The programme runs for 12 weeks during the summer and places participants in EPFL research laboratories working on projects in engineering, computer science, life sciences, physics, mathematics, and materials science. Summer researchers receive a monthly stipend of CHF 1,760 and travel support. EPFL, ranked among the top 20 technical universities worldwide, provides access to state-of-the-art facilities and world-renowned researchers. The programme is open to students from any country who are enrolled in a bachelor's or master's programme at a recognised university. Applicants must have strong academic records, demonstrate research interest, and be proficient in English. The application requires a CV, academic transcripts, a motivation letter, and a reference letter. Selection is based on academic excellence, research potential, and the quality of the application. EPFL's campus in Lausanne offers a stunning lakeside setting with access to the Swiss Alps and a vibrant international community. SPR participants present their research at the end of the programme and receive a certificate of completion. Many former participants have returned to EPFL for PhD study or have published their summer research in peer-reviewed journals."
  },
  {
    type: "Internship", funding: "Paid",
    title: "Mitacs Globalink Research Internship", country: "Canada",
    level: "Bachelor's", field: "All Fields",
    deadline: "15 Sep 2026",
    link: "https://www.mitacs.ca/en/programs/globalink/globalink-research-internship",
    description: "The Mitacs Globalink Research Internship is a fully funded programme that brings outstanding undergraduate students from eligible countries to Canada for 12-week research internships at Canadian universities. The programme covers round-trip airfare, a living stipend, health insurance, and visa support. Interns work on research projects supervised by Canadian faculty members across all academic disciplines — from engineering and computer science to humanities and social sciences. The programme is open to students in their third year of a bachelor's programme (or equivalent) at universities in eligible partner countries, with a minimum GPA equivalent to a Canadian 80%. Applicants must be proficient in English or French and meet the specific requirements of their chosen research project. The application requires a CV, academic transcripts, a reference letter, and a statement of interest. Selection is based on academic excellence, research potential, and alignment with the available projects. Mitacs Globalink has supported over 5,000 international students since its inception, with many returning to Canada for graduate study. The programme provides a unique opportunity to experience Canadian research culture, build international academic networks, and explore potential pathways to graduate study in Canada. Participants also benefit from social and cultural activities organised by Mitacs, including orientation sessions, networking events, and community engagement opportunities."
  },
  {
    type: "Internship", funding: "Paid",
    title: "Microsoft Research Internship Programme", country: "United States",
    level: "Bachelor's, Master's, PhD", field: "Computer Science, Engineering, Data Science",
    deadline: "Rolling",
    link: "https://www.microsoft.com/en-us/research/academic-programs/internship-program",
    description: "The Microsoft Research Internship Programme offers undergraduate, master's, and PhD students the opportunity to work on cutting-edge research projects at Microsoft Research labs worldwide. Interns collaborate with leading researchers on projects spanning artificial intelligence, machine learning, systems, security, economics, and social impact. The programme is available at Microsoft Research locations in Redmond (Washington), Cambridge (UK), Bangalore (India), Beijing (China), and other locations. Interns receive a competitive salary, relocation assistance, and health benefits. The internship duration is typically 12 weeks during the summer. Applicants must be enrolled in a relevant degree programme at an accredited university and demonstrate strong research and technical skills. The application requires a CV, research statement, academic transcripts, and reference letters. Selection is based on research potential, technical ability, and alignment with ongoing projects. Microsoft Research is one of the world's leading industrial research laboratories, with a track record of groundbreaking contributions to computer science, from natural language processing to quantum computing. Interns benefit from access to world-class facilities, mentorship from senior researchers, and the opportunity to publish their work at top academic conferences. Many former interns have gone on to full-time positions at Microsoft or pursued academic careers at leading universities."
  },
  {
    type: "Internship", funding: "Paid",
    title: "Red Cross Humanitarian Internship Programme", country: "Global",
    level: "Bachelor's, Master's", field: "International Relations, Public Health, Social Sciences",
    deadline: "Rolling",
    link: "https://www.ifrc.org/jobs",
    description: "The International Federation of Red Cross and Red Crescent Societies (IFRC) offers internship opportunities for students and recent graduates interested in humanitarian work. Interns work at the IFRC Secretariat in Geneva or at regional and country offices worldwide, supporting the organisation's mission to prevent and alleviate human suffering in disasters and emergencies. Internships are available in areas including disaster response, public health, migration, community resilience, communications, and international humanitarian law. The programme is open to students currently enrolled in a relevant degree programme or those who have graduated within the past 12 months. Internships typically last three to six months. While the IFRC does not provide a salary, some positions may offer a modest stipend or living allowance depending on the duty station. Applicants must be nationals of a Red Cross or Red Crescent member society country, be proficient in English (additional languages are an asset), and demonstrate a commitment to humanitarian principles. The application requires a CV, cover letter, and academic transcripts. The IFRC internship offers a unique opportunity to gain hands-on experience in the humanitarian sector, working alongside experienced professionals dedicated to the world's most vulnerable populations."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Oxford Pershing Square Graduate Scholarships", country: "United Kingdom",
    level: "Master's", field: "Social Sciences, Business, Public Policy",
    deadline: "03 Jan 2027",
    link: "https://www.pershingsquare.ox.ac.uk/scholarships",
    description: "The Oxford Pershing Square Graduate Scholarships support outstanding students pursuing a one-year Master's degree at the University of Oxford in partnership with the Saïd Business School. The scholarships are designed for students who want to tackle global challenges through innovative, scalable solutions that combine social impact with entrepreneurial thinking. Each year, up to five scholarships are awarded, covering full tuition fees and a living stipend of approximately £18,622. Eligible Master's programmes include the MSc in Social Science of the Internet, MSc in Evidence-Based Social Intervention, MSc in Public Policy, MBA, and other programmes that combine academic rigour with a focus on social impact. Applicants must demonstrate academic excellence, a commitment to addressing global challenges, and entrepreneurial potential. The application is submitted alongside the Oxford graduate application and requires a separate scholarship essay. Selection is based on academic merit, the quality of the applicant's vision for addressing a global challenge, and leadership potential. Pershing Square Scholars join a unique community that bridges Oxford's academic world with the business and social enterprise ecosystem. The programme includes networking events, mentoring from business leaders, and access to the Skoll Centre for Social Entrepreneurship at Saïd Business School."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "University of Tokyo Global Science Course Scholarships", country: "Japan",
    level: "Bachelor's", field: "Science, Engineering",
    deadline: "15 Dec 2026",
    link: "https://www.u-tokyo.ac.jp/en/prospective-students/scholarships.html",
    description: "The University of Tokyo offers a range of scholarship opportunities for outstanding international students enrolling in its science and engineering programmes. The most prestigious is the UTokyo Global Science Scholarship, which covers full tuition and provides a monthly living allowance of approximately JPY 150,000 for the duration of the programme. Additional scholarships are available through the Japan Student Services Organization (JASSO), private foundations, and departmental funds. The University of Tokyo, Japan's oldest and most prestigious university, offers world-class programmes in physics, chemistry, biology, mathematics, engineering, and information science — many taught in English at the graduate level. Undergraduate applicants must demonstrate strong performance in mathematics and science through the university's entrance examination. Graduate applicants must hold a relevant degree and demonstrate research potential. The scholarship application is submitted alongside the university admission application. Japan offers a unique combination of academic excellence, cultural richness, and technological innovation. Tokyo, one of the world's most dynamic cities, provides access to cutting-edge research facilities, a thriving tech industry, and a vibrant international community. University of Tokyo scholars benefit from small class sizes, close faculty mentorship, and the university's extensive global partnerships."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "Sciences Po Eiffel Excellence Scholarship", country: "France",
    level: "Master's", field: "Political Science, International Relations, Economics, Law",
    deadline: "05 Dec 2026",
    link: "https://www.sciencespo.fr/en/admissions/international-students/scholarships",
    description: "Sciences Po, France's leading institution for political and social sciences, offers the Eiffel Excellence Scholarship and its own institutional scholarships to outstanding international students enrolling in Master's programmes. Sciences Po scholarships cover partial or full tuition waivers (up to €19,000 per year) and, for Eiffel scholars, a monthly living allowance of €1,181. Sciences Po offers 17 Master's programmes taught in English across fields including international relations, public policy, economics, law, journalism, urban studies, and environmental policy. The institution is renowned for its rigorous academic training, international perspective, and strong connections to government, international organisations, and the private sector. Applicants must be non-French nationals applying for a Master's programme through Sciences Po's international admissions process. Selection is based on academic excellence, the quality of the application, and, for the Eiffel Scholarship, the candidate's potential to contribute to France's international influence. Sciences Po graduates hold leadership positions across the globe — from heads of state to diplomats, journalists, and business leaders. The institution's Paris campus and regional campuses across France offer a unique educational experience in the heart of European politics and culture."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Robertson Scholars Leadership Program", country: "United States",
    level: "Bachelor's", field: "All Fields",
    deadline: "01 Nov 2026",
    link: "https://robertsonscholars.org/",
    description: "The Robertson Scholars Leadership Program is one of the most prestigious undergraduate scholarships in the United States, funding up to four years of full tuition, room, board, and most fees at either the University of North Carolina at Chapel Hill or Duke University — or a combination of both. Each year, approximately 30 outstanding high school seniors and college transfer students are selected from a highly competitive applicant pool. Beyond financial support, the Robertson Programme provides transformative leadership development opportunities including summer experiences, mentoring, and a close-knit community of scholars committed to making a difference. Scholars can attend both UNC-Chapel Hill and Duke during their undergraduate years, taking advantage of the combined resources of two world-class universities. Applicants must demonstrate exceptional academic achievement, leadership, creativity, and a commitment to making a positive impact. The application process includes a comprehensive application form, essays, recommendations, and finalist interviews. The programme is open to students of all nationalities, though international scholars may need to demonstrate financial need for additional funding. Robertson Scholars join a community of over 700 current and alumni scholars who are leaders in their fields — from medicine and law to technology, public service, and entrepreneurship."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "Stamps Leadership Scholarships", country: "United States",
    level: "Bachelor's", field: "All Fields",
    deadline: "01 Nov 2026",
    link: "https://www.stampscholars.org/",
    description: "The Stamps Leadership Scholarships, offered through the Stamps Family Charitable Foundation, are among the most generous undergraduate merit scholarships in the United States. The programme partners with over 40 leading universities to provide full-ride scholarships — covering tuition, room, board, and fees — plus enrichment funds for study abroad, research, and other educational experiences. Each partner university selects its own Stamps Scholars through its regular admissions process. The scholarship also includes a significant enrichment fund (typically USD 5,000–10,000 per year) that scholars can use for study abroad, undergraduate research, conference travel, and other academic opportunities. Applicants must apply for admission to a participating university by the early action or early decision deadline. Selection is based on exceptional academic achievement, leadership, service, and character. The Stamps programme also provides a national community of scholars, with annual enrichment retreats, mentoring, and networking opportunities. Stamps Scholars have gone on to become Rhodes Scholars, Fulbright recipients, Fulbright scholars, and leaders in every field. The programme's combination of full financial support, enrichment funding, and a powerful national network makes it one of the most comprehensive undergraduate scholarships available."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Qatar Foundation Scholarships for International Students", country: "Qatar",
    level: "Bachelor's", field: "Engineering, Computer Science, Business, Communication",
    deadline: "15 Jan 2027",
    link: "https://www.qf.org.qa/en/education",
    description: "Education City in Qatar, home to branch campuses of leading international universities including Carnegie Mellon University, Georgetown University, Texas A&M University, Virginia Commonwealth University, Cornell University, and Northwestern University, offers scholarship opportunities for outstanding Qatari and international students. The Qatar Foundation provides fully funded scholarships covering full tuition, accommodation, health insurance, and round-trip airfare for students enrolled in partner universities within Education City. The scholarships are available for bachelor's programmes in fields including computer science, business administration, international relations, journalism, engineering, biological sciences, and fine arts. Applicants must demonstrate exceptional academic performance, leadership potential, and a commitment to contributing to Qatar's development and the wider region. The application process varies by university but typically involves submitting the university's standard application along with a scholarship application. Qatar offers a unique educational environment where students receive degrees from top-ranked American universities while studying in a Middle Eastern context. Education City provides world-class facilities, a multicultural student community, and access to Qatar's growing research and innovation ecosystem. Scholars benefit from Qatar's strategic location, strong economy, and the Qatar Foundation's extensive network of partnerships with leading global institutions."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "UAE University Scholarships for International Students", country: "UAE",
    level: "Bachelor's, Master's, PhD", field: "All Fields",
    deadline: "30 Jun 2027",
    link: "https://www.uaeu.ac.ae/en/admissions/scholarships/",
    description: "United Arab Emirates University (UAEU), the oldest and largest national university in the UAE, offers fully funded scholarships to outstanding international students at all levels of study. The scholarships cover full tuition, a monthly stipend, accommodation, health insurance, and annual airfare. UAEU offers programmes across nine colleges including Business and Economics, Engineering, Humanities and Social Sciences, Science, Medicine, Law, Information Technology, Food and Agriculture, and Education. The university is located in Al Ain, the cultural capital of the UAE, and provides a modern campus with state-of-the-art facilities. Scholarship recipients must maintain a minimum GPA of 3.0 to retain their funding. Applicants must demonstrate strong academic performance, English proficiency (TOEFL or IELTS), and meet the specific requirements of their chosen programme. The application is submitted through the UAEU online portal alongside the admission application. The UAE offers a unique study environment combining world-class facilities with a rich cultural heritage and a strategic location at the crossroads of Asia, Africa, and Europe. UAEU graduates benefit from the country's strong economy, growing research investment, and extensive international partnerships."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "Malaysian International Scholarship Programme (MIS)", country: "Malaysia",
    level: "Master's, PhD", field: "All Fields",
    deadline: "30 Sep 2026",
    link: "https://mis.moe.gov.my/",
    description: "The Malaysian International Scholarship (MIS) is an initiative by the Malaysian government to attract the best minds from around the world to pursue postgraduate studies at Malaysian public universities. The scholarship covers a monthly allowance of MYR 3,500, round-trip airfare, health insurance, and a one-time settling-in allowance. The scholarship is tenable for up to two years (Master's) or four years (PhD). Malaysia offers a diverse, multicultural environment with English-taught programmes at internationally recognised universities. Participating institutions include the University of Malaya, Universiti Putra Malaysia, Universiti Kebangsaan Malaysia, Universiti Sains Malaysia, and Universiti Teknologi Malaysia. Eligible fields span all disciplines, with priority given to science and technology, engineering, agriculture, biotechnology, environmental science, Islamic finance, and ICT. Applicants must be nationals of MIS partner countries, hold a relevant degree with a minimum CGPA of 3.0, and be under 45 years of age. The application is submitted through the MIS online portal alongside the university admission application. Malaysia offers an affordable cost of living, a tropical climate, and a strategic location in Southeast Asia. The country's higher education system has risen rapidly in global rankings, with several universities now ranked among the top 200 worldwide."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Irish Government International Scholarships", country: "Ireland",
    level: "Bachelor's, Master's, PhD, Research", field: "All Fields",
    deadline: "31 Mar 2027",
    link: "https://www.gov.ie/en/organisation-information/d3713b-government-of-ireland-international-education-scholarships/",
    description: "The Government of Ireland International Education Scholarship (GOI-IES) programme awards scholarships to outstanding international students who wish to study at Irish higher education institutions. The scholarship provides a stipend of €10,000 for one academic year of study at an eligible Irish university or institute of technology. The programme is open to non-EU/EEA students enrolling in a full-time bachelor's, master's, or research programme at a participating Irish institution. Participating institutions include Trinity College Dublin, University College Dublin, National University of Ireland Galway, University College Cork, Dublin City University, University of Limerick, and the Technological Universities. Applicants must demonstrate academic excellence, strong motivation, and a commitment to building connections between Ireland and their home country. The application requires academic transcripts, a personal statement, reference letters, and evidence of extracurricular activities. Selection is based on academic merit and the quality of the application. Ireland offers a world-class education system, a vibrant cultural environment, and a thriving economy — particularly in technology, pharmaceuticals, and financial services. Irish universities consistently rank among the top 2% globally, and the country's English-speaking environment, friendly culture, and post-study work opportunities make it an increasingly popular destination for international students."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Spanish Government Scholarships for International Students", country: "Spain",
    level: "Master's, PhD", field: "All Fields",
    deadline: "30 Jun 2027",
    link: "https://www.exteriores.gob.es/en/ServiciosConsulares/tramitesConsulares/Scholarships/Paginas/index.aspx",
    description: "The Spanish government, through the Ministry of Universities and the Agencia Española de Cooperación Internacional para el Desarrollo (AECID), offers scholarships to outstanding international students from developing countries to pursue master's and doctoral studies at Spanish universities. The AECID scholarships cover monthly stipends of approximately €800–1,200, tuition fees, health insurance, and travel expenses. The programme is open to nationals of developing countries who wish to study in fields aligned with Spain's development cooperation priorities, including public health, education, environmental sustainability, governance, and cultural heritage. Spain offers a rich academic tradition with over 80 public universities, many of which rank among the top in Europe. Spanish universities are particularly strong in humanities, social sciences, architecture, renewable energy, and biotechnology. Applicants must hold a relevant degree, demonstrate academic excellence, and show a commitment to development in their home country. The application is submitted through the Spanish embassy or consulate in the applicant's home country. Spain offers a vibrant culture, a moderate cost of living, and a strategic location at the crossroads of Europe, Africa, and Latin America. Scholars benefit from Spain's world-class academic environment, its rich cultural heritage, and the opportunity to learn or improve their Spanish — the world's second most spoken native language."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Saudi Arabian Cultural Mission (SACM) Scholarships", country: "Saudi Arabia",
    level: "Bachelor's, Master's, PhD", field: "All Fields",
    deadline: "30 Apr 2027",
    link: "https://www.sacam.org/",
    description: "The Saudi Arabian Cultural Mission (SACM) administers scholarships for Saudi students to study at top universities worldwide, as well as scholarships for international students to study at Saudi universities. For international students, King Saud University, King Abdulaziz University, and King Fahd University of Petroleum and Minerals offer fully funded scholarships covering full tuition, monthly stipends, accommodation, health insurance, and annual airfare. These universities rank among the top in the Middle East and offer programmes in engineering, science, medicine, business, computer science, and Islamic studies. International scholarship applicants must demonstrate strong academic performance, English proficiency, and meet the specific requirements of their chosen programme. Saudi Arabia has invested heavily in higher education, with world-class facilities, competitive research funding, and partnerships with leading global universities. The Kingdom's Vision 2030 initiative is driving significant investment in research and innovation, particularly in renewable energy, technology, and healthcare. Scholars benefit from Saudi Arabia's strategic location, strong economy, and the opportunity to study in a rapidly modernising society."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "Hungarian Stipendium Hungaricum Scholarship", country: "Hungary",
    level: "Bachelor's, Master's, PhD", field: "All Fields",
    deadline: "15 Jan 2027",
    link: "https://stipendiumhungaricum.hu/",
    description: "The Stipendium Hungaricum Scholarship Programme, funded by the Hungarian government, offers fully funded scholarships to outstanding international students from over 80 partner countries to study at Hungarian higher education institutions. The scholarship covers tuition-free education, a monthly stipend of HUF 140,000 (approximately €400) for bachelor's and master's students or HUF 180,000 (approximately €500) for doctoral students, accommodation support of HUF 40,000 per month or free dormitory place, and health insurance. The programme offers over 600 study programmes across 60 Hungarian institutions, including the University of Debrecen, Eötvös Loránd University (ELTE), Budapest University of Technology and Economics, and the University of Szeged. Eligible fields span all disciplines, with particular strengths in engineering, medicine, natural sciences, economics, and the humanities. Applicants must be nationals of a partner country, meet the academic requirements of their chosen programme, and be nominated by the responsible authority in their home country. The application is submitted through the Stipendium Hungaricum online portal. Hungary offers a high-quality education system at an affordable cost of living, a rich cultural heritage, and a central European location with excellent travel connections. Budapest, the capital, is consistently ranked among Europe's most beautiful and liveable cities."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Polish Government Scholarships for International Students", country: "Poland",
    level: "Master's, PhD", field: "All Fields",
    deadline: "31 Mar 2027",
    link: "https://study.gov.pl/",
    description: "The Polish National Agency for Academic Exchange (NAWA) offers scholarships to international students from select countries to pursue master's and doctoral studies at Polish universities. The Łukasiewicz Scholarship and the Polish Government Scholarship programmes cover a monthly stipend of approximately PLN 2,500, tuition waivers, health insurance, and a settling-in allowance. Poland offers a rapidly improving higher education system with over 130 public universities, many of which have risen significantly in global rankings. Polish universities are particularly strong in engineering, computer science, mathematics, physics, and medicine. The country also offers a low cost of living compared to Western Europe, making it an attractive destination for international students. Applicants must be nationals of eligible countries, hold a relevant degree, and demonstrate academic excellence. The application is submitted through the NAWA online portal alongside the university admission application. Poland's membership in the European Union provides scholars with access to the Erasmus+ programme and European research networks. Polish cities like Warsaw, Kraków, and Wrocław offer vibrant cultural scenes, rich history, and growing international communities."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Czech Government Scholarships for Developing Countries", country: "Czech Republic",
    level: "Master's, PhD", field: "All Fields",
    deadline: "31 Aug 2026",
    link: "https://www.msmt.cz/",
    description: "The Czech Government Scholarships, administered by the Ministry of Education, Youth and Sports, support students from developing countries and priority partner countries to pursue master's and doctoral studies at Czech public universities. The scholarship covers a monthly stipend of approximately CZK 14,000 (around €560), accommodation support, health insurance, and a one-time settling-in allowance. The programme is tenable for the full duration of the study programme at any Czech public university. Czech universities offer programmes in all fields, with particular strengths in engineering, natural sciences, medicine, humanities, and social sciences. Charles University in Prague, the Czech Technical University, and Masaryk University are among the leading institutions. The scholarship is open to nationals of eligible developing countries and countries prioritised by Czech development cooperation. Applicants must hold a relevant degree, demonstrate academic excellence, and submit their application through the Czech embassy in their home country. The Czech Republic offers a high-quality education system at an affordable cost of living, a rich cultural heritage, and a central European location. Prague, the capital, is one of Europe's most beautiful and historically significant cities."
  },
  // ===== BATCH 5: Competitions, Conferences, Youth, Summer Schools (72–100) =====
  {
    type: "Scholarship", funding: "Prize-Based",
    title: "James Dyson Award", country: "Global",
    level: "University Students, Recent Graduates", field: "Engineering, Design",
    deadline: "15 Jul 2026",
    link: "https://www.jamesdysonaward.org/",
    description: "The James Dyson Award is an international engineering and design competition that celebrates, supports, and inspires the next generation of design talent. The award is open to university students and recent graduates in engineering, product design, and industrial design. The winner receives £30,000, and two national winners each receive £10,000. The competition challenges entrants to design something that solves a problem — anything at all. Entries must be functional, original, and manufactured using engineering or design principles. The award is open to students and recent graduates (within four years of graduation) from any country. There is no restriction on the type of product or solution — past winners have designed medical devices, sustainable packaging, assistive technology, and renewable energy solutions. The application requires a description of the design, images or videos, and an explanation of the problem it solves. The competition is judged by a panel of industry experts and Dyson engineers. The James Dyson Foundation, which runs the award, aims to inspire young people to use their skills to make a difference. The award provides not just prize money but also global media exposure, mentorship opportunities, and a platform to develop the winning design into a commercial product."
  },
  {
    type: "Scholarship", funding: "Prize-Based",
    title: "iGEM (International Genetically Engineered Machine) Competition", country: "Global",
    level: "University Students", field: "Synthetic Biology, Biotechnology",
    deadline: "01 Oct 2026",
    link: "https://igem.org/competition",
    description: "iGEM is the world's premier synthetic biology competition, bringing together student teams from universities worldwide to design and build biological systems using standardised biological parts. The competition culminates in the iGEM Grand Jamboree, where teams present their projects to judges and the public. iGEM is open to teams at all levels — undergraduate, graduate, and high school — from any country. Teams receive a standard DNA distribution of biological parts and spend the summer designing and testing their projects in their home laboratories. The competition emphasises not just scientific achievement but also entrepreneurship, public engagement, education, and human practices. Teams must address the ethical, legal, and social implications of their work. The application requires team registration, project documentation, a wiki describing the project, and a presentation at the Grand Jamboree. iGEM has grown from 5 teams in 2004 to over 350 teams from 50+ countries, making it the largest synthetic biology competition in the world. Past iGEM teams have gone on to found biotech companies, publish in top journals, and pursue careers in science and medicine. The competition provides an exceptional training ground for the next generation of synthetic biologists and bioengineers."
  },
  {
    type: "Scholarship", funding: "Prize-Based",
    title: "MIT Solve Global Challenges", country: "Global",
    level: "Open to All", field: "Social Innovation, Technology",
    deadline: "15 Jun 2027",
    link: "https://solve.org/",
    description: "MIT Solve is an initiative of the Massachusetts Institute of Technology that seeks to solve world-changing challenges through social entrepreneurship and innovation. Each year, Solve launches global challenges in areas including economic prosperity, health, learning, and climate innovation. Winners of each challenge receive a USD 10,000 prize, 18 months of accelerator support, mentorship, and access to MIT's innovation ecosystem. Solve is open to innovators from anywhere in the world — individuals, teams, and organisations working on technology-driven solutions to global challenges. There are no formal education or age requirements. The application requires a description of the solution, evidence of impact, and a team profile. Selection is based on the innovation's potential for impact, feasibility, scalability, and the team's capability. MIT Solve connects winners with MIT's vast network of researchers, entrepreneurs, investors, and institutional partners. The initiative has supported over 250 solvers from more than 80 countries, who have collectively raised over USD 100 million in follow-on funding and impacted millions of lives. Solve challenges address issues from access to quality education and healthcare to economic opportunity and climate resilience."
  },
  {
    type: "Scholarship", funding: "Prize-Based",
    title: "One Young World Summit Scholarships", country: "Global",
    level: "Young Leaders (18–30)", field: "All Fields",
    deadline: "30 Jun 2027",
    link: "https://www.oneyoungworld.com/",
    description: "One Young World is a leading global forum for young leaders aged 18 to 30, bringing together the brightest young minds from over 190 countries to discuss, share ideas, and find solutions to the world's most pressing issues. The One Young World Summit Scholarships enable young leaders who might not otherwise have the resources to attend the annual summit. Scholarship packages include travel, accommodation, and full participation in the summit programme. The summit features sessions with heads of state, Nobel laureates, business leaders, and cultural icons. One Young World Ambassadors include figures such as Nelson Mandela, the Dalai Lama, Sir Bob Geldof, and global leaders from business, politics, and the arts. Applicants must be between 18 and 30, demonstrate leadership in their community, and have a concrete plan for how they will use the One Young World network to create positive change. The application requires a personal statement, evidence of leadership, and a description of the challenges facing the applicant's community. Since its founding in 2009, One Young World has created a community of over 20,000 young leaders from every country in the world, connected through an ongoing programme of summits, workshops, and campaigns."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Oxford University Summer Schools", country: "United Kingdom",
    level: "University Students", field: "All Fields",
    deadline: "15 Feb 2027",
    link: "https://www.ox.ac.uk/students/summer",
    description: "The University of Oxford offers a range of summer school programmes for international university students, providing short-term academic experiences at one of the world's most prestigious universities. Programmes are available across all academic divisions — Humanities, Mathematical and Physical Sciences, Medical Sciences, and Social Sciences — and typically run for two to four weeks during the summer months. Programme costs vary, with some including tuition, accommodation, meals, and cultural activities. Oxford's summer schools cover topics ranging from English literature and medieval history to quantum physics, global health, and international relations. Applicants must be currently enrolled university students with strong academic records. English proficiency is required for all programmes. The application is submitted through the individual programme's online portal. Oxford's summer schools offer a unique opportunity to experience the university's tutorial system, access world-class libraries and laboratories, and explore the historic city of Oxford. Participants receive a certificate of completion and join a global network of Oxford summer school alumni. The programmes are designed to provide academic enrichment, cultural immersion, and a taste of Oxford's unique educational experience."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "Cambridge Summer Schools", country: "United Kingdom",
    level: "University Students, High School Students", field: "All Fields",
    deadline: "28 Feb 2027",
    link: "https://www.ice.cam.ac.uk/international-summer-schools",
    description: "The University of Cambridge Institute of Continuing Education (ICE) offers a range of international summer schools for university students and pre-university students. Programmes cover subjects including international relations, creative writing, business, engineering, medicine, law, and the arts. Summer schools typically run for two to three weeks and include academic lectures, seminars, tutorials, and cultural activities. Programme fees cover tuition, accommodation in Cambridge colleges, meals, and excursions. Cambridge summer schools are taught by experienced Cambridge academics and provide an authentic taste of the university's world-class education. Applicants must meet the specific academic requirements of their chosen programme and demonstrate English proficiency. The University of Cambridge, with its 800-year history and 31 colleges, offers a unique educational environment. Summer school participants stay in historic college accommodation, dine in ancient halls, and study in world-renowned libraries. The programmes also include social activities, punting on the River Cam, and visits to historic sites. Cambridge's summer schools attract students from over 80 countries, creating a truly international learning community."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "YSEALI Academic Fellows Program", country: "United States",
    level: "Young Leaders (18–25)", field: "Civic Engagement, Entrepreneurship, Social Innovation",
    deadline: "15 Oct 2026",
    link: "https://yseali.state.gov/",
    description: "The Young Southeast Asian Leaders Initiative (YSEALI) Academic Fellows Program is a fully funded leadership development programme for young leaders from Southeast Asian countries aged 18 to 25. The programme brings approximately 400 young leaders to the United States each year for a four-to-six-week academic residency at US universities. Fellows participate in coursework, community service, leadership training, and cultural activities. The programme covers all costs including international travel, accommodation, meals, a stipend, and health insurance. YSEALI Academic Fellows are selected in thematic tracks including civic engagement, entrepreneurship, social innovation, and public policy. Applicants must be citizens of a Southeast Asian country (Brunei, Cambodia, Indonesia, Laos, Malaysia, Myanmar, Philippines, Singapore, Thailand, Timor-Leste, or Vietnam), be between 18 and 25 years old, and demonstrate leadership in their community. The application is submitted through the US Embassy or through the YSEALI online platform. Selection is based on leadership achievements, commitment to community service, and the potential for positive impact. YSEALI Fellows join a network of over 10,000 young leaders across Southeast Asia, gaining access to ongoing professional development, mentoring, and alumni programming."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Global UGRAD Programme", country: "United States",
    level: "Undergraduate Students", field: "All Fields",
    deadline: "15 Sep 2026",
    link: "https://worldlearning.org/program/global-ugrad/",
    description: "Global UGRAD (Global Undergraduate Exchange Program) is a fully funded semester exchange programme that brings outstanding undergraduate students from around the world to study at US colleges and universities. The programme is funded by the US Department of State and administered by World Learning. Global UGRAD covers all costs including tuition, room and board, a modest stipend, health insurance, round-trip airfare, and a pre-academic orientation in Washington, DC. The semester-long exchange typically takes place in the fall or spring semester. Students take non-degree courses at their host US institution while participating in community service, professional internships, and cultural activities. The programme is open to undergraduate students from eligible countries who are in their second or third year of study, have strong academic records, and demonstrate leadership and community engagement. Applicants must be nominated by their home university and pass a competitive selection process. Global UGRAD has supported over 10,000 students from more than 60 countries since its inception. Alumni have gone on to become leaders in government, business, civil society, and academia. The programme provides a transformative experience that combines academic enrichment, cultural exchange, and leadership development."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "European Solidarity Corps", country: "Global",
    level: "Young People (18–30)", field: "Community Service, Environment, Education, Culture",
    deadline: "Rolling",
    link: "https://europa.eu/youth/solidarity_en",
    description: "The European Solidarity Corps (ESC) is the European Union's flagship volunteering programme, offering young people aged 18 to 30 the opportunity to contribute to community projects across Europe and beyond. The programme funds volunteering placements lasting from two to 12 months in areas including social inclusion, environmental protection, education, culture, health, and digital transformation. ESC placements cover all costs including travel, accommodation, meals, health insurance, and a modest pocket money allowance. The programme is open to young people from EU member states and partner countries. No specific qualifications are required — the programme values motivation, willingness to learn, and a commitment to solidarity. Applications are submitted through the European Youth Portal, where participants can browse available projects and apply directly to host organisations. The ESC has supported over 100,000 young people since its launch in 2018, creating opportunities for personal and professional development through hands-on community service. Volunteers gain intercultural competencies, language skills, and practical experience that enhance their employability. The programme also supports solidarity projects — small-scale initiatives designed and implemented by young people in their own communities."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Peace Corps Volunteer Programme", country: "Global",
    level: "Recent Graduates, Professionals", field: "Education, Health, Community Development, Agriculture",
    deadline: "Rolling",
    link: "https://www.peacecorps.gov/",
    description: "The Peace Corps is the United States government's international volunteer programme, sending American citizens to serve in communities around the world for 27 months. Volunteers work in areas including education, health, community economic development, agriculture, environment, and youth development. The programme covers all costs including travel to and from the host country, housing, a settling-in allowance, a readjustment allowance of approximately USD 10,000 upon completion, and comprehensive medical coverage. Peace Corps Volunteers serve in over 60 countries across Africa, Asia, Latin America, the Caribbean, Europe, and the Pacific. No specific degree is required — the programme values commitment, adaptability, and a willingness to immerse oneself in a new culture. Applicants must be US citizens at least 18 years old. The application process includes an interview, medical clearance, and legal clearance. Peace Corps service provides unique professional development, language skills, and a deep understanding of other cultures. Returned Peace Corps Volunteers are eligible for non-competitive federal employment, graduate school scholarships, and student loan forgiveness programmes. Since its founding in 1961 by President John F. Kennedy, over 240,000 Americans have served as Peace Corps Volunteers in 142 countries."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "AIESEC Global Volunteer", country: "Global",
    level: "Young People (18–30)", field: "Social Impact, Education, Environment",
    deadline: "Rolling",
    link: "https://aiesec.org/global-volunteer",
    description: "AIESEC Global Volunteer is a short-term international volunteering programme that connects young people with social impact opportunities in organisations around the world. The programme offers volunteering experiences lasting six to eight weeks in areas including education, environmental sustainability, social entrepreneurship, and community development. Global Volunteer placements are available in over 100 countries and territories. Participants pay a programme fee that covers accommodation, local support, and administrative costs, while the host organisation provides meals and a structured volunteer experience. The programme is open to young people aged 18 to 30 who are passionate about social impact and cross-cultural exchange. No specific qualifications are required — the programme values motivation, adaptability, and a commitment to making a difference. Applications are submitted through the AIESEC online platform, where participants can browse opportunities and apply directly. AIESEC, the world's largest youth-run organisation, provides a supportive framework for the volunteer experience, including pre-departure preparation, on-site support, and a global alumni network. Global Volunteer participants gain intercultural competencies, leadership skills, and practical experience in social impact work."
  },
  {
    type: "Scholarship", funding: "Prize-Based",
    title: "St. Gallen Symposium Leaders of Tomorrow", country: "Switzerland",
    level: "University Students (18–28)", field: "All Fields",
    deadline: "31 Jan 2027",
    link: "https://www.symposium.org/leaders-of-tomorrow",
    description: "The St. Gallen Symposium is one of the world's leading student-initiated initiatives for young leaders, bringing together 600 participants from over 80 countries each year to discuss the most pressing economic, political, and social issues facing the world. The Leaders of Tomorrow Essay Competition selects approximately 100 outstanding students aged 18 to 28 to attend the symposium in St. Gallen, Switzerland. Selected essayists receive travel and accommodation coverage. The essay competition addresses a different theme each year, challenging participants to propose innovative solutions to global challenges. Essays are evaluated by a jury of academics, business leaders, and policymakers. The competition is open to students from any field and any country. The St. Gallen Symposium has been held annually since 1969 and has hosted heads of state, Nobel laureates, and leaders from business, science, and civil society. The symposium's unique format brings together three generations — students, senior leaders, and pioneers — for genuine dialogue and debate. Past participants have gone on to become leaders in every sector, from politics and business to academia and social entrepreneurship."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "World Economic Forum Global Shapers Community", country: "Global",
    level: "Young Leaders (20–30)", field: "All Fields",
    deadline: "Rolling",
    link: "https://www.weforum.org/communities/global-shapers-community/",
    description: "The Global Shapers Community, an initiative of the World Economic Forum, is a network of outstanding young people under 30 who are committed to driving positive change in their local communities and globally. The community has over 300 hubs in more than 130 cities, each led by local Shapers who design and implement community projects addressing issues from education inequality to climate action. Membership is by nomination and selection — there is no open application. Potential Shapers are identified through their existing impact, leadership potential, and commitment to their community. The Global Shapers Community provides access to the World Economic Forum's global network, mentorship from Forum leaders, and opportunities to participate in Forum events. Shapers also benefit from peer learning, collaborative projects, and a platform to amplify their impact. The community has launched over 500 community projects that have impacted millions of people worldwide. Global Shapers represent diverse backgrounds — from social entrepreneurs and scientists to artists and policymakers. The community's strength lies in its diversity and its members' shared commitment to using their talents to address the world's most pressing challenges."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "DAAD Helmut-Schmidt-Programme Master's Scholarships", country: "Germany",
    level: "Master's", field: "Public Policy, Governance, International Relations",
    deadline: "31 Jul 2026",
    link: "https://www.daad.de/en/study-and-research-in-germany/scholarships/daad-scholarships-in-germany/",
    description: "The DAAD Helmut-Schmidt-Programme provides fully funded master's scholarships for outstanding graduates from developing countries who wish to study public policy and good governance at participating German universities. Named after the former German Chancellor, the programme aims to qualify future leaders in politics, law, and the public and nonprofit sectors. The scholarship covers a monthly stipend of €934, health insurance, travel allowance, and study allowance. Participating universities include the Hertie School in Berlin, the Willy Brandt School of Public Policy in Erfurt, the University of Duisburg-Essen, the University of Kassel, the University of Potsdam, and Zeppelin University. Programmes are taught in English and cover public policy, governance, development studies, and European governance. Applicants must hold a relevant bachelor's degree, have at least one year of professional experience, and be from an eligible developing country. Selection is based on academic merit, professional experience, and the relevance of the chosen programme to the applicant's career goals. The programme has supported over 1,000 scholars since 2003."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "University of Geneva Excellence Fellowships", country: "Switzerland",
    level: "Master's", field: "All Fields",
    deadline: "15 Apr 2027",
    link: "https://www.unige.ch/education/bourses/",
    description: "The University of Geneva Excellence Fellowships support outstanding international students enrolling in a Master's programme at the University of Geneva. The fellowship provides a grant of CHF 15,000–20,000 per year for the duration of the programme, recognising academic excellence and potential. The University of Geneva, one of Switzerland's leading research universities, offers Master's programmes across all faculties including Science, Medicine, Law, Economics, Humanities, and Psychology and Educational Sciences. The university is particularly renowned for its programmes in international relations, environmental science, and biomedical research. Applicants must be non-Swiss nationals who have been admitted to a Master's programme at the University of Geneva and demonstrate exceptional academic performance (typically ranking in the top 10% of their previous cohort). The application requires academic transcripts, a motivation letter, reference letters, and evidence of extracurricular activities. Geneva, home to the United Nations, the World Health Organization, CERN, and hundreds of international organisations, offers a unique environment for students interested in global affairs, science, and diplomacy."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "L'Oréal-UNESCO For Women in Science Fellowships", country: "Global",
    level: "PhD, Postdoctoral", field: "Life Sciences, Materials Science, Mathematics, Computer Science",
    deadline: "30 Sep 2026",
    link: "https://www.forscience.org/",
    description: "The L'Oréal-UNESCO For Women in Science International Fellowships recognise and support outstanding women researchers at two career stages: postdoctoral fellows and PhD candidates. The programme awards 15 International Fellowships of €15,000 for postdoctoral researchers and 15 Rising Fellowships of €5,000 for PhD candidates in the life sciences, materials sciences, mathematics, and computer science. The fellowships are open to women researchers of any nationality who are conducting research in these fields. The programme aims to address the underrepresentation of women in science by recognising excellence, providing visibility, and supporting career development. Applicants must be nominated by their institution and demonstrate outstanding research potential. The selection process involves peer review by an international scientific jury. The L'Oréal-UNESCO For Women in Science programme has supported over 3,000 women scientists since its inception in 1998, including 115 International Fellows and numerous national award winners. The programme operates in over 50 countries and has created a powerful network of women scientists who serve as role models and mentors for the next generation."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "University of Helsinki Scholarships", country: "Finland",
    level: "Bachelor's, Master's", field: "All Fields",
    deadline: "15 Jan 2027",
    link: "https://www.helsinki.fi/en/admissions-and-applications/scholarships",
    description: "The University of Helsinki offers a range of scholarships to outstanding international students enrolling in English-taught bachelor's and master's degree programmes. The main scholarship, the University of Helsinki Scholarship, covers 50% or 100% of tuition fees for the duration of the programme. Additional scholarships are available through the Finnish government (EDUFI Fellowships) and specific departmental funds. The University of Helsinki, founded in 1640, is Finland's oldest and largest university, consistently ranked among the top 150 globally. The university offers over 30 English-taught master's programmes across 11 faculties, with particular strengths in environmental science, computer science, behavioural sciences, and humanities. Applicants must be non-EU/EEA nationals who have been admitted to a fee-charging programme. Scholarship selection is based on academic merit, with top-ranked applicants automatically considered. Finland offers a world-class education system, a safe and egalitarian society, and a thriving tech ecosystem. Helsinki, the capital, is a hub for innovation, design, and sustainability. The University of Helsinki's commitment to interdisciplinary research and teaching excellence makes it an ideal destination for ambitious international students."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Swedish Institute Study Scholarships", country: "Sweden",
    level: "Master's", field: "All Fields",
    deadline: "10 Feb 2027",
    link: "https://si.se/en/apply/scholarships/swedish-institute-study-scholarships/",
    description: "The Swedish Institute Study Scholarships (SISS) are offered by the Swedish Institute to outstanding non-EU/EEA master's students from eligible countries. The scholarship covers full tuition fees, a monthly living allowance of SEK 12,000, a travel grant of SEK 15,000, and insurance coverage. The scholarship is tenable for the full duration of a one- or two-year master's programme at any Swedish university. Sweden's higher education system is consistently ranked among the best in the world, with a strong emphasis on innovation, sustainability, and equality. Swedish universities offer over 900 English-taught master's programmes across all disciplines. Applicants must be citizens of an eligible country, hold a relevant bachelor's degree, and demonstrate leadership experience. The application is submitted through the national university admissions portal, universityadmissions.se. Selection is based on academic merit, leadership potential, and the relevance of the chosen programme to the applicant's career goals. Sweden offers a high standard of living, a progressive society, and a strategic location in Northern Europe. Stockholm, the capital, is one of Europe's most innovative and sustainable cities."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "Austrian Government OeAD Scholarships", country: "Austria",
    level: "Bachelor's, Master's, PhD", field: "All Fields",
    deadline: "01 Sep 2026",
    link: "https://www.oead.at/en/to-austria/scholarships-and-grants/",
    description: "The OeAD (Austrian Agency for Education and Internationalisation) administers a range of scholarship programmes for international students wishing to study at Austrian universities. The main programmes include the Austrian Government Scholarships for developing countries, the OeAD Scholarship for short-term study visits, and bilateral exchange scholarships. Scholarships typically cover a monthly allowance of €700–1,175, health insurance, and travel support. Austria offers a high-quality education system with 22 public universities, including the University of Vienna, TU Wien, and the University of Innsbruck. Austrian universities are particularly strong in music, arts, engineering, natural sciences, and social sciences. The country's central European location, rich cultural heritage, and high standard of living make it an attractive study destination. Applicants must be nationals of eligible countries and demonstrate academic excellence. Applications are submitted through the OeAD online portal or through the Austrian embassy in the applicant's home country. Austria offers a unique combination of academic rigour, cultural richness, and a high quality of life in one of Europe's most beautiful countries."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Belgium Wallonia-Brussels International Scholarships", country: "Belgium",
    level: "Bachelor's, Master's, PhD", field: "All Fields",
    deadline: "01 Mar 2027",
    link: "https://wbi.be/en/teaching/scholarships",
    description: "Wallonia-Brussels International (WBI) offers excellence scholarships to outstanding international students wishing to study in the French-speaking community of Belgium (Wallonia and Brussels). The scholarships cover a monthly allowance of €1,000, tuition fees, health insurance, and travel support. The programme is open to students from eligible countries enrolling in bachelor's, master's, or doctoral programmes at universities in the French-speaking community of Belgium, including the Université catholique de Louvain (UCLouvain), Université libre de Bruxelles (ULB), University of Liège, and University of Namur. Belgian universities offer programmes in all fields, with particular strengths in law, philosophy, medicine, engineering, and social sciences. Applicants must demonstrate academic excellence and be enrolled in a programme at a participating institution. The application is submitted through the WBI online portal. Belgium's position at the heart of Europe, its multilingual environment, and its role as the de facto capital of the European Union make it an ideal destination for students interested in European affairs, international law, and global governance."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Irish Research Council Government of Ireland Postgraduate Scholarship", country: "Ireland",
    level: "Master's, PhD", field: "All Fields",
    deadline: "27 Oct 2026",
    link: "https://research.ie/funding/goipg/",
    description: "The Government of Ireland Postgraduate Scholarship Programme, funded by the Irish Research Council, supports outstanding students pursuing master's or doctoral research at Irish higher education institutions. The scholarship provides a stipend of €22,000 per year (Master's) or €25,000 per year (PhD), plus fees of up to €5,750 per year, for a duration of one to four years. The programme is open to students of all nationalities who propose to conduct research at an eligible Irish institution. The Irish Research Council funds research across all disciplines — from the humanities and social sciences to science, engineering, and medicine. Applicants must hold a relevant degree, have a research proposal endorsed by a supervisor at an Irish institution, and demonstrate research excellence. The application requires a detailed research proposal, CV, academic transcripts, reference letters, and an impact statement. Ireland offers a vibrant research ecosystem, a thriving tech and pharmaceutical industry, and a welcoming international community. Irish universities are known for their research quality, collaborative culture, and strong industry links."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "New Zealand ASEAN Scholars Award", country: "New Zealand",
    level: "Master's", field: "All Fields",
    deadline: "01 Mar 2027",
    link: "https://www.mfat.govt.nz/en/aid-and-development/scholarships/",
    description: "The New Zealand ASEAN Scholars Award supports outstanding students from ASEAN member countries to pursue master's study at New Zealand tertiary institutions. The scholarship covers full tuition, a living stipend of NZD 25,000 per year, establishment costs of NZD 3,000, medical and travel insurance, and a research and book allowance. The programme is tenable for up to 24 months. New Zealand offers a world-class education system with a strong emphasis on research quality and student experience. Participating institutions include the University of Auckland, Victoria University of Wellington, University of Otago, Massey University, and others. Eligible fields include agriculture, environmental science, renewable energy, disaster management, public policy, and development studies. Applicants must be citizens of an ASEAN member country, hold a relevant bachelor's degree, and demonstrate a commitment to the development of their home country. The application is submitted through the New Zealand High Commission or Embassy in the applicant's country. New Zealand offers a safe, multicultural environment with stunning natural beauty and a strong commitment to sustainability."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Japan-World Bank Scholarship Program", country: "Japan",
    level: "Master's", field: "Economics, Finance, Development, Public Policy",
    deadline: "15 Mar 2027",
    link: "https://www.worldbank.org/en/about/partners/japan-world-bank-scholarship-program",
    description: "The Japan-World Bank Joint Graduate Scholarship Programme provides fully funded scholarships to professionals from developing countries to pursue a master's degree in development-related fields at participating universities in Japan and other countries. The scholarship covers full tuition, a monthly living stipend, round-trip airfare, health insurance, and a travel allowance. The programme is designed for mid-career professionals who are committed to returning to their home countries to contribute to development after completing their studies. Participating universities include the University of Tokyo, Hitotsubashi University, Kobe University, and international institutions. Eligible fields include economics, public policy, infrastructure development, health, education, agriculture, and environmental management. Applicants must be nationals of a World Bank borrowing member country, have at least three years of professional development experience, and be under 45 years of age. The application requires a detailed study plan, employer endorsement, academic transcripts, and reference letters. Selection is based on academic merit, professional experience, and the potential development impact."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Aga Khan Foundation International Scholarship Programme", country: "Global",
    level: "Master's, PhD", field: "All Fields",
    deadline: "31 Mar 2027",
    link: "https://www.akdn.org/our-agencies/aga-khan-foundation/international-scholarship-programme",
    description: "The Aga Khan Foundation International Scholarship Programme provides scholarships to outstanding students from select developing countries to pursue postgraduate studies at universities worldwide. The scholarship is offered as a 50% grant and 50% loan, with the loan component to be repaid after graduation. The programme covers tuition fees, living expenses, travel, and health insurance. The Aga Khan Foundation prioritises students who demonstrate genuine financial need and a commitment to returning to their home countries to contribute to development. Eligible fields include all disciplines, with priority given to areas relevant to the Foundation's development focus, including health, education, rural development, architecture, and engineering. Applicants must be nationals of eligible developing countries, hold a relevant degree, and demonstrate both academic excellence and financial need. The application requires academic transcripts, a personal statement, reference letters, and evidence of financial need. The Aga Khan Foundation has supported over 4,000 scholars since the programme's inception, building a global network of professionals committed to improving quality of life in developing countries."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Mastercard Foundation Scholars Program", country: "Global",
    level: "Bachelor's, Master's", field: "All Fields",
    deadline: "15 Dec 2026",
    link: "https://mastercardfdn.org/scholars/",
    description: "The Mastercard Foundation Scholars Program is one of the largest scholarship programmes in the world, enabling young people from sub-Saharan Africa to access quality secondary and higher education. The programme partners with over 50 universities and educational institutions across Africa, North America, and Europe to provide comprehensive scholarships covering full tuition, accommodation, books, health insurance, travel, and a living stipend. The programme also includes leadership development, mentoring, career guidance, and transition-to-work support. Mastercard Foundation Scholars are selected not only for their academic excellence but also for their commitment to giving back to their communities. The programme prioritises students who have experienced disadvantage — including those from rural areas, young women, refugees, and young people with disabilities. Applicants must be from sub-Saharan Africa, demonstrate academic potential, and show financial need. The application is submitted through one of the Foundation's partner institutions. Since its launch in 2012, the Mastercard Foundation Scholars Program has supported over 25,000 young people, creating a powerful network of African leaders committed to transforming their continent."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "Romanian Government Scholarships for Non-EU Citizens", country: "Romania",
    level: "Bachelor's, Master's, PhD", field: "All Fields (except Medicine)",
    deadline: "15 Mar 2027",
    link: "https://www.studyinromania.gov.ro/",
    description: "The Romanian Government offers scholarships to non-EU citizens wishing to study at Romanian public universities. The scholarships cover tuition fees, a monthly stipend (approximately RON 800 for bachelor's, RON 900 for master's, RON 1,100 for PhD), accommodation in student dormitories, and health insurance. The programme is open to students from non-EU countries who wish to study in Romanian, English, or French at Romanian public universities. Romania offers over 100 English-taught programmes across fields including engineering, computer science, economics, humanities, and natural sciences. Romanian universities, including the University of Bucharest, Babeș-Bolyai University, and Politehnica University of Bucharest, provide quality education at a low cost of living. Applicants must demonstrate academic excellence and be admitted to a Romanian public university. The application is submitted through the Ministry of Foreign Affairs online portal. Romania offers a vibrant cultural environment, a strategic location at the crossroads of Central and Southeastern Europe, and EU membership that provides scholars with access to European academic networks."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Chinese Government Scholarship (CSC) for International Students", country: "China",
    level: "Bachelor's, Master's, PhD", field: "All Fields",
    deadline: "30 Apr 2027",
    link: "https://www.campuschina.org/",
    description: "The Chinese Government Scholarship (CSC), administered by the China Scholarship Council, is one of the largest government scholarship programmes in the world, supporting over 60,000 international students annually. The scholarship covers full tuition, free university accommodation, a monthly living stipend (CNY 2,500–3,500 depending on degree level), and comprehensive medical insurance. The programme is open to students at all levels — bachelor's, master's, and doctoral — from any country. China offers over 2,800 programmes taught in English at more than 280 universities, with particular strengths in engineering, technology, medicine, business, and Chinese language and culture. There are several application tracks: the Chinese University Programme, the Chinese Embassy Programme, and the Silk Road Programme. Applicants must meet the academic requirements of their chosen programme and demonstrate good health. The application is submitted through the CSC online portal or through the Chinese embassy in the applicant's home country. China's rapid economic growth, massive investment in research and development, and rich cultural heritage make it an increasingly attractive destination for international students."
  },
  // ===== BATCH 6: Additional opportunities (99–120) =====
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Brunei Darussalam Government Scholarship", country: "Brunei",
    level: "Bachelor's, Master's, PhD", field: "All Fields",
    deadline: "28 Feb 2027",
    link: "https://www.moe.gov.bn/SitePages/Brunei%20Darussalam%20Government%20Scholarship.aspx",
    description: "The Brunei Darussalam Government Scholarship (BDGS) provides fully funded scholarships to outstanding international students to pursue undergraduate, master's, or doctoral studies at universities in Brunei Darussalam and selected countries. The scholarship covers full tuition, a monthly stipend, accommodation, health insurance, and round-trip airfare. The programme is open to nationals of ASEAN countries and other selected countries. Brunei offers a unique study environment with a strong emphasis on Islamic values, Malay culture, and academic excellence. The country's universities, including Universiti Brunei Darussalam (UBD), provide quality education in a peaceful and prosperous setting. Applicants must demonstrate academic excellence and good character. The application is submitted through the Brunei Ministry of Education."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Hungary Stipendium Hungaricum Doctoral Fellowships", country: "Hungary",
    level: "PhD", field: "All Fields",
    deadline: "15 Jan 2027",
    link: "https://stipendiumhungaricum.hu/doctoral",
    description: "The Stipendium Hungaricum Doctoral Fellowships provide fully funded support for outstanding international doctoral students at Hungarian universities. The fellowship covers a monthly stipend of HUF 180,000 (approximately €500), accommodation contribution, health insurance, and a travel allowance. The fellowship is tenable for up to four years of doctoral study at any Hungarian university offering doctoral programmes. Hungary offers over 200 doctoral programmes across all disciplines, with particular strengths in mathematics, physics, chemistry, computer science, and engineering. Hungarian universities have a strong tradition of academic excellence, with 14 Nobel laureates among their alumni. Applicants must be nationals of a partner country, hold a relevant master's degree, and have a research proposal endorsed by a Hungarian doctoral school. The application is submitted through the Stipendium Hungaricum online portal."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "Italian Government Scholarships for Foreign Students (MAECI)", country: "Italy",
    level: "Bachelor's, Master's, PhD", field: "All Fields",
    deadline: "30 Jun 2027",
    link: "https://www.esteri.it/maeci/en/studying-in-italy/scholarships/",
    description: "The Italian Ministry of Foreign Affairs and International Cooperation (MAECI) offers scholarships to foreign citizens and Italian citizens living abroad (IRE) to study at Italian institutions. The scholarships cover tuition fees, health insurance, and a monthly stipend of approximately €900. The programme is open to students at all levels — bachelor's, master's, doctoral, and artistic/music education — at Italian public universities, AFAM institutions, and research centres. Italy offers a rich academic tradition with over 90 public universities, many with centuries of history. Italian institutions excel in architecture, design, arts, humanities, engineering, and food science. Applicants must be nationals of eligible countries, meet the academic requirements of their chosen programme, and demonstrate Italian language proficiency (or English for English-taught programmes). The application is submitted through the MAECI online portal."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "University of Cape Town International Doctoral Scholarships", country: "South Africa",
    level: "PhD", field: "All Fields",
    deadline: "30 Sep 2026",
    link: "https://www.uct.ac.za/research/postgraduate-funding",
    description: "The University of Cape Town (UCT), Africa's top-ranked university, offers international doctoral scholarships to outstanding researchers from outside South Africa. The scholarship covers full tuition, a living stipend, research costs, and medical aid. UCT offers doctoral programmes across all faculties including Commerce, Engineering and the Built Environment, Health Sciences, Humanities, Law, and Science. The university is particularly renowned for its research in African studies, marine biology, public health, and climate science. Applicants must hold a relevant master's degree with distinction, have a research proposal endorsed by a UCT supervisor, and demonstrate research excellence. The application is submitted through the UCT postgraduate funding portal. South Africa offers a unique research environment combining world-class facilities with the opportunity to address challenges and opportunities specific to the African continent."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "African Leadership Centre Fellowships", country: "Global",
    level: "Master's, PhD", field: "Peace, Security, International Development",
    deadline: "15 Mar 2027",
    link: "https://africanleadershipcentre.org/",
    description: "The African Leadership Centre (ALC) offers fellowships for outstanding African scholars and practitioners to pursue master's and doctoral research on peace, security, and development in Africa. The ALC is a partnership between King's College London, the University of Johannesburg, and the African Union. Fellowships cover tuition, a living stipend, research support, and travel. The programme is designed to build the next generation of African thought leaders who will shape policy and practice on the continent. Applicants must be African nationals with a strong academic record and a commitment to research that addresses African challenges. The ALC provides a unique platform for rigorous academic research combined with direct engagement with African policymakers and practitioners."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Roland Berger Foundation Scholarships", country: "Germany",
    level: "Bachelor's, Master's", field: "All Fields",
    deadline: "Rolling",
    link: "https://www.rolandberger-stiftung.de/en/",
    description: "The Roland Berger Foundation supports talented students from disadvantaged backgrounds who are studying at German universities. The scholarship provides financial support of up to €850 per month, mentoring from senior business leaders, and access to a network of professionals. The programme is open to students of all nationalities studying at a German university, regardless of their field of study. Selection is based on academic excellence, social commitment, and personal circumstances — the foundation specifically seeks students who have overcome significant challenges. The Roland Berger Foundation has supported over 500 students since its founding, with a focus on diversity, inclusion, and social mobility."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Heinrich Böll Foundation Scholarships", country: "Germany",
    level: "Bachelor's, Master's, PhD", field: "All Fields",
    deadline: "01 Oct 2026",
    link: "https://www.boell.de/en/scholarships",
    description: "The Heinrich Böll Foundation, affiliated with the German Green Party, offers scholarships to outstanding students at German universities who demonstrate academic excellence, social engagement, and alignment with the foundation's values of ecology, democracy, solidarity, and nonviolence. The scholarship provides a monthly stipend of €861 (Bachelor's/Master's) or €1,200 (PhD), plus health insurance and a book allowance. The programme is open to students of all nationalities. Applicants must demonstrate not only academic merit but also active engagement in civil society — through volunteer work, political engagement, or advocacy. The Heinrich Böll Foundation has supported over 1,000 students from more than 100 countries."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Konrad Adenauer Stiftung Scholarships", country: "Germany",
    level: "Master's, PhD", field: "All Fields",
    deadline: "15 Oct 2026",
    link: "https://www.kas.de/en/web/scholarships",
    description: "The Konrad Adenauer Stiftung (KAS), one of Germany's largest political foundations, offers scholarships to outstanding graduate students and doctoral candidates who share the foundation's commitment to Christian democratic values, democracy, and the rule of law. The scholarship provides a monthly stipend of €861 (Master's) or €1,200 (PhD), plus health insurance and research allowances. The programme is open to German and international students. KAS supports approximately 1,000 scholars at any given time, making it one of the largest scholarship providers in Germany. Applicants must demonstrate academic excellence, social engagement, and alignment with the foundation's values."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Ernst Ludwig Ehrlich Studienwerk Scholarships", country: "Germany",
    level: "Bachelor's, Master's, PhD", field: "All Fields",
    deadline: "01 Nov 2026",
    link: "https://www.eles.de/en/",
    description: "The Ernst Ludwig Ehrlich Studienwerk (ELES) supports outstanding Jewish and non-Jewish students at German universities who demonstrate academic excellence and social commitment. The scholarship provides a monthly stipend of €861 (Bachelor's/Master's) or €1,200 (PhD), plus book allowances and conference support. The programme is open to students of all nationalities. ELES has supported over 800 students since its founding in 2007, with a focus on diversity, academic excellence, and civic engagement."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "DAAD Study Scholarships for Graduates of All Disciplines", country: "Germany",
    level: "Master's", field: "All Fields",
    deadline: "30 Nov 2026",
    link: "https://www.daad.de/en/study-and-research-in-germany/scholarships/daad-scholarships-in-germany/",
    description: "The DAAD Study Scholarships support graduates of all disciplines who wish to pursue a postgraduate degree at a German university. The scholarship provides a monthly payment of €934, health insurance, travel allowance, and a study allowance. The programme is open to graduates from all countries who wish to study a full postgraduate course leading to a degree at a German university. Applicants must hold a first university degree completed no more than six years before the application deadline. The DAAD has supported over 150,000 international students since its founding in 1925, making it the world's largest funding organisation for international academic exchange."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "University of Edinburgh Global Scholarships", country: "United Kingdom",
    level: "Bachelor's", field: "All Fields",
    deadline: "15 Jan 2027",
    link: "https://www.ed.ac.uk/student-funding/scholarships",
    description: "The University of Edinburgh offers a range of scholarships to outstanding international undergraduate students. The Edinburgh Global Scholarships cover full tuition fees for the duration of the programme, recognising students who would not otherwise be able to afford to study at Edinburgh. The university, founded in 1582, is one of the oldest and most prestigious in the English-speaking world, consistently ranked among the top 30 globally. Edinburgh offers over 400 undergraduate programmes across all disciplines. Applicants must be international students who have received an offer of admission and demonstrate exceptional academic merit and financial need. The University of Edinburgh's beautiful campus in Scotland's historic capital city provides a unique academic and cultural experience."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "University of Melbourne International Undergraduate Scholarships", country: "Australia",
    level: "Bachelor's", field: "All Fields",
    deadline: "30 Nov 2026",
    link: "https://study.unimelb.edu.au/find/scholarships/international-undergraduate",
    description: "The University of Melbourne International Undergraduate Scholarships recognise academic excellence and provide financial support to outstanding international students commencing an undergraduate degree. The scholarship covers a partial tuition fee remission of up to AUD 28,000 per year and is tenable for the full duration of the programme. The University of Melbourne, Australia's top-ranked university, offers a broad range of undergraduate programmes through the innovative Melbourne Model, which allows students to specialise after completing a broad undergraduate foundation. Applicants must be international students who have received an offer for an undergraduate programme and demonstrate exceptional academic results. Selection is based on the applicant's academic achievement in their final years of secondary education."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "University of British Columbia International Leader of Tomorrow Scholarships", country: "Canada",
    level: "Bachelor's", field: "All Fields",
    deadline: "15 Dec 2026",
    link: "https://you.ubc.ca/financial-planning/scholarships-awards/",
    description: "The University of British Columbia (UBC) International Leader of Tomorrow Scholarships are merit-based awards for outstanding international students who demonstrate exceptional academic achievement, leadership, and financial need. The scholarship covers full tuition, living expenses, and all costs associated with studying at UBC for the duration of the undergraduate programme. UBC, consistently ranked among the top 40 universities globally, offers a world-class education in a stunning West Coast setting. The Karen McKellin International Leader of Tomorrow Award and the Donald A. Wehrung International Student Award together support students who would not otherwise be able to afford to study at UBC. Applicants must be international students requiring financial assistance who demonstrate outstanding academic achievement, creative or artistic abilities, and leadership in school and community activities."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "ETH Zurich Excellence Masters Scholarships", country: "Switzerland",
    level: "Master's", field: "Engineering, Science, Mathematics",
    deadline: "15 Dec 2026",
    link: "https://ethz.ch/en/studies/financing/scholarships/excellence-scholarships.html",
    description: "The ETH Zurich Excellence Masters Scholarships support outstanding students pursuing a Master's degree at ETH Zurich, one of the world's leading technical universities. The scholarship covers full study and living costs, providing a stipend of CHF 12,000 per semester plus a tuition fee waiver. ETH Zurich offers Master's programmes in engineering, natural sciences, mathematics, architecture, and management. Applicants must demonstrate exceptional academic performance, ranking in the top 10% of their bachelor's degree cohort. ETH Zurich, located in Zurich, consistently ranks among the top 10 universities globally for engineering and technology."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "University of Sydney International Scholarships", country: "Australia",
    level: "Bachelor's, Master's", field: "All Fields",
    deadline: "31 Oct 2026",
    link: "https://www.sydney.edu.au/scholarships.html",
    description: "The University of Sydney International Scholarships recognise academic excellence and provide financial support to outstanding international students. The Vice-Chancellor's International Scholarships cover up to AUD 40,000 per year in tuition fee remission. The Sydney Scholars Awards cover tuition fees and living expenses for high-achieving students with financial need. The University of Sydney, founded in 1850, is Australia's first university and one of the world's leading research-intensive institutions. The university offers over 400 fields of study across all disciplines. Applicants must be international students who have received an offer for an undergraduate or postgraduate programme."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "KAIST Graduate Scholarships for International Students", country: "South Korea",
    level: "Master's, PhD", field: "Engineering, Science, Technology",
    deadline: "15 May 2027",
    link: "https://admission.kaist.ac.kr/en/scholarship",
    description: "KAIST offers full scholarships to outstanding international graduate students in science and technology. The scholarship covers full tuition, a monthly stipend of approximately KRW 350,000–900,000, and health insurance. KAIST, South Korea's premier science and technology university, provides world-class research opportunities in computer science, electrical engineering, mechanical engineering, biological sciences, physics, chemistry, and mathematics. All graduate courses are taught in English. Applicants must hold a relevant bachelor's or master's degree and demonstrate strong research potential."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "Singapore Government Scholarships (SGS) for ASEAN Students", country: "Singapore",
    level: "Bachelor's, Master's, PhD", field: "All Fields",
    deadline: "15 Mar 2027",
    link: "https://www.moe.gov.sg/scholarships",
    description: "The Singapore Government Scholarships (SGS) programme supports outstanding ASEAN students to study at Singapore's autonomous universities. The scholarship covers full tuition, a living allowance, accommodation, health insurance, and a settling-in allowance. Singapore's universities — the National University of Singapore (NUS), Nanyang Technological University (NTU), and Singapore Management University (SMU) — are consistently ranked among the top in Asia and the world. Applicants must be nationals of ASEAN countries and demonstrate exceptional academic performance. The application is submitted through the Ministry of Education Singapore."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "University of Tokyo Research Fellowships for International Students", country: "Japan",
    level: "PhD", field: "All Fields",
    deadline: "15 Dec 2026",
    link: "https://www.u-tokyo.ac.jp/en/prospective-students/research-fellowships.html",
    description: "The University of Tokyo offers several fellowship programmes for outstanding international doctoral students, including the UTokyo Fellowship and the Special Research Student programme. Fellowships cover full tuition, a monthly stipend of approximately JPY 200,000, and research expenses. The University of Tokyo, Japan's top-ranked university, offers doctoral programmes across all disciplines with world-class research facilities. Applicants must hold a relevant master's degree and demonstrate research excellence. The application is submitted through the relevant graduate school at the university."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "NUS Graduate Research Scholarship", country: "Singapore",
    level: "PhD", field: "All Fields",
    deadline: "15 Jan 2027",
    link: "https://www.nus.edu.sg/registrar/docs/info/scholarships/graduate-research-scholarship.pdf",
    description: "The National University of Singapore (NUS) Graduate Research Scholarship provides full funding for outstanding international students pursuing a PhD at NUS. The scholarship covers full tuition, a monthly stipend of SGD 3,500 (increasing to SGD 4,000 after passing the qualifying examination), and a conference travel grant. NUS, consistently ranked among the top 20 universities globally, offers doctoral programmes across all disciplines. Singapore's position as Asia's leading education and research hub provides unparalleled opportunities for interdisciplinary collaboration and industry engagement."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "NTU International Presidential Scholarship", country: "Singapore",
    level: "PhD", field: "All Fields",
    deadline: "30 Nov 2026",
    link: "https://www.ntu.edu.sg/education/graduate-programmes/scholarships",
    description: "Nanyang Technological University (NTU) offers the International Presidential Scholarship to outstanding doctoral candidates from around the world. The scholarship covers full tuition, a monthly stipend of SGD 3,500, and a conference travel grant. NTU, one of Asia's fastest-rising universities, is particularly renowned for its programmes in engineering, materials science, computer science, and sustainability research. The scholarship is tenable for up to four years. Applicants must hold a relevant bachelor's or master's degree with outstanding academic results."
  },
  {
    type: "Scholarship", funding: "Fully Funded",
    title: "University of Auckland International Doctoral Scholarships", country: "New Zealand",
    level: "PhD", field: "All Fields",
    deadline: "15 Sep 2026",
    link: "https://www.auckland.ac.nz/en/study/scholarships-and-awards/scholarship-types/university-of-auckland-doctoral-scholarships.html",
    description: "The University of Auckland International Doctoral Scholarships provide full funding for outstanding international doctoral students. The scholarship covers tuition at the domestic rate, a living stipend of approximately NZD 28,000 per year, health insurance, and a relocation grant. The University of Auckland, New Zealand's top-ranked university, offers doctoral programmes across all faculties. New Zealand offers international PhD students a unique advantage: they pay domestic tuition fees and enjoy the same rights as domestic students, including work rights. Auckland's vibrant multicultural environment and world-class research facilities make it an ideal destination for doctoral study."
  },
  {
    type: "Scholarship", funding: "Partially Funded",
    title: "Leiden University Excellence Scholarships (LExS)", country: "Netherlands",
    level: "Master's", field: "All Fields",
    deadline: "01 Feb 2027",
    link: "https://www.universiteitleiden.nl/en/education/scholarships/find-scholarships/lexs",
    description: "Leiden University Excellence Scholarships (LExS) are awarded to outstanding non-EEA students enrolling in a full-time master's programme at Leiden University. The scholarship offers a tuition fee waiver of €10,000, €15,000, or full tuition depending on the level of academic achievement. Leiden University, the oldest university in the Netherlands (founded in 1575), offers master's programmes across all disciplines with particular strengths in law, humanities, social sciences, and science. Applicants must be non-EEA students with exceptional academic performance (typically the top 10% of their graduating class). Selection is based on academic merit and the strength of the master's programme application."
  }
];

async function seed() {
  // Insert in batches of 20 to avoid URL length limits
  const batchSize = 20;
  let totalInserted = 0;

  for (let i = 0; i < opportunities.length; i += batchSize) {
    const batch = opportunities.slice(i, i + batchSize);
    const response = await fetch(`${SUPABASE_URL}/rest/v1/opportunities?on_conflict=title,country,type`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify(batch)
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`Batch ${Math.floor(i/batchSize) + 1} failed:`, response.status, body);
      continue;
    }

    const data = await response.json();
    totalInserted += data.length;
    console.log(`Batch ${Math.floor(i/batchSize) + 1}: ${data.length} opportunities inserted/updated`);
  }

  console.log(`\nTotal: ${totalInserted} opportunities processed successfully.`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
