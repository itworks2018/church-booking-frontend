document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('fullcalendar');
  if (!calendarEl) {
    console.error('Calendar element not found');
    return;
  }

  // TODO: dynamically set venueId from user selection or localStorage
  const venueId = localStorage.getItem("selectedVenueId") || "123";
  const token = localStorage.getItem("access_token");

  try {
    const res = await fetch(`/api/calendar/venue/${venueId}/bookings`, {
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
        id: b.booking_id, // ✅ matches your Supabase schema
        title: b.event_name || (b.status === "Approved" ? "Approved Booking" : "Pending Booking"),
        start: b.start_datetime,
        end: b.end_datetime,
        color: b.status === "Approved" ? "blue" : "orange"
      })),
      eventClick: function (info) {
        alert(
          'Booking ID: ' + info.event.id +
          '\nTitle: ' + info.event.title +
          '\nStatus: ' + (info.event.extendedProps?.status || "N/A") +
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