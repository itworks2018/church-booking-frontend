document.addEventListener('DOMContentLoaded', async function () {
    // Ensure a valid venue is set in localStorage before loading calendar
    const validVenues = ["Main Hall", "Phase A Area 1", "Phase 2 Area B", "NxtGen Room"];
    let venueId = localStorage.getItem("selectedVenueId");
    if (!venueId || !validVenues.includes(venueId)) {
      venueId = validVenues[0];
      localStorage.setItem("selectedVenueId", venueId);
    }
  const calendarEl = document.getElementById('fullcalendar');
  if (!calendarEl) {
    console.error('Calendar element not found');
    return;
  }

  const token = localStorage.getItem("access_token");

  try {
    const res = await fetch(`${window.API_BASE_URL}/api/calendar/venue/${encodeURIComponent(venueId)}/bookings`, {
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

    // Only show pending and approved bookings
    const filtered = bookings.filter(b => b.status === "Pending" || b.status === "Approved");

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 'auto',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: filtered.map(b => ({
        id: b.booking_id,
        title: b.event_name || (b.status === "Approved" ? "Approved Booking" : "Pending Booking"),
        start: b.start_datetime,
        end: b.end_datetime,
        color: b.status === "Approved" ? "blue" : "orange",
        extendedProps: { status: b.status, venue: b.venue }
      })),
      eventClick: function (info) {
        const modal = document.getElementById("bookingModal");
        const content = document.getElementById("bookingModalContent");

        content.innerHTML = `
          <div class="space-y-5">
            <!-- Booking Details Section -->
            <div class="border-l-4 border-blue-500 pl-4">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Booking ID</label>
                  <p class="text-lg text-gray-900 font-semibold mt-2">${info.event.id}</p>
                </div>
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Event Name</label>
                  <p class="text-lg text-gray-900 font-semibold mt-2">${info.event.title}</p>
                </div>
              </div>
            </div>

            <!-- Venue & Status Section -->
            <div class="border-l-4 border-green-500 pl-4">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Venue</label>
                  <p class="text-lg text-gray-900 font-semibold mt-2">${info.event.extendedProps.venue}</p>
                </div>
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                  <span class="inline-block mt-2 px-4 py-2 rounded font-semibold text-sm ${info.event.extendedProps.status === "Approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}">${info.event.extendedProps.status}</span>
                </div>
              </div>
            </div>

            <!-- Date/Time Section -->
            <div class="border-l-4 border-purple-500 pl-4">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date/Time</label>
                  <p class="text-lg text-gray-900 font-semibold mt-2">${info.event.start.toLocaleString("en-US", { hour12: true })}</p>
                </div>
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">End Date/Time</label>
                  <p class="text-lg text-gray-900 font-semibold mt-2">${info.event.end ? info.event.end.toLocaleString("en-US", { hour12: true }) : "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        `;

        modal.classList.remove("hidden");
        
        document.getElementById("closeBookingModal").onclick = () => {
          modal.classList.add("hidden");
        };
      }
    });

    calendar.render();
  } catch (err) {
    console.error("Failed to load bookings:", err);
  }
});