const passwordForm = document.querySelector("#password-form");
const passwordInput = document.querySelector("#admin-password");
const adminGate = document.querySelector("#admin-gate");
const adminPanel = document.querySelector("#admin-panel");
const lockAdminButton = document.querySelector("#lock-admin");
const opportunityForm = document.querySelector("#opportunity-form");
const adminList = document.querySelector("#admin-list");
const adminStatus = document.querySelector("#admin-status");
const refreshAdminButton = document.querySelector("#refresh-admin");

let adminPassword = sessionStorage.getItem("opportunitynest_admin_password") || "";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const normalizeOpportunity = (row) => ({
  id: row.id,
  type: row.type || row.category || "",
  funding: row.funding || row.funding_type || "",
  title: row.title || row.name || "",
  country: row.country || row.location || "",
  level: row.level || row.study_level || "",
  field: row.field || row.subject || "",
  deadline: row.deadline || row.deadline_date || "",
  description: row.description || row.summary || "",
  link: row.link || row.url || row.application_link || ""
});

const setAdminStatus = (message, isError = false) => {
  adminStatus.textContent = message;
  adminStatus.classList.toggle("is-error", isError);
};

const requestAdmin = async (path = "/api/opportunities", options = {}) => {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": adminPassword,
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Admin request failed.");
  }
  return payload;
};

const renderAdminList = (rows) => {
  if (!rows.length) {
    adminList.innerHTML = '<p class="empty-state">No opportunities yet.</p>';
    return;
  }

  adminList.innerHTML = rows
    .map((row) => {
      const item = normalizeOpportunity(row);
      return `
        <article class="admin-list-item">
          <div>
            <p class="card-kicker">${escapeHtml(item.type)} • ${escapeHtml(item.country)}</p>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.funding)} • ${escapeHtml(item.level)} • ${escapeHtml(item.field)}</p>
            <p>Deadline: ${escapeHtml(item.deadline || "Open")}</p>
          </div>
          <button class="button button-danger" type="button" data-delete-id="${escapeHtml(item.id)}">Delete</button>
        </article>
      `;
    })
    .join("");
};

const loadAdminOpportunities = async () => {
  setAdminStatus("Loading opportunities...");
  adminList.innerHTML = "";
  try {
    const { data } = await requestAdmin();
    renderAdminList(data || []);
    setAdminStatus(`${(data || []).length} opportunities loaded.`);
  } catch (error) {
    setAdminStatus(error.message, true);
  }
};

const unlockAdmin = () => {
  adminGate.hidden = true;
  adminPanel.hidden = false;
  loadAdminOpportunities();
};

if (adminPassword) {
  unlockAdmin();
}

passwordForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  adminPassword = passwordInput.value.trim();
  if (!adminPassword) return;
  sessionStorage.setItem("opportunitynest_admin_password", adminPassword);
  unlockAdmin();
});

lockAdminButton?.addEventListener("click", () => {
  adminPassword = "";
  sessionStorage.removeItem("opportunitynest_admin_password");
  adminPanel.hidden = true;
  adminGate.hidden = false;
  passwordInput.value = "";
});

refreshAdminButton?.addEventListener("click", loadAdminOpportunities);

opportunityForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(opportunityForm);
  const opportunity = Object.fromEntries(formData.entries());

  setAdminStatus("Adding opportunity...");
  try {
    await requestAdmin("/api/opportunities", {
      method: "POST",
      body: JSON.stringify(opportunity)
    });
    opportunityForm.reset();
    await loadAdminOpportunities();
    setAdminStatus("Opportunity added successfully.");
  } catch (error) {
    setAdminStatus(error.message, true);
  }
});

adminList?.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) return;

  const id = button.getAttribute("data-delete-id");
  const confirmed = window.confirm("Delete this opportunity? This cannot be undone.");
  if (!confirmed) return;

  setAdminStatus("Deleting opportunity...");
  try {
    await requestAdmin(`/api/opportunities?id=${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    await loadAdminOpportunities();
    setAdminStatus("Opportunity deleted successfully.");
  } catch (error) {
    setAdminStatus(error.message, true);
  }
});
