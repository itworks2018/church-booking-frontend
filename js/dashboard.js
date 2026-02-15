// ✅ Security: HTML escape utility to prevent XSS
function escapeHtml(unsafe) {
  if (typeof unsafe !== "string") return String(unsafe || "");
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initPage() {
  loadUserBookings();
  loadCalendarEvents();
}

// Booking Table Fetcher
async function loadUserBookings() {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  // Get venueId dynamically (from localStorage or user selection)
  const validVenues = ["Main Hall", "Phase A Area 1", "Phase 2 Area B", "NxtGen Room"];
  let venueId = localStorage.getItem("selectedVenueId");
  if (!venueId || !validVenues.includes(venueId)) {
    venueId = validVenues[0];
    localStorage.setItem("selectedVenueId", venueId);
  }
  try {
    // Fetch only bookings for the logged-in user
    const res = await fetch(`${API_BASE_URL}/api/bookings/my`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      console.error("Request failed:", res.status);
      return;
    }

    const data = await res.json();
    const tbody = document.getElementById("myBookingsBody");
    if (!tbody) return;
    tbody.innerHTML = "";
    if (!Array.isArray(data)) {
      console.error("Bookings is not an array:", data);
      return;
    }
    // Only show pending and approved
    data.filter(b => b.status === "Pending" || b.status === "Approved").forEach(b => {
      const row = `
        <tr>
          <td class="border px-3 py-2">${b.event_name}</td>
          <td class="border px-3 py-2">${b.venue}</td>
          <td class="border px-3 py-2">${new Date(b.start_datetime).toLocaleString()}</td>
          <td class="border px-3 py-2">${new Date(b.end_datetime).toLocaleString()}</td>
          <td class="border px-3 py-2 capitalize">${b.status}</td>
          <td class="border px-3 py-2">${b.created_at ? new Date(b.created_at).toLocaleString() : ''}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  } catch (err) {
    console.error("Error loading bookings:", err);
  }
}

async function loadCalendarEvents() {
  const token = localStorage.getItem("access_token");
  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings/all`, {
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
    const calendarEl = document.getElementById("fullcalendar");
    if (!calendarEl) {
      console.error("Calendar element not found");
      return;
    }
    // Only show pending and approved bookings in the calendar
    const filtered = bookings.filter(b => b.status === "Pending" || b.status === "Approved");
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 600,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      events: filtered.map(b => ({
        id: b.id || b.booking_id,
        title: b.event_name || (b.status === "Approved" ? "Approved Booking" : "Pending Booking"),
        start: b.start_datetime,
        end: b.end_datetime,
        color: b.status === "Approved" ? "blue" : "orange",
        extendedProps: { ...b }
      })),
      eventClick: function(info) {
        const b = info.event.extendedProps;
        const modal = document.getElementById('bookingModal');
        const content = document.getElementById('bookingModalContent');
        content.innerHTML = `
          <div class="space-y-5">
            <!-- Event Details Section -->
            <div class="border-l-4 border-blue-500 pl-4">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Event</label>
                  <p class="text-lg text-gray-900 font-semibold mt-2">${escapeHtml(b.event_name || 'N/A')}</p>
                </div>
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Venue</label>
                  <p class="text-lg text-gray-900 font-semibold mt-2">${escapeHtml(b.venue || 'N/A')}</p>
                </div>
              </div>
            </div>

            <!-- Purpose & Details Section -->
            <div class="border-l-4 border-green-500 pl-4">
              <div>
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Purpose</label>
                <p class="text-lg text-gray-900 font-semibold mt-2">${escapeHtml(b.purpose || 'N/A')}</p>
              </div>
              <div class="mt-5">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Attendees</label>
                <p class="text-lg text-gray-900 font-semibold mt-2">${escapeHtml(b.attendees || 'N/A')}</p>
              </div>
            </div>

            <!-- Date/Time Section -->
            <div class="border-l-4 border-purple-500 pl-4">
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date/Time</label>
                  <p class="text-lg text-gray-900 font-semibold mt-2">${b.start_datetime ? new Date(b.start_datetime).toLocaleString("en-US", { hour12: true }) : 'N/A'}</p>
                </div>
                <div>
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">End Date/Time</label>
                  <p class="text-lg text-gray-900 font-semibold mt-2">${b.end_datetime ? new Date(b.end_datetime).toLocaleString("en-US", { hour12: true }) : 'N/A'}</p>
                </div>
              </div>
            </div>

            <!-- Additional Info Section -->
            <div class="border-l-4 border-orange-500 pl-4">
              <div>
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Additional Needs</label>
                <p class="text-lg text-gray-900 font-semibold mt-2">${escapeHtml(b.additional_needs || 'None')}</p>
              </div>
              <div class="mt-5">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Requested At</label>
                <p class="text-lg text-gray-900 font-semibold mt-2">${b.created_at ? new Date(b.created_at).toLocaleString("en-US", { hour12: true }) : 'N/A'}</p>
              </div>
              <div class="mt-5">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                <span class="inline-block mt-2 px-4 py-2 rounded font-semibold text-sm ${b.status === "Approved" ? "bg-green-100 text-green-800" : b.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}">${escapeHtml(b.status || 'N/A')}</span>
              </div>
            </div>
          </div>
        `;
        modal.classList.remove('hidden');
      }
    });
    calendar.render();
    // Modal close logic
    document.getElementById('closeBookingModal').onclick = function() {
      document.getElementById('bookingModal').classList.add('hidden');
    };
    document.getElementById('bookingModal').onclick = function(e) {
      if (e.target === this) this.classList.add('hidden');
    };
  } catch (err) {
    console.error("Failed to load bookings:", err);
  }
}

// === Create Venue Reservation Modal Logic ===
(function setupCreateVenueModal() {
  const modal = document.getElementById('createVenueModal');
  const form = document.getElementById('createVenueForm');
  const createVenueBtn = document.getElementById('createVenueBtn');
  const closeCreateVenueModal = document.getElementById('closeCreateVenueModal');
  const cancelCreateBtn = document.getElementById('cancelCreateBtn');
  const draftBtn = document.getElementById('draftBtn');
  const confirmationDialog = document.getElementById('confirmationDialog');
  const confirmNo = document.getElementById('confirmNo');
  const confirmYes = document.getElementById('confirmYes');
  const DRAFT_KEY = 'venueBookingDraft';

  if (!createVenueBtn || !modal) return;

  // Open modal
  createVenueBtn.addEventListener('click', function() {
    loadDraftData();
    modal.classList.remove('hidden');
  });

  // Close modal
  function closeModal() {
    modal.classList.add('hidden');
  }

  closeCreateVenueModal.addEventListener('click', closeModal);
  
  cancelCreateBtn.addEventListener('click', function(e) {
    e.preventDefault();
    closeModal();
  });

  // Click outside modal to close
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });

  // Load draft data from localStorage
  function loadDraftData() {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      const data = JSON.parse(draft);
      document.getElementById('cv_event_name').value = data.event_name || '';
      document.getElementById('cv_purpose').value = data.purpose || '';
      document.getElementById('cv_attendees').value = data.attendees || '';
      document.getElementById('cv_venue').value = data.venue || '';
      document.getElementById('cv_start_datetime').value = data.start_datetime || '';
      document.getElementById('cv_end_datetime').value = data.end_datetime || '';
      document.getElementById('cv_additional_needs').value = data.additional_needs || '';
    }
  }

  // Save draft to localStorage
  draftBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const formData = {
      event_name: document.getElementById('cv_event_name').value,
      purpose: document.getElementById('cv_purpose').value,
      attendees: document.getElementById('cv_attendees').value,
      venue: document.getElementById('cv_venue').value,
      start_datetime: document.getElementById('cv_start_datetime').value,
      end_datetime: document.getElementById('cv_end_datetime').value,
      additional_needs: document.getElementById('cv_additional_needs').value
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    alert('Draft saved! You can edit it anytime.');
  });

  // Submit form
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    confirmationDialog.classList.remove('hidden');
  });

  // Confirmation dialog - No
  confirmNo.addEventListener('click', function() {
    confirmationDialog.classList.add('hidden');
  });

  // Confirmation dialog - Yes
  confirmYes.addEventListener('click', async function() {
    confirmationDialog.classList.add('hidden');
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('User not authenticated. Please log in.');
      return;
    }

    const formData = {
      event_name: document.getElementById('cv_event_name').value,
      purpose: document.getElementById('cv_purpose').value,
      attendees: parseInt(document.getElementById('cv_attendees').value),
      venue: document.getElementById('cv_venue').value,
      start_datetime: document.getElementById('cv_start_datetime').value,
      end_datetime: document.getElementById('cv_end_datetime').value,
      additional_needs: document.getElementById('cv_additional_needs').value
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const error = await res.json();
        // Show error modal with specific message for booking conflicts
        const errorData = error.error || error.message || 'Unknown error';
        
        // For 409 conflicts, show available slots
        let displayMessage = errorData;
        if (res.status === 409 && error.availableSlots && error.availableSlots.length > 0) {
          displayMessage = errorData + "\n\nAvailable time slots:\n";
          error.availableSlots.forEach((slot, index) => {
            displayMessage += `${index + 1}. ${slot.start_time} - ${slot.end_time}\n`;
          });
        }
        
        showBookingError(displayMessage);
        return;
      }

      const result = await res.json();
      showBookingSuccess();
      
      // Clear draft
      localStorage.removeItem(DRAFT_KEY);
      
      // Reset form
      form.reset();
      closeModal();
      
      // Reload bookings
      if (typeof loadUserBookings === 'function') {
        loadUserBookings();
      }
      if (typeof loadCalendarEvents === 'function') {
        loadCalendarEvents();
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
      alert('Failed to submit booking. Please try again.');
    }
  });

  // Close confirmation dialog when clicking outside
  confirmationDialog.addEventListener('click', function(e) {
    if (e.target === confirmationDialog) {
      confirmationDialog.classList.add('hidden');
    }
  });
})();

// ✅ Show booking error modal
function showBookingError(message) {
  const errorModal = document.getElementById('bookingErrorModal');
  const errorMessageEl = document.getElementById('errorModalMessage');
  
  // Check if message contains available slots (multi-line format)
  if (message.includes('\n')) {
    // Use pre-formatted text for multi-line messages (escaped for XSS prevention)
    errorMessageEl.innerHTML = `<pre style="white-space: pre-wrap; text-align: left; font-family: inherit; font-size: 0.95rem; line-height: 1.4;">${escapeHtml(message)}</pre>`;
  } else {
    // Customize message for venue conflict (single line)
    let displayMessage = message;
    if (message.toLowerCase().includes('already booked') || message.toLowerCase().includes('prior schedule')) {
      displayMessage = 'A prior schedule is already booked in the venue, select different day or time.';
    }
    errorMessageEl.textContent = displayMessage;
  }
  
  errorModal.classList.remove('hidden');
  
  // Add close handlers
  const closeBtn = document.getElementById('closeErrorBtn');
  const closeXBtn = document.getElementById('closeErrorModal');
  
  if (closeBtn) closeBtn.addEventListener('click', () => {
    errorModal.classList.add('hidden');
  });
  if (closeXBtn) closeXBtn.addEventListener('click', () => {
    errorModal.classList.add('hidden');
  });
}

// ✅ Show booking success modal
function showBookingSuccess() {
  const successModal = document.getElementById('bookingSuccessModal');
  
  successModal.classList.remove('hidden');
  
  // Add close handlers
  const closeBtn = document.getElementById('closeSuccessBtn');
  const closeXBtn = document.getElementById('closeSuccessModal');
  
  if (closeBtn) closeBtn.addEventListener('click', () => {
    successModal.classList.add('hidden');
  });
  if (closeXBtn) closeXBtn.addEventListener('click', () => {
    successModal.classList.add('hidden');
  });
}

// === Session Timeout (5 min inactivity) ===
(function setupSessionTimeout() {
  let timeout;
  const LOGOUT_TIME = 5 * 60 * 1000; // 5 minutes
  function resetTimer() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      alert("Session expired due to inactivity. You will be logged out.");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_role");
      window.location.href = "/login.html";
    }, LOGOUT_TIME);
  }
  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(evt => {
    window.addEventListener(evt, resetTimer, true);
  });
  resetTimer();
})();