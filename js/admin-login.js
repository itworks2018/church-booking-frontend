const ADMIN_API_BASE_URL = "https://church-booking-backend.onrender.com";

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

      // ✅ Make sure backend always returns { user: { role: "admin" } }
      if (!data.user || data.user.role !== "admin") {
        alert("You are not authorized to access the admin dashboard.");
        return;
      }

      // Save token + email + role
      localStorage.setItem("access_token", data.token);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("user_role", data.user.role);

      // ✅ Correct redirect path for Vercel
      window.location.href = "/admin/main-dashboard.html";

    } catch (err) {
      console.error("Admin login error:", err);
      alert("Something went wrong. Please try again.");
    }
  });
});