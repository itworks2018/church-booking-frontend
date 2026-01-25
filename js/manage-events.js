async function loadApprovedEvents() {
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/bookings/approved/list`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to fetch approved events");
    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    const tbody = document.getElementById("eventsTable");
    if (!tbody) {
      console.warn("eventsTable not found in DOM yet — skipping loadApprovedEvents");
      return; // ✅ prevents null.innerHTML error
    }

    tbody.innerHTML = "";

    items.forEach(item => {
      const tr = document.createElement("tr");
      tr.className = "border-b";

      tr.innerHTML = `
        <td class="p-3 border">${item.booking_id}</td>
        <td class="p-3 border">${item.user_id || item.user_email || ""}</td>
        <td class="p-3 border">${item.event_name}</td>
        <td class="p-3 border">${item.purpose}</td>
        <td class="p-3 border">${item.attendees}</td>
        <td class="p-3 border">${item.venue}</td>
        <td class="p-3 border">${new Date(item.start_datetime).toLocaleString("en-US", { hour12: true })}</td>
        <td class="p-3 border">${new Date(item.end_datetime).toLocaleString("en-US", { hour12: true })}</td>
        <td class="p-3 border">${item.additional_needs || "None"}</td>
        <td class="p-3 border">${item.status}</td>
        <td class="p-3 border">${new Date(item.created_at).toLocaleString("en-US", { hour12: true })}</td>
        <td class="p-3 border space-x-2">
          <button class="bg-blue-500 text-white px-2 py-1 rounded view-btn" data-id="${item.booking_id}">View</button>
          <button class="bg-yellow-500 text-white px-2 py-1 rounded edit-btn" data-id="${item.booking_id}">Edit</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded delete-btn" data-id="${item.booking_id}">Delete</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // ✅ Attach handlers
    document.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.target.dataset.id;
        const booking = items.find(b => b.booking_id === id);
        if (booking) showEventModal(booking);
      });
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.target.dataset.id;
        // TODO: open edit form modal
        alert(`Edit event ${id}`);
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async e => {
        const id = e.target.dataset.id;
        if (confirm("Are you sure you want to delete this event?")) {
          await deleteEvent(id);
          loadApprovedEvents(); // refresh table
        }
      });
    });

  } catch (err) {
    console.error("loadApprovedEvents error:", err);
  }
}

// ✅ Delete event helper
async function deleteEvent(id) {
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/bookings/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to delete event");
    console.log(`Event ${id} deleted`);
  } catch (err) {
    console.error("deleteEvent error:", err);
  }
}

// ✅ Modal for viewing event details
function showEventModal(booking) {
  const modal = document.getElementById("eventModal");
  const content = document.getElementById("eventContent");

  content.innerHTML = `
    <p><strong>Event:</strong> ${booking.event_name}</p>
    <p><strong>Venue:</strong> ${booking.venue}</p>
    <p><strong>Purpose:</strong> ${booking.purpose}</p>
    <p><strong>Attendees:</strong> ${booking.attendees}</p>
    <p><strong>Start:</strong> ${new Date(booking.start_datetime).toLocaleString("en-US", { hour12: true })}</p>
    <p><strong>End:</strong> ${new Date(booking.end_datetime).toLocaleString("en-US", { hour12: true })}</p>
    <p><strong>Additional Needs:</strong> ${booking.additional_needs || "None"}</p>
    <p><strong>Status:</strong> ${booking.status}</p>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  document.getElementById("closeEvent").onclick = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };
}

// ✅ Initialize
window.addEventListener("DOMContentLoaded", loadApprovedEvents);