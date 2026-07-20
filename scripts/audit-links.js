const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const HTML_EXTENSIONS = ['.html'];
const IGNORED_PATTERNS = [
  'javascript:',
  'mailto:',
  'tel:',
  '#',
  'http://',
  'https://'
];

let auditResults = {
  totalFiles: 0,
  totalLinks: 0,
  brokenLinks: [],
  emptyHrefs: [],
  javascriptVoidLinks: [],
  missingAnchors: [],
  invalidUrls: [],
  filesChecked: []
};

function getAllHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (HTML_EXTENSIONS.includes(path.extname(file))) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function extractLinksFromHtml(content, filePath) {
  const links = [];
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;
  
  while ((match = hrefRegex.exec(content)) !== null) {
    links.push({
      href: match[1],
      file: filePath
    });
  }
  
  return links;
}

function isInternalLink(href) {
  return !href.startsWith('http://') && !href.startsWith('https://') && 
         !href.startsWith('mailto:') && !href.startsWith('tel:') &&
         !href.startsWith('javascript:');
}

function resolveInternalLink(href, filePath) {
  // Handle absolute paths (starting with /)
  if (href.startsWith('/')) {
    let absolutePath = path.join(ROOT_DIR, href.substring(1));
    
    // Handle anchors
    const anchorIndex = absolutePath.indexOf('#');
    if (anchorIndex !== -1) {
      absolutePath = absolutePath.substring(0, anchorIndex);
    }
    
    // Handle query parameters
    const queryIndex = absolutePath.indexOf('?');
    if (queryIndex !== -1) {
      absolutePath = absolutePath.substring(0, queryIndex);
    }
    
    // If it's just "/" or empty after stripping, it's the homepage
    if (absolutePath === ROOT_DIR || absolutePath === path.join(ROOT_DIR, '')) {
      return path.join(ROOT_DIR, 'index.html');
    }
    
    // If it ends with /, try index.html
    if (absolutePath.endsWith('/') || absolutePath.endsWith('\\')) {
      return path.join(absolutePath, 'index.html');
    }
    
    // If it doesn't have an extension, try adding .html
    if (!path.extname(absolutePath)) {
      return absolutePath + '.html';
    }
    
    return absolutePath;
  }
  
  // Handle relative paths
  const fileDir = path.dirname(filePath);
  let absolutePath = path.resolve(fileDir, href);
  
  // Handle anchors
  const anchorIndex = absolutePath.indexOf('#');
  if (anchorIndex !== -1) {
    absolutePath = absolutePath.substring(0, anchorIndex);
  }
  
  // Handle query parameters
  const queryIndex = absolutePath.indexOf('?');
  if (queryIndex !== -1) {
    absolutePath = absolutePath.substring(0, queryIndex);
  }
  
  // If it ends with /, try index.html
  if (absolutePath.endsWith('/') || absolutePath.endsWith('\\')) {
    return path.join(absolutePath, 'index.html');
  }
  
  // If it doesn't have an extension, try adding .html
  if (!path.extname(absolutePath)) {
    return absolutePath + '.html';
  }
  
  return absolutePath;
}

function checkFileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (e) {
    return false;
  }
}

function checkAnchorExists(content, anchor) {
  const anchorRegex = new RegExp(`id=["']${anchor}["']|name=["']${anchor}["']`, 'i');
  return anchorRegex.test(content);
}

function auditLinks() {
  console.log('Starting link audit...\n');
  
  const htmlFiles = getAllHtmlFiles(ROOT_DIR);
  auditResults.totalFiles = htmlFiles.length;
  
  console.log(`Found ${htmlFiles.length} HTML files\n`);
  
  htmlFiles.forEach(filePath => {
    const relativePath = path.relative(ROOT_DIR, filePath);
    console.log(`Checking: ${relativePath}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const links = extractLinksFromHtml(content, filePath);
      
      auditResults.totalLinks += links.length;
      auditResults.filesChecked.push(relativePath);
      
      links.forEach(link => {
        const href = link.href;
        
        // Check for empty href
        if (href === '' || href === '""' || href === "''") {
          auditResults.emptyHrefs.push({
            href: href,
            file: relativePath
          });
          return;
        }
        
        // Check for javascript:void(0)
        if (href.toLowerCase().includes('javascript:void(0)')) {
          auditResults.javascriptVoidLinks.push({
            href: href,
            file: relativePath
          });
          return;
        }
        
        // Skip external links and special protocols
        if (!isInternalLink(href)) {
          return;
        }
        
        // Check internal links
        const resolvedPath = resolveInternalLink(href, filePath);
        
        // Check if it's a same-page anchor (href starts with #)
        if (href.startsWith('#')) {
          // Same-page anchors are not broken links
          return;
        }
        
        // Check if file exists
        if (!checkFileExists(resolvedPath)) {
          auditResults.brokenLinks.push({
            href: href,
            resolvedPath: path.relative(ROOT_DIR, resolvedPath),
            file: relativePath
          });
          return;
        }
        
        // Check anchors
        const anchorMatch = href.match(/#([^#]+)$/);
        if (anchorMatch) {
          const anchor = anchorMatch[1];
          if (anchor) {
            const fileContent = fs.readFileSync(resolvedPath, 'utf8');
            if (!checkAnchorExists(fileContent, anchor)) {
              auditResults.missingAnchors.push({
                href: href,
                anchor: anchor,
                file: relativePath,
                targetFile: path.relative(ROOT_DIR, resolvedPath)
              });
            }
          }
        }
      });
    } catch (e) {
      console.error(`Error processing ${relativePath}: ${e.message}`);
    }
  });
}

function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('LINK AUDIT REPORT');
  console.log('='.repeat(80));
  console.log(`\nTotal Files Checked: ${auditResults.totalFiles}`);
  console.log(`Total Links Found: ${auditResults.totalLinks}`);
  
  console.log('\n' + '-'.repeat(80));
  console.log('ISSUES FOUND');
  console.log('-'.repeat(80));
  
  if (auditResults.emptyHrefs.length > 0) {
    console.log(`\n❌ Empty Href Attributes (${auditResults.emptyHrefs.length}):`);
    auditResults.emptyHrefs.forEach(issue => {
      console.log(`   ${issue.file}: href="${issue.href}"`);
    });
  }
  
  if (auditResults.javascriptVoidLinks.length > 0) {
    console.log(`\n⚠️  JavaScript:void(0) Links (${auditResults.javascriptVoidLinks.length}):`);
    auditResults.javascriptVoidLinks.forEach(issue => {
      console.log(`   ${issue.file}: href="${issue.href}"`);
    });
  }
  
  if (auditResults.brokenLinks.length > 0) {
    console.log(`\n❌ Broken Internal Links (${auditResults.brokenLinks.length}):`);
    auditResults.brokenLinks.forEach(issue => {
      console.log(`   ${issue.file}: "${issue.href}" -> ${issue.resolvedPath} (NOT FOUND)`);
    });
  }
  
  if (auditResults.missingAnchors.length > 0) {
    console.log(`\n⚠️  Missing Anchors (${auditResults.missingAnchors.length}):`);
    auditResults.missingAnchors.forEach(issue => {
      console.log(`   ${issue.file}: "${issue.href}" -> #${issue.anchor} (NOT FOUND in ${issue.targetFile})`);
    });
  }
  
  if (auditResults.invalidUrls.length > 0) {
    console.log(`\n❌ Invalid URLs (${auditResults.invalidUrls.length}):`);
    auditResults.invalidUrls.forEach(issue => {
      console.log(`   ${issue.file}: "${issue.href}"`);
    });
  }
  
  const totalIssues = auditResults.emptyHrefs.length + 
                      auditResults.javascriptVoidLinks.length + 
                      auditResults.brokenLinks.length + 
                      auditResults.missingAnchors.length + 
                      auditResults.invalidUrls.length;
  
  console.log('\n' + '='.repeat(80));
  console.log(`TOTAL ISSUES: ${totalIssues}`);
  console.log('='.repeat(80));
  
  // Save report to file
  const reportPath = path.join(ROOT_DIR, 'scripts', 'link-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);
}

// Run audit
auditLinks();
generateReport();
