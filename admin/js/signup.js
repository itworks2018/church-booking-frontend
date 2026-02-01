const API_BASE_URL = "https://church-booking-backend.onrender.com";

const signupForm = document.getElementById("signupForm");
const errorMessage = document.getElementById("errorMessage");
const submitBtn = document.getElementById("submitBtn");

function showError(msg) {
  errorMessage.textContent = msg;
}

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  showError(""); 

  const full_name = document.getElementById("full_name").value.trim();
  const email = document.getElementById("email").value.trim();
  const contact_number = document.getElementById("contact_number").value.trim();
  const role = document.getElementById("role").value;
  const password = document.getElementById("password").value;
  const confirm_password = document.getElementById("confirm_password").value;

  // Basic validation
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return showError("Please enter a valid email address.");
  }

  if (!/^[0-9+\- ]+$/.test(contact_number)) {
    return showError("Contact number must contain only digits, +, -, or spaces.");
  }

  if (password.length < 6) {
    return showError("Password must be at least 6 characters.");
  }

  if (password !== confirm_password) {
    return showError("Passwords do not match.");
  }

  if (!role) {
    return showError("Please select a role.");
  }

  // Disable button during submission
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account...";

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name,
        email,
        contact_number,
        role,
        password
      })
    });

    // Check if the response is not JSON
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await res.text();
        console.error("Server returned non-JSON response:", textResponse);
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    if (!res.ok) {
      // Log the full error from the backend
      console.error("Signup failed with status:", res.status, "Response:", data);
      showError(data.error || "Sign up failed. Check console for details.");
      return;
    }

    alert("Account created successfully! Please log in.");
    window.location.href = "login.html";
  } catch (err) {
    showError(err.message || "Sign up failed. Try again later.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign Up";
  }
});
