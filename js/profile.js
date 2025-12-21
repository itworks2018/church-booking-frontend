const API_BASE_URL = "https://church-booking-backend.onrender.com";

const fullNameInput = document.getElementById("profile_full_name");
const emailInput = document.getElementById("profile_email");
const contactInput = document.getElementById("profile_contact");
const roleInput = document.getElementById("profile_role");

const editBtn = document.getElementById("editProfileBtn");
const saveBtn = document.getElementById("saveProfileBtn");

// Load profile data
async function loadProfile() {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch(`${API_BASE_URL}/api/profile/my`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  fullNameInput.value = data.full_name;
  emailInput.value = data.email;
  contactInput.value = data.contact_number || "";
  roleInput.value = data.role || "";
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
  const token = localStorage.getItem("token");

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