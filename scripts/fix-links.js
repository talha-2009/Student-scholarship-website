const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const AUDIT_REPORT = path.join(ROOT_DIR, 'scripts', 'link-audit-report.json');

// Read the audit report
const auditData = JSON.parse(fs.readFileSync(AUDIT_REPORT, 'utf8'));

console.log('Starting link fixes...\n');

let fixes = {
  fixedAnchors: 0,
  fixedOpportunityLinks: 0,
  fixedCategoryLinks: 0,
  fixedGuidesLink: 0,
  filesModified: []
};

// Fix #main anchor links in guides pages
// These are actually same-page anchors, not broken links - skip them
console.log('Skipping #main anchor links (they are valid same-page anchors)\n');

// Fix /guides/ link in index.html
console.log('Fixing /guides/ link in index.html...');
const guidesLinkIssue = auditData.brokenLinks.find(issue => 
  issue.href === '/guides/' && issue.file === 'index.html'
);

if (guidesLinkIssue) {
  const filePath = path.join(ROOT_DIR, 'index.html');
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace /guides/ with /guides/application-checklist.html (a valid guides page)
  // Use word boundary to avoid replacing /guides/ followed by other text
  content = content.replace(/href="\/guides\/"/g, 'href="/guides/application-checklist.html"');
  
  fs.writeFileSync(filePath, content, 'utf8');
  fixes.fixedGuidesLink++;
  fixes.filesModified.push('index.html');
  
  console.log('Fixed /guides/ link\n');
}

// Fix links to missing category pages
console.log('Fixing links to missing category pages...');
const categoryMappings = {
  '/volunteer-program.html': '/volunteer-programs/',
  '/volunteer-program/': '/volunteer-programs/',
  '/summer-school.html': '/conferences/',
  '/summer-school/': '/conferences/',
  '/conference.html': '/conferences/',
  '/conference/': '/conferences/',
  '/youth-program.html': '/youth-programs/',
  '/youth-program/': '/youth-programs/',
  '/research-grant.html': '/research-opportunities/',
  '/research-grant/': '/research-opportunities/',
  '/exchange-program/': '/exchange-programs/',
  '/competitions/': '/competitions.html'
};

const categoryIssues = auditData.brokenLinks.filter(issue => 
  Object.keys(categoryMappings).includes(issue.href)
);

categoryIssues.forEach(issue => {
  const filePath = path.join(ROOT_DIR, issue.file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const newHref = categoryMappings[issue.href];
  const oldHref = issue.href;
  
  // Replace the broken link with the correct one
  content = content.replace(new RegExp(`href="${oldHref.replace('/', '\\/')}"`, 'g'), `href="${newHref}"`);
  
  fs.writeFileSync(filePath, content, 'utf8');
  fixes.fixedCategoryLinks++;
  
  if (!fixes.filesModified.includes(issue.file)) {
    fixes.filesModified.push(issue.file);
  }
});

console.log(`Fixed ${fixes.fixedCategoryLinks} category page links\n`);

// Fix links to missing opportunity pages
console.log('Fixing links to missing opportunity pages...');
const opportunityIssues = auditData.brokenLinks.filter(issue => 
  issue.href.startsWith('/opportunity/') && issue.resolvedPath.includes('index.html')
);

opportunityIssues.forEach(issue => {
  const filePath = path.join(ROOT_DIR, issue.file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove the entire link element (it's a broken opportunity page)
  // This is safer than trying to redirect it
  const linkRegex = new RegExp(`<a[^>]*href="${issue.href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>.*?<\\/a>`, 'gs');
  content = content.replace(linkRegex, '');
  
  fs.writeFileSync(filePath, content, 'utf8');
  fixes.fixedOpportunityLinks++;
  
  if (!fixes.filesModified.includes(issue.file)) {
    fixes.filesModified.push(issue.file);
  }
});

console.log(`Removed ${fixes.fixedOpportunityLinks} broken opportunity links\n`);

// Generate report
console.log('='.repeat(80));
console.log('LINK FIX REPORT');
console.log('='.repeat(80));
console.log(`Fixed #main anchor links: ${fixes.fixedAnchors}`);
console.log(`Fixed category page links: ${fixes.fixedCategoryLinks}`);
console.log(`Fixed /guides/ link: ${fixes.fixedGuidesLink}`);
console.log(`Removed broken opportunity links: ${fixes.fixedOpportunityLinks}`);
console.log(`Total files modified: ${fixes.filesModified.length}`);
console.log('\nFiles modified:');
fixes.filesModified.forEach(file => {
  console.log(`  - ${file}`);
});

// Save fix report
const fixReportPath = path.join(ROOT_DIR, 'scripts', 'link-fix-report.json');
fs.writeFileSync(fixReportPath, JSON.stringify(fixes, null, 2));
console.log(`\nFix report saved to: ${fixReportPath}`);
