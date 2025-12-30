/* =========================================================
   Client-Side Inactivity Timer
   ---------------------------------------------------------
   • Logs user out after 1 minute of NO interaction
   • Provides instant UX logout
   • Complements server-side enforcement
   ========================================================= */

const INACTIVITY_MS = Number(process.env.INACTIVITY_MS) || 6 * 60 * 60 * 1000; // 6 hours

let inactivityTimer;

/**
 * Resets the inactivity timer.
 * Called whenever the user interacts with the page.
 */
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);

  inactivityTimer = setTimeout(() => {
    // Redirect to logout endpoint after inactivity
    window.location.href = "/logout";
  }, INACTIVITY_LIMIT);
}

/**
 * List of user interactions that count as "activity"
 */
[
  "mousemove",    // mouse movement
  "mousedown",    // mouse click
  "keydown",      // keyboard input
  "touchstart",   // mobile touch
  "scroll"        // page scroll
].forEach(event => {
  document.addEventListener(event, resetInactivityTimer, true);
});

// Start inactivity timer immediately on page load
resetInactivityTimer();

/* =========================================================
   Auth UI Logic (Log In / Log Out Toggle)
   ========================================================= */

(async function () {
  try {
    // Check session state from the server
    const res = await fetch("/api/session", {
      credentials: "include"
    });

    if (!res.ok) return;

    const data = await res.json();

    // If user is authenticated, show Logout link
    if (data.authenticated) {
      const authLink = document.getElementById("authLink");
      if (authLink) {
        authLink.textContent = "Logout";
        authLink.href = "/logout";
      }
    }
  } catch (err) {
    // If session check fails, assume logged out
    console.warn("Session check failed:", err);
  }
})();
