/**
 * Database Audit Script for OpportunityNest
 * 
 * This script performs a comprehensive audit of the Supabase database
 * to identify missing data, broken links, and SEO issues.
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - Replace with your actual credentials
const SUPABASE_URL = 'https://rveunrzbeynaizitqanx.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

if (SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY') {
  console.error('ERROR: Please set SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Audit results storage
const auditResults = {
  opportunities: {
    total: 0,
    missingCountry: [],
    missingDeadline: [],
    missingDescription: [],
    missingFunding: [],
    brokenLinks: [],
    duplicates: [],
    outdated: [],
    seoIssues: []
  },
  internships: {
    total: 0,
    missingCountry: [],
    missingDeadline: [],
    missingDescription: [],
    missingFunding: [],
    brokenLinks: [],
    duplicates: [],
    outdated: [],
    seoIssues: []
  },
  summary: {}
};

async function auditOpportunities() {
  console.log('🔍 Auditing opportunities table...');
  
  const { data: opportunities, error } = await supabase
    .from('opportunities')
    .select('*');
  
  if (error) {
    console.error('Error fetching opportunities:', error);
    return;
  }
  
  auditResults.opportunities.total = opportunities.length;
  console.log(`Found ${opportunities.length} opportunities`);
  
  // Check for missing data
  opportunities.forEach(opp => {
    // Missing country
    if (!opp.country || opp.country.trim() === '' || opp.country === 'Not specified') {
      auditResults.opportunities.missingCountry.push({
        id: opp.id,
        title: opp.title,
        currentCountry: opp.country
      });
    }
    
    // Missing deadline
    if (!opp.deadline || opp.deadline.trim() === '') {
      auditResults.opportunities.missingDeadline.push({
        id: opp.id,
        title: opp.title,
        currentDeadline: opp.deadline
      });
    }
    
    // Missing description
    if (!opp.description || opp.description.trim() === '' || opp.description === 'No description available.') {
      auditResults.opportunities.missingDescription.push({
        id: opp.id,
        title: opp.title
      });
    }
    
    // Missing funding
    if (!opp.funding || opp.funding.trim() === '') {
      auditResults.opportunities.missingFunding.push({
        id: opp.id,
        title: opp.title
      });
    }
    
    // Check for broken links (basic validation)
    if (!opp.link || opp.link.trim() === '' || opp.link === '#') {
      auditResults.opportunities.brokenLinks.push({
        id: opp.id,
        title: opp.title,
        link: opp.link
      });
    }
    
    // Check for expired opportunities
    if (opp.deadline && opp.deadline !== 'Rolling') {
      const deadlineDate = new Date(opp.deadline);
      if (deadlineDate < new Date()) {
        auditResults.opportunities.outdated.push({
          id: opp.id,
          title: opp.title,
          deadline: opp.deadline
        });
      }
    }
    
    // SEO issues - check for AI-generated content
    if (!opp.is_ai_content_generated) {
      auditResults.opportunities.seoIssues.push({
        id: opp.id,
        title: opp.title,
        hasSeoTitle: !!opp.seo_title,
        hasSeoDescription: !!opp.seo_description,
        hasTags: !!opp.tags && opp.tags.length > 0
      });
    }
  });
  
  // Check for duplicates (by title, country, type)
  const seen = new Set();
  opportunities.forEach(opp => {
    const key = `${opp.title.toLowerCase()}-${opp.country.toLowerCase()}-${opp.type.toLowerCase()}`;
    if (seen.has(key)) {
      auditResults.opportunities.duplicates.push({
        id: opp.id,
        title: opp.title,
        country: opp.country,
        type: opp.type
      });
    }
    seen.add(key);
  });
}

async function auditInternships() {
  console.log('🔍 Auditing internships table...');
  
  const { data: internships, error } = await supabase
    .from('internships')
    .select('*');
  
  if (error) {
    console.error('Error fetching internships:', error);
    return;
  }
  
  auditResults.internships.total = internships.length;
  console.log(`Found ${internships.length} internships`);
  
  // Check for missing data
  internships.forEach(internship => {
    // Missing country
    if (!internship.country || internship.country.trim() === '' || internship.country === 'Global') {
      auditResults.internships.missingCountry.push({
        id: internship.id,
        title: internship.title,
        currentCountry: internship.country
      });
    }
    
    // Missing deadline
    if (!internship.deadline || internship.deadline.trim() === '') {
      auditResults.internships.missingDeadline.push({
        id: internship.id,
        title: internship.title,
        currentDeadline: internship.deadline
      });
    }
    
    // Missing description
    if (!internship.description || internship.description.trim() === '') {
      auditResults.internships.missingDescription.push({
        id: internship.id,
        title: internship.title
      });
    }
    
    // Missing funding
    if (!internship.funding || internship.funding.trim() === '') {
      auditResults.internships.missingFunding.push({
        id: internship.id,
        title: internship.title
      });
    }
    
    // Check for broken links
    if (!internship.official_url || internship.official_url.trim() === '' || internship.official_url === '#') {
      auditResults.internships.brokenLinks.push({
        id: internship.id,
        title: internship.title,
        link: internship.official_url
      });
    }
    
    // Check for expired opportunities
    if (internship.deadline && internship.deadline !== 'Rolling') {
      const deadlineDate = new Date(internship.deadline);
      if (deadlineDate < new Date()) {
        auditResults.internships.outdated.push({
          id: internship.id,
          title: internship.title,
          deadline: internship.deadline
        });
      }
    }
    
    // SEO issues
    if (!internship.is_ai_content_generated) {
      auditResults.internships.seoIssues.push({
        id: internship.id,
        title: internship.title,
        hasSeoTitle: !!internship.seo_title,
        hasSeoDescription: !!internship.seo_description,
        hasTags: !!internship.tags && internship.tags.length > 0
      });
    }
  });
  
  // Check for duplicates
  const seen = new Set();
  internships.forEach(internship => {
    const key = `${internship.title.toLowerCase()}-${internship.country.toLowerCase()}`;
    if (seen.has(key)) {
      auditResults.internships.duplicates.push({
        id: internship.id,
        title: internship.title,
        country: internship.country
      });
    }
    seen.add(key);
  });
}

function generateAuditReport() {
  console.log('\n' + '='.repeat(80));
  console.log('DATABASE AUDIT REPORT');
  console.log('='.repeat(80));
  
  // Opportunities Summary
  console.log('\n📊 OPPORTUNITIES TABLE');
  console.log(`Total Records: ${auditResults.opportunities.total}`);
  console.log(`Missing Countries: ${auditResults.opportunities.missingCountry.length}`);
  console.log(`Missing Deadlines: ${auditResults.opportunities.missingDeadline.length}`);
  console.log(`Missing Descriptions: ${auditResults.opportunities.missingDescription.length}`);
  console.log(`Missing Funding: ${auditResults.opportunities.missingFunding.length}`);
  console.log(`Broken Links: ${auditResults.opportunities.brokenLinks.length}`);
  console.log(`Duplicates: ${auditResults.opportunities.duplicates.length}`);
  console.log(`Outdated/Expired: ${auditResults.opportunities.outdated.length}`);
  console.log(`SEO Issues: ${auditResults.opportunities.seoIssues.length}`);
  
  // Internships Summary
  console.log('\n📊 INTERNSHIPS TABLE');
  console.log(`Total Records: ${auditResults.internships.total}`);
  console.log(`Missing Countries: ${auditResults.internships.missingCountry.length}`);
  console.log(`Missing Deadlines: ${auditResults.internships.missingDeadline.length}`);
  console.log(`Missing Descriptions: ${auditResults.internships.missingDescription.length}`);
  console.log(`Missing Funding: ${auditResults.internships.missingFunding.length}`);
  console.log(`Broken Links: ${auditResults.internships.brokenLinks.length}`);
  console.log(`Duplicates: ${auditResults.internships.duplicates.length}`);
  console.log(`Outdated/Expired: ${auditResults.internships.outdated.length}`);
  console.log(`SEO Issues: ${auditResults.internships.seoIssues.length}`);
  
  // Overall Summary
  const totalRecords = auditResults.opportunities.total + auditResults.internships.total;
  const totalIssues = 
    auditResults.opportunities.missingCountry.length +
    auditResults.opportunities.missingDeadline.length +
    auditResults.opportunities.missingDescription.length +
    auditResults.opportunities.missingFunding.length +
    auditResults.opportunities.brokenLinks.length +
    auditResults.opportunities.duplicates.length +
    auditResults.opportunities.outdated.length +
    auditResults.opportunities.seoIssues.length +
    auditResults.internships.missingCountry.length +
    auditResults.internships.missingDeadline.length +
    auditResults.internships.missingDescription.length +
    auditResults.internships.missingFunding.length +
    auditResults.internships.brokenLinks.length +
    auditResults.internships.duplicates.length +
    auditResults.internships.outdated.length +
    auditResults.internships.seoIssues.length;
  
  console.log('\n' + '='.repeat(80));
  console.log('OVERALL SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Records: ${totalRecords}`);
  console.log(`Total Issues Found: ${totalIssues}`);
  console.log(`Data Quality Score: ${Math.max(0, 100 - (totalIssues / totalRecords * 100)).toFixed(1)}%`);
  
  // Detailed issues
  if (auditResults.opportunities.missingCountry.length > 0) {
    console.log('\n⚠️  OPPORTUNITIES MISSING COUNTRY:');
    auditResults.opportunities.missingCountry.forEach(item => {
      console.log(`  - ${item.title} (ID: ${item.id}) - Current: "${item.currentCountry}"`);
    });
  }
  
  if (auditResults.opportunities.missingDeadline.length > 0) {
    console.log('\n⚠️  OPPORTUNITIES MISSING DEADLINE:');
    auditResults.opportunities.missingDeadline.forEach(item => {
      console.log(`  - ${item.title} (ID: ${item.id})`);
    });
  }
  
  if (auditResults.opportunities.brokenLinks.length > 0) {
    console.log('\n⚠️  OPPORTUNITIES WITH BROKEN LINKS:');
    auditResults.opportunities.brokenLinks.forEach(item => {
      console.log(`  - ${item.title} (ID: ${item.id}) - Link: "${item.link}"`);
    });
  }
  
  if (auditResults.opportunities.outdated.length > 0) {
    console.log('\n⚠️  OUTDATED OPPORTUNITIES:');
    auditResults.opportunities.outdated.forEach(item => {
      console.log(`  - ${item.title} (ID: ${item.id}) - Deadline: ${item.deadline}`);
    });
  }
  
  // Save detailed report to file
  const fs = require('fs');
  fs.writeFileSync('database-audit-report.json', JSON.stringify(auditResults, null, 2));
  console.log('\n💾 Detailed audit report saved to: database-audit-report.json');
  
  return auditResults;
}

async function main() {
  console.log('🚀 Starting database audit...\n');
  
  await auditOpportunities();
  await auditInternships();
  
  const results = generateAuditReport();
  
  console.log('\n✅ Audit complete!');
  return results;
}

main().catch(console.error);
