import { apiRequest, clearAuth, getRole } from './api.js'

const logoutBtn = document.getElementById('logout-btn')
const venueSelect = document.getElementById('venue-select')
const bookingForm = document.getElementById('booking-form')
const userMessage = document.getElementById('user-message')
const bookingsList = document.getElementById('bookings-list')

if (!getRole()) {
  window.location.href = 'index.html'
}

logoutBtn.addEventListener('click', () => {
  clearAuth()
  window.location.href = 'index.html'
})

function showMessage(text, isError = false) {
  userMessage.textContent = text
  userMessage.className = isError ? 'message error' : 'message success'
}

async function loadVenues() {
  try {
    const venues = await apiRequest('/venues')
    venueSelect.innerHTML = ''
    venues.forEach(v => {
      const option = document.createElement('option')
      option.value = v.id
      option.textContent = `${v.name} (${v.area}) [${v.capacity_min}-${v.capacity_max}]`
      venueSelect.appendChild(option)
    })
  } catch (err) {
    showMessage('Failed to load venues: ' + err.message, true)
  }
}

async function loadMyBookings() {
  try {
    const bookings = await apiRequest('/bookings/me')
    if (!bookings.length) {
      bookingsList.innerHTML = '<p>No bookings yet.</p>'
      return
    }

    const grouped = {}
    bookings.forEach(b => {
      const dateKey = new Date(b.start_datetime).toLocaleDateString()
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(b)
    })

    bookingsList.innerHTML = ''
    Object.keys(grouped).sort().forEach(date => {
      const dateSection = document.createElement('div')
      dateSection.className = 'booking-day'

      const heading = document.createElement('h3')
      heading.textContent = date
      dateSection.appendChild(heading)

      grouped[date].forEach(b => {
        const div = document.createElement('div')
        div.className = `booking-item status-${b.status}`

        const start = new Date(b.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const end = new Date(b.end_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        div.innerHTML = `
          <p><strong>${b.event_name}</strong> (${b.status})</p>
          <p>${b.venues?.name || 'Venue'} - ${start} to ${end}</p>
          <p>${b.event_purpose || ''}</p>
        `
        dateSection.appendChild(div)
      })

      bookingsList.appendChild(dateSection)
    })
  } catch (err) {
    bookingsList.innerHTML = `<p class="error">Failed to load bookings: ${err.message}</p>`
  }
}

bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  showMessage('Submitting booking...')

  const body = {
    venue_id: Number(venueSelect.value),
    event_name: document.getElementById('event-name').value,
    event_purpose: document.getElementById('event-purpose').value,
    start_datetime: document.getElementById('start-datetime').value,
    end_datetime: document.getElementById('end-datetime').value
  }

  try {
    await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(body)
    })
    showMessage('Booking request submitted!')
    bookingForm.reset()
    await loadMyBookings()
  } catch (err) {
    showMessage(err.message, true)
  }
})

loadVenues()
loadMyBookings()