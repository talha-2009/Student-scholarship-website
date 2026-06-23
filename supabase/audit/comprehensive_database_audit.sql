-- ============================================================================
-- COMPREHENSIVE DATABASE AUDIT SCRIPT FOR OPPORTUNITYNEST
-- ============================================================================
-- This script performs a read-only audit of the OpportunityNest database
-- It dynamically inspects the schema and reports on data quality issues
-- 
-- INSTRUCTIONS:
-- 1. Open Supabase SQL Editor
-- 2. Copy this entire script
-- 3. Paste into the SQL Editor
-- 4. Click "Run" to execute
-- 5. Share the results with your developer for automated cleanup
-- ============================================================================

-- Set search path to public schema
SET search_path TO public;

-- ============================================================================
-- SECTION 1: SCHEMA INSPECTION
-- ============================================================================
-- This section checks which tables and columns exist in your database

DO $$
DECLARE
    table_exists BOOLEAN;
    column_exists BOOLEAN;
BEGIN
    -- Check if opportunities table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'opportunities'
    ) INTO table_exists;
    
    RAISE NOTICE 'Opportunities table exists: %', table_exists;
    
    -- Check if internships table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'internships'
    ) INTO table_exists;
    
    RAISE NOTICE 'Internships table exists: %', table_exists;
    
    -- Check for AI content columns in opportunities table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'opportunities') THEN
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'opportunities' 
            AND column_name = 'seo_title'
        ) INTO column_exists;
        
        RAISE NOTICE 'AI content columns (seo_title) exist in opportunities: %', column_exists;
    END IF;
END $$;

-- ============================================================================
-- SECTION 2: TABLE OVERVIEW
-- ============================================================================
-- Shows all tables in the public schema related to opportunities

SELECT 
    'TABLE OVERVIEW' as section,
    table_name,
    column_count
FROM (
    SELECT 
        t.table_name,
        COUNT(c.column_name) as column_count
    FROM information_schema.tables t
    LEFT JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = 'public'
    WHERE t.table_schema = 'public'
    AND t.table_name IN ('opportunities', 'internships', 'ai_generation_logs')
    GROUP BY t.table_name
) overview
ORDER BY table_name;

-- ============================================================================
-- SECTION 3: OPPORTUNITIES TABLE AUDIT
-- ============================================================================

-- Only run opportunities audit if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'opportunities') THEN
        RAISE NOTICE 'Starting opportunities table audit...';
    ELSE
        RAISE NOTICE 'Skipping opportunities audit - table does not exist';
    END IF;
END $$;

-- 3.1: Total opportunities count
SELECT 
    'OPPORTUNITIES - TOTAL RECORDS' as section,
    COUNT(*) as count,
    'Total number of opportunities in database' as description
FROM public.opportunities;

-- 3.2: Opportunities by type
SELECT 
    'OPPORTUNITITIES - BY TYPE' as section,
    type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM public.opportunities
GROUP BY type
ORDER BY count DESC;

-- 3.3: Opportunities by country (top 20)
SELECT 
    'OPPORTUNITITIES - BY COUNTRY (TOP 20)' as section,
    country,
    COUNT(*) as count
FROM public.opportunities
GROUP BY country
ORDER BY count DESC
LIMIT 20;

-- 3.4: Missing or empty titles
SELECT 
    'OPPORTUNITITIES - MISSING TITLES' as section,
    id,
    COALESCE(title, '<NULL>') as title,
    CASE 
        WHEN title IS NULL THEN 'NULL'
        WHEN TRIM(title) = '' THEN 'Empty string'
        ELSE 'Other'
    END as issue_type
FROM public.opportunities
WHERE title IS NULL OR TRIM(title) = ''
ORDER BY id;

-- 3.5: Missing or empty descriptions
SELECT 
    'OPPORTUNITITIES - MISSING DESCRIPTIONS' as section,
    id,
    title,
    CASE 
        WHEN description IS NULL THEN 'NULL'
        WHEN TRIM(description) = '' THEN 'Empty string'
        WHEN description = 'No description available.' THEN 'Placeholder text'
        ELSE 'Other'
    END as issue_type,
    LENGTH(description) as description_length
FROM public.opportunities
WHERE description IS NULL OR TRIM(description) = '' OR description = 'No description available.'
ORDER BY id;

-- 3.6: Very short descriptions (less than 50 characters)
SELECT 
    'OPPORTUNITITIES - SHORT DESCRIPTIONS (< 50 chars)' as section,
    id,
    title,
    description,
    LENGTH(description) as description_length
FROM public.opportunities
WHERE description IS NOT NULL 
  AND TRIM(description) != '' 
  AND description != 'No description available.'
  AND LENGTH(TRIM(description)) < 50
ORDER BY description_length ASC
LIMIT 20;

-- 3.7: Missing or empty countries
SELECT 
    'OPPORTUNITITIES - MISSING COUNTRIES' as section,
    id,
    title,
    COALESCE(country, '<NULL>') as country,
    CASE 
        WHEN country IS NULL THEN 'NULL'
        WHEN TRIM(country) = '' THEN 'Empty string'
        WHEN country = 'Not specified' THEN 'Placeholder text'
        ELSE 'Other'
    END as issue_type
FROM public.opportunities
WHERE country IS NULL OR TRIM(country) = '' OR country = 'Not specified'
ORDER BY id;

-- 3.8: Missing or empty deadlines
SELECT 
    'OPPORTUNITITIES - MISSING DEADLINES' as section,
    id,
    title,
    COALESCE(deadline, '<NULL>') as deadline,
    CASE 
        WHEN deadline IS NULL THEN 'NULL'
        WHEN TRIM(deadline) = '' THEN 'Empty string'
        ELSE 'Other'
    END as issue_type
FROM public.opportunities
WHERE deadline IS NULL OR TRIM(deadline) = ''
ORDER BY id;

-- 3.9: Missing or empty funding information
SELECT 
    'OPPORTUNITIES - MISSING FUNDING' as section,
    id,
    title,
    COALESCE(funding, '<NULL>') as funding,
    CASE 
        WHEN funding IS NULL THEN 'NULL'
        WHEN TRIM(funding) = '' THEN 'Empty string'
        ELSE 'Other'
    END as issue_type
FROM public.opportunities
WHERE funding IS NULL OR TRIM(funding) = ''
ORDER BY id;

-- 3.10: Missing or empty links (official URLs)
SELECT 
    'OPPORTUNITITIES - MISSING LINKS' as section,
    id,
    title,
    COALESCE(link, '<NULL>') as link,
    CASE 
        WHEN link IS NULL THEN 'NULL'
        WHEN TRIM(link) = '' THEN 'Empty string'
        WHEN link = '#' THEN 'Placeholder (#)'
        ELSE 'Other'
    END as issue_type
FROM public.opportunities
WHERE link IS NULL OR TRIM(link) = '' OR link = '#'
ORDER BY id;

-- 3.11: Missing eligibility information (level field)
SELECT 
    'OPPORTUNITITIES - MISSING ELIGIBILITY (LEVEL)' as section,
    id,
    title,
    COALESCE(level, '<NULL>') as level,
    CASE 
        WHEN level IS NULL THEN 'NULL'
        WHEN TRIM(level) = '' THEN 'Empty string'
        ELSE 'Other'
    END as issue_type
FROM public.opportunities
WHERE level IS NULL OR TRIM(level) = ''
ORDER BY id;

-- 3.12: Missing field of study information
SELECT 
    'OPPORTUNITIES - MISSING FIELD OF STUDY' as section,
    id,
    title,
    COALESCE(field, '<NULL>') as field,
    CASE 
        WHEN field IS NULL THEN 'NULL'
        WHEN TRIM(field) = '' THEN 'Empty string'
        ELSE 'Other'
    END as issue_type
FROM public.opportunities
WHERE field IS NULL OR TRIM(field) = ''
ORDER BY id;

-- 3.13: Expired opportunities (deadlines in the past)
SELECT 
    'OPPORTUNITITIES - EXPIRED' as section,
    id,
    title,
    deadline,
    CURRENT_DATE as today_date,
    CASE 
        WHEN deadline ~ '^\d{4}-\d{2}-\d{2}$' THEN CAST(deadline AS date)
        ELSE NULL
    END as parsed_deadline
FROM public.opportunities
WHERE deadline IS NOT NULL 
  AND TRIM(deadline) != ''
  AND deadline != 'Rolling'
  AND deadline ~ '^\d{4}-\d{2}-\d{2}$'
  AND CAST(deadline AS date) < CURRENT_DATE
ORDER BY CAST(deadline AS date) DESC;

-- 3.14: Invalid or malformed URLs
SELECT 
    'OPPORTUNITITIES - INVALID URLS' as section,
    id,
    title,
    link,
    CASE 
        WHEN link IS NULL THEN 'NULL'
        WHEN link ~ '^https?://[^\s/$.?#].[^\s]*$' THEN 'Valid HTTP/HTTPS'
        WHEN link ~ '^www\.' THEN 'Missing protocol (www.)'
        WHEN link ~ '^[^\s/$.?#]+\.[^\s]+$' THEN 'Missing protocol (domain only)'
        ELSE 'Invalid format'
    END as url_status
FROM public.opportunities
WHERE link IS NOT NULL 
  AND TRIM(link) != '' 
  AND link != '#'
  AND link !~ '^https?://[^\s/$.?#].[^\s]*$'
ORDER BY id;

-- 3.15: Duplicate opportunities (same title, country, type)
SELECT 
    'OPPORTUNITITIES - DUPLICATES' as section,
    title,
    country,
    type,
    COUNT(*) as duplicate_count,
    ARRAY_AGG(id ORDER BY id) as duplicate_ids
FROM public.opportunities
GROUP BY title, country, type
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, title;

-- 3.16: SEO Issues - Check if AI content columns exist
DO $$
DECLARE
    has_seo_columns BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'opportunities' 
        AND column_name = 'seo_title'
    ) INTO has_seo_columns;
    
    IF has_seo_columns THEN
        RAISE NOTICE 'SEO columns detected - running SEO audit...';
    ELSE
        RAISE NOTICE 'SEO columns not found - skipping SEO audit';
    END IF;
END $$;

-- 3.17: SEO content audit (only if columns exist)
SELECT 
    'OPPORTUNITITIES - SEO CONTENT STATUS' as section,
    id,
    title,
    CASE WHEN seo_title IS NOT NULL AND TRIM(seo_title) != '' THEN 'Yes' ELSE 'No' END as has_seo_title,
    CASE WHEN seo_description IS NOT NULL AND TRIM(seo_description) != '' THEN 'Yes' ELSE 'No' END as has_seo_description,
    CASE WHEN tags IS NOT NULL AND array_length(tags, 1) > 0 THEN 'Yes' ELSE 'No' END as has_tags,
    is_ai_content_generated,
    CASE 
        WHEN is_ai_content_generated = true THEN 'Generated'
        WHEN is_ai_content_generated = false THEN 'Not generated'
        ELSE 'Unknown'
    END as ai_status
FROM public.opportunities
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'opportunities' 
    AND column_name = 'seo_title'
)
ORDER BY is_ai_content_generated DESC NULLS LAST, title;

-- 3.18: Opportunities without SEO content
SELECT 
    'OPPORTUNITITIES - MISSING SEO CONTENT' as section,
    id,
    title,
    type,
    country,
    CASE 
        WHEN is_ai_content_generated = false THEN 'Not generated'
        WHEN is_ai_content_generated IS NULL THEN 'Column missing'
        ELSE 'Other'
    END as issue
FROM public.opportunities
WHERE EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'opportunities' 
    AND column_name = 'seo_title'
)
AND (is_ai_content_generated = false OR is_ai_content_generated IS NULL)
ORDER BY title;

-- ============================================================================
-- SECTION 4: INTERNSHIPS TABLE AUDIT
-- ============================================================================

-- Only run internships audit if table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'internships') THEN
        RAISE NOTICE 'Starting internships table audit...';
    ELSE
        RAISE NOTICE 'Skipping internships audit - table does not exist';
    END IF;
END $$;

-- 4.1: Total internships count
SELECT 
    'INTERNSHIPS - TOTAL RECORDS' as section,
    COUNT(*) as count,
    'Total number of internships in database' as description
FROM public.internships;

-- 4.2: Internships by organization (top 20)
SELECT 
    'INTERNSHIPS - BY ORGANIZATION (TOP 20)' as section,
    organization,
    COUNT(*) as count
FROM public.internships
GROUP BY organization
ORDER BY count DESC
LIMIT 20;

-- 4.3: Internships by country (top 20)
SELECT 
    'INTERNSHIPS - BY COUNTRY (TOP 20)' as section,
    country,
    COUNT(*) as count
FROM public.internships
GROUP BY country
ORDER BY count DESC
LIMIT 20;

-- 4.4: Missing or empty titles
SELECT 
    'INTERNSHIPS - MISSING TITLES' as section,
    id,
    COALESCE(title, '<NULL>') as title,
    CASE 
        WHEN title IS NULL THEN 'NULL'
        WHEN TRIM(title) = '' THEN 'Empty string'
        ELSE 'Other'
    END as issue_type
FROM public.internships
WHERE title IS NULL OR TRIM(title) = ''
ORDER BY id;

-- 4.5: Missing or empty descriptions
SELECT 
    'INTERNSHIPS - MISSING DESCRIPTIONS' as section,
    id,
    title,
    CASE 
        WHEN description IS NULL THEN 'NULL'
        WHEN TRIM(description) = '' THEN 'Empty string'
        ELSE 'Other'
    END as issue_type,
    LENGTH(description) as description_length
FROM public.internships
WHERE description IS NULL OR TRIM(description) = ''
ORDER BY id;

-- 4.6: Very short descriptions (less than 50 characters)
SELECT 
    'INTERNSHIPS - SHORT DESCRIPTIONS (< 50 chars)' as section,
    id,
    title,
    description,
    LENGTH(description) as description_length
FROM public.internships
WHERE description IS NOT NULL 
  AND TRIM(description) != '' 
  AND LENGTH(TRIM(description)) < 50
ORDER BY description_length ASC
LIMIT 20;

-- 4.7: Missing or empty countries
SELECT 
    'INTERNSHIPS - MISSING COUNTRIES' as section,
    id,
    title,
    COALESCE(country, '<NULL>') as country,
    CASE 
        WHEN country IS NULL THEN 'NULL'
        WHEN TRIM(country) = '' THEN 'Empty string'
        WHEN country = 'Global' THEN 'Generic (Global)'
        ELSE 'Other'
    END as issue_type
FROM public.internships
WHERE country IS NULL OR TRIM(country) = '' OR country = 'Global'
ORDER BY id;

-- 4.8: Missing or empty deadlines
SELECT 
    'INTERNSHIPS - MISSING DEADLINES' as section,
    id,
    title,
    COALESCE(deadline, '<NULL>') as deadline,
    CASE 
        WHEN deadline IS NULL THEN 'NULL'
        WHEN TRIM(deadline) = '' THEN 'Empty string'
        ELSE 'Other'
    END as issue_type
FROM public.internships
WHERE deadline IS NULL OR TRIM(deadline) = ''
ORDER BY id;

-- 4.9: Missing or empty funding information
SELECT 
    'INTERNSHIPS - MISSING FUNDING' as section,
    id,
    title,
    COALESCE(funding, '<NULL>') as funding,
    CASE 
        WHEN funding IS NULL THEN 'NULL'
        WHEN TRIM(funding) = '' THEN 'Empty string'
        ELSE 'Other'
    END as issue_type
FROM public.internships
WHERE funding IS NULL OR TRIM(funding) = ''
ORDER BY id;

-- 4.10: Missing or empty official URLs
SELECT 
    'INTERNSHIPS - MISSING URLS' as section,
    id,
    title,
    COALESCE(official_url, '<NULL>') as official_url,
    CASE 
        WHEN official_url IS NULL THEN 'NULL'
        WHEN TRIM(official_url) = '' THEN 'Empty string'
        WHEN official_url = '#' THEN 'Placeholder (#)'
        ELSE 'Other'
    END as issue_type
FROM public.internships
WHERE official_url IS NULL OR TRIM(official_url) = '' OR official_url = '#'
ORDER BY id;

-- 4.11: Missing eligibility information (degree_level)
SELECT 
    'INTERNSHIPS - MISSING ELIGIBILITY (DEGREE LEVEL)' as section,
    id,
    title,
    COALESCE(degree_level, '<NULL>') as degree_level,
    CASE 
        WHEN degree_level IS NULL THEN 'NULL'
        WHEN TRIM(degree_level) = '' THEN 'Empty string'
        ELSE 'Other'
    END as issue_type
FROM public.internships
WHERE degree_level IS NULL OR TRIM(degree_level) = ''
ORDER BY id;

-- 4.12: Expired internships (deadlines in the past)
SELECT 
    'INTERNSHIPS - EXPIRED' as section,
    id,
    title,
    deadline,
    CURRENT_DATE as today_date,
    CASE 
        WHEN deadline ~ '^\d{4}-\d{2}-\d{2}$' THEN CAST(deadline AS date)
        ELSE NULL
    END as parsed_deadline
FROM public.internships
WHERE deadline IS NOT NULL 
  AND TRIM(deadline) != ''
  AND deadline != 'Rolling'
  AND deadline ~ '^\d{4}-\d{2}-\d{2}$'
  AND CAST(deadline AS date) < CURRENT_DATE
ORDER BY CAST(deadline AS date) DESC;

-- 4.13: Invalid or malformed URLs
SELECT 
    'INTERNSHIPS - INVALID URLS' as section,
    id,
    title,
    official_url,
    CASE 
        WHEN official_url IS NULL THEN 'NULL'
        WHEN official_url ~ '^https?://[^\s/$.?#].[^\s]*$' THEN 'Valid HTTP/HTTPS'
        WHEN official_url ~ '^www\.' THEN 'Missing protocol (www.)'
        WHEN official_url ~ '^[^\s/$.?#]+\.[^\s]+$' THEN 'Missing protocol (domain only)'
        ELSE 'Invalid format'
    END as url_status
FROM public.internships
WHERE official_url IS NOT NULL 
  AND TRIM(official_url) != '' 
  AND official_url != '#'
  AND official_url !~ '^https?://[^\s/$.?#].[^\s]*$'
ORDER BY id;

-- 4.14: Duplicate internships (same title, organization)
SELECT 
    'INTERNSHIPS - DUPLICATES' as section,
    title,
    organization,
    country,
    COUNT(*) as duplicate_count,
    ARRAY_AGG(id ORDER BY id) as duplicate_ids
FROM public.internships
GROUP BY title, organization, country
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, title;

-- 4.15: Featured internships status
SELECT 
    'INTERNSHIPS - FEATURED STATUS' as section,
    featured,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM public.internships
GROUP BY featured
ORDER BY featured DESC;

-- ============================================================================
-- SECTION 5: SUMMARY STATISTICS
-- ============================================================================

SELECT 
    'SUMMARY - OPPORTUNITIES' as section,
    'Total Records' as metric,
    COUNT(*)::text as value
FROM public.opportunities
UNION ALL
SELECT 
    'SUMMARY - OPPORTUNITIES' as section,
    'Missing Titles' as metric,
    COUNT(*)::text as value
FROM public.opportunities
WHERE title IS NULL OR TRIM(title) = ''
UNION ALL
SELECT 
    'SUMMARY - OPPORTUNITIES' as section,
    'Missing Descriptions' as metric,
    COUNT(*)::text as value
FROM public.opportunities
WHERE description IS NULL OR TRIM(description) = '' OR description = 'No description available.'
UNION ALL
SELECT 
    'SUMMARY - OPPORTUNITIES' as section,
    'Missing Countries' as metric,
    COUNT(*)::text as value
FROM public.opportunities
WHERE country IS NULL OR TRIM(country) = '' OR country = 'Not specified'
UNION ALL
SELECT 
    'SUMMARY - OPPORTUNITIES' as section,
    'Missing Deadlines' as metric,
    COUNT(*)::text as value
FROM public.opportunities
WHERE deadline IS NULL OR TRIM(deadline) = ''
UNION ALL
SELECT 
    'SUMMARY - OPPORTUNITIES' as section,
    'Missing Funding' as metric,
    COUNT(*)::text as value
FROM public.opportunities
WHERE funding IS NULL OR TRIM(funding) = ''
UNION ALL
SELECT 
    'SUMMARY - OPPORTUNITIES' as section,
    'Missing Links' as metric,
    COUNT(*)::text as value
FROM public.opportunities
WHERE link IS NULL OR TRIM(link) = '' OR link = '#'
UNION ALL
SELECT 
    'SUMMARY - OPPORTUNITIES' as section,
    'Missing Eligibility (Level)' as metric,
    COUNT(*)::text as value
FROM public.opportunities
WHERE level IS NULL OR TRIM(level) = ''
UNION ALL
SELECT 
    'SUMMARY - OPPORTUNITIES' as section,
    'Expired' as metric,
    COUNT(*)::text as value
FROM public.opportunities
WHERE deadline IS NOT NULL 
  AND TRIM(deadline) != '' 
  AND deadline != 'Rolling'
  AND deadline ~ '^\d{4}-\d{2}-\d{2}$'
  AND CAST(deadline AS date) < CURRENT_DATE
UNION ALL
SELECT 
    'SUMMARY - OPPORTUNITIES' as section,
    'Invalid URLs' as metric,
    COUNT(*)::text as value
FROM public.opportunities
WHERE link IS NOT NULL 
  AND TRIM(link) != '' 
  AND link != '#'
  AND link !~ '^https?://[^\s/$.?#].[^\s]*$'
UNION ALL
SELECT 
    'SUMMARY - INTERNSHIPS' as section,
    'Total Records' as metric,
    COUNT(*)::text as value
FROM public.internships
UNION ALL
SELECT 
    'SUMMARY - INTERNSHIPS' as section,
    'Missing Titles' as metric,
    COUNT(*)::text as value
FROM public.internships
WHERE title IS NULL OR TRIM(title) = ''
UNION ALL
SELECT 
    'SUMMARY - INTERNSHIPS' as section,
    'Missing Descriptions' as metric,
    COUNT(*)::text as value
FROM public.internships
WHERE description IS NULL OR TRIM(description) = ''
UNION ALL
SELECT 
    'SUMMARY - INTERNSHIPS' as section,
    'Missing Countries' as metric,
    COUNT(*)::text as value
FROM public.internships
WHERE country IS NULL OR TRIM(country) = '' OR country = 'Global'
UNION ALL
SELECT 
    'SUMMARY - INTERNSHIPS' as section,
    'Missing Deadlines' as metric,
    COUNT(*)::text as value
FROM public.internships
WHERE deadline IS NULL OR TRIM(deadline) = ''
UNION ALL
SELECT 
    'SUMMARY - INTERNSHIPS' as section,
    'Missing Funding' as metric,
    COUNT(*)::text as value
FROM public.internships
WHERE funding IS NULL OR TRIM(funding) = ''
UNION ALL
SELECT 
    'SUMMARY - INTERNSHIPS' as section,
    'Missing URLs' as metric,
    COUNT(*)::text as value
FROM public.internships
WHERE official_url IS NULL OR TRIM(official_url) = '' OR official_url = '#'
UNION ALL
SELECT 
    'SUMMARY - INTERNSHIPS' as section,
    'Missing Eligibility (egree Level)' as metric,
    COUNT(*)::text as value
FROM public.internships
WHERE degree_level IS NULL OR TRIM(degree_level) = ''
UNION ALL
SELECT 
    'SUMMARY - INTERNSHIPS' as section,
    'Expired' as metric,
    COUNT(*)::text as value
FROM public.internships
WHERE deadline IS NOT NULL 
  AND TRIM(deadline) != '' 
  AND deadline != 'Rolling'
  AND deadline ~ '^\d{4}-\d{2}-\d{2}$'
  AND CAST(deadline AS date) < CURRENT_DATE
UNION ALL
SELECT 
    'SUMMARY - INTERNSHIPS' as section,
    'Invalid URLs' as metric,
    COUNT(*)::text as value
FROM public.internships
WHERE official_url IS NOT NULL 
  AND TRIM(official_url) != '' 
  AND official_url != '#'
  AND official_url !~ '^https?://[^\s/$.?#].[^\s]*$';

-- ============================================================================
-- AUDIT COMPLETE
-- ============================================================================
-- Review the results above and share them with your developer
-- for automated cleanup and optimization
-- ============================================================================
