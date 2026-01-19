// frontend/js/calendar.js

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  if (!calendarEl) {
    console.error('Calendar element not found');
    return;
  }

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth', // default month view
    height: 'auto',              // fit parent container
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    // Replace with your backend endpoint that returns JSON events
    events: '/api/user-bookings',
    eventClick: function (info) {
      alert(
        'Booking: ' + info.event.title + '\nDate: ' + info.event.start.toLocaleString()
      );
    }
  });

  calendar.render();
});