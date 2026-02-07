// ✅ Load and display audit logs
async function loadAuditLogs() {
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to fetch audit logs");

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    const tbody = document.getElementById("auditLogsTable");
    if (!tbody) return;

    // Pagination logic
    const pageSize = 10;
    let currentPage = 1;
    const totalPages = Math.ceil(items.length / pageSize);

    function renderTablePage(page) {
      tbody.innerHTML = "";
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      items.slice(start, end).forEach(log => {
        const tr = document.createElement("tr");
        tr.className = "border-b";
        tr.innerHTML = `
          <td class="p-3">${log.booking_id || "N/A"}</td>
          <td class="p-3">${log.event_name || "N/A"}</td>
          <td class="p-3">${log.booker_email || "N/A"}</td>
          <td class="p-3">
            <span class="px-3 py-1 rounded text-white text-sm font-semibold ${
              log.action === "Approved" ? "bg-green-600" :
              log.action === "Rejected" ? "bg-red-600" :
              "bg-blue-600"
            }">
              ${log.action}
            </span>
          </td>
          <td class="p-3">${log.admin_name || "N/A"}</td>
          <td class="p-3">${new Date(log.created_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila', hour12: true })}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    function renderPagination() {
      const nav = document.getElementById("auditLogsPagination");
      const pagesDiv = document.getElementById("auditLogsPages");
      if (items.length > pageSize) {
        nav.style.display = "flex";
        pagesDiv.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
          const btn = document.createElement("button");
          btn.type = "button";
          const isActive = i === currentPage;
          btn.className = isActive 
            ? "px-3 py-2 bg-blue-600 text-white rounded font-semibold transition"
            : "px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition";
          btn.textContent = i;
          btn.onclick = () => {
            currentPage = i;
            renderTablePage(currentPage);
            renderPagination();
          };
          pagesDiv.appendChild(btn);
        }
        document.getElementById("auditLogsPrev").onclick = () => {
          if (currentPage > 1) {
            currentPage--;
            renderTablePage(currentPage);
            renderPagination();
          }
        };
        document.getElementById("auditLogsNext").onclick = () => {
          if (currentPage < totalPages) {
            currentPage++;
            renderTablePage(currentPage);
            renderPagination();
          }
        };
      } else {
        nav.style.display = "none";
      }
    }

    renderTablePage(currentPage);
    renderPagination();
  } catch (err) {
    console.error("loadAuditLogs error:", err);
  }
}

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
  loadAuditLogs();
});
