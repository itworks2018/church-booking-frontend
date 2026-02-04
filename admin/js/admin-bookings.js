// admin-bookings.js

// Attach handler to admin booking form


function convertToISO(dateStr, timeStr) {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;
  const iso = `${dateStr}T${String(hours).padStart(2, "0")}:${minutes}:00`;
  return new Date(iso).toISOString();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminBookingForm");
  if (!form) return;

  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = document.getElementById("adminSubmitBtn");
    btn.disabled = true;
    btn.textContent = "Submitting...";

    const event_name = document.getElementById("event_name").value.trim();
    const purpose = document.getElementById("purpose").value.trim();
    const attendees = Number(document.getElementById("attendees").value);
    const venue = document.getElementById("venue").value;
    const start_date = document.getElementById("start_date").value;
    const start_time = document.getElementById("start_time").value;
    const end_date = document.getElementById("end_date").value;
    const end_time = document.getElementById("end_time").value;
    const additional_needs = document.getElementById("additional_needs").value.trim();

    if (!event_name || !purpose || !attendees || !venue || !start_date || !start_time || !end_date || !end_time) {
      alert("Please fill in all required fields.");
      btn.disabled = false;
      btn.textContent = "Submit Event";
      return;
    }

    const start_datetime = convertToISO(start_date, start_time);
    const end_datetime = convertToISO(end_date, end_time);

    if (new Date(end_datetime) <= new Date(start_datetime)) {
      alert("End date/time must be after start date/time.");
      btn.disabled = false;
      btn.textContent = "Submit Event";
      return;
    }

    // Get admin token
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You must be logged in as admin to create a booking.");
      btn.disabled = false;
      btn.textContent = "Submit Event";
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
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

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) {
        alert(data.error || "Booking failed");
        btn.disabled = false;
        btn.textContent = "Submit Event";
        return;
      }

      alert("Booking created successfully!");
      window.location.href = "/admin/pages/dashboard.html";

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      btn.disabled = false;
      btn.textContent = "Submit Event";
    }
  });
});
