console.log("Profile JS loaded");

const API_BASE_URL = "https://church-booking-backend.onrender.com";

let fullNameInput;
let emailInput;
let contactInput;
let roleInput;

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

  // Backend returns the profile object directly
  const profile = await res.json();

  fullNameInput.value = profile.full_name || "";
  emailInput.value = profile.email || "";
  contactInput.value = profile.contact_number || "";
  roleInput.value = profile.role || "";
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

// ⭐ Delay until HTML is loaded dynamically
setTimeout(() => {
  fullNameInput = document.getElementById("profile_full_name");
  emailInput = document.getElementById("profile_email");
  contactInput = document.getElementById("profile_contact");
  roleInput = document.getElementById("profile_role");

  loadProfile();
}, 50);