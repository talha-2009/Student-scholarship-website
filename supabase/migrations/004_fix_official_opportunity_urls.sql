begin;

update public.opportunities
set link = replacement.new_url
from (
  values
    ('https://www.unesco.org/en/prizes/esd', 'https://www.unesco.org/en/prizes/education-sustainable-development?hub=72522'),
    ('https://www.salzburgglobal.org/get-involved', 'https://www.salzburgglobal.org/fellowship/an-introduction'),
    ('https://www.kas.de/en/web/begabtenfoerderung-und-kultur/stipendien-und-foerderung', 'https://www.kas.de/en/web/begabtenfoerderung-und%20kultur/international-talent-development'),
    ('https://www.rosalux.de/en/foundation/rosa-luxemburg-stiftung/scholarships', 'https://www.rosalux.de/en/foundation/studienwerk/scholarships'),
    ('https://www.studyinjapan.go.jp/en/smap_stopj-applications_mext.html', 'https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/'),
    ('https://www.universiteitleiden.nl/en/education/scholarships/leiden-university-excellence-scholarships-lexs', 'https://www.student.universiteitleiden.nl/en/scholarships/sea/leiden-university-excellence-scholarship-lexs'),
    ('https://usief.org.in/Fellowships/Fulbright-Nehru-Fellowships-for-Indian-Citizens.aspx', 'https://www.usief.org.in/fulbright-fellowships/fellowships-for-indian-citizen/fulbright-nehru-masters-fellowships/'),
    ('https://ethz.ch/en/studies/master/financials/scholarships/excellence-scholarship.html', 'https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html'),
    ('https://us.fulbrightonline.org/fulbright-us-student-program/fulbright-program-overview/foreign-language-teaching-assistant-flta', 'https://exchanges.state.gov/non-us/program/fulbright-foreign-language-teaching-assistant-flta'),
    ('https://www.urbanstudiesfoundation.org/grants-fellowships/', 'https://www.urbanstudiesfoundation.org/funding/international-fellowships/')
) as replacement(old_url, new_url)
where opportunities.link = replacement.old_url;

commit;
