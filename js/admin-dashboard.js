// Admin Dashboard Initialization Script
async function initAdminDashboard() {
  try {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role") || localStorage.getItem("role");

    // Guard: only allow admins
    if (!token || role !== "admin") {
      window.location.href = "/admin/login.html";
      return;
    }

    const authHeaders = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Fetch combined metrics
    const metricsRes = await fetch(`${window.ADMIN_API_BASE_URL}/api/metrics/counts`, authHeaders);
    if (!metricsRes.ok) throw new Error("Failed to fetch metrics");
    const metricsData = await metricsRes.json();
    console.log("Metrics data:", metricsData);

    const bookingsEl = document.getElementById("countBookings");
    const membersEl = document.getElementById("countMembers");
    if (bookingsEl && typeof metricsData.bookings_count !== "undefined")
      bookingsEl.textContent = metricsData.bookings_count;
    if (membersEl && typeof metricsData.users_count !== "undefined")
      membersEl.textContent = metricsData.users_count;

    // Pending bookings
    try {
      const pendingRes = await fetch(`${window.ADMIN_API_BASE_URL}/api/bookings/pending`, authHeaders);
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        const pendingEl = document.getElementById("countPending");
        if (pendingEl && typeof pendingData.pendingCount !== "undefined")
          pendingEl.textContent = pendingData.pendingCount;
        populatePendingTable(pendingData.items || pendingData);
      } else {
        console.warn("Pending bookings fetch failed:", pendingRes.status);
      }
    } catch (e) {
      console.warn("Pending bookings error:", e);
    }

    // Upcoming bookings
    try {
      const upcomingRes = await fetch(`${window.ADMIN_API_BASE_URL}/api/bookings/upcoming`, authHeaders);
      if (upcomingRes.ok) {
        const upcomingData = await upcomingRes.json();
        const upcomingEl = document.getElementById("countUpcoming");
        if (upcomingEl && typeof upcomingData.upcomingCount !== "undefined")
          upcomingEl.textContent = upcomingData.upcomingCount;
      } else {
        console.warn("Upcoming bookings fetch failed:", upcomingRes.status);
      }
    } catch (e) {
      console.warn("Upcoming bookings error:", e);
    }

    // ✅ Calendar initialization using global FullCalendar (CDN build)
    const calendarEl = document.getElementById("fullcalendar");
    if (calendarEl && window.FullCalendar) {
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        height: 600,
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        // ✅ Dynamic events fetch from backend
        events: async function (fetchInfo, successCallback, failureCallback) {
          try {
            const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/bookings/upcoming`, {
              headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to fetch events");
            const data = await res.json();

            const events = data.map(item => ({
              title: item.event_name || item.title || "Untitled",
              start: item.date || item.event_date,
              end: item.end_date || null,
              extendedProps: {
                user: item.user_email || item.user,
                venue: item.venue,
                status: item.status
              }
            }));

            successCallback(events);
          } catch (err) {
            console.error("Calendar events fetch error:", err);
            failureCallback(err);
          }
        }
      });

      calendar.render();
    }
  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }
}

// Helper to populate pending table
function populatePendingTable(items) {
  try {
    const tbody = document.getElementById("pendingTable");
    if (!tbody || !items || !Array.isArray(items)) return;
    tbody.innerHTML = "";
    items.forEach((item) => {
      const tr = document.createElement("tr");
      tr.className = "border-b";
      const date = item.date || item.event_date || item.created_at || "";
      tr.innerHTML = `
        <td class="p-3">${escapeHtml(item.event_name || item.title || "")}</td>
        <td class="p-3">${escapeHtml(item.user_email || item.user || "")}</td>
        <td class="p-3">${escapeHtml(item.venue || "")}</td>
        <td class="p-3">${escapeHtml(date)}</td>
        <td class="p-3">${escapeHtml(item.status || "")}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.warn("populatePendingTable error:", e);
  }
}

// Minimal HTML escape helper
function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

// ✅ Expose globally
window.initAdminDashboard = initAdminDashboard;