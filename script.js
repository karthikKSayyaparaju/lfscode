const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const navActions = document.getElementById("navActions");
const nav = document.querySelector(".nav");


hamburger.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", String(isOpen));
});


(async function () {
  // 1) Require active login (session-based)
  try {
    const res = await fetch("/api/session", { credentials: "include" });
    const data = await res.json();

    if (!data.authenticated) {
      // Not logged in -> send to login page
      window.location.replace("/login/dashboard.html");
      return;
    }

    // 2) If logged in, show "Logout" instead of "Log In"
    const authLink = document.getElementById("authLink");
    if (authLink) {
      authLink.textContent = "Logout";
      authLink.href = "/logout";
    }
  } catch (e) {
    // If session check fails, treat as logged out
    window.location.replace("/login/dashboard.html");
    return;
  }

  // Mobile menu toggle (if your CSS supports it)


  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("open"); // add .open styles in CSS if needed
    });
  }
})();
