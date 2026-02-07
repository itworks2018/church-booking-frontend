// js/navbar.js
(function () {
  function waitForNavbarElements(maxAttempts = 12, intervalMs = 100) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const timer = setInterval(() => {
        attempts++;
        const btn = document.getElementById("mobileMenuBtn");
        const menu = document.getElementById("mobileMenu");
        if (btn && menu) {
          clearInterval(timer);
          resolve({ btn, menu });
        } else if (attempts >= maxAttempts) {
          clearInterval(timer);
          reject(new Error("Navbar elements not found"));
        }
      }, intervalMs);
    });
  }

  function initMobileToggle(btn, menu) {
    const setInitialNavState = () => {
      if (window.innerWidth >= 768) {
        menu.classList.remove("hidden");
        btn.setAttribute("aria-expanded", "false");
      } else {
        menu.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
      }
    };
    setInitialNavState();
    btn.addEventListener("click", () => {
      menu.classList.toggle("hidden");
      const expanded = !menu.classList.contains("hidden");
      btn.setAttribute("aria-expanded", String(expanded));
    });
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setInitialNavState, 120);
    });
    btn.style.zIndex = "50";
    if (!btn.style.width) btn.style.width = "44px";
    if (!btn.style.height) btn.style.height = "44px";
  }

  function initSidebarToggle() {
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const sidebarToggleBtn = document.getElementById("sidebarToggle");
    if (!sidebar || !sidebarOverlay || !sidebarToggleBtn) return;
    sidebarToggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("sidebar--open");
      sidebarOverlay.classList.toggle("hidden");
    });
    sidebarOverlay.addEventListener("click", () => {
      sidebar.classList.remove("sidebar--open");
      sidebarOverlay.classList.add("hidden");
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    waitForNavbarElements()
      .then(({ btn, menu }) => {
        initMobileToggle(btn, menu);
      })
      .catch((err) => {
        console.warn("Navbar init:", err.message);
      });
    initSidebarToggle();
  });
})();
