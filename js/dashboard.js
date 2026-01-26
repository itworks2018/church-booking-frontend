function initPage() {
  loadUserBookings();
  loadCalendarEvents();
}

async function loadUserBookings() {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`https://church-booking-backend.onrender.com/api/calendar/venue/${venueId}/bookings`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const bookings = await res.json();

  const tbody = document.getElementById("myBookingsBody");
  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td class="px-4 py-2">${b.event_name}</td>
      <td class="px-4 py-2">${b.venue}</td>
      <td class="px-4 py-2">${new Date(b.start_datetime).toLocaleString()}</td>
      <td class="px-4 py-2">${new Date(b.end_datetime).toLocaleString()}</td>
      <td class="px-4 py-2">${b.status}</td>
    </tr>
  `).join("");
}

async function loadCalendarEvents() {
  const token = localStorage.getItem("access_token");
  const venueId = localStorage.getItem("selectedVenueId"); // later dynamic
  const res = await fetch(`https://church-booking-backend.onrender.com/api/calendar/venue/${venueId}/bookings`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const bookings = await res.json();

  const calendarEl = document.getElementById("fullcalendar");
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 600,
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
      color: b.status === "Approved" ? "blue" : "orange"
    }))
  });
  calendar.render();
}