const ADMIN_API_BASE_URL = "https://church-booking-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("access_token");
  const role = localStorage.getItem("user_role");

  // Guard: only allow admins
  if (!token || role !== "admin") {
    window.location.href = "/admin/login.html";
    return;
  }

  try {

    // Use new combined metrics endpoint for users and bookings
    const authHeaders = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const metricsRes = await fetch(`${ADMIN_API_BASE_URL}/api/metrics/counts`, authHeaders);
    const metricsData = await metricsRes.json();
    console.log("Metrics data:", metricsData);
    document.getElementById("countBookings").textContent = metricsData.bookings_count;
    document.getElementById("countMembers").textContent = metricsData.users_count;

    // Still fetch pending and upcoming bookings for other cards
    const pendingRes = await fetch(`${ADMIN_API_BASE_URL}/api/bookings/pending`, authHeaders);
    const pendingData = await pendingRes.json();
    document.getElementById("countPending").textContent = pendingData.pendingCount;

    const upcomingRes = await fetch(`${ADMIN_API_BASE_URL}/api/bookings/upcoming`, authHeaders);
    const upcomingData = await upcomingRes.json();
    document.getElementById("countUpcoming").textContent = upcomingData.upcomingCount;

  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }
});