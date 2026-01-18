// FullCalendar setup for admin/user dashboard
// Assumes FullCalendar and its CSS are loaded via CDN in the HTML

document.addEventListener('DOMContentLoaded', function() {
  const calendarEl = document.getElementById('calendar');
  if (!calendarEl) return;

  const token = localStorage.getItem('access_token');
  const venueId = window.selectedVenueId || 1; // Replace with actual venue selection logic

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: async function(fetchInfo, successCallback, failureCallback) {
      try {
        const res = await fetch(`/api/calendar/venue/${venueId}/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const bookings = await res.json();
        const events = bookings.map(b => ({
          title: b.status === 'approved' ? 'Approved' : 'Pending',
          start: b.start_datetime,
          end: b.end_datetime,
          color: b.status === 'approved' ? '#22c55e' : '#facc15',
        }));
        successCallback(events);
      } catch (err) {
        failureCallback(err);
      }
    },
    selectable: true,
    select: function(info) {
      // You can add logic here to open a booking modal, etc.
      alert('Selected: ' + info.startStr + ' to ' + info.endStr);
    },
    eventClick: function(info) {
      // Optionally show details or allow admin actions
      alert('Booking: ' + info.event.title + '\n' + info.event.start);
    }
  });
  calendar.render();
});
