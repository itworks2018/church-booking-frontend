import { apiRequest } from './api.js'

// ✅ 1. Guard admin page
async function guardAdminPage() {
  try {
    const profile = await apiRequest('/profiles/me')

    if (!profile || profile.role !== 'admin') {
      window.location.href = 'user.html'
      return
    }

    // If admin → load dashboard
    loadAdminContent()

  } catch (err) {
    console.error('Admin guard error:', err)
    window.location.href = 'index.html'
  }
}

// ✅ 2. Load admin dashboard content
async function loadAdminContent() {
  console.log('Admin verified — loading admin dashboard...')

  try {
    const bookings = await apiRequest('/bookings') // admin-only route

    renderBookingsTable(bookings)

  } catch (err) {
    console.error('Error loading admin data:', err)
    document.getElementById('admin-content').innerHTML =
      '<p style="color:red;">Failed to load admin data.</p>'
  }
}

// ✅ 3. Render bookings into a table
function renderBookingsTable(bookings) {
  const container = document.getElementById('admin-content')

  if (!bookings || bookings.length === 0) {
    container.innerHTML = '<p>No bookings found.</p>'
    return
  }

  let html = `
    <h2>All Bookings</h2>
    <table border="1" cellpadding="8" cellspacing="0">
      <thead>
        <tr>
          <th>User</th>
          <th>Venue</th>
          <th>Event</th>
          <th>Purpose</th>
          <th>Start</th>
          <th>End</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `

  bookings.forEach(b => {
    html += `
      <tr>
        <td>${b.profiles?.name || 'Unknown'}</td>
        <td>${b.venues?.name || 'Unknown'}</td>
        <td>${b.event_name}</td>
        <td>${b.event_purpose || '-'}</td>
        <td>${new Date(b.start_datetime).toLocaleString()}</td>
        <td>${new Date(b.end_datetime).toLocaleString()}</td>
        <td>${b.status}</td>
      </tr>
    `
  })

  html += `
      </tbody>
    </table>
  `

  container.innerHTML = html
}

// ✅ 4. Start everything
guardAdminPage()