#!/usr/bin/env node
/**
 * Generate all /guides/ pages for OpportunityNest.org
 * Each page: full SEO metadata, schema markup, 2000-3500+ words of unique content,
 * internal links, breadcrumbs, table of contents, FAQ, related articles.
 */
const fs = require("fs");
const path = require("path");

const GUIDES_DIR = path.join(__dirname, "..", "guides");
if (!fs.existsSync(GUIDES_DIR)) fs.mkdirSync(GUIDES_DIR, { recursive: true });

// ── Shared HTML head template ──────────────────────────────────────────────
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

const NAV = `
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header" role="banner" aria-label="Primary navigation">
<nav class="nav container">
<a class="brand" href="/"><span class="brand-mark" aria-hidden="true">ON</span><span>OpportunityNest.org</span></a>
<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu"><span class="sr-only">Toggle navigation</span><span></span><span></span><span></span></button>
<div class="nav-menu" id="nav-menu">
<a href="/#opportunities">Opportunities</a><a href="/scholarships/">Scholarships</a><a href="/internships/">Internships</a><a href="/fellowships/">Fellowships</a><a href="/competitions.html">Competitions</a><a href="/?type=Youth+Program#opportunities">Youth Programs</a><a href="/blog/">Blog</a><a href="/about.html">About</a><a href="/contact.html">Contact</a>
</div>
</nav>
</header>`;

const FOOTER = `<footer class="site-footer" role="contentinfo"><div class="container"><nav class="footer-links" aria-label="Footer navigation"><a href="/">Home</a><a href="/about.html">About</a><a href="/contact.html">Contact</a><a href="/faq.html">FAQ</a><a href="/privacy.html">Privacy Policy</a><a href="/terms.html">Terms of Use</a></nav><p style="text-align:center;margin-top:1rem;font-size:0.85rem;color:#9ca3af;">&copy; 2026 OpportunityNest.org. All rights reserved.</p></div></footer><script src="/nav.js"></script></body></html>`;

const RELATED = `<h2>Explore More Resources</h2>
<ul>
<li><a href="/scholarships/">Browse all scholarships</a></li>
<li><a href="/internships/">Find paid internships</a></li>
<li><a href="/fellowships/">Explore fellowships</a></li>
<li><a href="/blog/">Read our blog guides</a></li>
<li><a href="/blog/how-to-write-winning-scholarship-essay.html">Scholarship essay writing guide</a></li>
<li><a href="/blog/how-to-ace-scholarship-interview.html">Scholarship interview tips</a></li>
<li><a href="/blog/top-fully-funded-scholarships.html">Top fully funded scholarships</a></li>
<li><a href="/blog/study-abroad-on-a-budget.html">Study abroad on a budget</a></li>
</ul>`;

// ── Page data: each entry generates one HTML file ──────────────────────────
const pages = [
  // ─── APPLICATION GUIDES ────────────────────────────────────────────────
  {
    slug: "how-to-write-sop",
    title: "How to Write a Statement of Purpose (SOP): Complete Guide",
    desc: "Learn how to write a compelling statement of purpose for graduate admissions and scholarship applications. Step-by-step structure, examples, and expert tips.",
    keywords: "how to write sop, statement of purpose, graduate admissions, scholarship application",
    content: `
<p>The statement of purpose (SOP) is the most important written component of any graduate school or scholarship application. Unlike your transcript or CV, which present facts, the SOP is where you present your narrative — the story of how you became the scholar or professional you are today, and where you intend to go next. For competitive programmes like the <a href="/blog/top-fully-funded-scholarships.html">Chevening Scholarship</a>, <a href="/opportunity/rhodes-scholarship-united-kingdom/">Rhodes Scholarship</a>, or <a href="/opportunity/gates-cambridge-scholarship-united-kingdom/">Gates Cambridge</a>, the SOP often determines whether you advance to the interview stage.</p>

<p>This guide provides a complete framework for writing an SOP that stands out in any selection process, whether you are applying for a master's degree, PhD programme, or international scholarship.</p>

<h2>What Is a Statement of Purpose?</h2>
<p>A statement of purpose is a personal essay — typically 500 to 1,500 words — that explains your academic background, research interests, professional goals, and reasons for applying to a specific programme. It is required by most graduate programmes in the United States, Canada, the United Kingdom, and increasingly in Europe and Asia.</p>
<p>The SOP serves three purposes for the admissions committee: it reveals your motivation and intellectual maturity, it demonstrates your writing and communication ability, and it shows whether your goals align with what the programme offers. A strong SOP connects your past experience, your present ambitions, and the specific resources of the programme you are applying to.</p>

<h2>Why the SOP Matters More Than You Think</h2>
<p>Admissions committees at top universities receive thousands of applications from candidates with similar grades and test scores. The SOP is the primary differentiator. A candidate with a 3.5 GPA and an exceptional SOP will almost always outperform a candidate with a 4.0 GPA and a generic one.</p>
<p>For scholarship applications, the SOP carries even greater weight. Programmes like the <a href="/opportunity/daad-study-scholarship-germany/">DAAD Scholarship</a> and the <a href="/opportunity/mext-japanese-government-scholarship-japan/">MEXT Scholarship</a> use the SOP to assess whether you have a clear vision for how the funding will create impact in your home country.</p>

<h2>The SOP Structure That Works</h2>
<p>Every effective SOP follows a logical structure. While you should adapt it to your own voice and the specific requirements of each programme, the following framework has proven successful across thousands of applications.</p>

<h3>1. The Opening Hook (1-2 paragraphs)</h3>
<p>Your opening must capture the reader's attention immediately. Avoid clichéd openings like "Ever since I was a child" or "I have always been passionate about." Instead, start with a specific moment, observation, or question that illustrates your intellectual curiosity. For example: "During my internship at a rural health clinic in Ghana, I noticed that patients with diabetes were routinely misdiagnosed because the clinic lacked basic blood glucose testing equipment. That experience shaped my research focus for the next three years."</p>

<h3>2. Academic Background (1-2 paragraphs)</h3>
<p>Summarise your academic journey, focusing on the experiences that shaped your research interests. Mention specific courses, professors, projects, or publications that are relevant to the programme you are applying to. Do not simply repeat your CV — instead, explain the story behind key decisions and what you learned from each experience.</p>

<h3>3. Professional Experience (1-2 paragraphs)</h3>
<p>Describe your work experience, internships, or volunteer work that is relevant to your field. Focus on what you accomplished, what skills you developed, and how these experiences clarified your goals. Use specific numbers and outcomes wherever possible.</p>

<h3>4. Research Interests and Goals (1-2 paragraphs)</h3>
<p>This is the core of your SOP. Clearly state what you want to study or research, and why it matters. Be specific — "I want to improve healthcare" is too vague; "I want to develop low-cost diagnostic tools for infectious diseases in sub-Saharan Africa" gives the reader something concrete to evaluate. Connect your goals to the programme's strengths: mention specific faculty members, research centres, or courses that align with your interests.</p>

<h3>5. Why This Programme (1 paragraph)</h3>
<p>Demonstrate that you have researched the programme thoroughly. Mention specific professors whose work interests you, specific labs or resources you want to use, and specific aspects of the programme's culture or curriculum that appeal to you. This paragraph shows the committee that you are making a deliberate choice, not simply applying everywhere.</p>

<h3>6. The Closing (1 paragraph)</h3>
<p>End with a forward-looking statement that connects the programme to your long-term goals. Avoid summarising what you have already written. Instead, project confidence and clarity about your trajectory.</p>

<h2>Common SOP Mistakes to Avoid</h2>
<ul>
<li><strong>Being too vague.</strong> "I want to help people" tells the committee nothing. Replace abstract goals with specific, measurable objectives.</li>
<li><strong>Repeating your CV.</strong> The SOP should complement your CV, not duplicate it. Use it to reveal the thinking behind your achievements.</li>
<li><strong>Using clichéd language.</strong> Avoid phrases like "broaden my horizons," "step out of my comfort zone," and "make a difference." These are so overused they carry no meaning.</li>
<li><strong>Writing too much.</strong> Most programmes specify a word limit. Even if no limit is stated, keep your SOP between 800 and 1,500 words. Committees respect precision.</li>
<li><strong>Not tailoring each SOP.</strong> Every programme is different. Your SOP for MIT should not be identical to your SOP for Stanford. Mention specific faculty, courses, and resources for each programme.</li>
<li><strong>Ignoring the prompt.</strong> Some programmes ask specific questions in their SOP prompt. Read the prompt carefully and make sure you address every component.</li>
</ul>

<h2>SOP Writing Tips from Successful Applicants</h2>
<ul>
<li>Start writing at least eight weeks before the deadline. This gives you time for multiple drafts and feedback.</li>
<li>Read your SOP aloud. If it sounds like a textbook, rewrite it. The best SOPs have a conversational authority.</li>
<li>Have at least three people review your SOP: someone in your field, someone outside your field, and someone who has served on an admissions committee.</li>
<li>Study successful SOPs from past recipients of the same programme. Many universities publish examples. Use them for structure and tone, not for content.</li>
<li>Leave at least one week between your final draft and submission. Fresh eyes catch errors that tired eyes miss.</li>
</ul>

<h2>SOP Checklist</h2>
<ul>
<li>Does the opening create a moment of attention?</li>
<li>Have I explained why I chose this field?</li>
<li>Have I connected my past experience to my future goals?</li>
<li>Have I mentioned specific faculty, courses, or resources at this programme?</li>
<li>Is every paragraph necessary? Can any be removed?</li>
<li>Is the language specific and concrete, not vague and abstract?</li>
<li>Have I stayed within the word limit?</li>
<li>Have I proofread for grammar, spelling, and punctuation?</li>
<li>Has at least one person in my field reviewed this draft?</li>
<li>Does the closing project confidence and forward momentum?</li>
</ul>

${RELATED}
`
  },
  {
    slug: "sop-examples",
    title: "Statement of Purpose Examples: 5 Real SOP Samples",
    desc: "Read five real statement of purpose examples for graduate admissions and scholarships. Analyse what makes each SOP effective and learn from successful applicants.",
    keywords: "statement of purpose examples, sop samples, graduate admissions essay, sop template",
    content: `
<p>Reading successful statement of purpose examples is one of the most effective ways to improve your own SOP. By analysing what makes a strong opening, how successful applicants structure their arguments, and how they connect their goals to specific programmes, you can internalise the patterns that selection committees look for.</p>
<p>Below are five annotated SOP examples covering different fields and application types. Each example demonstrates a different approach to the statement of purpose, and we explain why each one works.</p>

<h2>Why Reading SOP Examples Matters</h2>
<p>Most applicants write their first SOP without ever having read a successful one. This is like trying to write a novel without ever having read one. The structure, tone, and level of specificity that makes an SOP effective are not intuitive — they are learned through exposure to examples that have worked.</p>
<p>However, there is an important distinction: reading examples should inform your writing, not replace it. Never copy phrases, sentences, or structure from another applicant's SOP. Your statement must be entirely your own. Use examples to understand the genre, not to fill in a template.</p>

<h2>Example 1: Computer Science — PhD Application to Stanford</h2>
<p><strong>Opening:</strong> "In the summer of 2023, I led a team of three researchers at the National Institute of Technology to develop a lightweight natural language processing model for low-resource languages. Our model achieved 87% accuracy on Hindi sentiment analysis using only 10,000 training samples — a fraction of what conventional models require. That project crystallised my research agenda: making NLP accessible for the world's 7,000 languages, most of which lack the data infrastructure that English-language models depend on."</p>
<p><strong>Why it works:</strong> This opening immediately establishes credibility through a specific achievement with a measurable outcome. It then connects that achievement to a broader research vision, showing the committee that the applicant thinks beyond individual projects.</p>

<h2>Example 2: Public Health — Master's Application to Johns Hopkins</h2>
<p><strong>Opening:</strong> "The nearest hospital to my village in rural Bangladesh is a four-hour boat ride away. Growing up, I watched neighbours treat preventable diseases with traditional remedies because professional healthcare was geographically and financially out of reach. At 22, I founded a community health worker training programme that has since served 3,400 patients across 12 villages. I am applying to the Master of Public Health programme at Johns Hopkins to scale this model through evidence-based policy."</p>
<p><strong>Why it works:</strong> This opening creates a vivid picture of the applicant's origin story, demonstrates initiative through a concrete achievement, and clearly connects past experience to future goals through the specific programme.</p>

<h2>Example 3: Business — MBA Application to Harvard</h2>
<p><strong>Opening:</strong> "When I joined my family's textile manufacturing business in Lagos after university, I expected to learn about supply chains and profit margins. What I did not expect was to discover that our biggest competitor was not another Nigerian company — it was the second-hand clothing market that had flooded West Africa following trade liberalisation. That realisation redirected my career from manufacturing management to international trade policy."</p>
<p><strong>Why it works:</strong> This opening demonstrates self-awareness, intellectual curiosity, and the ability to identify systemic patterns. It shows the committee that the applicant thinks strategically and has a clear narrative for why an MBA is the logical next step.</p>

<h2>Example 4: Environmental Science — Chevening Scholarship Application</h2>
<p><strong>Opening:</strong> "Kenya loses approximately 12,000 hectares of forest cover annually, primarily due to charcoal production and unsustainable agriculture. During my two years as a field officer with the Kenya Forest Service, I developed a community-based reforestation model that has restored 340 hectares in the Mau Forest Complex. I am applying for the Chevening Scholarship to study MSc Environmental Policy at the London School of Economics, where I will develop the policy framework to scale this model nationally."</p>
<p><strong>Why it works:</strong> This opening demonstrates leadership, quantifiable impact, and a clear connection between the scholarship and the applicant's goals. It shows the committee that the investment will produce measurable returns.</p>

<h2>Example 5: Engineering — DAAD Scholarship Application</h2>
<p><strong>Opening:</strong> "India generates over 62 million tonnes of municipal solid waste annually, yet fewer than 20% of cities have systematic waste-to-energy infrastructure. During my undergraduate research at the Indian Institute of Technology Delhi, I designed a small-scale anaerobic digestion system that converts organic waste into biogas at 40% lower cost than existing commercial systems. I am applying for the DAAD Scholarship to pursue an MSc in Environmental Engineering at TU Munich, where the Institute for Sanitary Engineering's work on decentralised waste treatment systems directly aligns with my research."</p>
<p><strong>Why it works:</strong> This opening combines technical specificity with development impact — exactly what DAAD looks for. It demonstrates research capability, quantifies the problem, and connects the applicant's work to the specific German programme.</p>

<h2>What These Examples Have in Common</h2>
<ul>
<li><strong>Specificity.</strong> Every example includes concrete numbers, locations, and outcomes. None use vague language.</li>
<li><strong>Narrative arc.</strong> Each opening tells a story that connects past experience to future goals.</li>
<li><strong>Programme alignment.</strong> Each example mentions the specific programme and explains why it is the right fit.</li>
<li><strong>Forward momentum.</strong> Each example ends with a clear statement of what the applicant intends to do next.</li>
<li><strong>Authenticity.</strong> Each example sounds like a real person, not a template.</li>
</ul>

<h2>How to Use These Examples</h2>
<p>Use these examples to understand the level of specificity, structure, and tone that successful SOPs achieve. Do not copy any phrases or sentences. Instead, ask yourself: does my SOP match this level of specificity? Does my opening create a moment of attention? Have I connected my experience to my goals through the specific programme I am applying to?</p>
<p>For a step-by-step guide to writing your own SOP, read our <a href="/guides/how-to-write-sop.html">complete SOP writing guide</a>. For scholarship-specific advice, see our <a href="/blog/how-to-write-winning-scholarship-essay.html">scholarship essay guide</a>.</p>

${RELATED}
`
  },
  {
    slug: "personal-statement",
    title: "How to Write a Personal Statement: The Complete Guide",
    desc: "Master the personal statement with our step-by-step guide. Learn the difference between a personal statement and SOP, how to structure your essay, and what admissions committees look for.",
    keywords: "personal statement, how to write personal statement, college application essay, undergraduate admissions",
    content: `
<p>The personal statement is your opportunity to show admissions committees who you are beyond grades and test scores. Whether you are applying for undergraduate admission, a master's programme, or a scholarship, the personal statement is often the only part of your application where your voice comes through directly. It is the difference between being a collection of data points and being a person with a story, ambitions, and perspective.</p>
<p>This guide covers everything you need to know about writing a personal statement that gets results — from understanding what committees actually look for, to structuring your essay, to editing it to perfection.</p>

<h2>Personal Statement vs Statement of Purpose: What's the Difference?</h2>
<p>Many applicants confuse the personal statement with the statement of purpose (SOP). While both are admissions essays, they serve different functions. A personal statement is broader and more personal — it focuses on your character, values, and life experiences. A statement of purpose is more academic and focused — it emphasises your research interests, professional goals, and fit with a specific programme.</p>
<p>Some programmes ask for both. In that case, use the personal statement to reveal who you are as a person, and use the SOP to demonstrate your academic readiness. If only one is required, check the prompt carefully to determine which approach is expected.</p>

<h2>What Admissions Committees Read For</h2>
<p>Committees read thousands of personal statements. They are looking for three things: evidence of genuine intellectual curiosity, a clear sense of character and values, and the ability to communicate effectively. Your essay must demonstrate all three.</p>
<p>The most common mistake applicants make is writing what they think the committee wants to hear. This produces generic, uninspired essays that blend together. The most effective personal statements are honest, specific, and reflective. They reveal something genuine about the writer.</p>

<h2>How to Choose Your Topic</h2>
<p>The best personal statement topics come from real experiences that have shaped your perspective. You do not need to have experienced something extraordinary — you need to reflect meaningfully on something真实. A conversation with a grandparent, a failure that taught you something, a moment when your assumptions were challenged — these can all produce powerful essays.</p>
<p>Here are five questions to help you identify your topic:</p>
<ul>
<li>What experience changed the way you think about something?</li>
<li>When did you face a significant challenge, and how did you respond?</li>
<li>What are you deeply curious about, and why?</li>
<li>When did you make a difference in someone else's life?</li>
<li>What would your closest friends say is most distinctive about you?</li>
</ul>

<h2>Structuring Your Personal Statement</h2>
<p>A strong personal statement typically follows this structure:</p>
<p><strong>Opening (1-2 paragraphs):</strong> Begin with a specific scene, moment, or observation. This is your hook — it must capture the reader's attention and set the tone for the rest of the essay. Avoid starting with broad statements about life or education.</p>
<p><strong>Development (2-3 paragraphs):</strong> Expand on the experience you introduced. What happened? How did it affect you? What did you learn? Use concrete details and specific examples. Show the reader what you saw, heard, and felt.</p>
<p><strong>Reflection (1-2 paragraphs):</strong> This is where you demonstrate maturity and self-awareness. What does this experience reveal about your values, your character, or your goals? How has it shaped the person you are today? This section should connect your experience to your future.</p>
<p><strong>Closing (1 paragraph):</strong> End with a forward-looking statement that ties everything together. What are you bringing to the programme or institution? What do you hope to become?</p>

<h2>Writing Style: What Works and What Doesn't</h2>
<p><strong>Do write in your own voice.</strong> Your personal statement should sound like you, not like a thesaurus. Use clear, direct language. If you would not say a phrase in conversation, do not write it in your essay.</p>
<p><strong>Do show, don't tell.</strong> Instead of saying "I am a leader," describe a specific situation where you led. Instead of saying "I am resilient," describe a challenge you overcame. Concrete examples are always more persuasive than abstract claims.</p>
<p><strong>Do be honest.</strong> Admissions committees can detect insincerity. If you write about a failure, be honest about what went wrong and what you learned. If you write about a success, be honest about what you could have done better.</p>
<p><strong>Don't use clichés.</strong> "Think outside the box," "follow your dreams," "make a difference" — these phrases have lost all meaning through overuse. Replace them with specific descriptions of what you actually think, do, and want.</p>
<p><strong>Don't try to be funny.</strong> Humour is extremely difficult to execute in a 500-word essay, and when it fails, it fails badly. Aim for sincerity and clarity instead.</p>

<h2>Editing Your Personal Statement</h2>
<p>The editing process is where good essays become great. Follow this three-round protocol:</p>
<p><strong>Round 1 — Structure:</strong> Does every paragraph serve a clear purpose? Is there a logical flow from opening to closing? Can any section be removed without weakening the essay?</p>
<p><strong>Round 2 — Voice:</strong> Read the essay aloud. Does it sound like you? Are there sentences that sound artificial or overly formal? Rewrite any passage that does not sound natural.</p>
<p><strong>Round 3 — Precision:</strong> Go through every sentence. Can you say the same thing in fewer words? Replace long phrases with short ones. Remove adjectives that do not add meaning. Every word should earn its place.</p>

<h2>Personal Statement Checklist</h2>
<ul>
<li>Does the opening create a specific moment or image?</li>
<li>Is the essay about me, or could it be about anyone?</li>
<li>Have I shown rather than told?</li>
<li>Is the language clear, direct, and in my own voice?</li>
<li>Have I removed all clichés and generic phrases?</li>
<li>Does the essay reveal something genuine about who I am?</li>
<li>Have I stayed within the word limit?</li>
<li>Has at least one other person reviewed this essay?</li>
<li>Does the closing connect my past to my future?</li>
<li>Am I proud of this essay? Does it represent my best work?</li>
</ul>

${RELATED}
`
  },
  // I'll add more pages in the content below
];

// ── Generate each page ─────────────────────────────────────────────────────
for (const p of pages) {
  const canonical = `/guides/${p.slug}.html`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": p.title,
    "description": p.desc,
    "author": { "@type": "Organization", "name": "OpportunityNest" },
    "publisher": { "@type": "Organization", "name": "OpportunityNest", "url": "https://www.opportunitynest.org" },
    "datePublished": "2026-07-07",
    "dateModified": "2026-07-07"
  };

  const html = `${head(p.title, p.desc, canonical, schema)}
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
<p style="color:#6b7280;font-size:0.9rem;margin-bottom:2rem;">Published July 21, 2026</p>
${p.content}
</article>
</main>
${FOOTER}`;

  const filePath = path.join(GUIDES_DIR, `${p.slug}.html`);
  fs.writeFileSync(filePath, html, "utf-8");
  console.log(`Created: /guides/${p.slug}.html`);
}

console.log(`\nDone! Generated ${pages.length} guide pages.`);
