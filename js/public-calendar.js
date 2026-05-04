// Public Calendar - Display Approved Events Only
// This is a read-only public calendar for viewing approved church events

const API_BASE_URL = "https://church-booking-backend.onrender.com";

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  initializeDateTimeDisplay();
  await initializeCalendar();
  setupEventModalHandlers();
});

// Update date/time display
function initializeDateTimeDisplay() {
  const now = new Date();
  
  // Update date (e.g., "April 27")
  const dateOptions = { month: 'short', day: 'numeric' };
  document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);
  
  // Update day (e.g., "Monday")
  const dayOptions = { weekday: 'long' };
  document.getElementById('currentDay').textContent = now.toLocaleDateString('en-US', dayOptions);
  
  // Update time (e.g., "2:30 PM")
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', timeOptions);

  // Update time every minute
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

    setTimeout(async () => {
      const events = await fetchApprovedEvents();
      createCalendar(events);
    }, 500);
  };
  document.head.appendChild(script);
}

// Fetch only approved events from backend
async function fetchApprovedEvents() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings`);
    if (!res.ok) {
      console.error('Failed to fetch bookings');
      return [];
    }

    const data = await res.json();
    const bookings = Array.isArray(data.items) ? data.items : data;

    // Filter ONLY approved bookings
    return bookings
      .filter(booking => booking.status && booking.status.toLowerCase() === 'approved')
      .map(booking => ({
        id: booking.id,
        title: booking.event_name || 'Event',
        start: booking.start_date,
        end: booking.end_date,
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        extendedProps: {
          purpose: booking.purpose,
          attendees: booking.attendees,
          venue: booking.venue,
          description: booking.description,
          contact: booking.contact_number,
          status: booking.status,
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
    headerToolbar: false,
    height: 'auto',
    contentHeight: 'auto',
    eventClick: handleEventClick,
    eventDisplay: 'block',
    eventClassNames: 'cursor-pointer transition hover:shadow-lg',
    dayCellClassNames: 'hover:bg-blue-50',
    dayMaxEventRows: 3,
    moreLinkClick: 'popover',
    datesSet: function() {
      document.querySelectorAll('.fc-event').forEach(el => {
        el.style.backgroundColor = '#3b82f6';
        el.style.borderColor = '#2563eb';
      });
    }
  });

  calendar.render();
  window.currentCalendar = calendar;

  // View change handlers
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
      btn.className = 'px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md';
    } else {
      btn.className = 'px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition';
    }
  });
}

// Handle event click - show details modal
function handleEventClick(info) {
  const event = info.event;
  const extendedProps = event.extendedProps;

  // Set title
  document.getElementById('modalTitle').textContent = event.title;

  // Format dates
  const startDate = new Date(event.start);
  const endDate = event.end ? new Date(event.end) : null;
  
  const dateDisplay = startDate.toLocaleString('en-US', { 
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const endDateDisplay = endDate ? endDate.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : null;

  // Create content HTML
  const contentHtml = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Left Column -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-blue-300">Date & Venue</h3>
        
        <div class="mb-5">
          <p class="text-xs uppercase tracking-wide font-bold text-gray-500 mb-1">Start Date & Time</p>
          <p class="text-base font-medium text-gray-900">${dateDisplay}</p>
        </div>

        ${endDateDisplay ? `
          <div class="mb-5">
            <p class="text-xs uppercase tracking-wide font-bold text-gray-500 mb-1">End Date & Time</p>
            <p class="text-base font-medium text-gray-900">${endDateDisplay}</p>
          </div>
        ` : ''}

        <div class="mb-5">
          <p class="text-xs uppercase tracking-wide font-bold text-gray-500 mb-1">Venue</p>
          <p class="text-base font-medium text-gray-900">${extendedProps.venue || 'Not specified'}</p>
        </div>

        <div class="mb-5">
          <p class="text-xs uppercase tracking-wide font-bold text-gray-500 mb-1">Expected Attendees</p>
          <p class="text-base font-medium text-gray-900">${extendedProps.attendees || 'Not specified'}</p>
        </div>

        <div class="mb-5">
          <p class="text-xs uppercase tracking-wide font-bold text-gray-500 mb-1">Contact Number</p>
          <p class="text-base font-medium text-gray-900">${extendedProps.contact || 'Not provided'}</p>
        </div>
      </div>

      <!-- Right Column -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b-2 border-green-300">Event Details</h3>
        
        <div class="mb-5">
          <p class="text-xs uppercase tracking-wide font-bold text-gray-500 mb-1">Event Purpose</p>
          <p class="text-base font-medium text-gray-900">${extendedProps.purpose || 'Not specified'}</p>
        </div>

        <div class="mb-5">
          <p class="text-xs uppercase tracking-wide font-bold text-gray-500 mb-1">Description</p>
          <p class="text-base text-gray-700 leading-relaxed">${extendedProps.description || 'No additional description provided'}</p>
        </div>

        <div class="mt-8 p-4 bg-green-50 rounded-lg border-2 border-green-200">
          <p class="text-sm font-bold text-green-700 flex items-center gap-2">
            <span class="text-lg">✓</span> This event has been approved
          </p>
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

  closeBtn.addEventListener('click', closeModal);
  closeBtnBottom.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

function closeModal() {
  const modal = document.getElementById('eventModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}
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
