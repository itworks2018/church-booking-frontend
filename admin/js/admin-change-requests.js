// admin-change-requests.js
// Handle admin functionality for managing change requests

const API_BASE_URL = window.ADMIN_API_BASE_URL || "https://church-booking-backend.onrender.com";
let currentChangeRequest = null; // Store current request being actioned
let currentAction = null; // Store current action (approve or reject)

// Load all change requests
async function loadChangeRequests() {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      console.error("No auth token");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/change-requests`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
      console.error("Failed to load change requests:", res.status);
      document.getElementById("changeRequestsTable").innerHTML = 
        '<tr><td colspan="5" class="p-3 text-center text-red-500">Error loading change requests</td></tr>';
      return;
    }

    const changeRequests = await res.json();
    displayChangeRequests(changeRequests);
    attachActionListeners();
  } catch (err) {
    console.error("Error loading change requests:", err);
    document.getElementById("changeRequestsTable").innerHTML = 
      '<tr><td colspan="5" class="p-3 text-center text-red-500">Error loading change requests</td></tr>';
  }
}

// Display change requests in table
function displayChangeRequests(requests) {
  const table = document.getElementById("changeRequestsTable");
  
  if (requests.length === 0) {
    table.innerHTML = '<tr><td colspan="5" class="p-3 text-center text-gray-500">No change requests found</td></tr>';
    return;
  }

  table.innerHTML = requests.map(req => {
    const statusColor = req.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                        req.status === "Approved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800";
    
    const requestedDate = new Date(req.created_at).toLocaleDateString();
    const truncatedDesc = req.description.substring(0, 80) + (req.description.length > 80 ? '...' : '');
    
    return `
      <tr class="hover:bg-gray-50">
        <td class="p-3">
          <span class="font-semibold text-gray-800">${req.event_name}</span>
        </td>
        <td class="p-3">
          <span class="text-sm text-gray-700">${truncatedDesc}</span>
        </td>
        <td class="p-3">
          <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColor}">${req.status}</span>
        </td>
        <td class="p-3 text-sm text-gray-600">
          ${requestedDate}
        </td>
        <td class="p-3">
          ${req.status === "Pending" ? `
            <div class="flex gap-2">
              <button class="approveBtn px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition" data-id="${req.id}">Approve</button>
              <button class="rejectBtn px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition" data-id="${req.id}">Reject</button>
            </div>
          ` : `
            <span class="text-xs text-gray-500 italic">No actions</span>
          `}
        </td>
      </tr>
    `;
  }).join("");
}

// Attach event listeners to action buttons
function attachActionListeners() {
  // Approve buttons
  document.querySelectorAll(".approveBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const requestId = e.target.dataset.id;
      openActionModal("approve", requestId);
    });
  });

  // Reject buttons
  document.querySelectorAll(".rejectBtn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const requestId = e.target.dataset.id;
      openActionModal("reject", requestId);
    });
  });

  // Filter status
  const filterStatus = document.getElementById("filterStatus");
  if (filterStatus) {
    filterStatus.addEventListener("change", () => {
      filterChangeRequests();
    });
  }

  // Modal cancel button
  const actionCancel = document.getElementById("actionCancel");
  if (actionCancel) {
    actionCancel.addEventListener("click", closeActionModal);
  }

  // Modal confirm button
  const actionConfirm = document.getElementById("actionConfirm");
  if (actionConfirm) {
    actionConfirm.addEventListener("click", submitAction);
  }

  // Success modal close button
  const closeSuccessModal = document.getElementById("closeSuccessModal");
  if (closeSuccessModal) {
    closeSuccessModal.addEventListener("click", () => {
      document.getElementById("successModal").classList.add("hidden");
      // Reload change requests after action
      loadChangeRequests();
      // Refresh notification bell
      if (typeof setupNotificationBell === 'function') {
        setupNotificationBell();
      }
    });
  }

  // Character counter for notes textarea
  const adminNotes = document.getElementById("adminNotes");
  if (adminNotes) {
    adminNotes.addEventListener("input", (e) => {
      document.getElementById("charCount").textContent = e.target.value.length;
    });
  }
}

// Open action modal
async function openActionModal(action, requestId) {
  currentAction = action;

  // Fetch request details
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${API_BASE_URL}/api/change-requests`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) return;

    const requests = await res.json();
    const request = requests.find(r => r.id == requestId);

    if (!request) return;

    currentChangeRequest = request;

    // Update modal content
    const modal = document.getElementById("actionModal");
    const title = document.getElementById("actionModalTitle");
    const eventName = document.getElementById("modalEventName");
    const requestDesc = document.getElementById("modalRequestDesc");
    const adminNotes = document.getElementById("adminNotes");
    const charCount = document.getElementById("charCount");

    title.textContent = action === "approve" ? "Approve Request?" : "Reject Request?";
    title.className = action === "approve" ? "text-2xl font-bold mb-4 text-green-600" : "text-2xl font-bold mb-4 text-red-600";
    
    eventName.textContent = request.event_name;
    requestDesc.textContent = request.description;
    adminNotes.value = "";
    charCount.textContent = "0";

    // Change confirm button style
    const confirmBtn = document.getElementById("actionConfirm");
    confirmBtn.className = action === "approve" 
      ? "px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
      : "px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition";
    confirmBtn.textContent = action === "approve" ? "Approve" : "Reject";

    modal.classList.remove("hidden");
  } catch (err) {
    console.error("Error opening action modal:", err);
  }
}

// Close action modal
function closeActionModal() {
  document.getElementById("actionModal").classList.add("hidden");
  currentChangeRequest = null;
  currentAction = null;
}

// Submit approve/reject action
async function submitAction() {
  if (!currentChangeRequest || !currentAction) return;

  const adminNotes = document.getElementById("adminNotes").value.trim();

  try {
    const token = localStorage.getItem("access_token");

    const res = await fetch(`${API_BASE_URL}/api/change-requests/${currentChangeRequest.id}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: currentAction === "approve" ? "Approved" : "Rejected",
        admin_notes: adminNotes
      })
    });

    if (!res.ok) {
      alert("Error updating request: " + res.statusText);
      return;
    }

    // Show success modal
    const successMsg = document.getElementById("successMessage");
    successMsg.textContent = currentAction === "approve" 
      ? `Request "${currentChangeRequest.event_name}" has been approved successfully.`
      : `Request "${currentChangeRequest.event_name}" has been rejected successfully.`;

    document.getElementById("successModal").classList.remove("hidden");
    closeActionModal();

  } catch (err) {
    console.error("Error submitting action:", err);
    alert("Error submitting action. Please try again.");
  }
}

// Filter change requests by status
async function filterChangeRequests() {
  try {
    const token = localStorage.getItem("access_token");
    const filterValue = document.getElementById("filterStatus").value;

    const res = await fetch(`${API_BASE_URL}/api/change-requests`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) return;

    let requests = await res.json();

    // Filter by status
    if (filterValue) {
      requests = requests.filter(r => r.status === filterValue);
    }

    displayChangeRequests(requests);
    attachActionListeners();
  } catch (err) {
    console.error("Error filtering change requests:", err);
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadChangeRequests();
});
