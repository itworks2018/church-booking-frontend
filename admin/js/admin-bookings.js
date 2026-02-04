// admin-bookings.js

// Attach handler to admin booking form

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = form.querySelector("button[type='submit']") || form.querySelector("button");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Submitting...";
    }

    // Collect form values by name
    const event_name = form.elements["event_name"].value.trim();
    const purpose = form.elements["purpose"].value.trim();
    const attendees = Number(form.elements["attendees"].value);
    const venue = form.elements["venue"].value;
    const start_datetime = form.elements["start_datetime"].value;
    const end_datetime = form.elements["end_datetime"].value;
    const additional_needs = form.elements["additional_needs"]?.value.trim() || "";

    // Basic validation
    if (!event_name || !purpose || !attendees || !venue || !start_datetime || !end_datetime) {
      alert("Please fill in all required fields.");
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Submit Event";
      }
      return;
    }
    if (new Date(end_datetime) <= new Date(start_datetime)) {
      alert("End date/time must be after start date/time.");
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Submit Event";
      }
      return;
    }

    // Get admin token
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You must be logged in as admin to create a booking.");
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Submit Event";
      }
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
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Booking failed");
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Submit Event";
        }
        return;
      }
      alert("Booking created successfully!");
      window.location.href = "/admin/pages/dashboard.html";
    } catch (err) {
      alert("Something went wrong. Please try again.");
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Submit Event";
      }
    }
  });
});
