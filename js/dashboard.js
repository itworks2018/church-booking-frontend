function initPage() {
  loadUserBookings();
  loadCalendarEvents();
}

// Booking Table Fetcher
async function loadUserBookings() {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  // Get venueId dynamically (from localStorage or user selection)
  const validVenues = ["Main Hall", "Phase A Area 1", "Phase 2 Area B", "NxtGen Room"];
  let venueId = localStorage.getItem("selectedVenueId");
  if (!venueId || !validVenues.includes(venueId)) {
    venueId = validVenues[0];
    localStorage.setItem("selectedVenueId", venueId);
  }
  try {
    // Fetch only bookings for the logged-in user
    const res = await fetch(`${API_BASE_URL}/api/bookings/my`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.error("Request failed:", res.status);
      return;
    }

    const data = await res.json();
    const tbody = document.getElementById("myBookingsBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (!Array.isArray(data)) {
      console.error("Bookings is not an array:", data);
      return;
    }
    // Only show pending and approved
    data.filter(b => b.status === "Pending" || b.status === "Approved").forEach(b => {
      const row = `
        <tr>
          <td class="border px-3 py-2">${b.event_name}</td>
          <td class="border px-3 py-2">${b.venue}</td>
          <td class="border px-3 py-2">${new Date(b.start_datetime).toLocaleString()}</td>
          <td class="border px-3 py-2">${new Date(b.end_datetime).toLocaleString()}</td>
          <td class="border px-3 py-2 capitalize">${b.status}</td>
          <td class="border px-3 py-2">${b.created_at ? new Date(b.created_at).toLocaleString() : ''}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  } catch (err) {
    console.error("Error loading bookings:", err);
  }
}

async function loadCalendarEvents() {
  const token = localStorage.getItem("access_token");
  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      console.error("Request failed:", res.status);
      return;
    }
    const bookings = await res.json();
    if (!Array.isArray(bookings)) {
      console.error("Bookings is not an array:", bookings);
      return;
    }
    const calendarEl = document.getElementById("fullcalendar");
    if (!calendarEl) {
      console.error("Calendar element not found");
      return;
    }
    // Only show pending and approved bookings in the calendar
    const filtered = bookings.filter(b => b.status === "Pending" || b.status === "Approved");
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 600,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: filtered.map(b => ({
        id: b.id || b.booking_id,
        title: b.event_name || (b.status === "Approved" ? "Approved Booking" : "Pending Booking"),
        start: b.start_datetime,
        end: b.end_datetime,
        color: b.status === "Approved" ? "blue" : "orange",
        extendedProps: { ...b }
      })),
      eventClick: function(info) {
        const b = info.event.extendedProps;
        const modal = document.getElementById('bookingModal');
        const content = document.getElementById('bookingModalContent');
        content.innerHTML = `
          <div><strong>Event:</strong> ${b.event_name || ''}</div>
          <div><strong>Venue:</strong> ${b.venue || ''}</div>
          <div><strong>Status:</strong> <span class="capitalize">${b.status || ''}</span></div>
          <div><strong>Start:</strong> ${b.start_datetime ? new Date(b.start_datetime).toLocaleString() : ''}</div>
          <div><strong>End:</strong> ${b.end_datetime ? new Date(b.end_datetime).toLocaleString() : ''}</div>
          <div><strong>Purpose:</strong> ${b.purpose || ''}</div>
          <div><strong>Attendees:</strong> ${b.attendees || ''}</div>
          <div><strong>Additional Needs:</strong> ${b.additional_needs || ''}</div>
          <div><strong>Requested At:</strong> ${b.created_at ? new Date(b.created_at).toLocaleString() : ''}</div>
        `;
        modal.classList.remove('hidden');
      }
    });
    calendar.render();
    // Modal close logic
    document.getElementById('closeBookingModal').onclick = function() {
      document.getElementById('bookingModal').classList.add('hidden');
    };
    document.getElementById('bookingModal').onclick = function(e) {
      if (e.target === this) this.classList.add('hidden');
    };
  } catch (err) {
    console.error("Failed to load bookings:", err);
  }
}

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
      window.location.href = "/login.html";
    }, LOGOUT_TIME);
  }
  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(evt => {
    window.addEventListener(evt, resetTimer, true);
  });
  resetTimer();
})();