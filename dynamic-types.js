const ON = window.OpportunityNest;

const populateTypeFilter = async () => {
  const typeFilter = document.querySelector("#type-filter");
  if (!typeFilter || !ON) return;

  await ON.populateTypeFilter(typeFilter);
};

const populateNavLinks = async () => {
  const navContainer = document.getElementById("dynamic-nav-links");
  if (!navContainer || !ON) return;

  try {
    const types = await ON.fetchUniqueTypes();

    if (types && types.length > 0) {
      navContainer.innerHTML = types.map(type => {
        const url = ON.typeToUrl(type);
        return `<a href="${url}">${type}s</a>`;
      }).join('');
    }
  } catch (error) {
    console.error("Error populating nav links:", error);
    navContainer.innerHTML = `
      <a href="/scholarships/">Scholarships</a>
      <a href="/internships/">Internships</a>
      <a href="/fellowships/">Fellowships</a>
    `;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    populateTypeFilter();
    populateNavLinks();
  });
} else {
  populateTypeFilter();
  populateNavLinks();
}
