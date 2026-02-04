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


    // Pagination logic
    const pageSize = 10;
    let currentPage = 1;
    const totalPages = Math.ceil(items.length / pageSize);

    function renderTablePage(page) {
      tbody.innerHTML = "";
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      items.slice(start, end).forEach(item => {
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
          <td class="p-3 border">
            <div class="flex flex-row gap-2 justify-center">
              <button class="view-btn min-w-[80px] px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition" data-id="${item.booking_id}">View</button>
              <button class="edit-btn min-w-[80px] px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition" data-id="${item.booking_id}">Edit</button>
              <button class="delete-btn min-w-[80px] px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition" data-id="${item.booking_id}">Delete</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Attach handlers for current page
      tbody.querySelectorAll(".view-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = e.target.dataset.id;
          const booking = items.find(b => b.booking_id === id);
          if (booking) showEventModal(booking);
        });
      });
      tbody.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = e.target.dataset.id;
          const booking = items.find(b => b.booking_id === id);
          if (booking) showEditEventModal(booking);
        });
      });
      tbody.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async e => {
          const id = e.target.dataset.id;
          if (confirm("Are you sure you want to delete this event?")) {
            await deleteEvent(id);
            loadApprovedEvents();
          }
        });
      });
    }

    function renderPagination() {
      const nav = document.getElementById("eventsPagination");
      const pagesDiv = document.getElementById("eventsPages");
      if (items.length > pageSize) {
        nav.style.display = "flex";
        pagesDiv.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "btn btn-soft btn-square aria-[current='page']:text-bg-soft-primary";
          if (i === currentPage) btn.setAttribute("aria-current", "page");
          btn.textContent = i;
          btn.onclick = () => {
            currentPage = i;
            renderTablePage(currentPage);
            renderPagination();
          };
          pagesDiv.appendChild(btn);
        }
        document.getElementById("eventsPrev").onclick = () => {
          if (currentPage > 1) {
            currentPage--;
            renderTablePage(currentPage);
            renderPagination();
          }
        };
        document.getElementById("eventsNext").onclick = () => {
          if (currentPage < totalPages) {
            currentPage++;
            renderTablePage(currentPage);
            renderPagination();
          }
        };
      } else {
        nav.style.display = "none";
      }
    }

    renderTablePage(currentPage);
    renderPagination();

    // ✅ Attach handlers
    document.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.target.dataset.id;
        const booking = items.find(b => b.booking_id === id);
        if (booking) showEventModal(booking);
      });
    });

    // ✅ Update event helper
async function updateEvent(id, formData) {
  try {
    const token = localStorage.getItem("access_token");
    const body = Object.fromEntries(formData.entries());

    const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/bookings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to update event: ${errText}`);
    }

    console.log(`Event ${id} updated`);
  } catch (err) {
    console.error("updateEvent error:", err);
  }
}

document.querySelectorAll(".edit-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    const id = e.target.dataset.id;
    const booking = items.find(b => b.booking_id === id);

    if (booking) {
      const modal = document.getElementById("editEventModal");
      const form = document.getElementById("editEventForm");

      // Pre-fill form fields
      form.elements["event_name"].value = booking.event_name;
      form.elements["purpose"].value = booking.purpose;
      form.elements["attendees"].value = booking.attendees;
      form.elements["venue"].value = booking.venue;
      form.elements["start_datetime"].value = booking.start_datetime.slice(0,16); // ISO string trimmed
      form.elements["end_datetime"].value = booking.end_datetime.slice(0,16);
      form.elements["additional_needs"].value = booking.additional_needs || "";

      // Show modal
      modal.classList.remove("hidden");
      modal.classList.add("flex");

      // Cancel button
      document.getElementById("cancelEdit").onclick = () => {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
      };

      // Save handler
      form.onsubmit = async (ev) => {
        ev.preventDefault();
        await updateEvent(id, new FormData(form));
        modal.classList.add("hidden");
        modal.classList.remove("flex");
        loadApprovedEvents(); // refresh table
      };
    }
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
