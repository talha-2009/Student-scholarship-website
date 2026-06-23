# Database Audit & Optimization Guide

This guide provides step-by-step instructions for performing a comprehensive audit, cleanup, and expansion of the OpportunityNest Supabase database.

## Important Note

**I cannot directly access your Supabase database.** You must run the audit scripts in your Supabase SQL Editor and share the results with me so I can proceed with the fixes.

## Phase 1: Database Audit

### Step 1: Run the Audit Script

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `supabase/audit/01_database_audit.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the audit

### Step 2: Review the Results

The audit will show:
- Total records in each table
- Missing countries
- Missing deadlines
- Missing descriptions
- Missing funding information
- Invalid/broken links
- Expired opportunities
- Duplicate records
- SEO issues (missing AI-generated content)

### Step 3: Share Results

Please share the audit results with me by:
1. Copying the output from the SQL Editor
2. Pasting it in a message to me

This will allow me to:
- Identify specific issues
- Create targeted fix scripts
- Prioritize the most critical problems

## Phase 2-8: Next Steps

Once you share the audit results, I will:

### Phase 2: Link Verification
- Create scripts to verify each URL
- Research replacement URLs for broken links
- Update records with verified URLs

### Phase 3: Deadline Research
- Research official sources for missing deadlines
- Standardize deadline formatting
- Set "Deadline Not Announced" where appropriate

### Phase 4: Country Research
- Research official sources for missing countries
- Standardize country naming conventions
- Update records with correct country data

### Phase 5: SEO Optimization
- Use the Gemini AI integration to generate:
  - SEO meta titles
  - SEO meta descriptions
  - Relevant tags/keywords
- Ensure uniqueness across all records

### Phase 6: Content Improvement
- Identify weak descriptions
- Generate improved content using Gemini AI
- Ensure descriptions include:
  - Overview
  - Benefits
  - Eligibility
  - Funding details
  - Application process
  - Deadline information

### Phase 7: Add New Opportunities
- Research and verify 50 new opportunities
- Ensure they are:
  - Active and not expired
  - From official sources
  - Have valid links
  - Have deadlines
  - Not duplicates
- Generate SEO metadata for each

### Phase 8: Website Quality Check
- Verify frontend integration
- Test search functionality
- Test filters
- Verify SEO metadata display
- Check schema markup
- Validate sitemap

## Manual Audit Checklist

While waiting for the automated audit, you can manually check:

### Quick Checks
- [ ] Are all opportunity titles clear and descriptive?
- [ ] Do all links work when clicked?
- [ ] Are deadlines formatted consistently?
- [ ] Are country names standardized?
- [ ] Are descriptions informative and professional?

### Priority Issues
- [ ] Broken or redirecting links
- [ ] Expired opportunities still showing as active
- [ ] Duplicate listings
- [ ] Missing critical information (deadline, country, link)

## Expected Timeline

Based on the audit results:
- **Phase 1-4**: Data cleanup (1-2 hours with your input)
- **Phase 5-6**: SEO & content optimization (2-3 hours)
- **Phase 7**: Adding 50 new opportunities (3-4 hours)
- **Phase 8**: Quality verification (1 hour)

## Safety Measures

All changes will:
- Create backups before modifications
- Never delete valid records
- Use transactions for data updates
- Log all changes for rollback capability
- Prioritize data quality over quantity

## Next Action

**Please run the audit script in Supabase SQL Editor and share the results with me.**

Once I have the audit results, I can create targeted fix scripts and proceed with the optimization phases.
