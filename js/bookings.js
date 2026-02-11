// booking.js

window.API_BASE_URL = window.API_BASE_URL || "https://church-booking-backend.onrender.com";

// Convert AM/PM to ISO
function convertToLocal(dateStr, timeStr) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  // Create a date in local time (with timezone offset)
  const localDate = new Date(`${dateStr}T${String(hours).padStart(2, "0")}:${minutes}:00`);
  // Format as YYYY-MM-DDTHH:mm:ss±hh:mm (local time with offset)
  const pad = n => String(n).padStart(2, '0');
  const tzOffset = -localDate.getTimezoneOffset();
  const sign = tzOffset >= 0 ? '+' : '-';
  const absOffset = Math.abs(tzOffset);
  const offsetHours = pad(Math.floor(absOffset / 60));
  const offsetMinutes = pad(absOffset % 60);
  const offset = `${sign}${offsetHours}:${offsetMinutes}`;
  return `${localDate.getFullYear()}-${pad(localDate.getMonth()+1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(localDate.getMinutes())}:00${offset}`;
}

// Booking submit handler
async function handleBookingSubmit(e) {
  e.preventDefault();

  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.textContent = "Submitting...";

  const token = localStorage.getItem("access_token");   // ⭐ FIXED
  if (!token) {
    alert("You must be logged in to create a booking.");
    btn.disabled = false;
    btn.textContent = "Submit Booking";
    return;
  }

  const event_name = document.getElementById("event_name").value.trim();
  const purpose = document.getElementById("purpose").value.trim();
  const attendees = Number(document.getElementById("attendees").value);
  const venue = document.getElementById("venue").value;

  const start_date = document.getElementById("start_date").value;
  const start_time = document.getElementById("start_time").value;
  const end_date = document.getElementById("end_date").value;
  const end_time = document.getElementById("end_time").value;

  const additional_needs = document.getElementById("additional_needs").value.trim();

  if (!start_time || !end_time) {
    alert("Please select both start and end times.");
    btn.disabled = false;
    btn.textContent = "Submit Booking";
    return;
  }

  const start_datetime = convertToLocal(start_date, start_time);
  const end_datetime = convertToLocal(end_date, end_time);

  if (new Date(end_datetime) <= new Date(start_datetime)) {
    alert("End date/time must be after start date/time.");
    btn.disabled = false;
    btn.textContent = "Submit Booking";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`   // ⭐ FIXED
      },
      body: JSON.stringify({
        event_name,
        purpose,
        attendees,
        venue,
        start_datetime,
        end_datetime,
        additional_needs
      })
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 409) {
        // Display conflict with available options
        let errorMessage = data.error || "Booking conflict detected.";
        
        if (data.conflictingBooking) {
          errorMessage += `\n\n⚠️ Conflict Details:\nVenue: ${data.conflictingBooking.venue}\nDate: ${data.conflictingBooking.date}\nTime: ${data.conflictingBooking.time}`;
        }

        if (data.availableSlots && data.availableSlots.length > 0) {
          errorMessage += `\n\n${data.message}\n`;
          data.availableSlots.forEach((slot, index) => {
            errorMessage += `${index + 1}. ${slot.start_time} - ${slot.end_time}\n`;
          });
          errorMessage += "\nPlease select one of these available times.";
        } else {
          errorMessage += "\n\nNo available time slots for this date. Please choose another date or venue.";
        }

        alert(errorMessage);
      } else {
        alert(data.error || "Booking failed");
      }
      btn.disabled = false;
      btn.textContent = "Submit Booking";
      return;
    }

    alert("Booking created successfully!");
    loadPage("pages/dashboard.html");

  } catch (err) {
    console.error(err);
    alert("Something went wrong. Please try again.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Submit Booking";
  }
}

// Attach handler when bookings page loads dynamically
document.addEventListener("click", () => {
  const form = document.getElementById("bookingForm");
  if (!form || form.dataset.bound) return;

  form.dataset.bound = true;
  form.addEventListener("submit", handleBookingSubmit);
});

// Booking Table Fetcher
async function loadUserBookings() {
  const token = localStorage.getItem("access_token");   // ⭐ FIXED
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/bookings/my`, {
      headers: {
        "Authorization": `Bearer ${token}`   // ⭐ FIXED
      }
    });

    const data = await res.json();

    const tbody = document.getElementById("myBookingsBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    data.forEach(b => {
      const row = `
        <tr>
          <td class="border px-3 py-2">${b.event_name}</td>
          <td class="border px-3 py-2">${b.venue}</td>
          <td class="border px-3 py-2">${new Date(b.start_datetime).toLocaleString()}</td>
          <td class="border px-3 py-2">${new Date(b.end_datetime).toLocaleString()}</td>
          <td class="border px-3 py-2 capitalize">${b.status}</td>
          <td class="border px-3 py-2">${b.created_at ? new Date(b.created_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila', hour12: true }) : ''}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });

  } catch (err) {
    console.error("Error loading bookings:", err);
  }
}