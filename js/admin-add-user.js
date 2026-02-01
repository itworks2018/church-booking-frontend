// Admin-only Add User form logic

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminAddUserForm");
  const errorMsg = document.getElementById("adminAddUserError");
  const cancelBtn = document.getElementById("cancelAdminAddUser");

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      window.history.back();
    };
  }

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      errorMsg.textContent = "";
      const full_name = form.full_name.value.trim();
      const email = form.email.value.trim();
      const contact_number = form.contact_number.value.trim();
      const role = form.role.value;
      const password = form.password.value;
      const confirm_password = form.confirm_password.value;
      if (password !== confirm_password) {
        errorMsg.textContent = "Passwords do not match.";
        return;
      }
      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ full_name, email, contact_number, role, password })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          errorMsg.textContent = data.error || "Failed to add user.";
          return;
        }
        alert("User added successfully!");
        window.location.href = "profiles.html";
      } catch (err) {
        errorMsg.textContent = "Error adding user.";
        console.error(err);
      }
    };
  }
});
