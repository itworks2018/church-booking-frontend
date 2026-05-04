// Public Calendar - Display Approved Events Only
const API_BASE_URL = "https://church-booking-backend.onrender.com";

let calendarInstance = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded');
  initializeDateTimeDisplay();
  loadFullCalendarAndInit();
  setupEventModalHandlers();
});

// Update date/time display
function initializeDateTimeDisplay() {
  const now = new Date();
  
  const dateOptions = { month: 'short', day: 'numeric' };
  document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);
  
  const dayOptions = { weekday: 'long' };
  document.getElementById('currentDay').textContent = now.toLocaleDateString('en-US', dayOptions);
  
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', timeOptions);

  // Update time every minute
  setInterval(() => {
    const updated = new Date();
    const timeOpts = { hour: '2-digit', minute: '2-digit' };
    document.getElementById('currentTime').textContent = updated.toLocaleTimeString('en-US', timeOpts);
  }, 60000);
}

// Load FullCalendar library and initialize
function loadFullCalendarAndInit() {
  // Load FullCalendar CSS
  const cssLink = document.createElement('link');
  cssLink.rel = 'stylesheet';
  cssLink.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.css';
  document.head.appendChild(cssLink);

  // Load FullCalendar JS
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js';
  script.async = true;
  
  script.onload = function() {
    console.log('FullCalendar script loaded');
    initializeCalendar();
  };

  script.onerror = function() {
    console.error('Failed to load FullCalendar');
  };

  document.body.appendChild(script);
}

// Initialize calendar with events
async function initializeCalendar() {
  try {
    console.log('Initializing calendar...');
    const events = await fetchApprovedEvents();
    console.log('Events fetched:', events.length);
    createCalendar(events);
  } catch (error) {
    console.error('Error initializing calendar:', error);
  }
}

// Fetch approved events from backend
async function fetchApprovedEvents() {
  try {
    console.log('Fetching events from:', API_BASE_URL);
    const res = await fetch(`${API_BASE_URL}/api/bookings`);
    
    if (!res.ok) {
      console.warn('API response not ok, returning empty array');
      return [];
    }

    const data = await res.json();
    const bookings = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
    
    console.log('Total bookings received:', bookings.length);

    // Filter only approved bookings
    const approvedEvents = bookings
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
          status: booking.status
        }
      }));

    console.log('Approved events:', approvedEvents.length);
    return approvedEvents;
  } catch (err) {
    console.error('Error fetching events:', err);
    return [];
  }
}

// Create and render calendar
function createCalendar(events) {
  const calendarEl = document.getElementById('calendar');
  
  if (!calendarEl) {
    console.error('Calendar element not found');
    return;
  }

  if (!window.FullCalendar) {
    console.error('FullCalendar not available');
    return;
  }

  console.log('Creating calendar with', events.length, 'events');

  calendarInstance = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    initialDate: new Date(),
    headerToolbar: false,
    height: '100%',
    contentHeight: '100%',
    events: events,
    eventClick: handleEventClick,
    eventDisplay: 'block',
    dayCellClassNames: 'hover:bg-blue-50',
    dayMaxEventRows: 3,
    moreLinkClick: 'popover',
    datesSet: function() {
      // Re-style events after render
      document.querySelectorAll('.fc-event').forEach(el => {
        el.style.backgroundColor = '#3b82f6';
        el.style.borderColor = '#2563eb';
      });
    }
  });

  try {
    calendarInstance.render();
    console.log('Calendar rendered successfully');
  } catch (error) {
    console.error('Error rendering calendar:', error);
  }

  // Setup view change buttons
  setupViewButtons();
}

// Setup calendar view buttons
function setupViewButtons() {
  const monthBtn = document.getElementById('monthViewBtn');
  const weekBtn = document.getElementById('weekViewBtn');
  const dayBtn = document.getElementById('dayViewBtn');
  const listBtn = document.getElementById('listViewBtn');

  if (!calendarInstance) {
    console.warn('Calendar instance not available for button setup');
    return;
  }

  monthBtn.addEventListener('click', () => {
    calendarInstance.changeView('dayGridMonth');
    updateViewButtons('month');
  });

  weekBtn.addEventListener('click', () => {
    calendarInstance.changeView('timeGridWeek');
    updateViewButtons('week');
  });

  dayBtn.addEventListener('click', () => {
    calendarInstance.changeView('timeGridDay');
    updateViewButtons('day');
  });

  listBtn.addEventListener('click', () => {
    calendarInstance.changeView('listMonth');
    updateViewButtons('list');
  });

  console.log('View buttons setup complete');
}

// Update view button styles
function updateViewButtons(activeView) {
  const buttons = [
    { id: 'monthViewBtn', name: 'month' },
    { id: 'weekViewBtn', name: 'week' },
    { id: 'dayViewBtn', name: 'day' },
    { id: 'listViewBtn', name: 'list' }
  ];

  buttons.forEach(btn => {
    const element = document.getElementById(btn.id);
    if (btn.name === activeView) {
      element.className = 'px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md';
    } else {
      element.className = 'px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition';
    }
  });
}

// Handle event click
function handleEventClick(info) {
  const event = info.event;
  const extendedProps = event.extendedProps;

  document.getElementById('modalTitle').textContent = event.title;

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

  const contentHtml = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
  const modal = document.getElementById('eventModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// Setup modal handlers
function setupEventModalHandlers() {
  const modal = document.getElementById('eventModal');
  const closeBtn = document.getElementById('closeModal');
  const closeBtnBottom = document.getElementById('closeModalBtn');

  if (!closeBtn || !closeBtnBottom) {
    console.warn('Modal elements not found');
    return;
  }

  closeBtn.addEventListener('click', closeModal);
  closeBtnBottom.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

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
