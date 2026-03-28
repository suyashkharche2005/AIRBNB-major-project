document.addEventListener("DOMContentLoaded", () => {
  // Smooth scroll for valid on-page anchors only
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetSelector = this.getAttribute("href");

      if (!targetSelector || targetSelector === "#") return;

      const targetEl = document.querySelector(targetSelector);
      if (!targetEl) return;

      e.preventDefault();
      targetEl.scrollIntoView({
        behavior: "smooth",
      });
    });
  });

  // Navbar shadow on scroll
  const navbar = document.querySelector(".navbar");

  const updateNavbarShadow = () => {
    if (!navbar) return;

    if (window.scrollY > 10) {
      navbar.style.boxShadow = "0 10px 30px rgba(0,0,0,0.08)";
    } else {
      navbar.style.boxShadow = "";
    }
  };

  window.addEventListener("scroll", updateNavbarShadow);
  updateNavbarShadow();

  // Prevent card click when clicking wishlist controls
  document.querySelectorAll('[data-wishlist-btn="true"]').forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  document.querySelectorAll(".wishlist-form form").forEach((form) => {
    form.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  document.querySelectorAll(".wishlist-form a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  // Button click animation
  document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.style.transform = "scale(0.98)";
      setTimeout(() => {
        btn.style.transform = "";
      }, 120);
    });
  });

  // Card image hover helper
  document.querySelectorAll(".listing-card").forEach((card) => {
    const img = card.querySelector("img");
    if (!img) return;

    card.addEventListener("mouseenter", () => {
      img.style.transform = "scale(1.05)";
    });

    card.addEventListener("mouseleave", () => {
      img.style.transform = "";
    });
  });

  // Toast helper
  function showToast(message, type = "success") {
    if (!message) return;

    const toast = document.createElement("div");
    toast.className = `custom-toast ${type}`;

    const icon =
      type === "error"
        ? '<i class="fa-solid fa-circle-exclamation"></i>'
        : '<i class="fa-solid fa-circle-check"></i>';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" type="button" aria-label="Close">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    const closeToast = () => {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 250);
    };

    const closeBtn = toast.querySelector(".toast-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", closeToast);
    }

    setTimeout(closeToast, 3200);
  }

  // Convert flash messages to premium toasts
  document.querySelectorAll(".flash-toast-source").forEach((node) => {
    const message = node.dataset.toastMessage;
    const type = node.dataset.toastType === "error" ? "error" : "success";
    showToast(message, type);
  });

  // Basic skeleton loader helper
  window.addEventListener("load", () => {
    document.querySelectorAll(".skeleton").forEach((el) => {
      el.classList.remove("skeleton");
    });
  });
});