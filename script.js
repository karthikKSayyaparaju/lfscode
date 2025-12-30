const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const navActions = document.getElementById("navActions");
const nav = document.querySelector(".nav");

if (hamburger && nav) {
  hamburger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });
}

(async function () {
  try {
    const res = await fetch("/api/session", { credentials: "include" });

    // If endpoint missing or error, just treat as logged out (no redirect)
    if (!res.ok) return;

    const data = await res.json();

    // If logged in, show "Logout" instead of "Log In"
    if (data.authenticated) {
      const authLink = document.getElementById("authLink");
      if (authLink) {
        authLink.textContent = "Logout";
        authLink.href = "/logout";
      }
    }
  } catch (e) {
    // Treat as logged out; do nothing
    return;
  }

  // Mobile menu toggle (optional)
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("open");
    });
  }
})();
