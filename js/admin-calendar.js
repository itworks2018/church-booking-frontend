// Load both approved and pending events for the admin calendar
async function loadAdminCalendarEvents() {
  const token = localStorage.getItem("access_token");
  const approvedRes = await fetch(`${window.ADMIN_API_BASE_URL}/api/bookings/approved/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const pendingRes = await fetch(`${window.ADMIN_API_BASE_URL}/api/bookings/pending/list`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  let approved = [];
  let pending = [];
  if (approvedRes.ok) {
    const data = await approvedRes.json();
    approved = Array.isArray(data.items) ? data.items : [];
  }
  if (pendingRes.ok) {
    const data = await pendingRes.json();
    pending = Array.isArray(data.items) ? data.items : [];
  }
  return [approved, pending];
}

// Render FullCalendar with both approved and pending events
async function renderAdminCalendar() {
  const calendarEl = document.getElementById('fullcalendar');
  if (!calendarEl) return;
  const [approved, pending] = await loadAdminCalendarEvents();
  const events = [
    ...approved.map(b => ({
      id: b.booking_id,
      title: b.event_name || 'Approved Booking',
      start: b.start_datetime,
      end: b.end_datetime,
      color: 'blue',
      extendedProps: { status: 'Approved', venue: b.venue }
    })),
    ...pending.map(b => ({
      id: b.booking_id,
      title: b.event_name || 'Pending Booking',
      start: b.start_datetime,
      end: b.end_datetime,
      color: 'orange',
      extendedProps: { status: 'Pending', venue: b.venue }
    }))
  ];
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events,
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
}

document.addEventListener('DOMContentLoaded', function() {
  renderAdminCalendar();
});
