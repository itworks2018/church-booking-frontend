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

    // Pagination logic
    const pageSize = 5;
    let currentPage = 1;
    const totalPages = Math.ceil(items.length / pageSize);

    function renderTablePage(page) {
      tbody.innerHTML = "";
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      items.slice(start, end).forEach((item) => {
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
          <td class="p-3">${escapeHtml(new Date(item.created_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila', hour12: true }))}</td>
          <td class="p-3">
            <div class="flex flex-row gap-2 justify-center">
              <button class="review-btn min-w-[90px] px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" data-id="${item.booking_id}">Review</button>
              <button class="approve-btn min-w-[90px] px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition" data-id="${item.booking_id}">Approve</button>
              <button class="reject-btn min-w-[90px] px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition" data-id="${item.booking_id}">Reject</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Attach button handlers for current page
      tbody.querySelectorAll(".review-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          const booking = items.find(b => b.booking_id === id);
          if (booking) {
            // Just show the review modal - no audit log needed (no DB change)
            showReviewModal(booking);
          }
        });
      });
      tbody.querySelectorAll(".approve-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          // Disable button to prevent double-click
          e.target.disabled = true;
          e.target.textContent = "Processing...";
          try {
            // Log the approval action
            await logAuditAction(id, "Approved");
            // Then update the booking status
            await updateBookingStatus(id, "Approved");
          } finally {
            // Re-enable button (will be replaced when dashboard refreshes)
            e.target.disabled = false;
            e.target.textContent = "Approve";
          }
        });
      });
      tbody.querySelectorAll(".reject-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          // Disable button to prevent double-click
          e.target.disabled = true;
          e.target.textContent = "Processing...";
          try {
            // Log the rejection action
            await logAuditAction(id, "Rejected");
            // Then update the booking status
            await updateBookingStatus(id, "Rejected");
          } finally {
            // Re-enable button (will be replaced when dashboard refreshes)
            e.target.disabled = false;
            e.target.textContent = "Reject";
          }
        });
      });
    }

    function renderPagination() {
      const nav = document.getElementById("adminBookingsPagination");
      const pagesDiv = document.getElementById("adminBookingsPages");
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
        document.getElementById("adminBookingsPrev").onclick = () => {
          if (currentPage > 1) {
            currentPage--;
            renderTablePage(currentPage);
            renderPagination();
          }
        };
        document.getElementById("adminBookingsNext").onclick = () => {
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


// ✅ Helper to log audit action
async function logAuditAction(booking_id, action) {
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/audit-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ booking_id, action }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`✅ Audit log created for booking ${booking_id}: ${action}`, data);
      return true;
    } else {
      const errorData = await res.json();
      console.error(`❌ Failed to create audit log:`, res.status, errorData);
      return false;
    }
  } catch (err) {
    console.error("❌ logAuditAction error:", err);
    return false;
  }
}

// ✅ Helper to update booking status (WITHOUT logging - logging is done separately)
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
      console.log(`✅ Booking ${id} updated to ${status}`);
      // Refresh dashboard after update
      initAdminDashboard();
    } else {
      console.error("❌ Failed to update booking:", res.status);
    }
  } catch (err) {
    console.error("❌ updateBookingStatus error:", err);
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
      right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
    },
    timeZone: "local",

    // ✅ Highlight the clicked day
    dateClick: function(info) {
      const clickedDate = info.dateStr;
      alert(`You selected: ${clickedDate}`);
    },

    // ✅ Dynamic events fetch from backend (approved and pending)
    events: async function (fetchInfo, successCallback, failureCallback) {
      try {
        const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/bookings/upcoming/list`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch events");
        const data = await res.json();

        console.log("=== ADMIN CALENDAR DEBUG ===");
        console.log("Full API response:", data);
        console.log("Data type:", typeof data);

        const items = Array.isArray(data.items) ? data.items : [];
        console.log("Items array:", items);
        console.log("Total items count:", items.length);
        
        // Check status values in the data
        console.log("Unique statuses in items:", [...new Set(items.map(i => i.status))]);
        
        const approvedAndPendingEvents = items.filter(item => item.status === "Approved" || item.status === "Pending");
        console.log("Approved and Pending items count:", approvedAndPendingEvents.length);
        console.log("Filtered approved and pending:", approvedAndPendingEvents);

        const events = approvedAndPendingEvents.map(item => ({
          id: item.booking_id,
          title: item.event_name || "Untitled",
          start: item.start_datetime,
          end: item.end_datetime || null,
          color: item.status === "Approved" ? "blue" : "orange",
          extendedProps: {
            purpose: item.purpose,
            attendees: item.attendees,
            venue: item.venue,
            additional_needs: item.additional_needs,
            created_at: item.created_at,
            status: item.status
          }
        }));
        
        console.log("Final events for calendar:", events);
        console.log("Events count for calendar:", events.length);
        console.log("=== END DEBUG ===");

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

// === Admin Create Venue Reservation Modal Logic ===
(function setupAdminCreateVenueModal() {
  const modal = document.getElementById('adminCreateVenueModal');
  const form = document.getElementById('adminCreateVenueForm');
  const createVenueBtn = document.getElementById('adminCreateVenueBtn');
  const closeAdminCreateVenueModal = document.getElementById('closeAdminCreateVenueModal');
  const cancelCreateBtn = document.getElementById('adminCancelCreateBtn');
  const draftBtn = document.getElementById('adminDraftBtn');
  const confirmationDialog = document.getElementById('adminConfirmationDialog');
  const confirmNo = document.getElementById('adminConfirmNo');
  const confirmYes = document.getElementById('adminConfirmYes');
  const DRAFT_KEY = 'adminVenueBookingDraft';
  const API_BASE_URL = window.ADMIN_API_BASE_URL;

  if (!createVenueBtn || !modal) return;

  // Open modal
  createVenueBtn.addEventListener('click', function() {
    loadDraftData();
    modal.classList.remove('hidden');
  });

  // Close modal
  function closeModal() {
    modal.classList.add('hidden');
  }

  closeAdminCreateVenueModal.addEventListener('click', closeModal);
  
  cancelCreateBtn.addEventListener('click', function(e) {
    e.preventDefault();
    closeModal();
  });

  // Click outside modal to close
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });

  // Load draft data from localStorage
  function loadDraftData() {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      const data = JSON.parse(draft);
      document.getElementById('acv_event_name').value = data.event_name || '';
      document.getElementById('acv_purpose').value = data.purpose || '';
      document.getElementById('acv_attendees').value = data.attendees || '';
      document.getElementById('acv_venue').value = data.venue || '';
      document.getElementById('acv_start_datetime').value = data.start_datetime || '';
      document.getElementById('acv_end_datetime').value = data.end_datetime || '';
      document.getElementById('acv_additional_needs').value = data.additional_needs || '';
    }
  }

  // Save draft to localStorage
  draftBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const formData = {
      event_name: document.getElementById('acv_event_name').value,
      purpose: document.getElementById('acv_purpose').value,
      attendees: document.getElementById('acv_attendees').value,
      venue: document.getElementById('acv_venue').value,
      start_datetime: document.getElementById('acv_start_datetime').value,
      end_datetime: document.getElementById('acv_end_datetime').value,
      additional_needs: document.getElementById('acv_additional_needs').value
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    alert('Draft saved! You can edit it anytime.');
  });

  // Submit form
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    confirmationDialog.classList.remove('hidden');
  });

  // Confirmation dialog - No
  confirmNo.addEventListener('click', function() {
    confirmationDialog.classList.add('hidden');
  });

  // Confirmation dialog - Yes
  confirmYes.addEventListener('click', async function() {
    confirmationDialog.classList.add('hidden');
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Admin not authenticated. Please log in.');
      return;
    }

    const formData = {
      event_name: document.getElementById('acv_event_name').value,
      purpose: document.getElementById('acv_purpose').value,
      attendees: parseInt(document.getElementById('acv_attendees').value),
      venue: document.getElementById('acv_venue').value,
      start_datetime: document.getElementById('acv_start_datetime').value,
      end_datetime: document.getElementById('acv_end_datetime').value,
      additional_needs: document.getElementById('acv_additional_needs').value
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const error = await res.json();
        alert('Error submitting booking: ' + (error.message || 'Unknown error'));
        return;
      }

      const result = await res.json();
      alert('Booking submitted successfully!');
      
      // Clear draft
      localStorage.removeItem(DRAFT_KEY);
      
      // Reset form
      form.reset();
      closeModal();
      
      // Reload dashboard
      if (typeof initAdminDashboard === 'function') {
        initAdminDashboard();
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
      alert('Failed to submit booking. Please try again.');
    }
  });

  // Close confirmation dialog when clicking outside
  confirmationDialog.addEventListener('click', function(e) {
    if (e.target === confirmationDialog) {
      confirmationDialog.classList.add('hidden');
    }
  });
})();

// === Session Timeout (5 min inactivity) ===
(function setupSessionTimeout() {
  let timeout;
  const LOGOUT_TIME = 5 * 60 * 1000; // 5 minutes
  function resetTimer() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      alert("Session expired due to inactivity. You will be logged out.");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_role");
      window.location.href = "/admin/login.html";
    }, LOGOUT_TIME);
  }
  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(evt => {
    window.addEventListener(evt, resetTimer, true);
  });
  resetTimer();
})();

// ✅ Expose globally
window.initAdminDashboard = initAdminDashboard;