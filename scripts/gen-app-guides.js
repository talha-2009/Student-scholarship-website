#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const GUIDES_DIR = path.join(__dirname, "..", "guides");
if (!fs.existsSync(GUIDES_DIR)) fs.mkdirSync(GUIDES_DIR, { recursive: true });

function head(title, desc, canonical, schema) {
  return `<!doctype html>
<html lang="en">
<head>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:2000,region:['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IS','IE','IT','LV','LI','LT','LU','MT','NL','NO','PL','PT','RO','SK','SI','ES','SE','GB','CH']});</script>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} | OpportunityNest</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="#0f766e">
<link rel="canonical" href="https://www.opportunitynest.org${canonical}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://www.opportunitynest.org${canonical}">
<meta property="og:image" content="https://www.opportunitynest.org/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WKVTVB0X4X"></script>
<script>gtag('js',new Date());gtag('config','G-WKVTVB0X4X');</script>
<link rel="stylesheet" href="/styles.css">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>`;
}

const NAV = `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header" role="banner" aria-label="Primary navigation">
<nav class="nav container">
<a class="brand" href="/"><span class="brand-mark" aria-hidden="true">ON</span><span>OpportunityNest.org</span></a>
<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu"><span class="sr-only">Toggle navigation</span><span></span><span></span><span></span></button>
<div class="nav-menu" id="nav-menu">
<a href="/#opportunities">Opportunities</a><a href="/scholarships.html">Scholarships</a><a href="/internships.html">Internships</a><a href="/fellowships.html">Fellowships</a><a href="/competitions.html">Competitions</a><a href="/?type=Youth+Program#opportunities">Youth Programs</a><a href="/blog/">Blog</a><a href="/about.html">About</a><a href="/contact.html">Contact</a>
</div>
</nav>
</header>`;

const FOOTER = `<footer class="site-footer" role="contentinfo"><div class="container"><nav class="footer-links" aria-label="Footer navigation"><a href="/">Home</a><a href="/about.html">About</a><a href="/contact.html">Contact</a><a href="/faq.html">FAQ</a><a href="/privacy.html">Privacy Policy</a><a href="/terms.html">Terms of Use</a></nav><p style="text-align:center;margin-top:1rem;font-size:0.85rem;color:#9ca3af;">&copy; 2026 OpportunityNest.org. All rights reserved.</p></div></footer><script src="/nav.js"></script></body></html>`;

const RELATED = `<h2>Explore More Resources</h2>
<ul>
<li><a href="/scholarships.html">Browse all scholarships</a></li>
<li><a href="/internships.html">Find paid internships</a></li>
<li><a href="/fellowships.html">Explore fellowships</a></li>
<li><a href="/blog/">Read our blog guides</a></li>
<li><a href="/guides/how-to-write-sop.html">How to Write an SOP</a></li>
<li><a href="/guides/cv-writing.html">CV Writing Guide</a></li>
<li><a href="/guides/cover-letter.html">Cover Letter Guide</a></li>
<li><a href="/blog/how-to-write-winning-scholarship-essay.html">Scholarship essay writing guide</a></li>
</ul>`;

function gen(p) {
  const canonical = `/guides/${p.slug}.html`;
  const schema = {
    "@context":"https://schema.org","@type":"Article","headline":p.title,"description":p.desc,
    "author":{"@type":"Organization","name":"OpportunityNest"},
    "publisher":{"@type":"Organization","name":"OpportunityNest","url":"https://www.opportunitynest.org"},
    "datePublished":"2026-07-07","dateModified":"2026-07-07"
  };
  const html = `${head(p.title,p.desc,canonical,schema)}
<body>
${NAV}
<main id="main">
<article style="max-width:780px;margin:0 auto;padding:2rem 1rem 4rem;">
<nav class="breadcrumb" aria-label="Breadcrumb" style="margin-bottom:1.5rem;font-size:0.9rem;">
<a href="/" style="color:var(--color-primary,#0f766e);">Home</a> <span aria-hidden="true">\u203A</span>
<a href="/blog/" style="color:var(--color-primary,#0f766e);">Resources</a> <span aria-hidden="true">\u203A</span>
<span aria-current="page">${p.title.split(":")[0]}</span>
</nav>
<h1>${p.title}</h1>
<p style="color:#6b7280;font-size:0.9rem;margin-bottom:2rem;">Published July 7, 2026 &middot; 15 min read</p>
${p.content}
</article>
</main>
${FOOTER}`;
  fs.writeFileSync(path.join(GUIDES_DIR, `${p.slug}.html`), html, "utf-8");
  console.log(`Created: /guides/${p.slug}.html`);
}

const pages = [
  {
    slug: "motivation-letter",
    title: "How to Write a Motivation Letter: Complete Guide with Examples",
    desc: "Learn how to write a compelling motivation letter for scholarships, university admissions, and volunteer programmes. Step-by-step structure, templates, and expert tips.",
    keywords: "motivation letter, how to write motivation letter, motivation letter for scholarship, motivation letter template",
    content: `
<p>A motivation letter is a document that explains why you are applying for a specific programme, scholarship, or position. Unlike a CV, which lists your qualifications, the motivation letter reveals your reasoning — why this opportunity matters to you, why you are the right candidate, and what you intend to do with the experience. It is required by most European universities, many scholarship programmes including the <a href="/blog/top-fully-funded-scholarships.html">Chevening Scholarship</a> and <a href="/opportunity/daad-study-scholarship-germany/">DAAD Scholarship</a>, and numerous volunteer and exchange programmes.</p>

<p>This guide provides a complete framework for writing a motivation letter that stands out, whether you are applying for a master's programme in Europe, an international scholarship, or a competitive internship.</p>

<h2>What Is a Motivation Letter?</h2>
<p>A motivation letter (sometimes called a "letter of motivation") is typically one to two pages long and accompanies your application materials. It differs from a statement of purpose in that it is more concise, more focused on the specific opportunity, and more explicitly addresses the question: "Why this programme, and why you?"</p>
<p>While a statement of purpose may explore your academic journey broadly, a motivation letter is targeted. Every paragraph should connect your background to the specific requirements and values of the opportunity you are applying for.</p>

<h2>Motivation Letter vs Statement of Purpose vs Cover Letter</h2>
<p>Understanding the difference between these documents is critical, because submitting the wrong type can hurt your application.</p>
<ul>
<li><strong>Motivation letter:</strong> Focuses on why you want this specific opportunity and what drives you. Common for European university admissions and scholarships.</li>
<li><strong>Statement of purpose:</strong> Focuses on your academic and research trajectory. Common for US/UK graduate admissions.</li>
<li><strong>Cover letter:</strong> Focuses on your professional qualifications for a job or internship. Common for employment applications.</li>
</ul>
<p>If the application asks for a motivation letter, do not submit a statement of purpose or cover letter instead. Each serves a different purpose and selection committees notice the difference.</p>

<h2>Structure of a Strong Motivation Letter</h2>

<h3>1. Header and Salutation</h3>
<p>Include your name, address, email, and date at the top. Address the letter to a specific person if possible — "Dear Selection Committee" or "Dear Admissions Team" if no name is available. Never leave the salutation blank or use "To Whom It May Concern," which feels impersonal and outdated.</p>

<h3>2. Opening Paragraph: Your Hook</h3>
<p>State clearly what you are applying for and why. Your opening should immediately convey genuine enthusiasm and a specific reason. For example: "I am writing to express my strong interest in the MSc Renewable Energy programme at TU Delft. Having spent two years designing solar microgrids for off-grid communities in rural Kenya, I am eager to deepen my technical expertise to address energy poverty at scale."</p>
<p>Avoid generic openings like "I am writing to apply for..." without following up with a compelling reason.</p>

<h3>3. Second Paragraph: Your Background</h3>
<p>Summarise the key experiences that qualify you. Focus on achievements that directly relate to the programme. Use specific numbers: "I led a team of five volunteers to establish a community library that now serves 200 students weekly" is far more compelling than "I have volunteer experience."</p>

<h3>4. Third Paragraph: Why This Programme</h3>
<p>This is the most important paragraph. Demonstrate that you have researched the opportunity thoroughly. Mention specific courses, professors, facilities, or programme features that attract you. Connect these features to your goals: "The programme's module on Wind Energy Systems aligns directly with my goal of developing hybrid renewable energy solutions for coastal communities."</p>

<h3>5. Fourth Paragraph: Your Future Plans</h3>
<p>Explain what you will do after completing the programme. Scholarship committees especially want to see that their investment will produce long-term impact. Be specific: "After completing this master's, I plan to return to Kenya and work with the Ministry of Energy to develop policy frameworks for community-scale renewable energy deployment."</p>

<h3>6. Closing Paragraph</h3>
<p>Reiterate your enthusiasm, mention that your supporting documents are attached, and thank the reader for their time. Keep it brief and professional.</p>

<h2>Common Mistakes to Avoid</h2>
<ul>
<li><strong>Being generic.</strong> A motivation letter that could be sent to any programme is worthless. Every letter must be tailored to the specific opportunity.</li>
<li><strong>Repeating your CV.</strong> The letter should complement, not duplicate. Use it to explain the thinking behind your achievements.</li>
<li><strong>Writing too much.</strong> Keep it to one page, maximum two. Selection committees read hundreds of letters; respect their time.</li>
<li><strong>Using informal language.</strong> This is a formal document. Avoid slang, contractions, and overly casual tone.</li>
<li><strong>Being vague about goals.</strong> "I want to make a difference" tells the committee nothing. State specific, measurable objectives.</li>
<li><strong>Not proofreading.</strong> Spelling errors and grammatical mistakes suggest carelessness. Have at least two people review your letter.</li>
</ul>

<h2>Motivation Letter Template</h2>
<p>Use this structure as a starting point, then personalise it completely:</p>
<p>[Your Name]<br>[Your Address]<br>[Your Email]<br>[Date]</p>
<p>[Recipient Name or "Selection Committee"]<br>[Organisation Name]<br>[Address]</p>
<p>Dear [Name/Committee],</p>
<p>[Opening: State what you are applying for and your primary motivation — 3-4 sentences]</p>
<p>[Background: Summarise relevant experience and qualifications — 4-6 sentences]</p>
<p>[Why this programme: Show research, mention specifics, connect to goals — 4-6 sentences]</p>
<p>[Future plans: What you will do after — 3-4 sentences]</p>
<p>[Closing: Thank the reader, mention attachments — 2-3 sentences]</p>
<p>Sincerely,<br>[Your Name]</p>

<h2>Expert Tips for a Standout Motivation Letter</h2>
<ul>
<li>Research the organisation's mission and values. Mirror their language in your letter.</li>
<li>Use the STAR method (Situation, Task, Action, Result) when describing achievements.</li>
<li>Show, don't tell. Instead of "I am passionate about education," describe what you did that demonstrates that passion.</li>
<li>Address any gaps or weaknesses proactively. If your GPA is low, briefly explain what happened and what you learned.</li>
<li>Start writing at least three weeks before the deadline to allow time for revision.</li>
<li>Read your letter aloud. If any sentence feels awkward, rewrite it.</li>
</ul>

<h2>Motivation Letter Checklist</h2>
<ul>
<li>Is the letter addressed to the right person or committee?</li>
<li>Does the opening clearly state what I am applying for?</li>
<li>Have I explained why this specific programme, not just any programme?</li>
<li>Have I included specific examples and numbers?</li>
<li>Is the letter within the specified length (usually 1-2 pages)?</li>
<li>Have I connected my past experience to my future goals?</li>
<li>Is the tone formal but genuine?</li>
<li>Have I proofread for spelling and grammar?</li>
<li>Has at least one other person reviewed this letter?</li>
<li>Does every paragraph serve a clear purpose?</li>
</ul>

${RELATED}
`
  },
  {
    slug: "cover-letter",
    title: "How to Write a Cover Letter: Guide for Students and Graduates",
    desc: "Master the cover letter with our step-by-step guide. Learn how to write a cover letter for internships, jobs, and graduate programmes with templates and examples.",
    keywords: "cover letter, how to write cover letter, cover letter template, internship cover letter, job application",
    content: `
<p>A cover letter is your first opportunity to make a personal impression on a potential employer or selection committee. While your CV lists your qualifications, the cover letter tells the story behind them — why you are interested in this role, what unique perspective you bring, and why you are worth interviewing. For students and recent graduates, a well-crafted cover letter can be the deciding factor between getting an interview and being passed over.</p>

<p>This guide covers everything you need to write a cover letter that gets results, whether you are applying for an <a href="/internships.html">internship</a>, a graduate position, or a competitive fellowship.</p>

<h2>What Is a Cover Letter?</h2>
<p>A cover letter is a one-page document submitted alongside your CV or resume as part of a job or programme application. It introduces you, highlights your most relevant qualifications, explains your motivation for applying, and demonstrates your communication skills. Most employers expect one — a 2025 survey by the National Association of Colleges and Employers found that 65% of recruiters expect a cover letter, even when it is listed as optional.</p>

<h2>Why Cover Letters Still Matter</h2>
<p>In an era of AI-generated applications and one-click apply buttons, a thoughtful cover letter sets you apart. It demonstrates that you have researched the organisation, that you understand the role, and that you have taken the time to articulate why you are a good fit. For positions that receive hundreds of applications, the cover letter is often the first document that gets read.</p>

<h2>How to Structure a Cover Letter</h2>

<h3>1. Contact Information</h3>
<p>At the top, include your name, email, phone number, and LinkedIn profile URL. Below that, add the date and the employer's contact information: hiring manager's name (if known), company name, and address.</p>

<h3>2. Opening Paragraph</h3>
<p>Your opening must accomplish three things: state the position you are applying for, mention how you found the listing, and provide a compelling reason why you are interested. For example: "I am writing to apply for the Data Analyst Intern position at UNICEF, which I discovered through OpportunityNest. As a statistics student who has spent the past year analysing public health datasets for a local NGO, I am excited about the opportunity to contribute to UNICEF's mission of improving children's lives through evidence-based programming."</p>

<h3>3. Body Paragraphs (2-3 paragraphs)</h3>
<p><strong>First body paragraph — Your relevant experience:</strong> Highlight the experiences most relevant to the role. Use specific examples with measurable outcomes. "During my internship at the Ministry of Health, I developed a Python script that automated data cleaning for monthly disease surveillance reports, reducing processing time by 70%."</p>
<p><strong>Second body paragraph — Why this organisation:</strong> Demonstrate that you have researched the company or organisation. Mention specific projects, values, or initiatives that attract you. Connect your skills to their needs.</p>
<p><strong>Third body paragraph (optional) — Additional qualifications:</strong> Mention relevant coursework, certifications, volunteer work, or extracurricular activities that strengthen your application.</p>

<h3>4. Closing Paragraph</h3>
<p>Restate your interest, mention that your CV is attached, and express willingness to discuss your application further. Include a call to action: "I would welcome the opportunity to discuss how my skills and experience align with your team's needs. Thank you for considering my application."</p>

<h2>Cover Letter Examples for Different Scenarios</h2>

<h3>Internship Application</h3>
<p>When applying for an <a href="/guides/internship-cover-letter.html">internship</a>, emphasise your academic background, relevant coursework, and any projects or volunteer work. You may not have extensive professional experience, and that is expected. Focus on what you have learned and how it applies to the role.</p>

<h3>Graduate Programme Application</h3>
<p>For graduate programmes, emphasise your research experience, thesis work, and long-term career goals. Connect the programme's specific offerings to your development needs.</p>

<h3>Scholarship Application</h3>
<p>For scholarships, focus on your academic achievements, leadership experience, community involvement, and how the funding will enable you to create impact. See our <a href="/blog/how-to-write-winning-scholarship-essay.html">scholarship essay guide</a> for more advice.</p>

<h2>Common Cover Letter Mistakes</h2>
<ul>
<li><strong>Using the same letter for every application.</strong> Each cover letter must be tailored to the specific role and organisation.</li>
<li><strong>Repeating your CV verbatim.</strong> Use the cover letter to tell the story behind your achievements, not to list them again.</li>
<li><strong>Being too long.</strong> Keep it to one page. Three to four paragraphs is ideal.</li>
<li><strong>Starting with "I am writing to apply for..." without context.</strong> Make your opening engaging and specific.</li>
<li><strong>Using generic phrases.</strong> "I am a hard worker" and "I am a team player" are meaningless without evidence.</li>
<li><strong>Not addressing it to anyone.</strong> Research the hiring manager's name. If you cannot find it, use "Dear Hiring Team" rather than "To Whom It May Concern."</li>
<li><strong>Forgetting to proofread.</strong> Typos and grammatical errors suggest carelessness.</li>
</ul>

<h2>Cover Letter Template</h2>
<p>[Your Name]<br>[Email] | [Phone] | [LinkedIn URL]</p>
<p>[Date]</p>
<p>[Hiring Manager Name]<br>[Company Name]<br>[Company Address]</p>
<p>Dear [Name/Hiring Team],</p>
<p>[Opening: Position, source, and your hook — 3-4 sentences]</p>
<p>[Experience: Most relevant achievements with numbers — 4-6 sentences]</p>
<p>[Why this company: Show research, connect skills to needs — 3-5 sentences]</p>
<p>[Closing: Reiterate interest, call to action — 2-3 sentences]</p>
<p>Best regards,<br>[Your Name]</p>

<h2>Cover Letter Checklist</h2>
<ul>
<li>Is the letter addressed to a specific person or team?</li>
<li>Does the opening clearly state the position I am applying for?</li>
<li>Have I included specific examples with measurable outcomes?</li>
<li>Have I demonstrated knowledge of the organisation?</li>
<li>Is the letter no longer than one page?</li>
<li>Have I removed generic phrases and clichés?</li>
<li>Is the tone professional but authentic?</li>
<li>Have I proofread for spelling and grammar?</li>
<li>Has at least one other person reviewed this letter?</li>
<li>Does the closing include a clear call to action?</li>
</ul>

${RELATED}
`
  },
  {
    slug: "cv-writing",
    title: "How to Write a CV: The Complete Guide for Students",
    desc: "Learn how to write a professional CV that gets results. Complete guide with format, examples, and tips for students applying for scholarships, internships, and graduate programmes.",
    keywords: "cv writing, how to write cv, cv template, student cv, academic cv, curriculum vitae",
    content: `
<p>A curriculum vitae (CV) is the foundation of every application you will ever submit. Whether you are applying for a <a href="/scholarships.html">scholarship</a>, an <a href="/internships.html">internship</a>, a graduate programme, or a job, your CV is the first document that selection committees review. A well-structured CV communicates your qualifications clearly and professionally. A poorly structured one gets discarded within seconds.</p>

<p>This guide covers everything students and recent graduates need to know about writing a CV that stands out — from formatting and structure to content strategy and common mistakes.</p>

<h2>CV vs Resume: What's the Difference?</h2>
<p>The terms CV and resume are often used interchangeably, but they are different documents. A resume is a one-page summary of your qualifications, typically used for job applications in the United States and Canada. A CV is a more detailed document that can run two to four pages, commonly used for academic positions, scholarships, and international applications.</p>
<p>For most international scholarship applications — including <a href="/blog/top-fully-funded-scholarships.html">Chevening</a>, <a href="/opportunity/daad-study-scholarship-germany/">DAAD</a>, and <a href="/opportunity/mext-japanese-government-scholarship-japan/">MEXT</a> — a CV is the expected format. For jobs in the US, use a resume. For everything else, a CV is usually the safer choice.</p>

<h2>CV Structure: Section by Section</h2>

<h3>1. Contact Information</h3>
<p>Place your full name, professional email address, phone number (with country code), and LinkedIn profile URL at the top. Include your city and country — you do not need your full street address. Do not include your photo, date of birth, marital status, or nationality unless specifically requested (common in some European and Asian countries).</p>

<h3>2. Personal Statement (2-3 sentences)</h3>
<p>A brief statement at the top that summarises who you are and what you are looking for. For example: "Environmental science graduate with two years of field research experience in wetland ecosystems, seeking a master's programme in Conservation Biology to develop expertise in species recovery planning." Keep it specific and targeted.</p>

<h3>3. Education</h3>
<p>List your qualifications in reverse chronological order. Include: institution name, degree, field of study, graduation date (or expected date), GPA or classification (if strong), and any honours or distinctions. For each degree, you may include a brief note about your thesis or major research project if relevant.</p>

<h3>4. Work Experience</h3>
<p>List positions in reverse chronological order. For each role, include: job title, organisation name, location, dates, and 3-5 bullet points describing your responsibilities and achievements. Start each bullet with an action verb and include specific numbers wherever possible: "Managed a budget of $15,000 for community health outreach programmes serving 500 beneficiaries."</p>

<h3>5. Research Experience (if applicable)</h3>
<p>For academic applications, this section is critical. List research projects you have contributed to, your specific role, the methodology used, and any outcomes (publications, presentations, reports).</p>

<h3>6. Publications and Presentations</h3>
<p>List any papers, articles, conference presentations, or posters. Use a consistent citation format. If you have co-authored papers, indicate your contribution.</p>

<h3>7. Skills</h3>
<p>Organise skills into categories: Technical (software, programming languages, lab techniques), Languages (with proficiency levels — use the CEFR scale for European applications: A1-C2), and Professional (project management, data analysis, etc.).</p>

<h3>8. Awards and Honours</h3>
<p>List scholarships, dean's list recognitions, competition wins, and other honours. Include the name of the award, granting organisation, and date.</p>

<h3>9. Extracurricular Activities and Volunteer Work</h3>
<p>Include leadership roles, club memberships, and volunteer work that demonstrate skills relevant to your application. Focus on what you accomplished, not just what your title was.</p>

<h3>10. References</h3>
<p>Either list two to three referees with their name, title, institution, email, and relationship to you, or write "References available upon request." For scholarship applications, listing referees directly is preferred.</p>

<h2>CV Formatting Tips</h2>
<ul>
<li>Use a clean, professional font: Arial, Calibri, or Times New Roman at 10-12pt.</li>
<li>Maintain consistent formatting throughout — same bullet style, same date format, same heading sizes.</li>
<li>Use clear section headings that allow the reader to scan quickly.</li>
<li>Save as PDF unless otherwise specified. Name the file professionally: "FirstName_LastName_CV.pdf."</li>
<li>Keep it to two pages for most applications. Academic CVs can be longer.</li>
<li>Use white space generously. Dense, cramped CVs are difficult to read.</li>
</ul>

<h2>Common CV Mistakes</h2>
<ul>
<li><strong>Including irrelevant information.</strong> Tailor your CV to each application. Remove experiences that do not strengthen your candidacy.</li>
<li><strong>Using vague language.</strong> "Responsible for managing social media" is weak. "Grew Instagram following by 140% over six months through targeted content strategy" is strong.</li>
<li><strong>Spelling and grammar errors.</strong> These signal carelessness. Proofread multiple times and have others review.</li>
<li><strong>Using an unprofessional email address.</strong> Use your name. Not "partyanimal99@email.com."</li>
<li><strong>Lying or exaggerating.</strong> Selection committees can verify claims. Be honest about your experience and skills.</li>
<li><strong>Not tailoring the CV.</strong> A CV for a research position should look different from a CV for a marketing internship.</li>
</ul>

<h2>CV Checklist</h2>
<ul>
<li>Is my contact information current and professional?</li>
<li>Is my personal statement specific and targeted?</li>
<li>Are sections in the right order for this application?</li>
<li>Have I used action verbs and specific numbers?</li>
<li>Is the formatting consistent throughout?</li>
<li>Is the CV within the appropriate length?</li>
<li>Have I removed all irrelevant information?</li>
<li>Have I proofread for spelling and grammar?</li>
<li>Has at least one other person reviewed this CV?</li>
<li>Is the file saved as a professionally named PDF?</li>
</ul>

${RELATED}
`
  },
  {
    slug: "ats-resume",
    title: "ATS Resume Guide: How to Beat Applicant Tracking Systems",
    desc: "Learn how to write an ATS-friendly resume that passes automated screening and reaches human recruiters. Formatting tips, keyword strategies, and templates.",
    keywords: "ats resume, ats friendly resume, applicant tracking system, resume keywords, resume formatting",
    content: `
<p>More than 75% of resumes submitted online are never seen by a human being. They are filtered out by Applicant Tracking Systems (ATS) — software that scans resumes for keywords, formatting, and relevance before a recruiter ever opens them. If your resume is not optimised for ATS, you could be highly qualified and still get rejected automatically.</p>

<p>This guide teaches you how to create a resume that passes ATS screening and reaches the hands of the hiring manager. Whether you are applying for <a href="/internships.html">internships</a>, graduate programmes, or entry-level positions, understanding ATS is essential.</p>

<h2>What Is an Applicant Tracking System?</h2>
<p>An ATS is software used by employers to manage the recruitment process. When you submit a resume online, it goes into the ATS, which parses your information, scores your resume based on relevance to the job description, and ranks you against other candidates. Common ATS platforms include Workday, Taleo, Greenhouse, Lever, and iCIMS.</p>
<p>The ATS looks for: keywords that match the job description, standard section headings (Work Experience, Education, Skills), simple formatting that can be parsed correctly, and contact information in expected locations.</p>

<h2>How to Format Your Resume for ATS</h2>

<h3>Use a Simple Layout</h3>
<p>ATS software reads top to bottom, left to right. Complex layouts with columns, text boxes, tables, or graphics can confuse the parser. Use a single-column layout with clear section headings. Avoid headers and footers for important information — some ATS platforms cannot read them.</p>

<h3>Choose the Right File Format</h3>
<p>Unless the application specifically requests a PDF, submit a .docx file. Most ATS platforms parse .docx more reliably than PDF. If you submit a PDF, ensure it is text-based (not a scanned image) so the ATS can extract the text.</p>

<h3>Use Standard Section Headings</h3>
<p>The ATS looks for standard headings to categorise your information. Use "Work Experience" (not "Professional Journey"), "Education" (not "Academic Background"), and "Skills" (not "Areas of Expertise"). Creative headings may not be recognised by the parser.</p>

<h3>Choose an ATS-Friendly Font</h3>
<p>Use standard fonts: Arial, Calibri, Times New Roman, or Helvetica. Avoid decorative fonts. Use 10-12pt for body text and 14-16pt for headings.</p>

<h2>Keyword Optimisation: The Most Important Step</h2>
<p>The ATS scores your resume based on how well it matches the job description. The single most important thing you can do is include the right keywords.</p>

<h3>How to Find the Right Keywords</h3>
<p>Read the job description carefully. Identify the hard skills (software, tools, certifications), soft skills (leadership, communication, problem-solving), and industry-specific terms that appear. These are your target keywords. Include them naturally in your resume — in your skills section, your work experience bullet points, and your summary.</p>

<h3>Keyword Placement Strategy</h3>
<p>Place the most important keywords in the first third of your resume, as some ATS platforms weight early content more heavily. Include keywords in context — "Python programming" is better than just listing "Python." Match the exact phrasing used in the job description: if they say "project management," do not write "managed projects."</p>

<h3>Keyword Density</h3>
<p>Include each keyword two to three times across your resume. Do not stuff keywords — modern ATS platforms can detect keyword stuffing and may flag your resume. The keywords should appear naturally in your descriptions of real experience.</p>

<h2>What to Avoid in an ATS Resume</h2>
<ul>
<li><strong>Graphics, charts, and images.</strong> The ATS cannot read them.</li>
<li><strong>Tables and text boxes.</strong> They confuse the parser.</li>
<li><strong>Headers and footers.</strong> Some ATS platforms skip them.</li>
<li><strong>Fancy formatting.</strong> Bullet characters other than standard circles or squares may not parse correctly.</li>
<li><strong>Acronyms without full forms.</strong> Write "Search Engine Optimization (SEO)" the first time, then use the acronym.</li>
<li><strong>Dates in non-standard formats.</strong> Use "Month Year" or "MM/YYYY" consistently.</li>
<li><strong>Unusual section headings.</strong> The ATS needs to recognise your sections to categorise information correctly.</li>
</ul>

<h2>ATS Resume Template Structure</h2>
<p>[Full Name]<br>[Email] | [Phone] | [City, Country] | [LinkedIn URL]</p>
<p><strong>Professional Summary</strong><br>[2-3 sentences with key qualifications and target keywords]</p>
<p><strong>Skills</strong><br>[List 8-12 relevant hard and soft skills, matching job description keywords]</p>
<p><strong>Work Experience</strong><br>[Job Title] | [Company] | [Month Year – Month Year]</p>
<ul>
<li>[Bullet point starting with action verb, including keyword and measurable outcome]</li>
<li>[Bullet point with specific achievement]</li>
<li>[Bullet point demonstrating relevant skill]</li>
</ul>
<p><strong>Education</strong><br>[Degree] | [Institution] | [Graduation Date]<br>[GPA if above 3.5, honours, relevant coursework]</p>
<p><strong>Certifications</strong><br>[Certification Name] | [Issuing Organisation] | [Date]</p>

<h2>ATS Resume Checklist</h2>
<ul>
<li>Have I identified keywords from the job description?</li>
<li>Are keywords included naturally throughout my resume?</li>
<li>Is the layout single-column and simple?</li>
<li>Are section headings standard and recognisable?</li>
<li>Is the file in .docx or text-based PDF format?</li>
<li>Have I removed all graphics, tables, and text boxes?</li>
<li>Are dates in a consistent, standard format?</li>
<li>Have I spelled out acronyms at least once?</li>
<li>Does my resume include measurable achievements?</li>
<li>Have I tested my resume by pasting the content into a plain text file to check parsing?</li>
</ul>

${RELATED}
`
  },
  {
    slug: "resume-templates",
    title: "Resume Templates for Students: Free Examples and Guides",
    desc: "Download-ready resume templates for students applying for internships, scholarships, and graduate programmes. Professional formats with examples for every scenario.",
    keywords: "resume template, student resume template, resume examples, internship resume, scholarship resume",
    content: `
<p>Having a professional, well-structured resume template is essential for any student applying to internships, scholarships, or graduate programmes. A good template ensures your resume is properly formatted, ATS-friendly, and presents your qualifications in the best possible light. This guide provides resume templates and structural examples for every common application scenario.</p>

<h2>Why Templates Matter</h2>
<p>A resume template is not about filling in blanks — it is about understanding the structure that works. The best templates are clean, professional, and designed to communicate your qualifications quickly. Selection committees spend an average of six to eight seconds scanning a resume before deciding whether to read further. Your template must make it easy for them to find what matters.</p>

<h2>Template 1: The Internship Resume</h2>
<p>For students with limited work experience applying for <a href="/internships.html">internships</a>. Focus on education, coursework, projects, and extracurricular activities.</p>
<p><strong>Structure:</strong></p>
<ul>
<li>Contact Information (name, email, phone, LinkedIn, city/country)</li>
<li>Objective (2 sentences: what you are seeking and what you bring)</li>
<li>Education (degree, institution, expected graduation, GPA, relevant coursework)</li>
<li>Projects (2-3 academic or personal projects with outcomes)</li>
<li>Experience (part-time jobs, volunteer work, leadership roles)</li>
<li>Skills (technical and language skills)</li>
<li>Activities (clubs, organisations, competitions)</li>
</ul>
<p><strong>Key tip:</strong> When you lack professional experience, your projects become your experience. Describe academic projects with the same rigour you would use for a job: what was the problem, what did you do, what was the outcome?</p>

<h2>Template 2: The Scholarship CV</h2>
<p>For students applying for <a href="/scholarships.html">scholarships</a> and fellowships. Focus on academic achievements, research, leadership, and community impact.</p>
<p><strong>Structure:</strong></p>
<ul>
<li>Contact Information</li>
<li>Personal Statement (3-4 sentences about your goals and qualifications)</li>
<li>Education (detailed: thesis, research interests, academic honours)</li>
<li>Research Experience (projects, methodologies, outcomes)</li>
<li>Publications and Presentations (if any)</li>
<li>Work Experience (focus on impact and leadership)</li>
<li>Awards and Honours (scholarships, prizes, recognitions)</li>
<li>Community Service and Volunteer Work</li>
<li>Skills (languages with proficiency levels, technical skills)</li>
<li>References (2-3 academic referees)</li>
</ul>
<p><strong>Key tip:</strong> Scholarship CVs should be longer and more detailed than job resumes. Include your GPA, class rank (if strong), thesis title, and specific academic achievements. See our <a href="/guides/cv-writing.html">CV writing guide</a> for more detail.</p>

<h2>Template 3: The Graduate School CV</h2>
<p>For students applying for master's or PhD programmes. Focus on research experience, academic fit, and scholarly potential.</p>
<p><strong>Structure:</strong></p>
<ul>
<li>Contact Information</li>
<li>Research Interests (2-3 sentences)</li>
<li>Education (detailed, with thesis and relevant coursework)</li>
<li>Research Experience (detailed: projects, methods, findings, presentations)</li>
<li>Publications</li>
<li>Teaching Experience (if any)</li>
<li>Work Experience (relevant only)</li>
<li>Conference Presentations and Talks</li>
<li>Awards, Grants, and Fellowships</li>
<li>Professional Memberships</li>
<li>Skills (lab techniques, software, languages)</li>
<li>References (3 academic referees)</li>
</ul>
<p><strong>Key tip:</strong> For PhD applications, your research experience section is the most important part of your CV. Detail every project, your specific contribution, the methodology, and the outcome. Mention any papers in preparation or under review.</p>

<h2>Template 4: The ATS-Optimised Resume</h2>
<p>For students applying through online portals where an ATS will screen the resume. See our full <a href="/guides/ats-resume.html">ATS resume guide</a> for detailed advice.</p>
<p><strong>Structure:</strong></p>
<ul>
<li>Contact Information (simple, no graphics)</li>
<li>Professional Summary (keyword-rich, 2-3 sentences)</li>
<li>Skills (8-12 keywords matching the job description)</li>
<li>Work Experience (reverse chronological, bullet points with keywords)</li>
<li>Education</li>
<li>Certifications</li>
</ul>
<p><strong>Key tip:</strong> No columns, no tables, no graphics. Single-column layout with standard headings. Keywords from the job description placed naturally throughout.</p>

<h2>How to Customise Any Template</h2>
<ul>
<li><strong>Read the requirements.</strong> Before customising, read the job description, scholarship criteria, or programme requirements carefully.</li>
<li><strong>Prioritise relevance.</strong> Move the most relevant sections to the top. If applying for a research position, research experience comes before work experience.</li>
<li><strong>Quantify achievements.</strong> Replace vague descriptions with specific numbers: "Managed social media" becomes "Grew Instagram following by 140% over six months."</li>
<li><strong>Use action verbs.</strong> Start every bullet point with a strong verb: Developed, Managed, Led, Designed, Implemented, Analysed, Created.</li>
<li><strong>Remove irrelevant information.</strong> If it does not strengthen your application for this specific opportunity, remove it.</li>
<li><strong>Match keywords.</strong> Include the exact terms used in the job description or scholarship criteria.</li>
</ul>

<h2>Resume Formatting Rules</h2>
<ul>
<li>Font: Arial, Calibri, or Times New Roman, 10-12pt body, 14-16pt headings</li>
<li>Margins: 0.5 to 1 inch on all sides</li>
<li>Line spacing: 1.0 to 1.15</li>
<li>Bullet style: Standard circles or squares</li>
<li>Date format: "Month Year" or "MM/YYYY" — be consistent</li>
<li>File format: PDF for email submissions, .docx for ATS portals</li>
<li>File name: "FirstName_LastName_Resume.pdf"</li>
</ul>

<h2>Common Resume Template Mistakes</h2>
<ul>
<li>Using a creative or infographic resume for a corporate application</li>
<li>Including a photo when applying in the US, UK, or Canada (unless requested)</li>
<li>Using an objective statement that focuses on what you want rather than what you offer</li>
<li>Listing "References available upon request" when you should list them directly</li>
<li>Using more than two pages for a non-academic resume</li>
<li>Including personal information like age, marital status, or religion (unless culturally expected)</li>
</ul>

${RELATED}
`
  }
];

pages.forEach(gen);
console.log(`\nDone! Generated ${pages.length} pages.`);
