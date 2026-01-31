// ✅ Helper to safely escape HTML
function escapeHtml(unsafe) {
  if (typeof unsafe !== "string") return unsafe;
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Admin Dashboard Initialization Script
async function initAdminDashboard() {
  try {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role") || localStorage.getItem("role");

    // Guard: only allow admins (check both user_role and role)
    if (!token || (role !== "admin" && localStorage.getItem("user_role") !== "admin" && localStorage.getItem("role") !== "admin")) {
      window.location.href = "/admin/login.html";
      return;
    }

    const authHeaders = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

  // ✅ Place helper functions AFTER initAdminDashboard

function populatePendingTable(items) {
  try {
    const tbody = document.getElementById("pendingTable");
    if (!tbody || !items || !Array.isArray(items)) return;
    tbody.innerHTML = "";

    items.forEach((item) => {
      const tr = document.createElement("tr");
      tr.className = "border-b";

      tr.innerHTML = `
        <td class="p-3">${escapeHtml(item.booking_id || "")}</td>
        <td class="p-3">${escapeHtml(item.event_name || "")}</td>
        <td class="p-3">${escapeHtml(item.purpose || "")}</td>
        <td class="p-3">${escapeHtml(item.attendees || "")}</td>
        <td class="p-3">${escapeHtml(item.venue || "")}</td>
        <td class="p-3">${escapeHtml(new Date(item.start_datetime).toLocaleString())}</td>
        <td class="p-3">${escapeHtml(new Date(item.end_datetime).toLocaleString())}</td>
        <td class="p-3">${escapeHtml(item.status || "")}</td>
        <td class="p-3">${escapeHtml(new Date(item.created_at).toLocaleString())}</td>
        <td class="p-3 space-x-2">
          <button class="bg-blue-500 text-white px-2 py-1 rounded review-btn" data-id="${item.booking_id}">Review</button>
          <button class="bg-green-500 text-white px-2 py-1 rounded approve-btn" data-id="${item.booking_id}">Approve</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded reject-btn" data-id="${item.booking_id}">Reject</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // ✅ Attach button handlers
    document.querySelectorAll(".review-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        const booking = items.find(b => b.booking_id === id);
        if (booking) showReviewModal(booking);
      });
    });

    document.querySelectorAll(".approve-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        await updateBookingStatus(id, "Approved");
      });
    });

    document.querySelectorAll(".reject-btn").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        await updateBookingStatus(id, "Rejected");
      });
    });

  } catch (e) {
    console.warn("populatePendingTable error:", e);
  }
}

function showReviewModal(booking) {
  const modal = document.getElementById("reviewModal");
  const content = document.getElementById("reviewContent");

  content.innerHTML = `
    <p><strong>Booking ID:</strong> ${escapeHtml(booking.booking_id)}</p>
    <p><strong>Event Name:</strong> ${escapeHtml(booking.event_name)}</p>
    <p><strong>Purpose:</strong> ${escapeHtml(booking.purpose)}</p>
    <p><strong>Attendees:</strong> ${escapeHtml(booking.attendees)}</p>
    <p><strong>Venue:</strong> ${escapeHtml(booking.venue)}</p>
    <p><strong>Start:</strong> ${escapeHtml(new Date(booking.start_datetime).toLocaleString())}</p>
    <p><strong>End:</strong> ${escapeHtml(new Date(booking.end_datetime).toLocaleString())}</p>
    <p><strong>Status:</strong> ${escapeHtml(booking.status)}</p>
    <p><strong>Created At:</strong> ${escapeHtml(new Date(booking.created_at).toLocaleString())}</p>
    <p><strong>Additional Needs:</strong> ${escapeHtml(booking.additional_needs || "None")}</p>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  document.getElementById("closeReview").onclick = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };
}


// ✅ Helper to update booking status
async function updateBookingStatus(id, status) {
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      console.log(`Booking ${id} updated to ${status}`);
      // Refresh dashboard after update
      initAdminDashboard();
    } else {
      console.error("Failed to update booking:", res.status);
    }
  } catch (err) {
    console.error("updateBookingStatus error:", err);
  }
}

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

    // ✅ Pending bookings (table + metrics)
    try {
      const pendingRes = await fetch(`${window.ADMIN_API_BASE_URL}/api/bookings/pending/list`, authHeaders);
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();

        console.log("Pending bookings response:", pendingData); // Debug log

        const pendingEl = document.getElementById("countPending");
        if (pendingEl && typeof pendingData.pendingCount !== "undefined")
          pendingEl.textContent = pendingData.pendingCount;

        const items = Array.isArray(pendingData.items) ? pendingData.items : [];
        if (!items.length) {
          document.getElementById("pendingTable").innerHTML =
            '<tr><td colspan="10" class="p-3 text-center">No pending requests.</td></tr>';
        } else {
          populatePendingTable(items);
        }
      } else {
        console.warn("Pending bookings fetch failed:", pendingRes.status);
      }
    } catch (e) {
      console.warn("Pending bookings error:", e);
    }

    // ✅ Upcoming bookings count (for metrics card)
    try {
      const upcomingRes = await fetch(`${window.ADMIN_API_BASE_URL}/api/bookings/upcoming`, authHeaders);
      if (upcomingRes.ok) {
        const upcomingData = await upcomingRes.json();

        console.log("Upcoming bookings count response:", upcomingData); // Debug log

        const upcomingEl = document.getElementById("countUpcoming");
        if (upcomingEl && typeof upcomingData.upcomingCount !== "undefined") {
          upcomingEl.textContent = upcomingData.upcomingCount;
        }
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
    timeZone: "local",

    // ✅ Highlight the clicked day
    dateClick: function(info) {
      const clickedDate = info.dateStr;
      alert(`You selected: ${clickedDate}`);
    },

    // ✅ Dynamic events fetch from backend (approved only)
    events: async function (fetchInfo, successCallback, failureCallback) {
      try {
        const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/bookings/upcoming/list`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();

        console.log("Upcoming bookings response:", data); // Debug log

        const items = Array.isArray(data.items) ? data.items : [];
        const approvedEvents = items.filter(item => item.status === "Approved");

        const events = approvedEvents.map(item => ({
          id: item.booking_id,
          title: item.event_name || "Untitled",
          start: item.start_datetime,
          end: item.end_datetime || null,
          extendedProps: {
            purpose: item.purpose,
            attendees: item.attendees,
            venue: item.venue,
            additional_needs: item.additional_needs,
            created_at: item.created_at,
            status: item.status
          }
        }));

        successCallback(events);
      } catch (err) {
        console.error("Calendar events fetch error:", err);
        failureCallback(err);
      }
    },

    // ✅ Show modal when event clicked
    eventClick: function(info) {
      const booking = info.event.extendedProps;
      const modal = document.getElementById("eventModal");
      const content = document.getElementById("eventContent");

      content.innerHTML = `
        <p><strong>Event:</strong> ${info.event.title}</p>
        <p><strong>Venue:</strong> ${booking.venue}</p>
        <p><strong>Purpose:</strong> ${booking.purpose}</p>
        <p><strong>Attendees:</strong> ${booking.attendees}</p>
        <p><strong>Start:</strong> ${new Date(info.event.start).toLocaleString("en-US", { hour12: true })}</p>
        <p><strong>End:</strong> ${info.event.end ? new Date(info.event.end).toLocaleString("en-US", { hour12: true }) : "N/A"}</p>
        <p><strong>Additional Needs:</strong> ${booking.additional_needs || "None"}</p>
        <p><strong>Created At:</strong> ${new Date(booking.created_at).toLocaleString("en-US", { hour12: true })}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
      `;

      modal.classList.remove("hidden");
      modal.classList.add("flex");

      document.getElementById("closeEvent").onclick = () => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      };
    }
  }); // ✅ closes FullCalendar config

  calendar.render();
} // ✅ closes the if block
  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }
} // ✅ closes initAdminDashboard function

// ✅ Expose globally
window.initAdminDashboard = initAdminDashboard;