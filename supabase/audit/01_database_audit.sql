-- Database Audit Script for OpportunityNest
-- Run this in Supabase SQL Editor to perform a comprehensive audit

-- ============================================================================
-- PHASE 1: DATABASE AUDIT
-- ============================================================================

-- Count total records
SELECT 
  'Opportunities' as table_name,
  COUNT(*) as total_records
FROM public.opportunities
UNION ALL
SELECT 
  'Internships' as table_name,
  COUNT(*) as total_records
FROM public.internships;

-- Check for missing countries in opportunities
SELECT 
  id,
  title,
  country as current_country,
  'Missing Country' as issue
FROM public.opportunities
WHERE country IS NULL 
   OR country = '' 
   OR country = 'Not specified'
ORDER BY title;

-- Check for missing deadlines in opportunities
SELECT 
  id,
  title,
  deadline as current_deadline,
  'Missing Deadline' as issue
FROM public.opportunities
WHERE deadline IS NULL 
   OR deadline = ''
ORDER BY title;

-- Check for missing descriptions in opportunities
SELECT 
  id,
  title,
  CASE 
    WHEN description IS NULL OR description = '' THEN 'Empty'
    WHEN description = 'No description available.' THEN 'Placeholder'
    ELSE 'Present'
  END as description_status,
  'Missing/Weak Description' as issue
FROM public.opportunities
WHERE description IS NULL 
   OR description = '' 
   OR description = 'No description available.'
ORDER BY title;

-- Check for missing funding in opportunities
SELECT 
  id,
  title,
  funding as current_funding,
  'Missing Funding' as issue
FROM public.opportunities
WHERE funding IS NULL 
   OR funding = ''
ORDER BY title;

-- Check for broken/invalid links in opportunities
SELECT 
  id,
  title,
  link as current_link,
  'Invalid Link' as issue
FROM public.opportunities
WHERE link IS NULL 
   OR link = '' 
   OR link = '#'
ORDER BY title;

-- Check for expired opportunities (deadlines in the past)
SELECT 
  id,
  title,
  deadline,
  'Expired' as issue
FROM public.opportunities
WHERE deadline IS NOT NULL 
  AND deadline != 'Rolling'
  AND deadline != ''
  AND deadline ~ '^\d{4}-\d{2}-\d{2}$'
  AND CAST(deadline AS date) < CURRENT_DATE
ORDER BY deadline DESC;

-- Check for duplicate opportunities (same title, country, type)
SELECT 
  title,
  country,
  type,
  COUNT(*) as duplicate_count,
  array_agg(id) as ids
FROM public.opportunities
GROUP BY title, country, type
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Check for SEO issues (missing AI-generated content)
SELECT 
  id,
  title,
  CASE WHEN seo_title IS NOT NULL AND seo_title != '' THEN 'Yes' ELSE 'No' END as has_seo_title,
  CASE WHEN seo_description IS NOT NULL AND seo_description != '' THEN 'Yes' ELSE 'No' END as has_seo_description,
  CASE WHEN tags IS NOT NULL AND array_length(tags, 1) > 0 THEN 'Yes' ELSE 'No' END as has_tags,
  is_ai_content_generated,
  'SEO Content Missing' as issue
FROM public.opportunities
WHERE is_ai_content_generated = false
   OR seo_title IS NULL 
   OR seo_title = ''
   OR seo_description IS NULL 
   OR seo_description = ''
   OR tags IS NULL 
   OR array_length(tags, 1) IS NULL
ORDER BY title;

-- ============================================================================
-- INTERNSHIPS AUDIT
-- ============================================================================

-- Check for missing countries in internships
SELECT 
  id,
  title,
  country as current_country,
  'Missing Country' as issue
FROM public.internships
WHERE country IS NULL 
   OR country = '' 
   OR country = 'Global'
ORDER BY title;

-- Check for missing deadlines in internships
SELECT 
  id,
  title,
  deadline as current_deadline,
  'Missing Deadline' as issue
FROM public.internships
WHERE deadline IS NULL 
   OR deadline = ''
ORDER BY title;

-- Check for missing descriptions in internships
SELECT 
  id,
  title,
  CASE 
    WHEN description IS NULL OR description = '' THEN 'Empty'
    ELSE 'Present'
  END as description_status,
  'Missing Description' as issue
FROM public.internships
WHERE description IS NULL 
   OR description = ''
ORDER BY title;

-- Check for missing funding in internships
SELECT 
  id,
  title,
  funding as current_funding,
  'Missing Funding' as issue
FROM public.internships
WHERE funding IS NULL 
   OR funding = ''
ORDER BY title;

-- Check for broken/invalid links in internships
SELECT 
  id,
  title,
  official_url as current_link,
  'Invalid Link' as issue
FROM public.internships
WHERE official_url IS NULL 
   OR official_url = '' 
   OR official_url = '#'
ORDER BY title;

-- Check for expired internships
SELECT 
  id,
  title,
  deadline,
  'Expired' as issue
FROM public.internships
WHERE deadline IS NOT NULL 
  AND deadline != 'Rolling'
  AND deadline != ''
  AND deadline ~ '^\d{4}-\d{2}-\d{2}$'
  AND CAST(deadline AS date) < CURRENT_DATE
ORDER BY deadline DESC;

-- Check for duplicate internships
SELECT 
  title,
  organization,
  country,
  COUNT(*) as duplicate_count,
  array_agg(id) as ids
FROM public.internships
GROUP BY title, organization, country
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- ============================================================================
-- SUMMARY STATISTICS
-- ============================================================================

SELECT 
  'Total Opportunities' as metric,
  COUNT(*)::text as value
FROM public.opportunities
UNION ALL
SELECT 
  'Total Internships' as metric,
  COUNT(*)::text as value
FROM public.internships
UNION ALL
SELECT 
  'Opportunities Missing Country' as metric,
  COUNT(*)::text as value
FROM public.opportunities
WHERE country IS NULL OR country = '' OR country = 'Not specified'
UNION ALL
SELECT 
  'Opportunities Missing Deadline' as metric,
  COUNT(*)::text as value
FROM public.opportunities
WHERE deadline IS NULL OR deadline = ''
UNION ALL
SELECT 
  'Opportunities Missing Description' as metric,
  COUNT(*)::text as value
FROM public.opportunities
WHERE description IS NULL OR description = '' OR description = 'No description available.'
UNION ALL
SELECT 
  'Opportunities Missing Funding' as metric,
  COUNT(*)::text as value
FROM public.opportunities
WHERE funding IS NULL OR funding = ''
UNION ALL
SELECT 
  'Opportunities with Invalid Links' as metric,
  COUNT(*)::text as value
FROM public.opportunities
WHERE link IS NULL OR link = '' OR link = '#'
UNION ALL
SELECT 
  'Expired Opportunities' as metric,
  COUNT(*)::text as value
FROM public.opportunities
WHERE deadline IS NOT NULL AND deadline != 'Rolling' AND deadline != '' AND deadline ~ '^\d{4}-\d{2}-\d{2}$' AND CAST(deadline AS date) < CURRENT_DATE
UNION ALL
SELECT 
  'Opportunities Without SEO Content' as metric,
  COUNT(*)::text as value
FROM public.opportunities
WHERE is_ai_content_generated = false OR seo_title IS NULL OR seo_title = ''
UNION ALL
SELECT 
  'Internships Missing Country' as metric,
  COUNT(*)::text as value
FROM public.internships
WHERE country IS NULL OR country = '' OR country = 'Global'
UNION ALL
SELECT 
  'Internships Missing Deadline' as metric,
  COUNT(*)::text as value
FROM public.internships
WHERE deadline IS NULL OR deadline = ''
UNION ALL
SELECT 
  'Internships Missing Description' as metric,
  COUNT(*)::text as value
FROM public.internships
WHERE description IS NULL OR description = ''
UNION ALL
SELECT 
  'Internships Missing Funding' as metric,
  COUNT(*)::text as value
FROM public.internships
WHERE funding IS NULL OR funding = ''
UNION ALL
SELECT 
  'Internships with Invalid Links' as metric,
  COUNT(*)::text as value
FROM public.internships
WHERE official_url IS NULL OR official_url = '' OR official_url = '#'
UNION ALL
SELECT 
  'Expired Internships' as metric,
  COUNT(*)::text as value
FROM public.internships
WHERE deadline IS NOT NULL AND deadline != 'Rolling' AND deadline != '' AND deadline ~ '^\d{4}-\d{2}-\d{2}$' AND CAST(deadline AS date) < CURRENT_DATE;
