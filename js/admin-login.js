// frontend/js/admin-login.js

const ADMIN_API_BASE_URL = "https://church-booking-backend.onrender.com";

// Attach event listener once DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminLoginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value.trim();

    try {
      const res = await fetch(`${ADMIN_API_BASE_URL}/api/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      // ⭐ Check if this email exists in your Supabase admins table
      // (backend should enforce this, but frontend double-checks)
      if (!data.user || data.user.role !== "admin") {
        alert("You are not authorized to access the admin dashboard.");
        return;
      }

      // Save token + email
      localStorage.setItem("access_token", data.token);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("user_role", "admin");

      // Redirect to admin dashboard
      window.location.href = "/main-dashboard.html";

    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  });
});