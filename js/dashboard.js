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
    const res = await fetch(`${API_BASE_URL}/api/calendar/venue/${encodeURIComponent(venueId)}/bookings`, {
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
  // Use fallback venueId if not set
  const validVenues = ["Main Hall", "Phase A Area 1", "Phase 2 Area B", "NxtGen Room"];
  let venueId = localStorage.getItem("selectedVenueId");
  if (!venueId || !validVenues.includes(venueId)) {
    venueId = validVenues[0];
    localStorage.setItem("selectedVenueId", venueId);
  }
  if (!venueId) {
    console.error("venueId is not defined or selected");
    return;
  }
  try {
    const res = await fetch(`https://church-booking-backend.onrender.com/api/calendar/venue/${venueId}/bookings`, {
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
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 600,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: bookings.map(b => ({
        id: b.id || b.booking_id,
        title: b.event_name || (b.status === "Approved" ? "Approved Booking" : "Pending Booking"),
        start: b.start_datetime,
        end: b.end_datetime,
        color: b.status === "Approved" ? "blue" : "orange"
      }))
    });
    calendar.render();
  } catch (err) {
    console.error("Failed to load bookings:", err);
  }
}