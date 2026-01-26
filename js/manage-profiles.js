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

    const tbody = document.getElementById("profilesTable");
    if (!tbody) return;

    tbody.innerHTML = "";

    items.forEach(user => {
      const tr = document.createElement("tr");
      tr.className = "border-b";

      tr.innerHTML = `
        <td class="p-3 border">${user.user_id}</td>
        <td class="p-3 border">${user.full_name || ""}</td>
        <td class="p-3 border">${user.email}</td>
        <td class="p-3 border">${user.role}</td>
        <td class="p-3 border">${new Date(user.created_at).toLocaleString("en-US", { hour12: true })}</td>
        <td class="p-3 border space-x-2">
          <button class="bg-yellow-500 text-white px-2 py-1 rounded edit-profile-btn" data-id="${user.user_id}">Edit</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded delete-profile-btn" data-id="${user.user_id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

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
    const res = await fetch(`${window.ADMIN_API_BASE_URL}/api/profile/${user_id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to delete user");
    console.log(`User ${user_id} deleted`);
  } catch (err) {
    console.error("deleteProfile error:", err);
  }
}

// ✅ Show edit modal
function showEditProfileModal(user) {
  const modal = document.getElementById("editProfileModal");
  const form = document.getElementById("editProfileForm");

  form.elements["full_name"].value = user.full_name || "";
  form.elements["email"].value = user.email;
  form.elements["role"].value = user.role;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  document.getElementById("cancelEditProfile").onclick = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };

  form.onsubmit = async (ev) => {
    ev.preventDefault();
    await updateProfile(user.id, new FormData(form));
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