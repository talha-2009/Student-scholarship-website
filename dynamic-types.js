// Dynamic type filter and navigation population from Supabase database
const ON = window.OpportunityNest;

// Function to convert type name to SEO-friendly URL slug
const typeToSlug = (type) => {
  return type.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Function to get category page URL for a type
const typeRouteMap = {
  Scholarship: "/scholarships/",
  Internship: "/internships/",
  Fellowship: "/fellowships/",
  Competition: "/competitions.html",
  "Exchange Program": "/exchange-programs/",
  "Research Grant": "/grants/",
  "Youth Program": "/youth-programs/",
  "Volunteer Program": "/volunteer-programs/",
  Conference: "/conferences/",
  "Summer School": "/workshops/"
};

const typeToUrl = (type) => {
  if (typeRouteMap[type]) return typeRouteMap[type];
  const slug = typeToSlug(type);
  return `/${slug}/`;
};

// Populate type filter dropdown
const populateTypeFilter = async () => {
  const typeFilter = document.querySelector("#type-filter");
  if (!typeFilter || !ON) return;

  await ON.populateTypeFilter(typeFilter);
};

// Populate navigation links dynamically
const populateNavLinks = async () => {
  const navContainer = document.getElementById("dynamic-nav-links");
  if (!navContainer || !ON) return;

  try {
    const types = await ON.fetchUniqueTypes();
    
    if (types && types.length > 0) {
      navContainer.innerHTML = types.map(type => {
        const url = typeToUrl(type);
        return `<a href="${url}">${type}s</a>`;
      }).join('');
    }
  } catch (error) {
    console.error("Error populating nav links:", error);
    // Fallback to hardcoded links if dynamic loading fails
    navContainer.innerHTML = `
      <a href="/scholarships/">Scholarships</a>
      <a href="/internships/">Internships</a>
      <a href="/fellowships/">Fellowships</a>
    `;
  }
};

// Populate footer links dynamically
const populateFooterLinks = async () => {
  const footerContainer = document.getElementById("dynamic-footer-links");
  if (!footerContainer || !ON) return;

  try {
    const types = await ON.fetchUniqueTypes();
    
    if (types && types.length > 0) {
      footerContainer.innerHTML = types.map(type => {
        const url = typeToUrl(type);
        return `<a href="${url}">${type}s</a>`;
      }).join('');
    }
  } catch (error) {
    console.error("Error populating footer links:", error);
    // Fallback to hardcoded links if dynamic loading fails
    footerContainer.innerHTML = `
      <a href="/scholarships/">Scholarships</a>
      <a href="/internships/">Internships</a>
      <a href="/fellowships/">Fellowships</a>
    `;
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    populateTypeFilter();
    populateNavLinks();
  });
} else {
  populateTypeFilter();
  populateNavLinks();
}
