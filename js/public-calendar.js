// Public Calendar - Display Approved Events

const API_BASE_URL = "https://church-booking-backend.onrender.com";

// Initialize FullCalendar when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  initializeDateTimeDisplay();
  await initializeCalendar();
  setupEventModalHandlers();
});

// Update date/time display
function initializeDateTimeDisplay() {
  const now = new Date();
  
  // Update date (e.g., "April 27, 2026")
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);
  
  // Update time (e.g., "2:30 PM")
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', timeOptions);
  
  // Update day (e.g., "Monday")
  const dayOptions = { weekday: 'long' };
  document.getElementById('currentDay').textContent = now.toLocaleDateString('en-US', dayOptions);

  // Update every minute
  setInterval(() => {
    const updated = new Date();
    const timeOpts = { hour: '2-digit', minute: '2-digit' };
    document.getElementById('currentTime').textContent = updated.toLocaleTimeString('en-US', timeOpts);
  }, 60000);
}

// Initialize FullCalendar
async function initializeCalendar() {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js';
  script.onload = async () => {
    const CSS = document.createElement('link');
    CSS.rel = 'stylesheet';
    CSS.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css';
    document.head.appendChild(CSS);

    // Wait for CSS to load
    setTimeout(async () => {
      const events = await fetchApprovedEvents();
      createCalendar(events);
    }, 500);
  };
  document.head.appendChild(script);
}

// Fetch approved events from backend
async function fetchApprovedEvents() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings`);
    if (!res.ok) {
      console.error('Failed to fetch bookings');
      return [];
    }

    const data = await res.json();
    const bookings = Array.isArray(data.items) ? data.items : data;

    // Filter only approved bookings and format for FullCalendar
    return bookings
      .filter(booking => booking.status && booking.status.toLowerCase() === 'approved')
      .map(booking => ({
        id: booking.id,
        title: booking.event_name || 'Event',
        start: booking.start_date,
        end: booking.end_date,
        extendedProps: {
          purpose: booking.purpose,
          attendees: booking.attendees,
          venue: booking.venue,
          description: booking.description,
          contact: booking.contact_number,
          fullData: booking
        }
      }));
  } catch (err) {
    console.error('Error fetching events:', err);
    return [];
  }
}

// Create and configure FullCalendar
function createCalendar(events) {
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    initialDate: new Date(),
    events: events,
    headerToolbar: false, // We'll use custom buttons
    height: 'auto',
    contentHeight: 'auto',
    eventClick: handleEventClick,
    eventDisplay: 'block',
    eventClassNames: 'bg-blue-500 border-blue-600 hover:bg-blue-600 cursor-pointer',
    dayCellClassNames: 'hover:bg-blue-50',
    dayMaxEventRows: 3,
    moreLinkClick: 'popover'
  });

  calendar.render();

  // Store calendar instance for view changes
  window.currentCalendar = calendar;

  // Setup view change buttons
  document.getElementById('monthViewBtn').addEventListener('click', () => {
    calendar.changeView('dayGridMonth');
    updateViewButtons('month');
  });

  document.getElementById('weekViewBtn').addEventListener('click', () => {
    calendar.changeView('timeGridWeek');
    updateViewButtons('week');
  });

  document.getElementById('dayViewBtn').addEventListener('click', () => {
    calendar.changeView('timeGridDay');
    updateViewButtons('day');
  });

  document.getElementById('listViewBtn').addEventListener('click', () => {
    calendar.changeView('listMonth');
    updateViewButtons('list');
  });
}

// Update view button styles
function updateViewButtons(activeView) {
  const buttons = ['monthViewBtn', 'weekViewBtn', 'dayViewBtn', 'listViewBtn'];
  buttons.forEach(btnId => {
    const btn = document.getElementById(btnId);
    if (btnId === activeView + 'ViewBtn') {
      btn.className = 'px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition';
    } else {
      btn.className = 'px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition';
    }
  });
}

// Handle event click - show details modal
function handleEventClick(info) {
  const event = info.event;
  const extendedProps = event.extendedProps;
  const fullData = extendedProps.fullData;

  // Populate modal
  document.getElementById('modalTitle').textContent = event.title;

  const contentHtml = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Left Column -->
      <div>
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Event Details</h3>
        
        <div class="mb-4">
          <p class="text-sm text-gray-500 font-semibold">Date & Time</p>
          <p class="text-base">${new Date(event.start).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</p>
          ${event.end ? `<p class="text-sm text-gray-600">to ${new Date(event.end).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</p>` : ''}
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-500 font-semibold">Venue</p>
          <p class="text-base">${extendedProps.venue || 'N/A'}</p>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-500 font-semibold">Expected Attendees</p>
          <p class="text-base">${extendedProps.attendees || 'N/A'}</p>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-500 font-semibold">Contact Number</p>
          <p class="text-base">${extendedProps.contact || 'N/A'}</p>
        </div>
      </div>

      <!-- Right Column -->
      <div>
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Purpose & Description</h3>
        
        <div class="mb-4">
          <p class="text-sm text-gray-500 font-semibold">Purpose</p>
          <p class="text-base">${extendedProps.purpose || 'N/A'}</p>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-500 font-semibold">Description</p>
          <p class="text-base">${extendedProps.description || 'No description provided'}</p>
        </div>

        <div class="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p class="text-sm font-semibold text-green-700">✓ This event is approved</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('modalContent').innerHTML = contentHtml;

  // Show modal
  const modal = document.getElementById('eventModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// Setup modal close handlers
function setupEventModalHandlers() {
  const modal = document.getElementById('eventModal');
  const closeBtn = document.getElementById('closeModal');
  const closeBtnBottom = document.getElementById('closeModalBtn');

  closeBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  });

  closeBtnBottom.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  });

  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  });
}
