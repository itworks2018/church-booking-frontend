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
    let totalPages = Math.ceil(items.length / pageSize);

    function renderTablePage(page) {
      tbody.innerHTML = "";
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      items.slice(start, end).forEach(item => {
        const tr = document.createElement("tr");
        tr.className = "border-b";
        tr.innerHTML = `
          <td class="p-3 border">${escapeHtml(item.booking_id || "")}</td>
          <td class="p-3 border">${escapeHtml(item.user_id || item.user_email || "")}</td>
          <td class="p-3 border">${escapeHtml(item.event_name || "")}</td>
          <td class="p-3 border">${escapeHtml(item.purpose || "")}</td>
          <td class="p-3 border">${escapeHtml(item.attendees || "")}</td>
          <td class="p-3 border">${escapeHtml(item.venue || "")}</td>
          <td class="p-3 border">${new Date(item.start_datetime).toLocaleString("en-US", { hour12: true })}</td>
          <td class="p-3 border">${new Date(item.end_datetime).toLocaleString("en-US", { hour12: true })}</td>
          <td class="p-3 border">${escapeHtml(item.additional_needs || "None")}</td>
          <td class="p-3 border">${escapeHtml(item.status || "")}</td>
          <td class="p-3 border">${new Date(item.created_at).toLocaleString("en-US", { hour12: true })}</td>
          <td class="p-3 border">
            <div class="flex flex-row gap-2 justify-center">
              <button class="view-btn px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-lg" data-id="${item.booking_id || ""}" title="View">👁️</button>
              <button class="edit-btn px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-lg" data-id="${item.booking_id || ""}" title="Edit">✏️</button>
              <button class="delete-btn px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-lg" data-id="${item.booking_id || ""}" title="Delete">🗑️</button>
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
        btn.addEventListener("click", async e => {
          const id = e.target.dataset.id;
          const booking = items.find(b => b.booking_id === id);
          if (booking) {
            const modal = document.getElementById("editEventModal");
            const form = document.getElementById("editEventForm");
            form.elements["event_name"].value = booking.event_name;
            form.elements["purpose"].value = booking.purpose;
            form.elements["attendees"].value = booking.attendees;
            form.elements["venue"].value = booking.venue;
            form.elements["start_datetime"].value = booking.start_datetime.slice(0,16);
            form.elements["end_datetime"].value = booking.end_datetime.slice(0,16);
            form.elements["additional_needs"].value = booking.additional_needs || "";
            modal.classList.remove("hidden");
            modal.classList.add("flex");
            document.getElementById("cancelEdit").onclick = () => {
              modal.classList.add("hidden");
              modal.classList.remove("flex");
            };
            form.onsubmit = async (ev) => {
              ev.preventDefault();
              const confirmed = await showEventsConfirmationDialog("Are you sure you want to edit this event?");
              if (!confirmed) return;
              await updateEvent(id, new FormData(form));
              modal.classList.add("hidden");
              modal.classList.remove("flex");
              loadApprovedEvents();
            };
          }
        });
      });
      tbody.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", async e => {
          const id = e.target.dataset.id;
          const confirmed = await showEventsConfirmationDialog("Are you sure you want to delete this event?");
          if (!confirmed) return;
          await deleteEvent(id);
          loadApprovedEvents();
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
          const isActive = i === currentPage;
          btn.className = isActive 
            ? "px-3 py-2 bg-blue-600 text-white rounded font-semibold transition"
            : "px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition";
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

    // ✅ Filter Logic
    const originalItems = [...items]; // Keep original items for filtering

    function applyFilters() {
      const bookingIdFilter = document.getElementById("filterBookingId")?.value.toLowerCase() || "";

      items.length = 0; // Clear items array
      originalItems.forEach(item => {
        const bookingIdMatch = !bookingIdFilter || item.booking_id?.toLowerCase().includes(bookingIdFilter);

        if (bookingIdMatch) {
          items.push(item);
        }
      });

      // Reset pagination and re-render
      currentPage = 1;
      totalPages = Math.ceil(items.length / pageSize);
      renderTablePage(currentPage);
      renderPagination();
    }

    // Add event listeners to filter buttons
    const applyBtn = document.getElementById("applyFilters");
    const clearBtn = document.getElementById("clearFilters");

    if (applyBtn) {
      applyBtn.addEventListener("click", applyFilters);
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        document.getElementById("filterBookingId").value = "";
        items.length = 0;
        items.push(...originalItems);
        currentPage = 1;
        totalPages = Math.ceil(items.length / pageSize);
        renderTablePage(currentPage);
        renderPagination();
      });
    }

    // ✅ Attach handlers
    document.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.target.dataset.id;
        const booking = items.find(b => b.booking_id === id);
        if (booking) showEventModal(booking);
      });
    });

  } catch (err) {
    console.error("loadApprovedEvents error:", err);
  }
}

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
    <div class="space-y-5">
      <!-- Event Details Section -->
      <div class="border-l-4 border-blue-500 pl-4">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Event</label>
            <p class="text-lg text-gray-900 font-semibold mt-2">${booking.event_name}</p>
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Venue</label>
            <p class="text-lg text-gray-900 font-semibold mt-2">${booking.venue}</p>
          </div>
        </div>
      </div>

      <!-- Purpose & Details Section -->
      <div class="border-l-4 border-green-500 pl-4">
        <div>
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Purpose</label>
          <p class="text-lg text-gray-900 font-semibold mt-2">${booking.purpose}</p>
        </div>
        <div class="mt-5">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Attendees</label>
          <p class="text-lg text-gray-900 font-semibold mt-2">${booking.attendees}</p>
        </div>
      </div>

      <!-- Date/Time Section -->
      <div class="border-l-4 border-purple-500 pl-4">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date/Time</label>
            <p class="text-lg text-gray-900 font-semibold mt-2">${new Date(booking.start_datetime).toLocaleString("en-US", { hour12: true })}</p>
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">End Date/Time</label>
            <p class="text-lg text-gray-900 font-semibold mt-2">${new Date(booking.end_datetime).toLocaleString("en-US", { hour12: true })}</p>
          </div>
        </div>
      </div>

      <!-- Additional Info Section -->
      <div class="border-l-4 border-orange-500 pl-4">
        <div>
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Additional Needs</label>
          <p class="text-lg text-gray-900 font-semibold mt-2">${booking.additional_needs || "None"}</p>
        </div>
        <div class="mt-5">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
          <span class="inline-block mt-2 px-4 py-2 rounded font-semibold text-sm ${booking.status === "Approved" ? "bg-green-100 text-green-800" : booking.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}">${booking.status}</span>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  document.getElementById("closeEvent").onclick = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };
}

// ✅ Helper to show confirmation dialog for events
async function showEventsConfirmationDialog(message) {
  return new Promise((resolve) => {
    const dialog = document.getElementById("eventsConfirmationDialog");
    const messageEl = document.getElementById("eventsConfirmationMessage");
    const confirmNo = document.getElementById("eventsConfirmNo");
    const confirmYes = document.getElementById("eventsConfirmYes");

    messageEl.textContent = message;
    dialog.classList.remove("hidden");

    function cleanup() {
      confirmNo.removeEventListener("click", handleNo);
      confirmYes.removeEventListener("click", handleYes);
    }

    function handleNo() {
      cleanup();
      dialog.classList.add("hidden");
      resolve(false);
    }

    function handleYes() {
      cleanup();
      dialog.classList.add("hidden");
      resolve(true);
    }

    confirmNo.addEventListener("click", handleNo);
    confirmYes.addEventListener("click", handleYes);
  });
}

// ✅ Load admin's change requests
async function loadChangeRequests() {
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/change-requests`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
      console.warn("Failed to load change requests:", res.status);
      return;
    }

    const changeRequests = await res.json();
    const tbody = document.getElementById("changeRequestsTable");
    const noRequests = document.getElementById("noChangeRequests");

    if (!tbody || !noRequests) return;

    if (!Array.isArray(changeRequests) || changeRequests.length === 0) {
      tbody.innerHTML = "";
      noRequests.style.display = "block";
      return;
    }

    // Show ALL requests (not filtered anymore)
    tbody.innerHTML = "";
    noRequests.style.display = changeRequests.length === 0 ? "block" : "none";

    changeRequests.forEach(cr => {
      // Determine status badge styling
      let statusBgColor = "bg-yellow-100 text-yellow-800";
      if (cr.status === "Approved") {
        statusBgColor = "bg-green-100 text-green-800";
      } else if (cr.status === "Rejected") {
        statusBgColor = "bg-red-100 text-red-800";
      }
      
      // Only show Review button for pending requests
      const reviewButton = cr.status === "Pending" 
        ? `<button class="reviewChangeBtn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition" data-request-id="${cr.id}" data-event-name="${escapeHtml(cr.event_name)}" data-description="${escapeHtml(cr.description)}" data-date="${cr.created_at}">
              Review
            </button>`
        : `<span class="text-gray-500 text-sm">Processed</span>`;
      
      // Show admin notes for completed requests
      const adminNotesDisplay = cr.status !== "Pending" 
        ? `<div class="text-xs mt-1 p-2 bg-gray-100 rounded">${escapeHtml(cr.admin_notes || "No notes")}</div>`
        : '';
      
      const row = `
        <tr class="hover:bg-gray-50 transition">
          <td class="px-6 py-4 text-center">${escapeHtml(cr.event_name)}</td>
          <td class="px-6 py-4 text-center text-sm">${escapeHtml(cr.description)}</td>
          <td class="px-6 py-4 text-center">
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusBgColor}">${cr.status}</span>
            ${adminNotesDisplay}
          </td>
          <td class="px-6 py-4 text-center">
            ${reviewButton}
          </td>
          <td class="px-6 py-4 text-center text-sm">${cr.created_at ? new Date(cr.created_at).toLocaleString("en-US", { hour12: true }) : ''}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", row);
    });

    // Attach event listeners to review buttons
    document.querySelectorAll('.reviewChangeBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const requestId = e.target.dataset.requestId;
        const eventName = e.target.dataset.eventName;
        const description = e.target.dataset.description;
        const date = e.target.dataset.date;
        openChangeRequestModal(requestId, eventName, description, date);
      });
    });
  } catch (err) {
    console.error("Error loading change requests:", err);
  }
}

// ✅ Open change request modal for admin response
async function openChangeRequestModal(requestId, eventName, description, date) {
  // Attach listeners first time modal is opened
  setupChangeRequestModalListeners();
  
  const modal = document.getElementById('changeRequestModal');
  
  document.getElementById('crRequestId').value = requestId;
  document.getElementById('crEventName').textContent = eventName;
  document.getElementById('crDescription').textContent = description;
  document.getElementById('crDate').textContent = new Date(date).toLocaleString("en-US", { hour12: true });
  document.getElementById('adminNotes').value = '';
  
  // Fetch booking details to display current status
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/bookings/all`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (res.ok) {
      const bookings = await res.json();
      const booking = bookings.find(b => b.event_name === eventName);
      
      if (booking) {
        document.getElementById('crVenue').textContent = booking.venue || 'Not specified';
        
        // Set booking ID with copy-to-clipboard functionality
        const bookingIdLink = document.getElementById('crBookingId');
        if (booking.booking_id) {
          bookingIdLink.textContent = booking.booking_id;
          bookingIdLink.onclick = (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(booking.booking_id);
            // Visual feedback
            const originalText = bookingIdLink.textContent;
            bookingIdLink.textContent = '✅ Copied!';
            setTimeout(() => {
              bookingIdLink.textContent = originalText;
            }, 2000);
          };
        } else {
          bookingIdLink.textContent = 'Not specified';
        }
        
        document.getElementById('crBookingDateTime').textContent = booking.start_datetime 
          ? new Date(booking.start_datetime).toLocaleString("en-US", { hour12: true })
          : 'Not specified';
        document.getElementById('crAttendees').textContent = booking.attendees || 'Not specified';
        
        // Set booking status with appropriate styling
        const statusSpan = document.getElementById('crBookingStatus');
        statusSpan.textContent = booking.status || 'Unknown';
        statusSpan.className = 'px-2 py-1 rounded text-xs font-semibold ';
        
        if (booking.status === 'Approved') {
          statusSpan.className += 'bg-green-100 text-green-800';
        } else if (booking.status === 'Pending') {
          statusSpan.className += 'bg-yellow-100 text-yellow-800';
        } else if (booking.status === 'Rejected') {
          statusSpan.className += 'bg-red-100 text-red-800';
        } else {
          statusSpan.className += 'bg-gray-100 text-gray-800';
        }
      }
    }
  } catch (err) {
    console.error("Error fetching booking details:", err);
  }
  
  modal.classList.remove('hidden');
}

// ✅ Setup change request modal event listeners (called after modal is rendered)
let modalListenersAttached = false;
function setupChangeRequestModalListeners() {
  if (modalListenersAttached) return; // Only attach once
  
  // Close button
  const closeBtn = document.getElementById('closeChangeRequestModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('changeRequestModal').classList.add('hidden');
    });
  }

  // Cancel button
  const cancelBtn = document.getElementById('cancelChangeRequest');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      document.getElementById('changeRequestModal').classList.add('hidden');
    });
  }

  // Reject button
  const rejectBtn = document.getElementById('rejectChangeRequest');
  if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
      handleChangeRequestResponse('Rejected');
    });
  }

  // Approve button
  const approveBtn = document.getElementById('approveChangeRequest');
  if (approveBtn) {
    approveBtn.addEventListener('click', () => {
      handleChangeRequestResponse('Approved');
    });
  }
  
  modalListenersAttached = true;
}

// ✅ Handle change request approval/rejection
async function handleChangeRequestResponse(status) {
  const requestId = document.getElementById('crRequestId').value;
  const adminNotes = document.getElementById('adminNotes').value.trim();
  const token = localStorage.getItem("access_token");

  if (!adminNotes) {
    alert('Please add notes explaining your decision');
    return;
  }

  if (!token) {
    alert('You must be logged in');
    return;
  }

  try {
    const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/change-requests/${requestId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status: status,
        admin_notes: adminNotes
      })
    });

    if (!res.ok) {
      const error = await res.json();
      alert('Failed to update change request: ' + (error.message || 'Unknown error'));
      return;
    }

    alert(`Change request ${status === 'Approved' ? 'approved' : 'rejected'} successfully!`);
    document.getElementById('changeRequestModal').classList.add('hidden');
    
    // Reload change requests table
    loadChangeRequests();
  } catch (err) {
    console.error("Error handling change request:", err);
    alert('Failed to process change request. Please try again.');
  }
}

// Load change requests on page load
document.addEventListener('DOMContentLoaded', function() {
  loadChangeRequests();
  
  // Refresh change requests every 15 seconds for real-time updates
  setInterval(loadChangeRequests, 15000);
}, { once: false });

