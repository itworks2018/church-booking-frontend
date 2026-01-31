document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('fullcalendar');
  if (!calendarEl) {
    console.error('Calendar element not found');
    return;
  }

  // Use venue (string) from localStorage
  const venueId = localStorage.getItem("selectedVenueId");
  const token = localStorage.getItem("access_token");

  if (!venueId || typeof venueId !== "string" || venueId.trim() === "") {
    console.error("No valid venue selected in localStorage");
    return;
  }

  try {
    const res = await fetch(`https://church-booking-backend.onrender.com/api/calendar/venue/${encodeURIComponent(venueId)}/bookings`, {
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

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 'auto',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: bookings.map(b => ({
        id: b.booking_id,
        title: b.event_name || (b.status === "Approved" ? "Approved Booking" : "Pending Booking"),
        start: b.start_datetime,
        end: b.end_datetime,
        color: b.status === "Approved" ? "blue" : "orange",
        extendedProps: { status: b.status, venue: b.venue }
      })),
      eventClick: function (info) {
        alert(
          'Booking ID: ' + info.event.id +
          '\nTitle: ' + info.event.title +
          '\nStatus: ' + info.event.extendedProps.status +
          '\nVenue: ' + info.event.extendedProps.venue +
          '\nStart: ' + info.event.start.toLocaleString() +
          '\nEnd: ' + (info.event.end ? info.event.end.toLocaleString() : "N/A")
        );
      }
    });

    calendar.render();
  } catch (err) {
    console.error("Failed to load bookings:", err);
  }
});