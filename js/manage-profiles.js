// ✅ Load all users
async function loadProfiles() {
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to fetch profiles");

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    const tbody = document.getElementById("usersTable");
    if (!tbody) return;


    // Pagination logic
    const pageSize = 10;
    let currentPage = 1;
    const totalPages = Math.ceil(items.length / pageSize);

    function renderTablePage(page) {
      tbody.innerHTML = "";
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      items.slice(start, end).forEach(user => {
        const tr = document.createElement("tr");
        tr.className = "border-b";
        tr.innerHTML = `
          <td class="p-3 border">${user.user_id}</td>
          <td class="p-3 border">${user.full_name || ""}</td>
          <td class="p-3 border">${user.email}</td>
          <td class="p-3 border">${user.role}</td>
          <td class="p-3 border">${new Date(user.created_at).toLocaleString("en-US", { hour12: true })}</td>
          <td class="p-3 border">
            <div class="flex flex-row gap-2 justify-center">
              <button class="bg-yellow-500 text-white px-4 py-1 rounded edit-profile-btn text-lg" data-id="${user.user_id}" title="Edit">✏️</button>
              <button class="bg-red-500 text-white px-4 py-1 rounded delete-profile-btn text-lg" data-id="${user.user_id}" title="Delete">🗑️</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Attach handlers for current page
      tbody.querySelectorAll(".edit-profile-btn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = e.target.dataset.id;
          const user = items.find(u => u.user_id == id);
          if (user) showEditProfileModal(user);
        });
      });
      tbody.querySelectorAll(".delete-profile-btn").forEach(btn => {
        btn.addEventListener("click", async e => {
          const id = e.target.dataset.id;
          if (confirm("Are you sure you want to delete this user?")) {
            await deleteProfile(id);
            loadProfiles();
          }
        });
      });
    }

    function renderPagination() {
      const nav = document.getElementById("profilesPagination");
      const pagesDiv = document.getElementById("profilesPages");
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
        document.getElementById("profilesPrev").onclick = () => {
          if (currentPage > 1) {
            currentPage--;
            renderTablePage(currentPage);
            renderPagination();
          }
        };
        document.getElementById("profilesNext").onclick = () => {
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

    // Attach handlers
    document.querySelectorAll(".edit-profile-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.target.dataset.id;
        const user = items.find(u => u.user_id == id); // use == to match string vs number
        if (user) showEditProfileModal(user);
      });
    });

    document.querySelectorAll(".delete-profile-btn").forEach(btn => {
      btn.addEventListener("click", async e => {
        const id = e.target.dataset.id;
        if (confirm("Are you sure you want to delete this user?")) {
          await deleteProfile(id);
          loadProfiles(); // refresh table
        }
      });
    });

  } catch (err) {
    console.error("loadProfiles error:", err);
  }
}

// ✅ Delete user helper
async function deleteProfile(id) {
  try {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/profile/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to delete user");
    console.log(`User ${id} deleted`);
  } catch (err) {
    console.error("deleteProfile error:", err);
  }
}

// ✅ Show edit modal
function showEditProfileModal(user) {
  const modal = document.getElementById("editUserModal");
  const form = document.getElementById("editUserForm");

  form.elements["full_name"].value = user.full_name || "";
  form.elements["email"].value = user.email;
  form.elements["role"].value = user.role;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  document.getElementById("cancelEditUser").onclick = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };

  form.onsubmit = async (ev) => {
    ev.preventDefault();
    await updateProfile(user.user_id, new FormData(form));
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    loadProfiles();
  };
}

// ✅ Update user helper
async function updateProfile(user_id, formData) {
  try {
    const token = localStorage.getItem("access_token");
    const body = Object.fromEntries(formData.entries());

    const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/profile/${user_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error("Failed to update user");
    console.log(`User ${user_id} updated`);
  } catch (err) {
    console.error("updateProfile error:", err);
  }
}

// ✅ Toast notification function
function showToast(message, duration = 3000) {
  const toast = document.getElementById("toastNotification");
  const toastMessage = document.getElementById("toastMessage");
  if (!toast || !toastMessage) return;
  
  toastMessage.textContent = message;
  toast.classList.remove("hidden");
  
  setTimeout(() => {
    toast.classList.add("hidden");
  }, duration);
}

// ✅ Setup Add User Modal event listeners
function setupAddUserModal() {
  const addUserBtn = document.getElementById("addUserBtn");
  const addUserModal = document.getElementById("addUserModal");
  const cancelAddUser = document.getElementById("cancelAddUser");
  const addUserForm = document.getElementById("addUserForm");

  if (!addUserBtn || !addUserModal || !cancelAddUser || !addUserForm) {
    console.warn("Add User modal elements not found");
    return;
  }

  // Open modal
  addUserBtn.onclick = () => {
    addUserModal.classList.remove("hidden");
    addUserModal.classList.add("flex");
  };

  // Close modal
  cancelAddUser.onclick = () => {
    addUserModal.classList.add("hidden");
    addUserModal.classList.remove("flex");
    addUserForm.reset();
  };

  // Form submission
  addUserForm.onsubmit = async (e) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to add this user?")) return;
    
    // Gather form data
    const full_name = document.getElementById("add_full_name").value.trim();
    const email = document.getElementById("add_email").value.trim();
    const contact_number = document.getElementById("add_contact_number").value.trim();
    const role = document.getElementById("add_role").value;
    const password = document.getElementById("add_password").value;
    const confirm_password = document.getElementById("add_confirm_password").value;
    
    // Validation
    if (!full_name) {
      showToast("Full name is required.");
      return;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      showToast("Please enter a valid email address.");
      return;
    }
    if (!contact_number || !/^[0-9+\- ]+$/.test(contact_number)) {
      showToast("Contact number must contain only digits, +, -, or spaces.");
      return;
    }
    if (!role) {
      showToast("Please select a role.");
      return;
    }
    if (password.length < 6) {
      showToast("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm_password) {
      showToast("Passwords do not match.");
      return;
    }
    
    // API call to create user
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${window.ADMIN_API_BASE_URL || ''}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ full_name, email, contact_number, role, password })
      });
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to add user.");
        return;
      }
      
      showToast("User added successfully!");
      addUserModal.classList.add("hidden");
      addUserModal.classList.remove("flex");
      addUserForm.reset();
      if (typeof loadProfiles === "function") loadProfiles();
    } catch (err) {
      showToast("Error adding user. Check console for details.");
      console.error(err);
    }
  };
}

document.addEventListener("DOMContentLoaded", () => {
  setupAddUserModal();
});