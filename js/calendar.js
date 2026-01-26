// frontend/js/calendar.js

document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) {
    console.error('Calendar element not found');
    return;
  }

  const venueId = "123"; // dynamically set this based on user selection
  const token = localStorage.getItem("access_token");

  try {
    const res = await fetch(`/api/venue/${venueId}/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const bookings = await res.json();

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 'auto',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      events: bookings.map(b => ({
        id: b.id,
        title: b.status === "Approved" ? "Approved Booking" : "Pending Booking",
        start: b.start_datetime,
        end: b.end_datetime,
        color: b.status === "Approved" ? "blue" : "orange"   // ✅ color coding
      })),
      eventClick: function (info) {
        alert(
          'Booking ID: ' + info.event.id +
          '\nStatus: ' + info.event.title +
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