const loginCard = document.getElementById("loginCard");
const dashboardCard = document.getElementById("dashboardCard");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const submissionsBody = document.getElementById("submissionsBody");
const logoutBtn = document.getElementById("logoutBtn");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.classList.add("hidden");

  const formData = new FormData(loginForm);
  const payload = {
    password: String(formData.get("password") || "")
  };

  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    loginError.classList.remove("hidden");
    return;
  }

  loginForm.reset();
  await loadDashboard();
});

logoutBtn.addEventListener("click", async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  showLoggedOut();
});

loadDashboard();

async function loadDashboard() {
  const response = await fetch("/api/admin/submissions");
  if (!response.ok) {
    return showLoggedOut();
  }

  const data = await response.json();
  renderRows(data.submissions || []);
  loginCard.classList.add("hidden");
  dashboardCard.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
}

function showLoggedOut() {
  dashboardCard.classList.add("hidden");
  logoutBtn.classList.add("hidden");
  loginCard.classList.remove("hidden");
}

function renderRows(rows) {
  submissionsBody.innerHTML = "";

  if (!rows.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="6">No prank victims yet.</td>';
    submissionsBody.appendChild(row);
    return;
  }

  rows.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(entry.yourName)}</td>
      <td>${escapeHtml(entry.crushName)}</td>
      <td>${escapeHtml(entry.yourBirthDate || "-")}</td>
      <td>${escapeHtml(entry.crushBirthDate || "-")}</td>
      <td>${escapeHtml((entry.locale || "").toUpperCase())}</td>
      <td>${escapeHtml(formatDate(entry.createdAt))}</td>
    `;
    submissionsBody.appendChild(row);
  });
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value || "-";
  }

  return date.toLocaleString();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
