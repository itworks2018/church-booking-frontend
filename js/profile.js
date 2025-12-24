
let fullNameInput;
let emailInput;
let contactInput;
let roleInput;
let editBtn;
let saveBtn;

/* ⭐ Runs AFTER the HTML is injected by loadPage() */
function initPage() {
  console.log("initPage() for profile running");

  // Get elements AFTER HTML is inserted
  fullNameInput = document.getElementById("profile_full_name");
  emailInput = document.getElementById("profile_email");
  contactInput = document.getElementById("profile_contact");
  roleInput = document.getElementById("profile_role");

  editBtn = document.getElementById("editProfileBtn");
  saveBtn = document.getElementById("saveProfileBtn");

  if (!fullNameInput || !emailInput || !contactInput || !roleInput) {
    console.error("Profile inputs not found — HTML not ready");
    return;
  }

  // Attach button listeners
  setupEditButtons();

  // Load profile data
  loadProfile();
}

/* ⭐ Load profile data from backend */
async function loadProfile() {
  console.log("loadProfile() started");

  const token = localStorage.getItem("access_token");
  if (!token) {
    console.error("No token found");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/profile/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Profile load failed", res.status, err);
      return;
    }

    const profile = await res.json();
    console.log("PROFILE RESPONSE:", profile);

    fullNameInput.value = profile.full_name || "";
    emailInput.value = profile.email || "";
    contactInput.value = profile.contact_number || "";
    roleInput.value = profile.role || "";

  } catch (error) {
    console.error("Error loading profile:", error);
  }
}

/* ⭐ Enable editing + saving */
function setupEditButtons() {
  if (!editBtn || !saveBtn) return;

  editBtn.addEventListener("click", () => {
    emailInput.disabled = false;
    contactInput.disabled = false;
    roleInput.disabled = false;

    editBtn.classList.add("hidden");
    saveBtn.classList.remove("hidden");
  });

  saveBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("access_token");

    const body = {
      email: emailInput.value.trim(),
      contact_number: contactInput.value.trim(),
      role: roleInput.value.trim()
    };

    const res = await fetch(`${API_BASE_URL}/api/profile/my`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log("Profile update response:", data);

    if (!res.ok) {
      alert(data.error || "Update failed");
      return;
    }

    alert("Profile updated!");

    // Update sidebar + navbar name if needed
    localStorage.setItem("email", body.email);

    emailInput.disabled = true;
    contactInput.disabled = true;
    roleInput.disabled = true;

    saveBtn.classList.add("hidden");
    editBtn.classList.remove("hidden");
  });
}