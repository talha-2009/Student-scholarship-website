insert into public.opportunities (
  type,
  funding,
  title,
  country,
  level,
  field,
  deadline,
  description,
  link
) values
(
  'Scholarship',
  'Fully funded tuition and living allowance',
  'Australia Awards Scholarships',
  'Australia',
  'Master''s, PhD',
  'All fields of study',
  '2026-04-30',
  'Australia Awards Scholarships support students from eligible developing countries to study at participating Australian universities. Awards cover tuition, travel, establishment allowance, and living costs.',
  'https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships'
),
(
  'Scholarship',
  'Partial to full tuition support',
  'Vanier Canada Graduate Scholarships',
  'Canada',
  'PhD',
  'Health research, natural sciences, engineering, humanities, social sciences',
  '2026-10-31',
  'The Vanier CGS program helps Canadian institutions attract highly qualified doctoral students. It supports students who demonstrate leadership skills and a high standard of scholarly achievement.',
  'https://vanier.gc.ca/en/home-accueil.html'
),
(
  'Scholarship',
  'Full tuition and maintenance grant',
  'Chevening Scholarships',
  'UK',
  'Master''s',
  'Any subject at a UK university',
  '2026-11-05',
  'Chevening Scholarships are the UK government''s global scholarship programme, funded by the Foreign, Commonwealth and Development Office and partner organisations.',
  'https://www.chevening.org/scholarships/'
),
(
  'Scholarship',
  'Monthly stipend and travel allowance',
  'DAAD Scholarships for Development-Related Postgraduate Courses',
  'Germany',
  'Master''s',
  'Development-related fields',
  '2026-08-15',
  'DAAD supports international graduates from development and newly industrialised countries with scholarship opportunities for development-related postgraduate courses at German universities.',
  'https://www.daad.de/en/study-and-research-in-germany/scholarships/'
),
(
  'Fellowship',
  'Research stipend and project funding',
  'Marie Sklodowska-Curie Actions Postdoctoral Fellowship',
  'UK',
  'Postdoctoral',
  'All research fields',
  '2026-09-14',
  'MSCA Postdoctoral Fellowships support researchers to carry out their research activities abroad and acquire new skills through advanced training, international, interdisciplinary and inter-sectoral mobility.',
  'https://marie-sklodowska-curie-actions.ec.europa.eu/actions/postdoctoral-fellowships'
),
(
  'Fellowship',
  'Living allowance and research support',
  'Alexander von Humboldt Research Fellowship',
  'Germany',
  'Postdoctoral, Experienced researchers',
  'All research fields',
  'Rolling',
  'The Humboldt Research Fellowship enables highly qualified researchers from abroad to conduct research in Germany and collaborate with German host institutions.',
  'https://www.humboldt-foundation.de/en/apply/sponsorship/humboldt-research-fellowship'
),
(
  'Fellowship',
  'Stipend and professional development',
  'Commonwealth Professional Fellowships',
  'UK',
  'Mid-career professionals',
  'Development and public sector fields',
  '2026-07-14',
  'Commonwealth Professional Fellowships support mid-career professionals from low and middle income Commonwealth countries to spend time at a UK host organisation.',
  'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-professional-fellowships/'
),
(
  'Fellowship',
  'Research grant and mentorship',
  'Australia Research Council Discovery Early Career Researcher Award',
  'Australia',
  'Early career researchers',
  'All research disciplines',
  '2026-06-30',
  'DECRA fellowships provide focused research support for early career researchers in Australia, enabling them to conduct high-quality research and build research capacity.',
  'https://www.arc.gov.au/funding-research/funding-schemes/discovery-program/discovery-early-career-researcher-award-decr'
)
on conflict (title, country, type) do nothing;
