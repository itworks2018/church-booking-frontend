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
    // 🔹 Booking Reservations (blue)
    const bookingsRes = await fetch(`${ADMIN_API_BASE_URL}/api/bookings/summary`);
    const bookingsData = await bookingsRes.json();
    document.getElementById("bookingReservations").textContent = bookingsData.totalBookings;

    // 🔹 Pending Approval (yellow)
    const pendingRes = await fetch(`${ADMIN_API_BASE_URL}/api/bookings/pending`);
    const pendingData = await pendingRes.json();
    document.getElementById("pendingApproval").textContent = pendingData.pendingCount;

    // 🔹 Upcoming Events (green)
    const upcomingRes = await fetch(`${ADMIN_API_BASE_URL}/api/events/upcoming`);
    const upcomingData = await upcomingRes.json();
    document.getElementById("upcomingEvents").textContent = upcomingData.upcomingCount;

    // 🔹 Total Members (purple)
    const usersRes = await fetch(`${ADMIN_API_BASE_URL}/api/users/summary`);
    const usersData = await usersRes.json();
    document.getElementById("totalMembers").textContent = usersData.totalUsers;

  } catch (err) {
    console.error("Dashboard fetch error:", err);
  }
});