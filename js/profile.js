const API_BASE_URL = "https://church-booking-backend.onrender.com";

const fullNameInput = document.getElementById("profile_full_name");
const emailInput = document.getElementById("profile_email");
const contactInput = document.getElementById("profile_contact");
const roleInput = document.getElementById("profile_role");

const editBtn = document.getElementById("editProfileBtn");
const saveBtn = document.getElementById("saveProfileBtn");

// Load profile data
async function loadProfile() {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  const res = await fetch(`${API_BASE_URL}/api/profile/my`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    console.error("Profile load failed", res.status);
    return;
  }

  // ⭐ Backend returns the profile object directly
  const profile = await res.json();

  document.getElementById("profile_full_name").value = profile.full_name || "";
  document.getElementById("profile_email").value = profile.email || "";
  document.getElementById("profile_contact").value = profile.contact_number || "";
  document.getElementById("profile_role").value = profile.role || "";
}

// Enable editing
editBtn.addEventListener("click", () => {
  emailInput.disabled = false;
  contactInput.disabled = false;
  roleInput.disabled = false;

  editBtn.classList.add("hidden");
  saveBtn.classList.remove("hidden");
});

// Save changes
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

  // Update localStorage so navbar/sidebar updates
  localStorage.setItem("email", body.email);

  // Disable fields again
  emailInput.disabled = true;
  contactInput.disabled = true;
  roleInput.disabled = true;

  saveBtn.classList.add("hidden");
  editBtn.classList.remove("hidden");
});

// Load profile on page load
loadProfile();