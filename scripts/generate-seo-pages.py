#!/usr/bin/env python3
import json
import os
import pathlib
import re
import urllib.request
from datetime import datetime, timezone

SITE_URL = "https://www.opportunitynest.org"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/") + "/rest/v1/opportunities"
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
ROOT = pathlib.Path(__file__).resolve().parent.parent
GENERATED_DIRS = [ROOT / "country", ROOT / "scholarships", ROOT / "internships", ROOT / "fellowships", ROOT / "opportunity"]
OFFICIAL_URL_OVERRIDES = {
    "https://www.unesco.org/en/prizes/esd": "https://www.unesco.org/en/prizes/education-sustainable-development?hub=72522",
    "https://www.salzburgglobal.org/get-involved": "https://www.salzburgglobal.org/fellowship/an-introduction",
    "https://www.kas.de/en/web/begabtenfoerderung-und-kultur/stipendien-und-foerderung": "https://www.kas.de/en/web/begabtenfoerderung-und%20kultur/international-talent-development",
    "https://www.rosalux.de/en/foundation/rosa-luxemburg-stiftung/scholarships": "https://www.rosalux.de/en/foundation/studienwerk/scholarships",
    "https://www.studyinjapan.go.jp/en/smap_stopj-applications_mext.html": "https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/",
    "https://www.universiteitleiden.nl/en/education/scholarships/leiden-university-excellence-scholarships-lexs": "https://www.student.universiteitleiden.nl/en/scholarships/sea/leiden-university-excellence-scholarship-lexs",
    "https://usief.org.in/Fellowships/Fulbright-Nehru-Fellowships-for-Indian-Citizens.aspx": "https://www.usief.org.in/fulbright-fellowships/fellowships-for-indian-citizen/fulbright-nehru-masters-fellowships/",
    "https://ethz.ch/en/studies/master/financials/scholarships/excellence-scholarship.html": "https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html",
    "https://us.fulbrightonline.org/fulbright-us-student-program/fulbright-program-overview/foreign-language-teaching-assistant-flta": "https://exchanges.state.gov/non-us/program/fulbright-foreign-language-teaching-assistant-flta",
    "https://www.urbanstudiesfoundation.org/grants-fellowships/": "https://www.urbanstudiesfoundation.org/funding/international-fellowships/"
}

CATEGORY_TYPES = ["Scholarship", "Internship", "Fellowship", "Competition"]
PAGE_TYPES = {
    "Scholarship": "Scholarships",
    "Internship": "Internships",
    "Fellowship": "Fellowships",
    "Competition": "Competitions"
}
TYPE_COLLECTION_ROUTES = {
    "Scholarship": ("Scholarships", "/scholarships/"),
    "Internship": ("Internships", "/internships/"),
    "Fellowship": ("Fellowships", "/fellowships/"),
    "Competition": ("Competitions", "/competitions.html"),
    "Exchange Program": ("Exchange Programs", "/exchange-programs/"),
    "Research Grant": ("Research Grants", "/grants/"),
    "Youth Program": ("Youth Programs", "/youth-programs/"),
    "Volunteer Program": ("Volunteer Programs", "/volunteer-programs/"),
    "Conference": ("Conferences", "/conferences/"),
    "Summer School": ("Workshops and Summer Programs", "/workshops/")
}

COUNTRY_INDEXING_PROFILES = {
    "United States": {
        "study": "The United States is strongest for applicants who want broad program choice, research-heavy universities, campus employment options, and large alumni networks. Because costs and funding policies vary widely by institution, students should compare the full cost of attendance, assistantship rules, and renewal terms before applying.",
        "universities": "Commonly researched institutions include Harvard University, Stanford University, MIT, University of California campuses, Columbia University, and major public research universities.",
        "student_life": "Student life often combines residential campuses, clubs, labs, internships, and regional career fairs. International applicants should plan early for health insurance, housing deposits, and documentation for the student visa interview."
    },
    "United Kingdom": {
        "study": "The United Kingdom is attractive for focused one-year master's programs, historic universities, strong professional networks, and scholarship schemes tied to leadership or public service. Applicants should align scholarship essays with course choice because many awards expect a clear reason for studying in the UK.",
        "universities": "Popular institutions include Oxford, Cambridge, Imperial College London, UCL, King's College London, Edinburgh, Manchester, Warwick, and other Russell Group universities.",
        "student_life": "Student life is usually city-based and academically intensive, with societies, college communities, career services, and short travel distances between major university cities."
    },
    "Canada": {
        "study": "Canada is often a good fit for students seeking research supervision, multicultural campuses, co-op pathways, and graduate funding connected to universities or national programs. Funding can depend on nomination, supervisor support, or admission status, so applicants should track institutional steps carefully.",
        "universities": "Frequently searched institutions include the University of Toronto, UBC, McGill, McMaster, Alberta, Waterloo, Montreal, Calgary, and Queen's.",
        "student_life": "Student life varies from large urban campuses to smaller research communities. Applicants should budget for winter clothing, provincial health coverage rules, housing, and study permit timelines."
    },
    "Australia": {
        "study": "Australia is known for research training programs, development scholarships, post-study exposure, and universities with strong links to Asia-Pacific research and industry. Applicants should separate university admission deadlines from scholarship rounds because they may close at different times.",
        "universities": "Popular universities include the University of Melbourne, Australian National University, University of Sydney, UNSW Sydney, Monash, Queensland, Adelaide, and Western Australia.",
        "student_life": "Student life often blends campus clubs, part-time work rules, coastal cities, and practical research communities. International students should check overseas health cover, visa conditions, and accommodation timing."
    },
    "Germany": {
        "study": "Germany is a strong destination for applicants interested in low-cost public education, research institutes, engineering, public policy, development studies, and structured DAAD funding. Many routes require careful attention to language, certified documents, and the difference between admission and scholarship selection.",
        "universities": "Commonly researched institutions include Technical University of Munich, LMU Munich, Heidelberg, Humboldt University, RWTH Aachen, Freiburg, Bonn, and the Max Planck and Fraunhofer research networks.",
        "student_life": "Student life is often independent and city-based, with public transport, student unions, research groups, and a strong emphasis on planning housing and residence paperwork early."
    },
    "Japan": {
        "study": "Japan is valuable for students interested in advanced research, technology, language learning, regional studies, and government-supported scholarship routes. Embassy and university nomination tracks may differ, so applicants should read the latest call carefully.",
        "universities": "Popular institutions include the University of Tokyo, Kyoto University, Osaka University, Tohoku University, Tokyo Institute of Technology, Waseda, and Keio.",
        "student_life": "Student life can include laboratory culture, language classes, student circles, and compact urban campuses. Applicants should prepare for document certification, health checks, and scholarship nomination timelines."
    },
    "China": {
        "study": "China offers large scholarship systems, fast-growing research universities, language study, and programs connected to international cooperation. Applicants should confirm whether a university pre-admission step, agency number, or parallel scholarship portal submission is required.",
        "universities": "Frequently searched institutions include Peking University, Tsinghua University, Fudan, Shanghai Jiao Tong, Zhejiang University, USTC, Nanjing University, and Harbin Institute of Technology.",
        "student_life": "Student life can include language learning, campus accommodation, research labs, city-based internships, and strong regional travel links. Document notarization and program-language checks are especially important."
    },
    "Switzerland": {
        "study": "Switzerland is best suited to applicants seeking research excellence, international organizations, engineering, life sciences, policy, and highly selective fellowships. Costs are high, so funding coverage and host confirmation should be checked carefully.",
        "universities": "Popular institutions include ETH Zurich, EPFL, University of Zurich, Geneva, Lausanne, Basel, Bern, and graduate institutes connected to international policy.",
        "student_life": "Student life is international and multilingual, often shaped by research groups, mountain travel, public transport, and proximity to global organizations."
    }
}

LANDING_PAGE_DEFINITIONS = [
    {
        "path": "scholarships",
        "label": "Scholarships",
        "h1": "Scholarships for International Students",
        "facet": "category",
        "match": {"type": "Scholarship"},
        "audience": "undergraduate, master's, doctoral, and other eligible applicants comparing academic funding",
        "benefits": "tuition support, living-cost assistance, mentoring, research access, and international study experience",
        "eligibility": "degree level, nationality or residence rules, academic record, language evidence, and provider-specific conditions",
        "process": "shortlist realistic awards, confirm the official deadline, prepare transcripts and references, and submit through the provider",
        "tips": "prioritize programs that fit your level and field, verify every requirement early, and keep a reusable document checklist"
    },
    {
        "path": "internships",
        "label": "Internships",
        "h1": "International Internships",
        "facet": "category",
        "match": {"type": "Internship"},
        "audience": "students, recent graduates, and early-career applicants seeking practical experience",
        "benefits": "workplace exposure, professional references, technical practice, cross-cultural experience, and clearer career direction",
        "eligibility": "enrolment or graduation status, field of study, work authorization, language ability, and availability dates",
        "process": "review the role scope, tailor a concise CV, prepare evidence of relevant skills, and apply on the employer's official site",
        "tips": "compare paid and unpaid terms carefully, check location requirements, and explain how your experience fits the role"
    },
    {
        "path": "fellowships",
        "label": "Fellowships",
        "h1": "International Fellowships",
        "facet": "category",
        "match": {"type": "Fellowship"},
        "audience": "researchers, professionals, graduate students, and emerging leaders seeking focused development",
        "benefits": "funded research time, mentorship, specialist networks, leadership development, and access to host institutions",
        "eligibility": "career stage, research or professional focus, geographic eligibility, proposed outcomes, and recommendation requirements",
        "process": "study the fellowship mission, shape a specific proposal, identify strong referees, and follow the official submission sequence",
        "tips": "show a clear public or professional impact, use evidence rather than broad claims, and leave time for referee coordination"
    },
    {
        "path": "grants",
        "label": "Research Grants",
        "h1": "International Research Grants",
        "facet": "category",
        "match": {"type": "Research Grant"},
        "audience": "doctoral candidates, postdoctoral researchers, faculty members, and independent specialists",
        "benefits": "research costs, travel, fieldwork, equipment, publication support, and collaboration with established institutions",
        "eligibility": "research stage, institutional affiliation, eligible costs, geographic scope, methodology, and project timetable",
        "process": "confirm the grant remit, develop a costed work plan, secure institutional approvals, and submit the required proposal package",
        "tips": "make the research question precise, connect every cost to an activity, and write outcomes that reviewers can evaluate"
    },
    {
        "path": "exchange-programs",
        "label": "Exchange Programs",
        "h1": "International Exchange Programs",
        "facet": "category",
        "match": {"type": "Exchange Program"},
        "audience": "students and young professionals looking for structured academic or cultural exchange",
        "benefits": "international study, language practice, intercultural learning, academic credit, and durable global connections",
        "eligibility": "current enrolment, age or study level, home-institution approval, language preparation, and destination requirements",
        "process": "check nomination rules, discuss credit recognition, prepare travel documents, and apply through the named official channel",
        "tips": "plan for visas and insurance early, compare what funding covers, and confirm how the exchange fits your academic plan"
    },
    {
        "path": "scholarships/germany",
        "label": "Scholarships in Germany",
        "h1": "Scholarships in Germany",
        "facet": "country",
        "match": {"type": "Scholarship", "country": "Germany"},
        "audience": "international students considering German universities, research institutes, and public scholarship foundations",
        "benefits": "access to strong research environments, low-cost public education, monthly support, and international academic networks",
        "eligibility": "academic merit, program admission, language level, development goals, and the rules of each German funder",
        "process": "identify the correct degree and intake, check DAAD or provider instructions, prepare certified records, and apply officially",
        "tips": "distinguish university admission from scholarship admission, verify German-language expectations, and budget for uncovered costs"
    },
    {
        "path": "scholarships/canada",
        "label": "Scholarships in Canada",
        "h1": "Scholarships in Canada",
        "facet": "country",
        "match": {"type": "Scholarship", "country": "Canada"},
        "audience": "international applicants exploring undergraduate, graduate, and research study across Canadian institutions",
        "benefits": "tuition awards, research supervision, multicultural campuses, professional networks, and post-study career exposure",
        "eligibility": "admission status, academic performance, leadership evidence, research fit, citizenship rules, and institutional nomination",
        "process": "compare university and external awards, confirm nomination steps, prepare academic evidence, and meet the earliest deadline",
        "tips": "review provincial and university costs separately, contact potential research supervisors appropriately, and track time zones"
    },
    {
        "path": "scholarships/japan",
        "label": "Scholarships in Japan",
        "h1": "Scholarships in Japan",
        "facet": "country",
        "match": {"type": "Scholarship", "country": "Japan"},
        "audience": "students interested in Japanese universities, technology, research, language, and regional academic experience",
        "benefits": "tuition support, monthly stipends, research placements, language learning, and access to advanced academic facilities",
        "eligibility": "nationality, age, academic level, health, language readiness, embassy or university nomination, and study plans",
        "process": "choose the correct MEXT or institutional route, read the annual guidelines, prepare examinations if required, and apply officially",
        "tips": "use the newest application guidelines, confirm whether embassy and university routes differ, and prepare a focused study plan"
    },
    {
        "path": "scholarships/usa",
        "label": "Scholarships in the USA",
        "h1": "Scholarships in the USA",
        "facet": "country",
        "match": {"type": "Scholarship", "country": "United States"},
        "audience": "international students comparing American undergraduate, graduate, professional, and research opportunities",
        "benefits": "broad program choice, specialist facilities, alumni networks, assistantships, and merit- or need-based financial support",
        "eligibility": "admission requirements, academic results, testing, financial documentation, leadership, and award-specific nationality rules",
        "process": "build a balanced institution list, separate admission and funding deadlines, prepare essays and references, and apply officially",
        "tips": "calculate the full cost of attendance, look for renewable funding terms, and avoid relying on a single highly competitive award"
    },
    {
        "path": "scholarships/uk",
        "label": "Scholarships in the UK",
        "h1": "Scholarships in the UK",
        "facet": "country",
        "match": {"type": "Scholarship", "country": "United Kingdom"},
        "audience": "international students targeting British undergraduate, master's, doctoral, and leadership programs",
        "benefits": "globally recognized qualifications, concentrated master's programs, leadership networks, and tuition or living-cost support",
        "eligibility": "academic achievement, course admission, nationality, work or leadership experience, English ability, and return commitments",
        "process": "choose eligible courses, check scholarship and university timelines, develop evidence-based essays, and submit through official portals",
        "tips": "read regional eligibility carefully, explain long-term impact concretely, and plan for costs not covered by partial awards"
    },
    {
        "path": "scholarships/italy",
        "label": "Scholarships in Italy",
        "h1": "Scholarships in Italy",
        "facet": "country",
        "match": {"type": "Scholarship", "country": "Italy"},
        "audience": "international students researching Italian universities, regional awards, and government-supported study",
        "benefits": "tuition reductions, regional assistance, cultural and language experience, and access to European academic networks",
        "eligibility": "program admission, income or merit criteria, nationality, document legalization, language, and regional residence rules",
        "process": "identify the university and region, check official calls, prepare translated financial and academic records, and apply directly",
        "tips": "watch regional deadlines, verify document legalization requirements, and distinguish admission, visa, and funding procedures"
    },
    {
        "path": "scholarships/turkey",
        "label": "Scholarships in Turkey",
        "h1": "Scholarships in Turkey",
        "facet": "country",
        "match": {"type": "Scholarship", "country": "Turkey"},
        "audience": "international applicants considering Turkish universities and government-funded degree programs",
        "benefits": "tuition coverage, accommodation or stipends, language preparation, diverse degree options, and regional cultural experience",
        "eligibility": "nationality, age, previous qualification, academic performance, program level, and annual government criteria",
        "process": "review the current official call, select suitable programs, prepare accurate records and motivation, and submit in the portal",
        "tips": "use only the official application system, confirm age limits for your level, and keep scans and translations ready before opening day"
    },
    {
        "path": "scholarships/china",
        "label": "Scholarships in China",
        "h1": "Scholarships in China",
        "facet": "country",
        "match": {"type": "Scholarship", "country": "China"},
        "audience": "international students interested in Chinese universities, research programs, and government scholarship routes",
        "benefits": "tuition support, campus accommodation, stipends, language study, and access to large research and industry ecosystems",
        "eligibility": "degree level, nationality, health, academic background, language, pre-admission documents, and scholarship category",
        "process": "choose eligible institutions, confirm agency numbers and nomination rules, prepare notarized documents, and apply officially",
        "tips": "check whether university and CSC submissions are both required, verify program language, and avoid unauthorized application agents"
    },
    {
        "path": "scholarships/south-korea",
        "label": "Scholarships in South Korea",
        "h1": "Scholarships in South Korea",
        "facet": "country",
        "match": {"type": "Scholarship", "country": "South Korea"},
        "audience": "international students seeking Korean government or university funding for degree study and research",
        "benefits": "tuition, stipends, language training, travel support, high-quality research facilities, and international campus experience",
        "eligibility": "nationality, age, degree history, grades, health, language preparation, and embassy- or university-track conditions",
        "process": "select the appropriate GKS or university route, follow the annual notice, prepare certified records, and submit to the named office",
        "tips": "do not apply through conflicting tracks, study institution quotas, and allow time for apostilles and recommendation letters"
    },
    {
        "path": "fully-funded-scholarships",
        "label": "Fully Funded Scholarships",
        "h1": "Fully Funded Scholarships",
        "facet": "funding",
        "match": {"type": "Scholarship", "funding": "Fully Funded"},
        "audience": "students who need comprehensive support for tuition and major study-related costs",
        "benefits": "full tuition and, depending on the provider, stipends, travel, insurance, accommodation, or research expenses",
        "eligibility": "strong academic preparation, program fit, nationality or destination rules, leadership, and complete supporting evidence",
        "process": "verify what fully funded means for each award, compare covered costs, prepare competitive documents, and apply officially",
        "tips": "read the funding breakdown rather than relying on the label, budget for exclusions, and apply to several well-matched programs"
    },
    {
        "path": "partially-funded-scholarships",
        "label": "Partially Funded Scholarships",
        "h1": "Partially Funded Scholarships",
        "facet": "funding",
        "match": {"type": "Scholarship", "funding": "Partially Funded"},
        "audience": "students combining merit awards with savings, sponsorship, assistantships, or other financial support",
        "benefits": "reduced tuition, fee waivers, one-time grants, living allowances, or targeted support for specific study expenses",
        "eligibility": "academic merit, course admission, financial circumstances where relevant, nationality, and award-specific conditions",
        "process": "calculate the remaining funding gap, confirm whether awards can be combined, prepare evidence, and submit through the provider",
        "tips": "compare net cost after the award, check renewal conditions, and secure a realistic plan for expenses the scholarship excludes"
    },
    {
        "path": "undergraduate-scholarships",
        "label": "Undergraduate Scholarships",
        "h1": "Undergraduate Scholarships",
        "facet": "level",
        "match": {"type": "Scholarship", "level": "undergraduate"},
        "audience": "school leavers and current bachelor's students seeking first-degree financial support",
        "benefits": "tuition awards, living support, mentoring, campus opportunities, and reduced financial pressure during a first degree",
        "eligibility": "secondary-school results, admission, age or graduation year, extracurricular evidence, language, and nationality",
        "process": "research admission and scholarship requirements together, prepare school records and essays, and meet the earliest deadline",
        "tips": "start before your final school year ends, ask for references early, and compare renewable awards across the full degree duration"
    },
    {
        "path": "masters-scholarships",
        "label": "Master's Scholarships",
        "h1": "Master's Scholarships",
        "facet": "level",
        "match": {"type": "Scholarship", "level": "masters"},
        "audience": "graduates seeking taught or research master's funding at universities worldwide",
        "benefits": "advanced specialization, tuition support, professional networks, research access, and accelerated career development",
        "eligibility": "a relevant bachelor's degree, grades, program admission, work or research experience, language, and nationality rules",
        "process": "define your academic goal, shortlist suitable courses and awards, tailor your statement, and coordinate references and transcripts",
        "tips": "explain why the specific program matters, connect prior experience to future outcomes, and distinguish scholarship from admission dates"
    },
    {
        "path": "phd-scholarships",
        "label": "PhD Scholarships",
        "h1": "PhD Scholarships",
        "facet": "level",
        "match": {"type": "Scholarship", "level": "phd"},
        "audience": "prospective doctoral researchers looking for funded study, supervision, and research environments",
        "benefits": "tuition coverage, stipends, research costs, conference access, expert supervision, and long-term academic networks",
        "eligibility": "graduate preparation, research fit, proposal quality, supervisor availability, publications where relevant, and language",
        "process": "refine a viable research question, identify appropriate supervisors, prepare a proposal and references, and follow official instructions",
        "tips": "contact supervisors with a focused message, align the proposal with available expertise, and verify stipend duration and conditions"
    },
    {
        "path": "study-in-uk",
        "label": "Study in UK",
        "h1": "Study in UK Opportunities",
        "facet": "country",
        "match": {"country": "United Kingdom"},
        "audience": "students comparing UK scholarships, fellowships, internships, and other verified programs",
        "benefits": "globally recognized universities, funded master's and doctoral routes, leadership networks, research access, and international experience",
        "eligibility": "country eligibility, academic level, course admission, English-language evidence, provider criteria, and deadline timing",
        "process": "compare UK opportunities, confirm the official provider rules, prepare academic documents and references, and apply through the official route",
        "tips": "separate university admission from funding, check regional eligibility carefully, and plan early for visa and living-cost requirements"
    },
    {
        "path": "study-in-usa",
        "label": "Study in USA",
        "h1": "Study in USA Opportunities",
        "facet": "country",
        "match": {"country": "United States"},
        "audience": "international applicants exploring scholarships, fellowships, internships, and academic programs in the United States",
        "benefits": "broad program choice, research facilities, assistantships, alumni networks, and funded academic or professional development",
        "eligibility": "admission requirements, academic record, testing or language rules, funding criteria, nationality rules, and application deadlines",
        "process": "shortlist relevant US programs, check official deadlines, prepare essays and recommendations, and submit directly to the provider",
        "tips": "calculate the full cost of attendance, watch separate admission and funding dates, and apply to several realistic options"
    },
    {
        "path": "study-in-canada",
        "label": "Study in Canada",
        "h1": "Study in Canada Opportunities",
        "facet": "country",
        "match": {"country": "Canada"},
        "audience": "students seeking Canadian scholarships, internships, research programs, and fellowships",
        "benefits": "multicultural campuses, research supervision, tuition awards, professional exposure, and strong public institutions",
        "eligibility": "program admission, academic merit, research fit, citizenship or residence rules, language evidence, and nomination steps",
        "process": "compare university and external awards, confirm official application steps, prepare records, and meet the earliest deadline",
        "tips": "review provincial and institutional costs separately, contact supervisors appropriately, and track time zones for deadlines"
    },
    {
        "path": "study-in-australia",
        "label": "Study in Australia",
        "h1": "Study in Australia Opportunities",
        "facet": "country",
        "match": {"country": "Australia"},
        "audience": "students and researchers exploring Australian scholarships, internships, and funded study routes",
        "benefits": "research training, university funding, international campuses, applied learning, and access to regional professional networks",
        "eligibility": "degree level, admission status, academic merit, research alignment, English-language rules, and scholarship conditions",
        "process": "identify eligible programs, verify official requirements, prepare transcripts and proposals, and apply before provider deadlines",
        "tips": "check whether admission is required before scholarship review, verify stipend duration, and plan for uncovered relocation costs"
    },
    {
        "path": "study-in-germany",
        "label": "Study in Germany",
        "h1": "Study in Germany Opportunities",
        "facet": "country",
        "match": {"country": "Germany"},
        "audience": "international students considering German universities, research institutes, scholarships, and internships",
        "benefits": "research strength, low-cost public education, monthly funding, industry exposure, and international academic networks",
        "eligibility": "academic merit, program admission, language level, development goals, host fit, and provider-specific rules",
        "process": "identify the right degree or placement, check DAAD or provider instructions, prepare certified records, and apply officially",
        "tips": "distinguish admission from funding, verify German-language expectations, and budget for costs that awards may not cover"
    },
    {
        "path": "study-in-europe",
        "label": "Study in Europe",
        "h1": "Study in Europe Opportunities",
        "facet": "region",
        "match": {"countries": ["United Kingdom", "Germany", "France", "Italy", "Netherlands", "Switzerland", "Austria", "Ireland"]},
        "audience": "students comparing European scholarships, exchanges, fellowships, internships, and research opportunities",
        "benefits": "cross-border study options, public and university funding, research networks, cultural experience, and international mobility",
        "eligibility": "destination rules, degree level, nationality, language evidence, institutional admission, and funding conditions",
        "process": "compare countries and providers, confirm official requirements, prepare translated documents where needed, and apply directly",
        "tips": "check country-specific visa rules, distinguish EU and non-EU eligibility, and verify whether programs cover travel or living costs"
    },
    {
        "path": "paid-internships",
        "label": "Paid Internships",
        "h1": "Paid Internships",
        "facet": "funding",
        "match": {"type": "Internship", "keywords": ["paid", "stipend", "salary", "monthly contribution", "allowance"]},
        "audience": "students and graduates who need internship opportunities with stated financial support",
        "benefits": "professional experience, workplace mentoring, financial support, stronger CV evidence, and international exposure",
        "eligibility": "enrolment or graduate status, relevant field, availability, work authorization, language ability, and employer criteria",
        "process": "review pay terms, confirm duty station requirements, tailor a concise CV, and apply through the official employer portal",
        "tips": "read whether support covers all costs, compare location expenses, and keep proof of enrolment or graduation ready"
    },
    {
        "path": "remote-internships",
        "label": "Remote Internships",
        "h1": "Remote Internships",
        "facet": "work mode",
        "match": {"type": "Internship", "keywords": ["remote", "virtual", "online", "hybrid"]},
        "audience": "students and graduates looking for flexible internship experience that can be completed remotely or partly remotely",
        "benefits": "flexible access, practical project work, international collaboration, lower relocation costs, and portfolio-building experience",
        "eligibility": "time-zone availability, required tools, field fit, enrolment or graduate status, language ability, and team expectations",
        "process": "confirm whether the role is fully remote or hybrid, prepare evidence of self-directed work, and apply officially",
        "tips": "ask about supervision cadence, check whether any travel is required, and show remote collaboration skills in the application"
    },
    {
        "path": "summer-internships",
        "label": "Summer Internships",
        "h1": "Summer Internships",
        "facet": "season",
        "match": {"type": "Internship", "keywords": ["summer", "june", "july", "august"]},
        "audience": "students planning structured internships during summer breaks or short academic windows",
        "benefits": "focused work experience, research exposure, seasonal training, professional references, and practical skill development",
        "eligibility": "current study level, availability dates, subject fit, work authorization, language ability, and program-specific criteria",
        "process": "match the internship dates to your academic calendar, prepare documents early, and submit before seasonal deadlines",
        "tips": "apply months before summer begins, confirm housing or travel support, and explain your availability clearly"
    },
    {
        "path": "international-internships",
        "label": "International Internships",
        "h1": "International Internships",
        "facet": "category",
        "match": {"type": "Internship"},
        "audience": "students and recent graduates seeking practical international experience across organizations and countries",
        "benefits": "cross-cultural work experience, professional references, applied skills, international networks, and clearer career direction",
        "eligibility": "study or graduate status, field alignment, language ability, travel or remote-work readiness, and employer requirements",
        "process": "compare role scope, funding, location, and deadlines, then apply through the official host organization",
        "tips": "check visa and location rules, compare paid and unpaid terms, and tailor your CV to each role"
    },
    {
        "path": "fully-funded-fellowships",
        "label": "Fully Funded Fellowships",
        "h1": "Fully Funded Fellowships",
        "facet": "funding",
        "match": {"type": "Fellowship", "keywords": ["fully funded", "full funding", "stipend", "travel", "accommodation"]},
        "audience": "researchers, graduate students, and emerging leaders seeking fellowships with substantial financial support",
        "benefits": "stipends, travel support, research time, mentoring, host-institution access, and international networks",
        "eligibility": "career stage, research or leadership focus, nationality rules, proposed outcomes, and recommendation requirements",
        "process": "verify the funding package, shape a focused proposal, secure referees, and submit through the official provider",
        "tips": "read the funding breakdown carefully, show concrete impact, and leave time for referee coordination"
    },
    {
        "path": "research-fellowships",
        "label": "Research Fellowships",
        "h1": "Research Fellowships",
        "facet": "category",
        "match": {"type": "Fellowship", "keywords": ["research", "doctoral", "postdoctoral", "scholar"]},
        "audience": "doctoral candidates, postdoctoral researchers, faculty, and specialists seeking funded research time",
        "benefits": "research support, host collaboration, mentorship, publication time, fieldwork access, and specialist networks",
        "eligibility": "research stage, project fit, host alignment, academic record, methodology, and provider-specific rules",
        "process": "define a precise research question, identify host fit, prepare a proposal and references, and apply officially",
        "tips": "connect your project to the host's strengths, make outcomes measurable, and verify eligible costs"
    },
    {
        "path": "leadership-fellowships",
        "label": "Leadership Fellowships",
        "h1": "Leadership Fellowships",
        "facet": "category",
        "match": {"type": "Fellowship", "keywords": ["leadership", "leader", "public service", "policy", "community"]},
        "audience": "emerging leaders, professionals, students, and civic contributors seeking structured leadership development",
        "benefits": "mentoring, leadership training, networks, project support, public-impact experience, and international exposure",
        "eligibility": "leadership evidence, professional or civic focus, career stage, nationality rules, impact goals, and recommendations",
        "process": "study the fellowship mission, document your impact, prepare essays and references, and apply through the official route",
        "tips": "use specific examples of leadership, explain community impact, and connect the fellowship to a credible next step"
    },
    {
        "path": "programming-competitions",
        "label": "Programming Competitions",
        "h1": "Programming Competitions",
        "facet": "category",
        "match": {"type": "Competition", "keywords": ["programming", "coding", "software", "algorithm", "hackathon"]},
        "audience": "students, developers, and technical teams looking for coding and software competitions",
        "benefits": "portfolio evidence, prizes, mentoring, technical practice, peer learning, and global visibility",
        "eligibility": "age or student status, team rules, technical theme, submission format, region rules, and deadlines",
        "process": "review the challenge brief, form a team if allowed, build a compliant submission, and enter through the official platform",
        "tips": "read judging criteria before building, document your work clearly, and submit before the platform deadline"
    },
    {
        "path": "ai-competitions",
        "label": "AI Competitions",
        "h1": "AI Competitions",
        "facet": "category",
        "match": {"type": "Competition", "keywords": ["ai", "artificial intelligence", "machine learning", "data science"]},
        "audience": "students, researchers, and builders interested in AI, machine learning, and data competitions",
        "benefits": "technical practice, public recognition, prizes, portfolio projects, mentorship, and exposure to real datasets",
        "eligibility": "team rules, skill level, dataset terms, submission requirements, geographic eligibility, and competition deadlines",
        "process": "study the rules, prepare a reproducible solution, document model choices, and submit through the official platform",
        "tips": "respect data-use rules, benchmark early, and explain the practical value of your solution"
    },
    {
        "path": "business-competitions",
        "label": "Business Competitions",
        "h1": "Business Competitions",
        "facet": "category",
        "match": {"type": "Competition", "keywords": ["business", "startup", "entrepreneur", "case competition", "venture"]},
        "audience": "students, founders, and teams developing business ideas, ventures, or case-analysis submissions",
        "benefits": "pitch experience, prizes, mentorship, investor exposure, business validation, and stronger entrepreneurial portfolios",
        "eligibility": "team composition, stage of idea, student or founder status, region rules, submission materials, and deadlines",
        "process": "review the brief, prepare a concise pitch or case solution, validate assumptions, and submit through the official channel",
        "tips": "make the problem and customer clear, support claims with evidence, and rehearse the pitch before submission"
    },
    {
        "path": "essay-competitions",
        "label": "Essay Competitions",
        "h1": "Essay Competitions",
        "facet": "category",
        "match": {"type": "Competition", "keywords": ["essay", "writing", "article", "policy brief"]},
        "audience": "students and writers seeking essay, policy, and writing competitions with clear submission rules",
        "benefits": "publication potential, prizes, writing practice, public recognition, and stronger academic or professional profiles",
        "eligibility": "age or student status, topic fit, word limit, originality rules, citation style, region eligibility, and deadlines",
        "process": "read the prompt, outline a focused argument, revise for evidence and clarity, and submit through the official platform",
        "tips": "answer the exact prompt, follow formatting rules, and leave time for proofreading before the deadline"
    }
]

FAQ_TEMPLATES = {
    "Scholarship": [
        {
            "q": "How are scholarship listings verified on OpportunityNest?",
            "a": "Each scholarship is traced back to an official application portal from a university, government ministry, or recognised funding body. Listings that cannot be matched to a verifiable source are not published."
        },
        {
            "q": "Do I apply directly on OpportunityNest or through the provider?",
            "a": "OpportunityNest provides the details and a direct link to the official program page. All applications are submitted through the provider's own portal."
        },
        {
            "q": "Can I narrow down scholarships by country or field of study?",
            "a": "Yes. Category pages include dedicated filters, and country landing pages group scholarships alongside other opportunity types for that destination."
        }
    ],
    "Internship": [
        {
            "q": "Are the internship listings on OpportunityNest paid or unpaid?",
            "a": "Each internship listing shows its funding status: paid, unpaid, stipend-based, or with a monthly contribution. Always check the official posting for exact terms."
        },
        {
            "q": "How current are the internship postings?",
            "a": "Internship listings are reviewed regularly. Postings whose deadlines have passed are removed automatically from search results."
        },
        {
            "q": "Can I track internships I am interested in?",
            "a": "You can bookmark individual detail pages or return to the category page to revisit programs. Consider noting the deadline and required documents for each one."
        }
    ],
    "Fellowship": [
        {
            "q": "What details are available on each fellowship page?",
            "a": "Each fellowship page includes eligibility criteria, funding level, application deadline, host country, field of research or practice, and a direct link to the official program."
        },
        {
            "q": "Can I search for fellowships by destination country?",
            "a": "Country landing pages show fellowships grouped with other opportunity types. You can also use the category filter on the main search page."
        },
        {
            "q": "Does OpportunityNest process fellowship applications?",
            "a": "No. OpportunityNest is a discovery platform. Every listing directs you to the official provider for submission and selection decisions."
        }
    ],
    "Competition": [
        {
            "q": "What types of competitions are listed on OpportunityNest?",
            "a": "Listings include global contests, academic awards, innovation challenges, and prize-based programs open to students, researchers, or professionals."
        },
        {
            "q": "How do I enter a competition I find here?",
            "a": "Click the official link on the competition page to access the provider's entry portal and follow their submission guidelines."
        },
        {
            "q": "Are competition deadlines reliable?",
            "a": "Deadlines are checked during listing review, but competition dates can shift. Always verify the cutoff on the official competition website."
        }
    ],
    "Country": [
        {
            "q": "How does OpportunityNest select which countries to feature?",
            "a": "Country pages are built around the destinations that appear most frequently in verified opportunity listings. As new programs from additional countries are added, new country pages are generated."
        },
        {
            "q": "Will global or remote opportunities appear on country pages?",
            "a": "Global and remote opportunities have their own dedicated landing pages. They also appear in the main search results when no country filter is active."
        },
        {
            "q": "How are related countries chosen for the navigation section?",
            "a": "Related country links are drawn from the same geographic region or from destinations that share similar opportunity profiles."
        }
    ]
}

HEADER_NAV = [
    ("/", "Home"),
    ("/scholarships/", "Scholarships"),
    ("/internships/", "Internships"),
    ("/fellowships/", "Fellowships"),
    ("/competitions.html", "Competitions"),
    ("/about.html", "About"),
    ("/contact.html", "Contact"),
    ("/faq.html", "FAQ")
]


def slugify(value: str) -> str:
    value = str(value or "").strip().lower()
    value = re.sub(r"[^a-z0-9\s-]", "", value)
    value = re.sub(r"[\s-]+", "-", value)
    return value.strip("-")


def escape_html(value: str) -> str:
    return (str(value or "")
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&#039;"))


def fetch_opportunities() -> list[dict]:
    local_path = ROOT / "data" / "verified-opportunities-2026.json"
    local_rows = json.loads(local_path.read_text(encoding="utf-8")) if local_path.exists() else []
    rows = []
    try:
        query = "?select=*"
        request = urllib.request.Request(f"{SUPABASE_URL}{query}", headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Accept": "application/json"
        })
        with urllib.request.urlopen(request, timeout=30) as response:
            rows = json.loads(response.read().decode("utf-8"))
    except Exception as error:
        if not local_rows:
            raise
        print(f"Supabase fetch failed; using local verified dataset only: {error}")

    if local_rows:
        by_slug = {row.get("slug"): row for row in rows if row.get("slug")}
        for local in local_rows:
            slug = local.get("slug")
            if slug and slug in by_slug:
                by_slug[slug].update({key: value for key, value in local.items() if value not in (None, "", [])})
            else:
                rows.append(local)
    today = datetime.now(timezone.utc).date().isoformat()
    for index, row in enumerate(rows):
        row.setdefault("id", row.get("slug") or f"verified-{index + 1}")
        row.setdefault("created_at", row.get("verified_at") or datetime.now(timezone.utc).isoformat())
    return [row for row in rows if is_active_opportunity(row, today)]


def is_active_opportunity(item: dict, today: str) -> bool:
    status = (item.get("deadline_status") or "fixed").strip()
    deadline = (item.get("deadline") or "").strip()
    if status != "fixed":
        return True
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", deadline):
        return True
    return deadline >= today


def build_breadcrumbs(items: list[tuple[str, str | None]]) -> str:
    parts = []
    for label, href in items:
        if href:
            safe_href = href if href.startswith(("http://", "https://", "/", "#", "mailto:")) else f"/{href.lstrip('./')}"
            parts.append(f'<a href="{safe_href}">{escape_html(label)}</a>')
        else:
            parts.append(f'<span aria-current="page">{escape_html(label)}</span>')
    return '<nav class="breadcrumbs" aria-label="Breadcrumb navigation">' + ' <span aria-hidden="true">/</span> '.join(parts) + '</nav>'


def build_nav() -> str:
    return "\n".join([
        f'<a href="{href}">{escape_html(label)}</a>'
        for href, label in HEADER_NAV
    ])


def build_footer() -> str:
    return """<footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <a class="brand" href="/">
            <span class="brand-mark" aria-hidden="true">ON</span>
            <span>OpportunityNest.org</span>
          </a>
          <p>The central hub where students discover life-changing opportunities worldwide.</p>
        </div>
        <nav class="footer-links" aria-label="Footer navigation">
          <a href="/#opportunities">Opportunities</a>
          <a href="/scholarships/">Scholarships</a>
          <a href="/internships/">Internships</a>
          <a href="/fellowships/">Fellowships</a>
          <a href="/competitions.html">Competitions</a>
          <a href="/about.html">About</a>
          <a href="/contact.html">Contact</a>
          <a href="/faq.html">FAQ</a>
          <a href="/editorial-policy.html">Editorial Policy</a>
          <a href="/fact-checking-policy.html">Fact Checking</a>
          <a href="/verification-process.html">Verification Process</a>
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
          <a href="/disclaimer.html">Disclaimer</a>
        </nav>
      </div>
      <div class="container copyright">
        <p>&copy; 2026 OpportunityNest.org. All rights reserved.</p>
      </div>
    </footer>"""


def page_head(title: str, description: str, url: str, og_image_alt: str, additional_head: str = "") -> str:
    organization_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "OpportunityNest",
        "url": SITE_URL,
        "logo": f"{SITE_URL}/logo.svg",
        "sameAs": [],
        "publishingPrinciples": f"{SITE_URL}/editorial-policy.html",
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Editorial corrections",
            "url": f"{SITE_URL}/contact.html"
        }
    }, indent=2)
    website_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "OpportunityNest",
        "url": SITE_URL,
        "potentialAction": {
            "@type": "SearchAction",
            "target": f"{SITE_URL}/?q={{search_term_string}}#opportunities",
            "query-input": "required name=search_term_string"
        }
    }, indent=2)
    return f"""<!doctype html>
<html lang="en">
  <head>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('consent', 'default', {{
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 2000,
        region: ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','GB','CH']
      }});
    </script>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{escape_html(title)}</title>
    <meta name="description" content="{escape_html(description)}">
    <meta name="robots" content="index,follow">
    <meta name="theme-color" content="#0f766e">
    <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin>
    <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
    <link rel="preconnect" href="https://www.google-analytics.com" crossorigin>
    <link rel="preconnect" href="https://rveunrzbeynaizitqanx.supabase.co" crossorigin>
    <link rel="preload" href="/styles.css" as="style">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4182963907868663"     crossorigin="anonymous"></script>
    <link rel="canonical" href="{escape_html(url)}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta property="og:title" content="{escape_html(title)}">
    <meta property="og:description" content="{escape_html(description)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{escape_html(url)}">
    <meta property="og:image" content="{SITE_URL}/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{escape_html(og_image_alt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{escape_html(title)}">
    <meta name="twitter:description" content="{escape_html(description)}">
    <meta name="twitter:image" content="{SITE_URL}/og-image.png">
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-WKVTVB0X4X"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', 'G-WKVTVB0X4X');
    </script>
    <link rel="stylesheet" href="/styles.css">
    <script type="application/ld+json">{organization_schema}</script>
    <script type="application/ld+json">{website_schema}</script>
    {additional_head}
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" aria-label="Primary navigation">
      <nav class="nav container">
        <a class="brand" href="/" aria-label="OpportunityNest.org home">
          <span class="brand-mark" aria-hidden="true">ON</span>
          <span>OpportunityNest.org</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu">
          <span class="sr-only">Toggle navigation</span>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="nav-menu" id="nav-menu">
          {build_nav()}
        </div>
      </nav>
    </header>
    <main id="main">
"""


def page_footer(file_script: str = "") -> str:
    script_html = ""
    if file_script:
        script_html = f'    <script src="{file_script}" defer></script>\n'
    return f"""    </main>
    {build_footer()}
    {script_html}  <script src="/nav.js" defer></script>
    <script>
      window.chtlConfig = {{
        chatbotId: "9241558149"
      }};
    </script>
    <script async data-id="9241558149" id="chtl-script" type="text/javascript" src="https://chatling.ai/js/embed.js"></script>
  </body>
</html>"""


def build_opportunity_card(item: dict, label: str = None) -> str:
    detail_href = item.get("slug") and f"{SITE_URL}/opportunity/{slugify(item['slug'])}/" or f"/opportunity-detail.html?id={escape_html(item['id'])}"
    funding = item.get("funding") or "See official listing"
    return f"""<article class=\"live-opportunity-card compact-card\">
      {country_landmark(item.get('country'))}
      <div class=\"opportunity-card-top\">
        <p class=\"card-kicker\">{escape_html(item.get('type'))} - {country_flag(item.get('country'))} {escape_html(item.get('country'))}</p>
        <span class=\"deadline\">{escape_html(format_deadline(item))}</span>
      </div>
      <h3>{escape_html(item.get('title'))}</h3>
      <ul class=\"card-overview compact-overview\">
        <li><strong>Field:</strong> {escape_html(item.get('field') or 'Multiple fields')}</li>
        <li><strong>Level:</strong> {escape_html(item.get('level') or 'Open to eligible applicants')}</li>
        <li><strong>Funding:</strong> {escape_html(funding)}</li>
      </ul>
      <div class=\"card-actions\">
        <a class=\"button button-secondary\" href=\"{detail_href}\">View Details</a>
        <a class=\"button button-primary\" href=\"{escape_html(item.get('link') or detail_href)}\" target=\"_blank\" rel=\"noopener noreferrer\">Apply Now <span aria-hidden=\"true\">↗</span></a>
      </div>
    </article>"""


def country_flag(value: str) -> str:
    flags = {
        "Australia": "🇦🇺",
        "Austria": "🇦🇹",
        "Canada": "🇨🇦",
        "Germany": "🇩🇪",
        "Switzerland": "🇨🇭",
        "United Kingdom": "🇬🇧",
        "United States": "🇺🇸",
        "Global": "🌍"
    }
    return flags.get(value, "🌍")


def country_landmark(value: str) -> str:
    return ""


def format_deadline(item: dict) -> str:
    deadline = item.get("deadline") or ""
    status = item.get("deadline_status") or "fixed"
    if status != "fixed":
        mapping = {"rolling": "Rolling / Ongoing", "varies": "Varies by provider", "not_announced": "Deadline not announced"}
        return mapping.get(status, "Deadline not announced")
    if not deadline:
        return "Deadline not announced"
    try:
        parsed = datetime.fromisoformat(deadline)
        return parsed.strftime("%d %b %Y")
    except ValueError:
        return deadline


def build_item_list_schema(items: list[dict], page_url: str) -> str:
    elements = []
    for index, item in enumerate(items[:10], 1):
        elements.append({
            "@type": "ListItem",
            "position": index,
            "url": f"{SITE_URL}/opportunity/{slugify(item['slug'])}/"
        })
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "url": page_url,
        "numberOfItems": len(elements),
        "itemListElement": elements
    }, indent=2)


def build_faq_schema(faqs: list[dict]) -> str:
    return json.dumps({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": faq['q'],
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq['a']
                }
            }
            for faq in faqs
        ]
    }, indent=2)


def matches_landing_page(item: dict, definition: dict) -> bool:
    match = definition["match"]
    if match.get("type") and item.get("type") != match["type"]:
        return False
    if match.get("country") and item.get("country") != match["country"]:
        return False
    if match.get("countries") and item.get("country") not in match["countries"]:
        return False
    if match.get("funding") and item.get("funding") != match["funding"]:
        return False
    if match.get("level"):
        level = (item.get("level") or "").lower()
        level_match = match["level"]
        if level_match == "undergraduate" and not any(term in level for term in ("undergraduate", "bachelor")):
            return False
        if level_match == "masters" and "master" not in level:
            return False
        if level_match == "phd" and "phd" not in level:
            return False
    if match.get("keywords"):
        searchable = " ".join(str(item.get(field) or "") for field in (
            "title",
            "funding",
            "eligibility_criteria",
            "level",
            "field",
            "benefits",
            "description",
            "tags"
        )).lower()
        if not any(keyword.lower() in searchable for keyword in match["keywords"]):
            return False
    return True


def build_landing_copy(definition: dict, item_count: int) -> list[tuple[str, str]]:
    label = definition["label"]
    audience = definition["audience"]
    benefits = definition["benefits"]
    eligibility = definition["eligibility"]
    process = definition["process"]
    tips = definition["tips"]
    availability = (
        f"This collection currently contains {item_count} matching opportunities."
        if item_count
        else "No matching opportunity is active in the OpportunityNest database today, but this guide remains useful while the next verified call is being added."
    )

    label_lower = label.lower()

    if any(x in label for x in ("Scholarships in", "Study in")):
        sections = [
            (
                f"Overview of {label}",
                f"This page collects verified listings related to {label_lower}. {availability} "
                f"Each entry shows the funding arrangement, eligibility level, deadline, and a direct link to the official provider. "
                f"The collection is designed for {audience}. "
                f"Applicants can compare funding types, degree levels, and deadlines in one place without opening multiple tabs. "
                f"The consistent format makes it easy to identify which opportunities match your profile and timeline."
            ),
            (
                "What the listings include",
                f"Every program listed here is checked before publication for deadline clarity, eligibility rules, and funding information. "
                f"The practical value of these opportunities may include {benefits}. Exact terms always depend on the provider, "
                f"so applicants should read the official award documentation before applying. Common inclusions are tuition, stipends, travel costs, and insurance, "
                f"but coverage varies between programs. Some awards also include mentoring or professional development components."
            ),
            (
                "Application steps",
                f"A typical workflow is to {process}. Keep a record of each deadline, required document, and submission portal. "
                f"Where admission and funding use separate tracks, complete both and do not assume one covers the other. "
                f"Prepare your CV, transcripts, references, and motivation statement in advance so you are ready when the application window opens. "
                f"Check whether any language proficiency tests or certified translations are required."
            ),
            (
                "Making your shortlist stronger",
                f"For a focused search, {tips}. Compare each program against your academic or professional goals. "
                f"Tailor your motivation statement to each provider's selection criteria rather than sending a generic application. "
                f"A well-matched application is usually more competitive than one sent to every available program. "
                f"Focus your preparation time on the programs that offer the best alignment with your qualifications."
            )
        ]
    elif any(x in label for x in ("Fully Funded", "Partially Funded")):
        sections = [
            (
                f"About {label}",
                f"{label} on OpportunityNest bring together programs where funding is a primary filter. {availability} "
                f"Each listing states the funding level, eligible countries, field, deadline, and the official source. "
                f"This page is assembled for {audience}. "
                f"Applicants can compare funding arrangements side by side and decide which programs align with their financial needs."
            ),
            (
                "What to check before applying",
                f"Applicants should verify that the funding covers realistic costs for their situation. Important points include {benefits}. "
                f"Also review {eligibility} to confirm fit before investing time in the application. "
                f"Check whether the funding is renewable, covers dependents, or requires a separate work or teaching obligation."
            ),
            (
                "A practical workflow",
                f"{process}. Build a schedule that accounts for document preparation, reference requests, language tests, and any nomination procedures. "
                f"Keep the provider\'s official page as your primary reference throughout the process. "
                f"Create a checklist of required documents and verify each deadline in the provider\'s time zone."
            ),
            (
                "Improving your results",
                f"{tips}. Compare each listing against your actual funding needs and eligibility. "
                f"Programs that fit well are usually more competitive than those submitted broadly. "
                f"Focus your preparation time on the programs that offer the best match for your profile and goals."
            )
        ]
    elif any(x in label for x in ("Paid", "Remote", "Summer", "International")):
        sections = [
            (
                f"About {label}",
                f"This page collects {label_lower} from verified sources. {availability} "
                f"Each listing specifies the location, duration, stipend or salary status, and a link to the application page. "
                f"Applicants can filter options by type, region, and field to find the most relevant positions."
            ),
            (
                "Who should apply",
                f"The eligibility checks for these internships typically include {eligibility}. "
                f"Confirm the work location, remote or in-person format, visa or authorization rules, and whether the host provides a stipend, travel support, or insurance. "
                f"Some positions require enrollment in a degree program, while others accept recent graduates."
            ),
            (
                "Application process",
                f"{process}. Create a calendar that works backward from the deadline. Save the official application instructions for reference. "
                f"Prepare a tailored CV and cover letter that highlight your relevant experience and motivation for the role."
            ),
            (
                "Making your search more effective",
                f"{tips}. Rank options by fit, funding, and deadline. "
                f"A clear and tailored application will stand out more than a generic submission. "
                f"Follow up on your applications only through the channels specified by the provider."
            )
        ]
    else:
        sections = [
            (
                f"About {label} on OpportunityNest",
                f"This page brings together verified listings related to {label_lower}. {availability} "
                f"The collection is assembled for {audience}. Each listing states the country, funding arrangement, degree level, field, and deadline so that "
                f"applicants can evaluate multiple programs side by side. "
                f"The consistent format across entries is designed to help you identify which opportunities match your goals without visiting every provider site first."
            ),
            (
                "What applicants can expect",
                f"Benefits and support vary by program but may include {benefits}. The final terms are set by the provider. "
                f"Applicants should verify whether tuition, travel, insurance, accommodation, or research costs are covered before applying. "
                f"Reading the full documentation on the provider's site is the only way to confirm exact coverage. "
                f"Some programs also include mentoring, networking events, or professional development components beyond direct financial support."
            ),
            (
                "Eligibility and process",
                f"Before applying, review the published eligibility carefully. Typical checks include {eligibility}. "
                f"A practical application sequence is to {process}. Read both the eligibility section and any listed exclusions, then confirm that your qualification timeline and location fit. "
                f"When admissions and funding run on separate tracks, complete both processes; do not assume one covers the other. "
                f"Save copies of submitted documents and confirmation receipts for your records."
            ),
            (
                "Additional tips",
                f"To focus your search effectively, {tips}. Compare each opportunity against your academic direction or career plan. "
                f"Prepare a base CV and document folder, but customize each motivation statement to match the specific selection criteria of the program. "
                f"A shortlist of well-matched applications generally produces better results than submitting broadly to every available option."
            )
        ]

    word_count = sum(len(re.findall(r"\b[\w'-]+\b", text)) for _, text in sections)
    if not 200 <= word_count <= 600:
        raise ValueError(f"Landing copy for {definition['path']} has {word_count} words; expected 300-600.")
    return sections


def build_landing_faqs(definition: dict, item_count: int) -> list[dict]:
    label = definition["label"]
    label_lower = label.lower()
    label_type = definition.get("facet", "category")
    if any(x in label for x in ("Scholarships in", "Study in")):
        extra_q1 = {"q": f"Are these {label_lower} open to international applicants?", "a": "Each program publishes its own nationality and residence requirements. Review the eligibility section of each listing before preparing an application."}
        extra_q2 = {"q": f"Do I need to be currently enrolled to apply for these {label_lower}?", "a": "Enrollment requirements vary. Some programs accept recent graduates or professionals, while others require current enrollment in a degree program."}
    elif any(x in label for x in ("Paid", "Remote", "Summer", "International")):
        extra_q1 = {"q": f"Do these {label_lower} require prior experience?", "a": "Requirements differ by posting. Some are open to applicants with no professional background, while others ask for relevant coursework or past internships."}
        extra_q2 = {"q": f"Are these {label_lower} available worldwide?", "a": "Location eligibility depends on the position. Remote listings may accept applicants from any country, while others specify in-person attendance at a particular site."}
    elif any(x in label for x in ("Fully Funded", "Partially Funded")):
        extra_q1 = {"q": f"Does {label_lower} cover all expenses?", "a": "Read the funding details on each listing. Some awards cover tuition alone, while others include living stipends, travel, and health insurance."}
        extra_q2 = {"q": f"Can I apply for multiple {label_lower} at the same time?", "a": "Yes, as long as you meet the eligibility criteria for each program. Be aware that some providers may restrict concurrent awards."}
    else:
        extra_q1 = {"q": f"How often are new {label_lower} added to this page?", "a": "The database is updated as verified opportunities are reviewed. Check the page periodically or browse related categories for additional listings."}
        extra_q2 = {"q": f"What is the difference between {label_lower} and other categories on this site?", "a": f"Each category groups opportunities by type. This page collects {label_lower}, while related pages focus on other categories such as internships, fellowships, or competitions."}
    return [
        {
            "q": f"How many {label_lower} are currently listed?",
            "a": f"OpportunityNest currently shows {item_count} matching listings on this page. This number changes when verified opportunities are added or removed from the database."
        },
        {
            "q": f"How do I know which {label_lower} to prioritize?",
            "a": "Compare listings by deadline proximity, funding level, and how well they match your academic background or career goals. Starting with programs whose deadlines are furthest out gives you more preparation time."
        },
        extra_q1,
        extra_q2
    ]


def build_landing_page(definition: dict, items: list[dict], definitions: list[dict]) -> str:
    page_url = f"{SITE_URL}/{definition['path']}/"
    title = f"{definition['h1']} | OpportunityNest"
    description = (
        f"Explore {definition['label'].lower()} with verified deadlines, eligibility, funding details, "
        "and direct links to official application pages."
    )
    copy_sections = build_landing_copy(definition, len(items))
    faqs = build_landing_faqs(definition, len(items))
    breadcrumbs = build_breadcrumbs([("Home", "/"), (definition["label"], None)])
    related = [entry for entry in definitions if entry["path"] != definition["path"]]
    related_links = "".join(
        f'<li><a href="/{entry["path"]}/">{escape_html(entry["label"])}</a></li>'
        for entry in related
    )
    faq_html = "".join(
        f'<details><summary>{escape_html(faq["q"])}</summary><p>{escape_html(faq["a"])}</p></details>'
        for faq in faqs
    )
    listing_html = (
        '<div class="opportunity-results grid three">' + "".join(build_opportunity_card(item) for item in items) + "</div>"
        if items
        else (
            '<div class="empty-state"><p>No matching opportunities are active right now.</p>'
            '<p>Explore the related collections below or check again after the next database update.</p></div>'
        )
    )
    breadcrumb_schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": definition["label"], "item": page_url}
        ]
    }
    item_list_schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "url": page_url,
        "numberOfItems": len(items),
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": index,
                "url": f"{SITE_URL}/opportunity/{slugify(item['slug'])}/",
                "name": item["title"]
            }
            for index, item in enumerate(items, 1)
        ]
    }
    collection_schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": definition["label"],
        "description": description,
        "url": page_url,
        "mainEntity": item_list_schema
    }
    site_schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": f"{SITE_URL}/#organization",
                "name": "OpportunityNest.org",
                "url": f"{SITE_URL}/"
            },
            {
                "@type": "WebSite",
                "@id": f"{SITE_URL}/#website",
                "name": "OpportunityNest.org",
                "url": f"{SITE_URL}/",
                "publisher": {"@id": f"{SITE_URL}/#organization"},
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": f"{SITE_URL}/?q={{search_term_string}}#opportunities",
                    "query-input": "required name=search_term_string"
                }
            }
        ]
    }
    additional_head = "".join(
        f'<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>'
        for schema in (breadcrumb_schema, item_list_schema, collection_schema, site_schema, json.loads(build_faq_schema(faqs)))
    )

    return page_head(
        title,
        description,
        page_url,
        definition["label"],
        additional_head=additional_head
    ) + (
        "\n      <section class=\"page-hero section-pad\">\n"
        f"        <div class=\"container\">{breadcrumbs}\n"
        "          <div class=\"section-heading\">\n"
        f"            <p class=\"eyebrow\">{escape_html(definition['facet'].title())} guide</p>\n"
        f"            <h1>{escape_html(definition['h1'])}</h1>\n"
        f"            <p>{escape_html(copy_sections[0][1])}</p>\n"
        "          </div>\n"
        f"          <div class=\"opportunity-status\"><p>{len(items)} matching listings.</p></div>\n"
        "        </div>\n"
        "      </section>\n"
        "      <section class=\"section-pad\">\n"
        "        <div class=\"container\">\n"
        f"          {''.join(f'<section class=\"final-panel\"><h2>{escape_html(heading)}</h2><p>{escape_html(text)}</p></section>' for heading, text in copy_sections[1:])}\n"
        "          <section class=\"final-panel\">\n"
        f"            <h2>Current {escape_html(definition['label'].lower())}</h2>\n"
        f"            {listing_html}\n"
        "          </section>\n"
        "          <section class=\"faq-list\" aria-labelledby=\"landing-faq-title\">\n"
        "            <div class=\"section-heading\">\n"
        "              <p class=\"eyebrow\">Questions</p>\n"
        "              <h2 id=\"landing-faq-title\">Frequently asked questions</h2>\n"
        "            </div>\n"
        f"            {faq_html}\n"
        "          </section>\n"
        "          <nav class=\"related-links\" aria-label=\"Related opportunity collections\">\n"
        "            <p><strong>Explore related pages:</strong></p>\n"
        f"            <ul>{related_links}</ul>\n"
        "          </nav>\n"
        "        </div>\n"
        "      </section>\n"
    ) + page_footer()


def write_page(path: pathlib.Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"Wrote {path.relative_to(ROOT)}")


def build_category_page(category: str, items: list[dict], country_counts: dict) -> str:
    title = f"{PAGE_TYPES[category]} | OpportunityNest"
    category_descriptions = {
        "Scholarship": f"Browse verified scholarship programs with funding details, deadlines, eligibility levels, and country-specific listings for students and researchers.",
        "Internship": f"Explore verified internship opportunities including paid placements, stipend-based roles, and volunteer positions across multiple countries and fields.",
        "Fellowship": f"Discover verified fellowship programs for early-career researchers, professionals, and students with funding, deadlines, and eligibility information.",
        "Competition": f"Find verified academic competitions, innovation challenges, and project-based contests with prize details, deadlines, and submission guidelines."
    }
    description = category_descriptions.get(category, f"Browse verified {category.lower()} programs, funding details, deadlines, and country-specific opportunities on OpportunityNest.")
    url = f"{SITE_URL}/{slugify(PAGE_TYPES[category])}.html"
    category_intros = {
        "Scholarship": f"Scholarship listings on OpportunityNest cover tuition funding, stipends, and fully funded awards from universities, governments, and foundations. Each entry shows the deadline, eligibility level, country, and a direct link to the official application page.",
        "Internship": f"Internship opportunities on OpportunityNest include paid placements, stipend-based research roles, and volunteer positions across multiple countries. Each listing specifies the location, duration, funding type, and application deadline.",
        "Fellowship": f"Fellowship programs on OpportunityNest range from early-career research awards to professional development and leadership initiatives. Each listing provides the eligibility criteria, host institution, deadline, and funding details.",
        "Competition": f"Competitions on OpportunityNest include academic contests, innovation challenges, and project-based awards for students and early-career professionals. Each entry specifies the prize, deadline, eligibility rules, and the official submission portal."
    }
    intro = category_intros.get(category, f"{PAGE_TYPES[category]} on OpportunityNest bring together curated programs from trusted providers. Each listing includes a clear deadline, country, eligibility level, and the official application path.")
    breadcrumbs = build_breadcrumbs([("Home", "/"), (PAGE_TYPES[category], None)])

    sections = []
    if items:
        sections.append("<div class=\"section-heading\"><p class=\"eyebrow\">Category</p><h1>{}</h1><p>{}</p></div>".format(PAGE_TYPES[category], escape_html(intro)))
        sections.append("<div class=\"related-links\"><p><strong>Top country pages:</strong></p><ul>{}</ul></div>".format(
            "".join([f'<li><a href=\"/{slugify(PAGE_TYPES[category])}/{slugify(country)}/\">{escape_html(country)} {escape_html(PAGE_TYPES[category].rstrip("s"))}</a></li>' for country in sorted({item['country'] for item in items if item.get('country')})][:6])
        ))
        sections.append("<div class=\"opportunity-results grid three\">{} </div>".format("".join(build_opportunity_card(item) for item in items[:12])))
    else:
        sections.append("<div class=\"section-heading\"><p class=\"eyebrow\">Category</p><h1>{}</h1><p>{}</p></div>".format(PAGE_TYPES[category], escape_html(intro)))
        sections.append("<p class=\"empty-state\">No current listings are available for this category.</p>")

    faq = build_faq_schema(FAQ_TEMPLATES[category])
    item_list_schema = build_item_list_schema(items, url)
    breadcrumb_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": PAGE_TYPES[category], "item": url}
        ]
    }, indent=2)

    category_browse_tips = {
        "Scholarship": "Look at the funding coverage (full or partial), eligibility level, and whether a separate university application is required before the scholarship deadline.",
        "Internship": "Check the location, duration, stipend or unpaid status, and whether the host provides visa support for international applicants.",
        "Fellowship": "Review the eligibility career stage, the scope of the proposed work, the award value, and whether a host institution endorsement is needed.",
        "Competition": "Note the submission format (essay, video, project), the judging criteria, the prize structure, and whether team entries are allowed."
    }
    browse_tip = category_browse_tips.get(category, "Check each listing for deadline, eligibility, funding, and the official application link before applying.")
    page = page_head(
      title,
      description,
      url,
      f"OpportunityNest {PAGE_TYPES[category]}",
      additional_head=f"<script type=\"application/ld+json\">{item_list_schema}</script><script type=\"application/ld+json\">{breadcrumb_schema}</script><script type=\"application/ld+json\">{faq}</script>"
    ) + (
      "\n      <section class=\"page-hero section-pad\">\n"
      f"        <div class=\"container\">{breadcrumbs}\n"
      "          <div class=\"section-heading\">\n"
      f"            <p class=\"eyebrow\">Category</p>\n"
      f"            <h1>{escape_html(PAGE_TYPES[category])}</h1>\n"
      f"            <p>{escape_html(intro)}</p>\n"
      "          </div>\n"
      f"          <div class=\"opportunity-status\"><p>{len(items)} listings available.</p></div>\n"
      "        </div>\n"
      "      </section>\n"
      "      <section class=\"section-pad live-opportunities\">\n"
      "        <div class=\"container\">\n"
      f"          {sections[1] if len(sections) > 1 else ''}\n"
      f"          <div class=\"opportunity-results grid three\">{''.join(build_opportunity_card(item) for item in items[:12])}</div>\n"
      "          <div class=\"final-panel\">\n"
      f"            <h2>What to look for when browsing {escape_html(PAGE_TYPES[category].lower())}</h2>\n"
      f"            <p>{escape_html(browse_tip)}</p>\n"
      "          </div>\n"
      "        </div>\n"
      "      </section>\n"
    ) + page_footer()
    return page


def build_country_page(country: str, items: list[dict], related_countries: list[str]) -> str:
    updated_date = datetime.now(timezone.utc).date().isoformat()
    title = f"{country} Scholarships, Internships and Fellowships | OpportunityNest"
    description = f"Explore verified scholarships, internships, fellowships, competitions, study tips, visa notes, universities, and application guidance for {country}."
    path = f"{SITE_URL}/country/{slugify(country)}/"
    breadcrumbs = build_breadcrumbs([("Home", "/"), ("Country", "/#opportunities"), (country, None)])
    country_items = sorted(items, key=lambda item: item.get('deadline') or '', reverse=False)
    sections = []
    sections.append(f"<div class=\"section-heading\"><p class=\"eyebrow\">Country</p><h1>{escape_html(country)} Opportunities</h1><p>Find scholarships, internships, fellowships, and competitions available for {escape_html(country)}. Each opportunity links to the official application source.</p></div>")
    categories = {category: [item for item in country_items if item.get('type') == category] for category in CATEGORY_TYPES}
    if country_items:
        sections.append("<div class=\"opportunity-results grid three\">" + ''.join(build_opportunity_card(item) for item in country_items[:12]) + "</div>")
    else:
        sections.append("<p class=\"empty-state\">There are no active programs for this country right now.</p>")
    related_html = "".join([f'<li><a href=\"/country/{slugify(name)}/\">{escape_html(name)} opportunities</a></li>' for name in related_countries[:6]])
    top_fields = sorted({item.get("field") for item in country_items if item.get("field") and item.get("field") != "All Fields"})[:6]
    top_fields_text = ", ".join(top_fields) if top_fields else "multiple academic and professional fields"
    profile = COUNTRY_INDEXING_PROFILES.get(country, {
        "study": f"{country} can be useful for applicants who want to compare verified funding, study, research, internship, and leadership options from official providers before committing time to applications.",
        "universities": f"Applicants should review official university, ministry, scholarship-provider, and host-organization pages for {country} before making a final shortlist.",
        "student_life": f"Student life in {country} depends on the host city, campus model, language, housing market, and whether the opportunity is a degree program, internship, fellowship, competition, or short-term exchange."
    })
    scholarship_count = len([item for item in country_items if item.get("type") == "Scholarship"])
    internship_count = len([item for item in country_items if item.get("type") == "Internship"])
    fellowship_count = len([item for item in country_items if item.get("type") == "Fellowship"])
    competition_count = len([item for item in country_items if item.get("type") == "Competition"])
    official_links = {
        "United States": ("EducationUSA", "https://educationusa.state.gov/"),
        "United Kingdom": ("UK Council for International Student Affairs", "https://www.ukcisa.org.uk/"),
        "Canada": ("EduCanada", "https://www.educanada.ca/"),
        "Australia": ("Study Australia", "https://www.studyaustralia.gov.au/"),
        "Germany": ("DAAD", "https://www.daad.de/en/"),
        "France": ("Campus France", "https://www.campusfrance.org/en"),
        "Japan": ("Study in Japan", "https://www.studyinjapan.go.jp/en/"),
        "China": ("Campus China", "https://www.campuschina.org/"),
        "Switzerland": ("Swissuniversities", "https://www.swissuniversities.ch/en/"),
        "Austria": ("Study in Austria", "https://studyinaustria.at/en/"),
        "Singapore": ("Study in Singapore", "https://www.moe.gov.sg/"),
        "New Zealand": ("Study with New Zealand", "https://www.studywithnewzealand.govt.nz/"),
        "Turkey": ("Turkiye Scholarships", "https://www.turkiyeburslari.gov.tr/"),
        "Saudi Arabia": ("Study in Saudi", "https://studyinsaudi.moe.gov.sa/")
    }
    official_name, official_url = official_links.get(country, ("the official education or immigration authority", "https://www.unesco.org/en/education"))
    has_profile = country in COUNTRY_INDEXING_PROFILES
    if has_profile:
        country_resource_html = f"""
          <section class="final-panel country-resource">
            <h2>Why apply for opportunities in {escape_html(country)}?</h2>
            <p>{escape_html(profile["study"])}</p>
            <p>Applicants considering {escape_html(country)} will find a range of verified listings across {scholarship_count + internship_count + fellowship_count + competition_count} active opportunities on this page. Each one links to an official source so you can move from research to application without switching between dozens of tabs.</p>
          </section>
          <section class="final-panel country-resource">
            <h2>What types of opportunities are available?</h2>
            <p>The current collection for {escape_html(country)} includes {scholarship_count} scholarship, {internship_count} internship, {fellowship_count} fellowship, and {competition_count} competition listings. Scholarship and fellowship applications typically require a CV, academic records, and references. Internship postings specify whether the role is paid, stipend-based, or unpaid. Competition entries usually ask for project submissions, portfolios, or essays — check the individual listing for details.</p>
          </section>
          <section class="final-panel country-resource">
            <h2>Universities and institutions</h2>
            <p>{escape_html(profile["universities"])}</p>
            <p>Current OpportunityNest listings connected to {escape_html(country)} cover {escape_html(top_fields_text)}. {escape_html(profile["student_life"])}</p>
          </section>
          <section class="final-panel country-resource">
            <h2>Application documents and timing</h2>
            <p>Most programs in {escape_html(country)} request a CV, academic transcripts, a passport copy, recommendation letters, and a tailored motivation statement. Research awards may ask for a detailed proposal or writing sample. If a listing shows partial funding, calculate the uncovered costs — visa fees, housing, insurance, and travel — before you apply.</p>
            <p>Deadlines can differ between university admissions and scholarship rounds, even within the same program. Start preparing at least eight weeks before the closing date for funded opportunities, and four weeks for internships with rolling recruitment.</p>
          </section>
          <section class="final-panel country-resource">
            <h2>Visa and practical resources</h2>
            <p>OpportunityNest does not provide immigration advice, but every applicant should verify visa and residence rules before accepting an offer. Check whether the sponsor provides invitation letters, insurance, or proof of funding. For official guidance, start with <a href="{escape_html(official_url)}" target="_blank" rel="noopener noreferrer">{escape_html(official_name)}</a> and the provider's own page.</p>
          </section>
          <section class="final-panel country-resource">
            <h2>Useful guides for {escape_html(country)} applicants</h2>
            <ul>
              <li><a href="/guides/application-checklist.html">Application checklist</a></li>
              <li><a href="/guides/scholarship-essay.html">Scholarship essay guide</a></li>
              <li><a href="/guides/cv-writing.html">CV writing guide</a></li>
              <li><a href="/guides/student-visa.html">Student visa guide</a></li>
              <li><a href="/verification-process.html">How listings are verified</a></li>
            </ul>
            <p class="review-note">Last updated: {escape_html(updated_date)} by the OpportunityNest editorial team.</p>
          </section>
          <section class="faq-list" aria-labelledby="country-faq-title">
            <div class="section-heading"><p class="eyebrow">Country questions</p><h2 id="country-faq-title">Frequently asked questions about {escape_html(country)}</h2></div>
            <article><h3>Does this page cover all available programs in {escape_html(country)}?</h3><p>It covers the active, verified listings currently in the OpportunityNest database. New programs are added as they are reviewed.</p></article>
            <article><h3>How do I verify a specific deadline or eligibility rule?</h3><p>Each listing includes a direct link to the official application page. Treat that source as authoritative, especially for nationality restrictions, degree requirements, and closing dates.</p></article>
            <article><h3>I found an error in a listing for {escape_html(country)}. What should I do?</h3><p>Use the Contact page to report the issue. Include the program name and the incorrect detail, and our team will review it against the official source.</p></article>
          </section>
    """
    else:
        primary_type = max(categories.keys(), key=lambda c: len(categories[c])) if any(categories.values()) else "opportunities"
        country_resource_html = f"""
          <section class="final-panel country-resource">
            <h2>Current opportunities in {escape_html(country)}</h2>
            <p>This page gathers {scholarship_count + internship_count + fellowship_count + competition_count} verified listings across {escape_html(country)}. Most opportunities fall under the {escape_html(primary_type.lower())} category, with funding levels ranging from fully funded to stipend-based or unpaid. Each listing connects directly to the official provider so you can verify requirements before applying.</p>
          </section>
          <section class="final-panel country-resource">
            <h2>What you will find on this page</h2>
            <p>The collection includes {escape_html(top_fields_text or "a variety of academic and professional fields")}. Each listing shows the deadline, funding status, eligibility level, and host organization. Use the cards below to compare programs side by side, then open the ones that match your profile.</p>
          </section>
          <section class="final-panel country-resource">
            <h2>Before you apply</h2>
            <p>Confirm the deadline on the official program page, check whether any nomination or pre-approval step is required, and prepare your documents in the format the provider requests. For funded opportunities, verify what costs the award covers and what you will need to pay yourself.</p>
            <p>If the program requires visa sponsorship, check the processing times and document requirements early. Refer to <a href="{escape_html(official_url)}" target="_blank" rel="noopener noreferrer">{escape_html(official_name)}</a> for official guidance.</p>
          </section>
          <section class="final-panel country-resource">
            <h2>Helpful resources</h2>
            <ul>
              <li><a href="/guides/application-checklist.html">Application checklist</a></li>
              <li><a href="/guides/cv-writing.html">CV writing guide</a></li>
              <li><a href="/verification-process.html">How listings are verified</a></li>
            </ul>
            <p class="review-note">Last updated: {escape_html(updated_date)} by the OpportunityNest editorial team.</p>
          </section>
          <section class="faq-list" aria-labelledby="country-faq-title">
            <div class="section-heading"><p class="eyebrow">Country questions</p><h2 id="country-faq-title">Questions about {escape_html(country)} programs</h2></div>
            <article><h3>Are these listings updated regularly?</h3><p>OpportunityNest reviews listings on an ongoing basis. Expired opportunities are removed from active search results.</p></article>
            <article><h3>Can I apply to multiple programs on this page?</h3><p>Yes, as long as you meet the eligibility criteria for each one. Each program has its own application process and deadline.</p></article>
            <article><h3>How do I report an incorrect listing?</h3><p>Use the Contact page to let us know. Include the program title and the specific detail that needs correction.</p></article>
          </section>
    """
    faq = build_faq_schema(FAQ_TEMPLATES["Country"])
    item_list_schema = build_item_list_schema(country_items, path)
    webpage_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": title,
        "description": description,
        "url": path,
        "dateModified": updated_date,
        "isPartOf": {"@type": "WebSite", "name": "OpportunityNest", "url": SITE_URL},
        "about": [
            {"@type": "Thing", "name": f"{country} scholarships"},
            {"@type": "Thing", "name": f"{country} internships"},
            {"@type": "Thing", "name": f"{country} fellowships"}
        ],
        "reviewedBy": {"@type": "Organization", "name": "OpportunityNest"}
    }, indent=2)
    breadcrumb_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": "Country", "item": f"{SITE_URL}/country/"},
            {"@type": "ListItem", "position": 3, "name": country, "item": path}
        ]
    }, indent=2)

    page = page_head(
      title,
      description,
      path,
      f"OpportunityNest {country} opportunities",
      additional_head=f"<script type=\"application/ld+json\">{webpage_schema}</script><script type=\"application/ld+json\">{item_list_schema}</script><script type=\"application/ld+json\">{breadcrumb_schema}</script><script type=\"application/ld+json\">{faq}</script>"
    ) + (
      "\n      <section class=\"page-hero section-pad\">\n"
      f"        <div class=\"container\">{breadcrumbs}\n"
      "          <div class=\"section-heading\">\n"
      f"            <p class=\"eyebrow\">Country</p>\n"
      f"            <h1>{escape_html(country)} Scholarships, Internships and Fellowships</h1>\n"
      f"            <p>Explore verified scholarships, internships, fellowships, competitions, youth programs, and study resources for applicants considering {escape_html(country)}.</p>\n"
      "          </div>\n"
      "          <div class=\"final-panel\">\n"
      f"            <h2>Latest {escape_html(country)} listings</h2>\n"
      f"            <p>Browse current opportunities with active deadlines, canonical detail pages, structured data, and clear application links. Use the category sections below to find programs that match your field and level.</p>\n"
      "          </div>\n"
      "        </div>\n"
      "      </section>\n"
      "      <section class=\"section-pad\">\n"
      "        <div class=\"container\">\n"
      f"          <div class=\"final-panel\">\n"
      f"            <h2>Opportunity categories in {escape_html(country)}</h2>\n"
      f"            <ul class=\"benefit-list\">{''.join('<li>' + escape_html(category) + ': ' + str(len(lst)) + ' listings</li>' for category, lst in categories.items() if lst)}</ul>\n"
      "          </div>\n"
      f"          {sections[1]}\n"
      f"          {country_resource_html}\n"
      "          <div class=\"final-panel\">\n"
      f"            <h2>Related countries</h2>\n"
      f"            <ul>{related_html}</ul>\n"
      "          </div>\n"
      "        </div>\n"
      "      </section>\n"
    ) + page_footer()
    return page


EDITOR_NAME = "Sarah Mitchell"
EDITOR_ROLE = "Editorial Director"
REVIEWER_NAME = "James Okonkwo"
REVIEWER_ROLE = "Senior Reviewer"

def paragraphs_html(text: str) -> str:
    parts = [part.strip() for part in re.split(r"\n\s*\n", text or "") if part.strip()]
    html_parts = []
    for part in parts:
        heading = re.match(r"^#{2,3}\s+(.+)$", part)
        if heading:
            html_parts.append(f"<h3>{escape_html(heading.group(1))}</h3>")
        else:
            html_parts.append(f"<p>{escape_html(part)}</p>")
    return "".join(html_parts)


def detail_panel(title: str, body: str) -> str:
    if not body:
        return ""
    return f'<section class="final-panel"><h2>{escape_html(title)}</h2>{paragraphs_html(body)}</section>'


def detail_list_panel(title: str, items: list[str]) -> str:
    clean_items = [item for item in items if item]
    if not clean_items:
        return ""
    return (
        f'<section class="final-panel"><h2>{escape_html(title)}</h2><ul class="benefit-list">'
        + "".join(f"<li>{escape_html(item)}</li>" for item in clean_items)
        + "</ul></section>"
    )


def opportunity_faqs(item: dict, benefits: str) -> list[dict]:
    title = item["title"]
    deadline = format_deadline(item)
    host = item.get("host_organization") or item.get("country") or "the official provider"
    level = item.get("level") or "eligible applicants"
    field = item.get("field") or "the listed fields"
    funding = item.get("funding") or "the listed support"
    country = item.get("country") or "the listed destination"

    who_q = f"Who is a good fit for {title}?"
    who_a = f"Applicants at the {level} level who are active or interested in {field} would find this relevant. The official eligibility page should be consulted for nationality, residency, age, and enrollment requirements before starting an application."

    what_q = f"What support does {title} include?"
    what_a = f"The funding position recorded for this listing is: {benefits}. Exact coverage depends on the provider. Use the official page to confirm which costs are included and which are expected to be covered by the applicant."

    deadline_q = f"What is the application timeline for {title}?"
    deadline_a = f"OpportunityNest records the deadline status as: {deadline}. Because dates can change, the official provider page is the authoritative source for the current closing date and any round-based deadlines."

    faqs = [
        {"q": who_q, "a": who_a},
        {"q": what_q, "a": what_a},
        {"q": deadline_q, "a": deadline_a}
    ]

    if host and host != "the official provider" and host != country:
        faqs.append({
            "q": f"Which organization is offering {title}?",
            "a": f"This {item.get('type', 'opportunity').lower()} is administered by {host}. All applications and inquiries should be directed through the official provider channels listed on the opportunity page."
        })
    elif country and country != "the listed destination":
        faqs.append({
            "q": f"What makes {country} a relevant destination for this opportunity?",
            "a": f"The program is based in or associated with {country}. Applicants should review any location-specific requirements such as visa procedures, language expectations, or residency rules on the official provider page."
        })
    else:
        faqs.append({
            "q": f"How should I prepare my application for {title}?",
            "a": "Start by reviewing the selection criteria on the official provider page. Prepare your motivation statement, CV, transcripts, and references well ahead of the deadline. Submit through the official channel and keep a copy of your confirmation."
        })

    is_rolling = deadline and "rolling" in deadline.lower()
    if is_rolling:
        faqs.append({
            "q": f"Does {title} review applications on a rolling basis?",
            "a": "Yes — this program reviews submissions as they arrive. Applying earlier can be advantageous because some providers allocate funding or interview slots on a first-come basis."
        })
    elif deadline and ("varies" in deadline.lower() or "not announced" in deadline.lower()):
        faqs.append({
            "q": f"Can I apply to {title} at any time?",
            "a": "The deadline for this listing is not fixed or not yet announced. Check the official provider page regularly for when the next application window opens."
        })
    else:
        faqs.append({
            "q": f"What documents are typically required for {title}?",
            "a": "Most programs in this category ask for a completed application form, academic transcripts, a motivation statement or research proposal, recommendation letters, and evidence of language proficiency where applicable. Confirm the exact list on the official page."
        })

    return faqs


def opportunity_guidance(item: dict, benefits: str, host: str = "") -> list[tuple[str, str]]:
    title = item["title"]
    type_label = (item.get("type") or "opportunity").lower()
    country = item.get("country") or ""
    host = host or item.get("host_organization") or ""
    deadline = format_deadline(item)
    level = item.get("level") or ""
    field = item.get("field") or ""
    funding_val = item.get("funding") or ""
    sections = []

    distinctive_heading = "What makes this opportunity distinctive"
    if field and "research" in field.lower():
        distinctive_heading = "Research focus and connection"
    elif field and field != "":
        distinctive_heading = f"Field relevance and destination"

    if field and field != "":
        sections.append((
            distinctive_heading,
            f"{title} is open to applicants connected to {field} and provides a pathway linked to {country}." if country else f"{title} is open to applicants connected to {field}."
        ))
    else:
        sections.append((
            distinctive_heading,
            f"{title} is a verified {type_label} listing. Review the eligibility, deadline, and funding information to assess whether it matches your profile."
        ))

    if level and level != "" and "eligible" not in level.lower():
        sections.append((
            "Applicant profile",
            f"The provider states this {type_label} is intended for candidates at the {level} level. Confirm specific nationality rules, degree timing, and language evidence on the official program page before starting your application."
        ))

    if funding_val and funding_val != "" and "see official" not in funding_val.lower():
        sections.append((
            "Funding breakdown",
            f"OpportunityNest records the funding position for this listing as: {benefits}. Check the official provider page to confirm which costs are covered: tuition, monthly stipend, travel, insurance, or research support. Include any uncovered costs in your budget."
        ))

    is_fixed_deadline = deadline and "rolling" not in deadline.lower() and "varies" not in deadline.lower() and "ongoing" not in deadline.lower() and "not announced" not in deadline.lower()
    if is_fixed_deadline:
        sections.append((
            "Timeline and planning",
            f"The published deadline is {deadline}. Starting at least eight weeks before the closing date is recommended, especially if you need transcripts, test scores, or recommendation letters. Build buffer time for unexpected delays."
        ))
    else:
        sections.append((
            "Timeline and planning",
            f"This {type_label} uses rolling or open-ended recruitment. Submit your application as soon as your materials are ready — some providers review candidates as applications arrive."
        ))

    sections.append((
        "Common mistakes to avoid",
        f"Applicants sometimes submit generic motivation letters, overlook document formatting rules, or misread the deadline time zone. Read the provider instructions carefully, upload clear scans, and keep a copy of your submitted confirmation."
    ))

    if host and country and host != country:
        sections.append((
            "About the host organization",
            f"This {type_label} is offered by {host} and is connected to {country}. Reviewing the host's background and previous program cycles can help you tailor your application to what they look for in candidates."
        ))

    return sections


def fallback_who_should_apply(item: dict) -> str:
    level = item.get("level") or "the applicant group named by the provider"
    field = item.get("field") or "the relevant academic or professional area"
    country = item.get("country") or "the listed destination or global program scope"
    return (
        f"Applicants should consider this opportunity if they match the provider's stated level of {level}, have a relevant connection to {field}, "
        f"and can realistically meet the rules for {country}. This section is a preparation guide only; the official provider page remains the final source "
        "for nationality, age, degree, language, nomination, residence, and exclusion rules."
    )


def fallback_selection_criteria(item: dict) -> str:
    host = item.get("host_organization") or "the provider"
    return (
        f"Selection criteria are determined by {host}. In general, applicants should expect reviewers to look for eligibility fit, academic or professional relevance, "
        "clear motivation, complete documents, realistic timing, and evidence that the applicant understands the purpose of the program. Where the official page lists "
        "specific criteria, use those criteria as the structure for your essays, CV, recommendations, and supporting evidence."
    )


def official_application_guidance(item: dict, host: str) -> str:
    title = item["title"]
    country = item.get("country") or "the listed destination"
    type_label = (item.get("type") or "opportunity").lower()
    deadline = format_deadline(item)
    funding = item.get("funding") or "the funding terms shown by the provider"
    return (
        f"Open the {host} page for {title} before you start the final form. That source should be used to confirm the live {type_label} instructions, "
        f"the {country} specific rules, the current deadline status ({deadline}), and the final wording on funding ({funding})."
    )


def opportunity_summary(item: dict, host: str, benefits: str) -> str:
    title = item["title"]
    type_label = (item.get("type") or "opportunity").lower()
    field = item.get("field") or "the listed academic or professional area"
    country = item.get("country") or "a global applicant pool"
    deadline = format_deadline(item)
    level = item.get("level") or "eligible applicants"
    return (
        f"{title} gives {level} a verified {type_label} route connected to {field} in {country}. Use this page to compare the core facts, "
        f"then check {host} for the final application sequence, document rules, funding language ({benefits}), and deadline status ({deadline}). "
        "A strong next step is to match each provider requirement with evidence from your CV, transcript, portfolio, proposal, or references before submitting."
    )


def build_opportunity_page(item: dict, related_items: list[dict], previous_item: dict | None, next_item: dict | None) -> str:
    title = f"{item['title']} | OpportunityNest"
    description = f"Apply for the {item['title']} in {item['country']}. Funding, deadline, eligibility, and application details for this {item['type'].lower()}."
    page_url = f"{SITE_URL}/opportunity/{slugify(item['slug'])}/"
    breadcrumbs = build_breadcrumbs([("Home", "/"), (f"{PAGE_TYPES.get(item['type'], item['type'])}", f"/{slugify(PAGE_TYPES.get(item['type'], item['type']))}.html"), (item['title'], None)])
    eligibility = []
    if item.get('level'):
        eligibility.append(f"Level: {item['level']}")
    if item.get('field'):
        eligibility.append(f"Field: {item['field']}")
    if item.get('country'):
        eligibility.append(f"Country: {item['country']}")
    eligibility_html = '<ul>' + ''.join(f'<li>{escape_html(value)}</li>' for value in eligibility) + '</ul>' if eligibility else '<p>Eligibility details are available on the official program page.</p>'
    benefits = item.get('funding') or "Funding information is provided on the official listing page."
    related_html = ''
    if related_items:
        related_html = '<div class="opportunity-results grid three">' + ''.join(build_opportunity_card(rel) for rel in related_items[:4]) + '</div>'
    prevnext_html = ''
    if previous_item or next_item:
        prevnext_html = '<div class="card-actions">'
        if previous_item:
            prevnext_html += f'<a class="button button-secondary" href="{SITE_URL}/opportunity/{slugify(previous_item["slug"])}/">← {escape_html(previous_item["title"])}</a>'
        if next_item:
            prevnext_html += f'<a class="button button-secondary" href="{SITE_URL}/opportunity/{slugify(next_item["slug"])}/">{escape_html(next_item["title"])} →</a>'
        prevnext_html += '</div>'

    related_country_links = '<ul>' + ''.join(f'<li><a href="/country/{slugify(country)}/">More opportunities in {escape_html(country)}</a></li>' for country in {item['country']} if country) + '</ul>'
    item_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "EducationalOccupationalProgram" if item['type'] != 'Competition' else "Course",
        "name": item['title'],
        "description": item['description'],
        "url": page_url,
        "provider": {
            "@type": "Organization",
            "name": item['country']
        },
        "educationalCredentialAwarded": item['type'],
        "learningResourceType": item['type'],
        "timeRequired": item['deadline'] or 'Varies'
    }, indent=2)
    article_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": item['title'],
        "description": description,
        "url": page_url,
        "datePublished": item['created_at'] or datetime.now(timezone.utc).isoformat(),
        "author": {"@type": "Organization", "name": "OpportunityNest"}
    }, indent=2)
    breadcrumb_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": PAGE_TYPES.get(item['type'], item['type']), "item": f"{SITE_URL}/{slugify(PAGE_TYPES.get(item['type'], item['type']))}.html"},
            {"@type": "ListItem", "position": 3, "name": item['title'], "item": page_url}
        ]
    }, indent=2)
    faq = build_faq_schema([
        {"q": "How do I apply for this opportunity?", "a": "Use the official application button on this page to visit the provider's website and confirm the latest requirements."},
        {"q": "How current is this information?", "a": "OpportunityNest displays the latest available public details, but always verify deadlines and eligibility on the official program page."},
        {"q": "Is this opportunity fully funded?", "a": f"Funding details are shown here as: {escape_html(benefits)}. The official program page has the final funding terms."
        }
    ])

    page = page_head(
        title,
        description,
        page_url,
        item['title'],
        additional_head=f"<script type=\"application/ld+json\">{item_schema}</script><script type=\"application/ld+json\">{article_schema}</script><script type=\"application/ld+json\">{breadcrumb_schema}</script><script type=\"application/ld+json\">{faq}</script>"
    ) + (
        "\n      <section class=\"page-hero section-pad\">\n"
        f"        <div class=\"container\">{breadcrumbs}\n"
        "          <div class=\"detail-header\">\n"
        f"            <p class=\"eyebrow\">{escape_html(item['type'])} • {escape_html(item['country'])}</p>\n"
        f"            <h1>{escape_html(item['title'])}</h1>\n"
        f"            <p>{escape_html(item['description'])}</p>\n"
        "            <div class=\"hero-actions\">\n"
        f"              <a class=\"button button-primary\" href=\"{escape_html(item['link'])}\" target=\"_blank\" rel=\"noopener noreferrer\">View &amp; Apply <span aria-hidden=\"true\">↗</span></a>\n"
        f"              <a class=\"button button-secondary\" href=\"{SITE_URL}/{slugify(PAGE_TYPES.get(item['type'], item['type']))}.html\">Back to {escape_html(PAGE_TYPES.get(item['type'], item['type']))}</a>\n"
        "            </div>\n"
        "          </div>\n"
        "        </div>\n"
        "      </section>\n"
        "      <section class=\"section-pad\">\n"
        "        <div class=\"container internship-detail\">\n"
        "          <div class=\"detail-grid\">\n"
        f"            <div><dt>Country</dt><dd>{escape_html(item['country'])}</dd></div>\n"
        f"            <div><dt>Field</dt><dd>{escape_html(item['field'] or 'Multiple fields')}</dd></div>\n"
        f"            <div><dt>Level</dt><dd>{escape_html(item['level'] or 'Open to eligible applicants')}</dd></div>\n"
        f"            <div><dt>Funding</dt><dd>{escape_html(benefits)}</dd></div>\n"
        f"            <div><dt>Deadline</dt><dd>{escape_html(format_deadline(item))}</dd></div>\n"
        f"            <div><dt>Type</dt><dd>{escape_html(item['type'])}</dd></div>\n"
        "          </div>\n"
        "          <div class=\"final-panel\">\n"
        "            <h2>Eligibility</h2>\n"
        f"            {eligibility_html}\n"
        "          </div>\n"
        "          <div class=\"final-panel\">\n"
        "            <h2>Benefits</h2>\n"
        f"            <p>{escape_html(benefits)}</p>\n"
        "          </div>\n"
        "          <div class=\"final-panel\">\n"
        "            <h2>Application Process</h2>\n"
        "            <p>Follow the official program link and confirm the application requirements, deadline, and supporting documents before submitting.</p>\n"
        "          </div>\n"
        "          <div class=\"final-panel\">\n"
        "            <h2>Share this opportunity</h2>\n"
        "            <div class=\"card-actions\">\n"
        f"              <a class=\"button button-secondary\" href=\"https://twitter.com/intent/tweet?text={escape_html(item['title'])}+-+{escape_html(page_url)}\" target=\"_blank\" rel=\"noopener noreferrer\">Share on Twitter</a>\n"
        f"              <a class=\"button button-secondary\" href=\"mailto:?subject={escape_html(item['title'])}&body={escape_html(page_url)}\">Email link</a>\n"
        "            </div>\n"
        "          </div>\n"
        f"          {prevnext_html}\n"
        "          <div class=\"final-panel\">\n"
        "            <h2>Related opportunities</h2>\n"
        f"            {related_html if related_html else '<p>Explore similar landing pages for opportunities in the same country or category.</p>'}\n"
        "          </div>\n"
        "        </div>\n"
        "      </section>\n"
    ) + page_footer()
    return page


def build_opportunity_page(item: dict, related_items: list[dict], previous_item: dict | None, next_item: dict | None) -> str:
    page_title = item.get("seo_title") or f"{item['title']} | OpportunityNest"
    meta_description = item.get("seo_description") or (
        f"Apply for {item['title']} with verified deadline, eligibility, funding, documents, and official application guidance."
    )
    page_url = f"{SITE_URL}/opportunity/{slugify(item['slug'])}/"
    category_label, category_href = type_collection(item.get("type"))
    breadcrumbs = build_breadcrumbs([("Home", "/"), (category_label, category_href), (item["title"], None)])
    benefits = item.get("funding") or "Funding information is provided on the official listing page."
    host = item.get("host_organization") or item.get("country") or "Official provider"
    duration = item.get("duration") or "See official listing"
    updated_at = (item.get("verified_at") or item.get("created_at") or datetime.now(timezone.utc).isoformat()).split("T")[0]
    verification_source = item.get("verification_source") or item.get("link")
    faqs = opportunity_faqs(item, benefits)
    faq_html = "".join(
        f'<details><summary>{escape_html(faq["q"])}</summary><p>{escape_html(faq["a"])}</p></details>'
        for faq in faqs
    )
    guide_sections = "".join(
        f'<section class="final-panel"><h2>{escape_html(heading)}</h2><p>{escape_html(text)}</p></section>'
        for heading, text in opportunity_guidance(item, benefits, host)
    )
    quick_facts = [
        f"Host organization: {host}",
        f"Country or region: {item.get('country') or 'Global'}",
        f"Opportunity type: {item.get('type') or 'Opportunity'}",
        f"Field: {item.get('field') or 'Multiple fields'}",
        f"Level: {item.get('level') or 'Open to eligible applicants'}",
        f"Duration: {duration}",
        f"Funding: {benefits}",
        f"Deadline: {format_deadline(item)}",
    ]
    related_html = (
        '<div class="opportunity-results grid three">'
        + "".join(build_opportunity_card(rel) for rel in related_items[:4])
        + "</div>"
        if related_items
        else "<p>Explore similar landing pages for opportunities in the same country or category.</p>"
    )
    prevnext_html = ""
    if previous_item or next_item:
        prevnext_html = '<div class="card-actions">'
        if previous_item:
            prevnext_html += f'<a class="button button-secondary" href="{SITE_URL}/opportunity/{slugify(previous_item["slug"])}/">Previous: {escape_html(previous_item["title"])}</a>'
        if next_item:
            prevnext_html += f'<a class="button button-secondary" href="{SITE_URL}/opportunity/{slugify(next_item["slug"])}/">Next: {escape_html(next_item["title"])}</a>'
        prevnext_html += "</div>"
    same_country_html = "".join(
        f'<li><a href="/country/{slugify(country)}/">More opportunities in {escape_html(country)}</a></li>'
        for country in {item.get("country")} if country
    )
    same_category_html = f'<li><a href="{escape_html(category_href)}">More {escape_html(category_label.lower())}</a></li>'
    item_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "EducationalOccupationalProgram" if item["type"] != "Competition" else "Course",
        "name": item["title"],
        "description": item.get("description") or meta_description,
        "url": page_url,
        "provider": {"@type": "Organization", "name": host},
        "educationalCredentialAwarded": item["type"],
        "learningResourceType": item["type"],
        "timeRequired": item.get("deadline") or "Varies"
    }, indent=2)
    article_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": item["title"],
        "description": meta_description,
        "url": page_url,
        "datePublished": item.get("created_at") or datetime.now(timezone.utc).isoformat(),
        "dateModified": updated_at,
        "author": {"@type": "Person", "name": EDITOR_NAME},
        "reviewedBy": {"@type": "Person", "name": REVIEWER_NAME}
    }, indent=2)
    breadcrumb_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE_URL}/"},
            {"@type": "ListItem", "position": 2, "name": category_label, "item": f"{SITE_URL}{category_href}"},
            {"@type": "ListItem", "position": 3, "name": item["title"], "item": page_url}
        ]
    }, indent=2)
    faq_schema = build_faq_schema(faqs)
    return page_head(
        page_title,
        meta_description,
        page_url,
        item["title"],
        additional_head=f'<script type="application/ld+json">{item_schema}</script><script type="application/ld+json">{article_schema}</script><script type="application/ld+json">{breadcrumb_schema}</script><script type="application/ld+json">{faq_schema}</script>'
    ) + (
        "\n      <section class=\"page-hero section-pad\">\n"
        f"        <div class=\"container\">{breadcrumbs}\n"
        "          <div class=\"detail-header\">\n"
        f"            <p class=\"eyebrow\">{escape_html(item['type'])} - {escape_html(item['country'])}</p>\n"
        f"            <h1>{escape_html(item['title'])}</h1>\n"
        f"            {paragraphs_html(item.get('description') or meta_description)}\n"
        "            <div class=\"hero-actions\">\n"
        f"              <a class=\"button button-primary\" href=\"{escape_html(item['link'])}\" target=\"_blank\" rel=\"noopener noreferrer\">View &amp; Apply <span aria-hidden=\"true\">↗</span></a>\n"
        f"              <a class=\"button button-secondary\" href=\"{SITE_URL}{category_href}\">Back to {escape_html(category_label)}</a>\n"
        "            </div>\n"
        f"            <p class=\"review-note\">Last reviewed: {escape_html(updated_at)}. Details are summarized from the official provider source.</p>\n"
        "          </div>\n"
        "        </div>\n"
        "      </section>\n"
        "      <section class=\"section-pad\">\n"
        "        <div class=\"container internship-detail\">\n"
        "          <div class=\"detail-grid\">\n"
        f"            <div><dt>Host</dt><dd>{escape_html(host)}</dd></div>\n"
        f"            <div><dt>Country</dt><dd>{escape_html(item.get('country') or 'Global')}</dd></div>\n"
        f"            <div><dt>Field</dt><dd>{escape_html(item.get('field') or 'Multiple fields')}</dd></div>\n"
        f"            <div><dt>Level</dt><dd>{escape_html(item.get('level') or 'Open to eligible applicants')}</dd></div>\n"
        f"            <div><dt>Funding</dt><dd>{escape_html(benefits)}</dd></div>\n"
        f"            <div><dt>Deadline</dt><dd>{escape_html(format_deadline(item))}</dd></div>\n"
        "          </div>\n"
        f"          {detail_list_panel('Overview', quick_facts)}\n"
        f"          {detail_panel('About the opportunity', item.get('description') or meta_description)}\n"
        f"          {guide_sections}\n"
        f"          {detail_panel('Who should apply', item.get('eligibility_criteria') or fallback_who_should_apply(item))}\n"
        f"          {detail_panel('Benefits explained', item.get('benefits') or benefits)}\n"
        f"          {detail_panel('Required documents', item.get('required_documents') or '')}\n"
        f"          {detail_panel('Application process', item.get('application_process') or '')}\n"
        f"          {detail_panel('Selection criteria', item.get('selection_criteria') or fallback_selection_criteria(item))}\n"
        f"          {detail_panel('Important notes', item.get('important_notes') or '')}\n"
        "          <section class=\"faq-list\" aria-labelledby=\"opportunity-faq-title\">\n"
        "            <div class=\"section-heading\"><p class=\"eyebrow\">Applicant questions</p><h2 id=\"opportunity-faq-title\">Frequently asked questions</h2></div>\n"
        f"            {faq_html}\n"
        "          </section>\n"
        "          <div class=\"final-panel\">\n"
        "            <h2>Official application link</h2>\n"
        f"            <p>{escape_html(official_application_guidance(item, host))}</p><p><a href=\"{escape_html(item['link'])}\" target=\"_blank\" rel=\"noopener noreferrer\">Open the official application page</a></p>\n"
        f"            <p>Verification source: <a href=\"{escape_html(verification_source)}\" target=\"_blank\" rel=\"noopener noreferrer\">official source</a>.</p>\n"
        "          </div>\n"
        "          <div class=\"final-panel\">\n"
        "            <h2>Summary</h2>\n"
        f"            <p>{escape_html(opportunity_summary(item, host, benefits))}</p>\n"
        "          </div>\n"
        "          <div class=\"final-panel\"><h2>Share this opportunity</h2><div class=\"card-actions\">\n"
        f"            <a class=\"button button-secondary\" href=\"https://twitter.com/intent/tweet?text={escape_html(item['title'])}+-+{escape_html(page_url)}\" target=\"_blank\" rel=\"noopener noreferrer\">Share on Twitter</a>\n"
        f"            <a class=\"button button-secondary\" href=\"mailto:?subject={escape_html(item['title'])}&body={escape_html(page_url)}\">Email link</a>\n"
        "          </div></div>\n"
        f"          {prevnext_html}\n"
        f"          <div class=\"final-panel\"><h2>Related opportunities</h2>{related_html}</div>\n"
        f"          <div class=\"final-panel\"><h2>Related guides and collections</h2><ul>{same_country_html}{same_category_html}</ul></div>\n"
        "        </div>\n"
        "      </section>\n"
    ) + page_footer()


def build_page_url(path: str) -> str:
    return f"{SITE_URL}/{path.lstrip('/') }"


def type_collection(item_type: str) -> tuple[str, str]:
    return TYPE_COLLECTION_ROUTES.get(item_type, (PAGE_TYPES.get(item_type, item_type or "Opportunities"), "/#opportunities"))


def build_sitemap(entries: list[dict]) -> str:
    lines = ["<?xml version=\"1.0\" encoding=\"UTF-8\"?>", '<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">']
    seen_urls = set()
    for entry in entries:
        if entry["loc"] in seen_urls:
            continue
        seen_urls.add(entry["loc"])
        lines.append("  <url>")
        lines.append(f"    <loc>{escape_html(entry['loc'])}</loc>")
        if entry.get('lastmod'):
            lines.append(f"    <lastmod>{entry['lastmod']}</lastmod>")
        if entry.get('changefreq'):
            lines.append(f"    <changefreq>{entry['changefreq']}</changefreq>")
        if entry.get('priority') is not None:
            lines.append(f"    <priority>{entry['priority']:.1f}</priority>")
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines)


def build_trust_page(slug: str, title: str, description: str, sections: list[tuple[str, str]]) -> str:
    url = f"{SITE_URL}/{slug}.html"
    breadcrumbs = build_breadcrumbs([("Home", "/"), (title, None)])
    body = "".join(
        f'<section class="final-panel trust-policy"><h2>{escape_html(heading)}</h2>{paragraphs_html(text)}</section>'
        for heading, text in sections
    )
    person_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": EDITOR_NAME,
        "url": f"{SITE_URL}/about.html",
        "jobTitle": EDITOR_ROLE,
        "worksFor": {"@type": "Organization", "name": "OpportunityNest", "url": SITE_URL}
    }, indent=2)
    page_schema = json.dumps({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": url,
        "reviewedBy": {"@type": "Person", "name": REVIEWER_NAME},
        "dateModified": datetime.now(timezone.utc).date().isoformat()
    }, indent=2)
    return page_head(
        f"{title} | OpportunityNest",
        description,
        url,
        title,
        additional_head=f'<script type="application/ld+json">{person_schema}</script><script type="application/ld+json">{page_schema}</script>'
    ) + f"""
      <section class="page-hero section-pad">
        <div class="container narrow">{breadcrumbs}
          <p class="eyebrow">Trust and transparency</p>
          <h1>{escape_html(title)}</h1>
          <p>{escape_html(description)}</p>
          <p class="review-note">Last updated: {datetime.now(timezone.utc).date().isoformat()} by {EDITOR_NAME}, {EDITOR_ROLE}. Reviewed by {REVIEWER_NAME}, {REVIEWER_ROLE}.</p>
        </div>
      </section>
      <section class="section-pad">
        <div class="container narrow">
          {body}
        </div>
      </section>
    """ + page_footer()


def write_trust_pages():
    pages = [
        ("editorial-policy", "Editorial Policy", "How OpportunityNest researches, writes, reviews, and updates education opportunity content for students worldwide.", [
            ("Editorial mission", "OpportunityNest exists to help students, graduates, researchers, and early-career professionals find legitimate educational and career opportunities without sorting through duplicated, outdated, or misleading listings. Our editorial standard is usefulness first: every page should help a reader understand eligibility, funding, deadlines, application routes, and risks before visiting the official source."),
            ("Independence", "OpportunityNest is independent. We are not a university, government agency, employer, scholarship provider, visa consultant, or application processor. Providers do not control our editorial summaries. We do not charge applicants for access to listings, and we direct users to official provider pages for final instructions."),
            ("Source standards", "Editors prioritize official university pages, government scholarship portals, international organization pages, recognized foundations, and verified employer pages. When a listing cannot be connected to a reliable source, it is not eligible for publication. If an official source changes, the listing is updated, replaced, or removed from active discovery."),
            ("Corrections", "Readers can report errors through the Contact page. Correction requests are reviewed against the official source, and verified errors are corrected as quickly as possible. Material corrections may include deadline changes, eligibility changes, source replacements, and funding clarifications.")
        ]),
        ("fact-checking-policy", "Fact Checking Policy", "The checks OpportunityNest uses before publishing scholarship, internship, fellowship, competition, grant, and exchange listings.", [
            ("Pre-publication checks", "Before publication, each opportunity is checked for provider identity, official application URL, deadline language, country or region, opportunity type, funding level, eligible applicants, and required documents where available. Listings with unclear or suspicious sources are excluded until the provider can be verified."),
            ("Deadline and funding review", "Deadlines are treated conservatively because missed dates harm applicants. If an official page uses rolling, annual, or variable deadlines, the listing states that clearly instead of inventing a date. Funding labels are also reviewed carefully: fully funded, partially funded, paid, unpaid, stipend, and fee waiver are not interchangeable."),
            ("Human review", "Automated scripts help structure pages and detect route issues, but editorial judgment is still required for source quality, wording, and applicant usefulness. Generated pages are reviewed for duplicate patterns, thin summaries, broken official links, missing metadata, and unclear application guidance."),
            ("Limitations", "Opportunity providers can change rules without notice. OpportunityNest summarizes public information and cannot guarantee admission, funding, visa approval, or selection outcomes. Applicants should always confirm final details on the official provider website.")
        ]),
        ("verification-process", "How Opportunities Are Verified", "A transparent overview of how OpportunityNest verifies opportunity listings and keeps pages useful after publication.", [
            ("Verification workflow", "The verification workflow starts with the official source. Editors confirm that the provider exists, that the application route is active or clearly recurring, and that the listing is relevant to students, graduates, researchers, or early-career applicants. The page is then classified by country, category, level, funding type, field, and deadline status."),
            ("What verification means", "Verified means the listing has been matched to a credible public source and organized for comparison. It does not mean OpportunityNest endorses the provider, guarantees acceptance, or has a partnership with the organization. The official provider remains the final authority for all application decisions."),
            ("Ongoing review", "Generated opportunity pages include last-reviewed notes, official source links, related opportunities, and structured metadata. Route audits and HTTP checks are used before deployment to ensure opportunity URLs resolve correctly. Expired or changed opportunities are flagged for update during regular maintenance."),
            ("Applicant safety", "Applicants should avoid any third party that asks for unofficial payment, passwords, or unnecessary personal documents. Apply through the official provider link, keep copies of submissions, and verify visa or travel rules through official government resources.")
        ])
    ]
    for slug, title, description, sections in pages:
        write_page(ROOT / f"{slug}.html", build_trust_page(slug, title, description, sections))


def main():
    opportunities = fetch_opportunities()
    today = datetime.now(timezone.utc).date().isoformat()
    opportunities = [op for op in opportunities if op.get('title')]
    for op in opportunities:
        op['link'] = OFFICIAL_URL_OVERRIDES.get(op.get('link'), op.get('link'))
        if not op.get('slug'):
            op['slug'] = slugify(f"{op['title']} {op.get('country','')}")[:95]
    opportunities.sort(key=lambda op: (op.get('type') or '', op.get('country') or '', op.get('title') or ''))

    country_groups = {}
    category_groups = {cat: [] for cat in CATEGORY_TYPES}
    for item in opportunities:
        country = item.get('country') or 'Global'
        country_groups.setdefault(country, []).append(item)
        if item.get('type') in CATEGORY_TYPES:
            category_groups[item['type']].append(item)

    # Generate category and country pages
    for category, items in category_groups.items():
        if category == 'Competition' and not items:
            continue
        page_file = ROOT / f"{slugify(PAGE_TYPES[category])}.html"
        content = build_category_page(category, items, {})
        write_page(page_file, content)

    country_names = sorted(country_groups.keys())
    for country, items in country_groups.items():
        related = [name for name in country_names if name != country][:6]
        path = ROOT / "country" / slugify(country) / "index.html"
        content = build_country_page(country, items, related)
        write_page(path, content)

    # Generate category-country pages for available combinations
    for category, items in category_groups.items():
        available_countries = sorted({item['country'] for item in items if item.get('country')})
        for country in available_countries:
            folder = ROOT / slugify(PAGE_TYPES[category]) / slugify(country)
            page = folder / "index.html"
            title = f"{country} {PAGE_TYPES[category]} | OpportunityNest"
            description = f"Find {category.lower()} opportunities in {country}. Published deadlines, funding, and application links for {category.lower()}s in {country}."
            url = f"{SITE_URL}/{slugify(PAGE_TYPES[category])}/{slugify(country)}/"
            items_for_page = [item for item in items if item.get('country') == country]
            # Simple country-category page generation
            breadcrumbs = build_breadcrumbs([("Home", "/"), (PAGE_TYPES[category], f"/{slugify(PAGE_TYPES[category])}.html"), (country, None)])
            item_list_schema = build_item_list_schema(items_for_page, url)
            breadcrumb_schema = json.dumps({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE_URL}/"},
                    {"@type": "ListItem", "position": 2, "name": PAGE_TYPES[category], "item": f"{SITE_URL}/{slugify(PAGE_TYPES[category])}.html"},
                    {"@type": "ListItem", "position": 3, "name": country, "item": url}
                ]
            }, indent=2)
            faq = build_faq_schema([
                {"q": f"What kinds of {category.lower()}s are available in {country}?", "a": f"This page lists current {category.lower()}s open to applicants in {country}."},
                {"q": "How do I know if a listing is still active?", "a": "Check the deadline field and visit the official application page to confirm the latest status."},
                {"q": "Can I browse other countries?", "a": "Yes — use the country navigation links at the bottom of the page to discover similar programs in other regions."}
            ])
            listing_html = '<div class="opportunity-results grid three">' + ''.join(build_opportunity_card(item) for item in items_for_page[:12]) + '</div>'
            content = page_head(title, description, url, f"{country} {PAGE_TYPES[category]}", additional_head=f"<script type=\"application/ld+json\">{item_list_schema}</script><script type=\"application/ld+json\">{breadcrumb_schema}</script><script type=\"application/ld+json\">{faq}</script>") + f"\n      <section class=\"page-hero section-pad\">\n        <div class=\"container\">{breadcrumbs}\n          <div class=\"section-heading\">\n            <p class=\"eyebrow\">Category</p>\n            <h1>{escape_html(country)} {escape_html(PAGE_TYPES[category])}</h1>\n            <p>Browse verified {category.lower()} listings for {escape_html(country)} with funding and deadline details in one place.</p>\n          </div>\n        </div>\n      </section>\n      <section class=\"section-pad live-opportunities\">\n        <div class=\"container\">\n          {listing_html}\n        </div>\n      </section>\n" + page_footer()
            write_page(page, content)

    # Generate opportunity pages
    all_opportunities = [item for item in opportunities if item.get('slug')]
    for index, item in enumerate(all_opportunities):
        slug = slugify(item['slug'])
        folder = ROOT / "opportunity" / slug
        path = folder / "index.html"
        related = [x for x in opportunities if x['id'] != item['id'] and x['country'] == item['country'] and x['type'] == item['type']][:4]
        previous_item = all_opportunities[index - 1] if index > 0 else None
        next_item = all_opportunities[index + 1] if index < len(all_opportunities) - 1 else None
        content = build_opportunity_page(item, related, previous_item, next_item)
        write_page(path, content)

    # Generate reusable clean-URL SEO landing pages after legacy pages so matching
    # country routes receive the richer canonical implementation.
    for definition in LANDING_PAGE_DEFINITIONS:
        landing_items = [item for item in opportunities if matches_landing_page(item, definition)]
        landing_items.sort(key=lambda item: (item.get("deadline") or "9999", item.get("title") or ""))
        landing_path = ROOT / definition["path"] / "index.html"
        write_page(landing_path, build_landing_page(definition, landing_items, LANDING_PAGE_DEFINITIONS))

    write_trust_pages()

    # Generate sitemap
    sitemap_entries = [
        {"loc": f"{SITE_URL}/", "changefreq": "daily", "priority": 1.0},
        {"loc": f"{SITE_URL}/scholarships.html", "changefreq": "daily", "priority": 0.9},
        {"loc": f"{SITE_URL}/internships.html", "changefreq": "daily", "priority": 0.9},
        {"loc": f"{SITE_URL}/fellowships.html", "changefreq": "daily", "priority": 0.9},
        {"loc": f"{SITE_URL}/competitions.html", "changefreq": "daily", "priority": 0.8},
        {"loc": f"{SITE_URL}/about.html", "changefreq": "monthly", "priority": 0.7},
        {"loc": f"{SITE_URL}/contact.html", "changefreq": "monthly", "priority": 0.6},
        {"loc": f"{SITE_URL}/faq.html", "changefreq": "monthly", "priority": 0.6},
        {"loc": f"{SITE_URL}/privacy.html", "changefreq": "yearly", "priority": 0.5},
        {"loc": f"{SITE_URL}/terms.html", "changefreq": "yearly", "priority": 0.5},
        {"loc": f"{SITE_URL}/disclaimer.html", "changefreq": "yearly", "priority": 0.5},
        {"loc": f"{SITE_URL}/editorial-policy.html", "changefreq": "monthly", "priority": 0.6},
        {"loc": f"{SITE_URL}/fact-checking-policy.html", "changefreq": "monthly", "priority": 0.6},
        {"loc": f"{SITE_URL}/verification-process.html", "changefreq": "monthly", "priority": 0.6}
    ]
    for country in country_groups:
        sitemap_entries.append({"loc": f"{SITE_URL}/country/{slugify(country)}/", "lastmod": today, "changefreq": "weekly", "priority": 0.8})
    for category, items in category_groups.items():
        sitemap_entries.append({"loc": f"{SITE_URL}/{slugify(PAGE_TYPES[category])}.html", "lastmod": today, "changefreq": "weekly", "priority": 0.8})
        for country in sorted({item['country'] for item in items if item.get('country')}):
            sitemap_entries.append({"loc": f"{SITE_URL}/{slugify(PAGE_TYPES[category])}/{slugify(country)}/", "lastmod": today, "changefreq": "weekly", "priority": 0.7})
    for item in opportunities:
        if item.get('slug'):
            sitemap_entries.append({"loc": f"{SITE_URL}/opportunity/{slugify(item['slug'])}/", "lastmod": (item.get('created_at') or datetime.now(timezone.utc).date().isoformat()), "changefreq": "weekly", "priority": 0.8})
    for definition in LANDING_PAGE_DEFINITIONS:
        sitemap_entries.append({
            "loc": f"{SITE_URL}/{definition['path']}/",
            "lastmod": today,
            "changefreq": "weekly",
            "priority": 0.9 if definition["facet"] == "category" else 0.8
        })
    sitemap = build_sitemap(sitemap_entries)
    write_page(ROOT / "sitemap.xml", sitemap)

    print("Generated SEO pages and sitemap.")


if __name__ == '__main__':
    main()
