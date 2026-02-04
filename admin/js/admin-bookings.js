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
        // Show error notification at top
        const notif = document.createElement("div");
        notif.textContent = data.error || "Booking failed";
        notif.style.position = "fixed";
        notif.style.top = "30px";
        notif.style.left = "50%";
        notif.style.transform = "translateX(-50%)";
        notif.style.background = "#ef4444";
        notif.style.color = "white";
        notif.style.padding = "16px 32px";
        notif.style.borderRadius = "8px";
        notif.style.fontSize = "1.1rem";
        notif.style.zIndex = 9999;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2500);
        btn.disabled = false;
        btn.textContent = "Submit Event";
        return;
      }


      // Show notification before redirect
      const notif = document.createElement("div");
      notif.textContent = "Booking created successfully! Redirecting to dashboard...";
      notif.style.position = "fixed";
      notif.style.top = "30px";
      notif.style.left = "50%";
      notif.style.transform = "translateX(-50%)";
      notif.style.background = "#22c55e";
      notif.style.color = "white";
      notif.style.padding = "16px 32px";
      notif.style.borderRadius = "8px";
      notif.style.fontSize = "1.1rem";
      notif.style.zIndex = 9999;
      document.body.appendChild(notif);
      setTimeout(() => {
        notif.remove();
        window.location.href = "/admin/pages/dashboard.html";
      }, 1800);

    } catch (err) {
      console.error(err);
      // Show error notification at top
      const notif = document.createElement("div");
      notif.textContent = "Something went wrong. Please try again.";
      notif.style.position = "fixed";
      notif.style.top = "30px";
      notif.style.left = "50%";
      notif.style.transform = "translateX(-50%)";
      notif.style.background = "#ef4444";
      notif.style.color = "white";
      notif.style.padding = "16px 32px";
      notif.style.borderRadius = "8px";
      notif.style.fontSize = "1.1rem";
      notif.style.zIndex = 9999;
      document.body.appendChild(notif);
      setTimeout(() => notif.remove(), 2500);
    } finally {
      btn.disabled = false;
      btn.textContent = "Submit Event";
    }
  });
});
