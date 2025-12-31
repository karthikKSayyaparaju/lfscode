/* =========================================================
   Client-Side Inactivity Timer
   ---------------------------------------------------------
   • Logs user out after 1 minute of NO interaction
   • Provides instant UX logout
   • Complements server-side enforcement
   ========================================================= */

const DEFAULT_INACTIVITY_MS = 6 * 60 * 60 * 1000; // 6 hours
const INACTIVITY_LIMIT = Number(window.INACTIVITY_MS || DEFAULT_INACTIVITY_MS);
const HEADER_PARTIAL_PATH = "/partials/header.html";

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
   Header Loader + Auth UI
   ========================================================= */

async function loadHeaderPartial() {
  const mount = document.getElementById("headerMount");
  if (!mount) return;

  const res = await fetch(HEADER_PARTIAL_PATH, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Header fetch failed (${res.status})`);
  }

  mount.innerHTML = await res.text();
}

function hydrateNavLinks(config) {
  const nav = document.getElementById("navLinks");
  if (!nav) return;
  nav.innerHTML = "";

  const links = config?.navLinks || [];
  links.forEach((item) => {
    const a = document.createElement("a");
    a.href = item.href || "#";
    a.textContent = item.label || "";
    nav.appendChild(a);
  });
}

function hydrateNavActions(config) {
  const navActions = document.getElementById("navActions");
  if (!navActions) return;
  const authLink = document.getElementById("authLink");
  const hasAuth = authLink && navActions.contains(authLink);
  const insertBeforeNode = hasAuth ? authLink : navActions.firstChild;

  if (config?.hideAuthLink && hasAuth) {
    authLink.remove();
  }

  (config?.actionButtons || []).forEach((btn) => {
    const a = document.createElement("a");
    a.href = btn.href || "#";
    a.textContent = btn.label || "";
    if (btn.className) a.className = btn.className;
    if (insertBeforeNode && navActions.contains(insertBeforeNode)) {
      navActions.insertBefore(a, insertBeforeNode);
    } else {
      navActions.prepend(a);
    }
  });
}

async function initAuthUI() {
  try {
    const res = await fetch("/api/session", { credentials: "include" });
    if (!res.ok) return;

    const data = await res.json();

    if (data.authenticated) {
      const authLink = document.getElementById("authLink");
      if (authLink) {
        authLink.textContent = "Logout";
        authLink.href = "/logout";
      }

      const avatar = document.getElementById("profileAvatar");
      const user = data.user;

      const menu = document.getElementById("profileMenu");
      const nameEl = document.getElementById("profileName");
      const emailEl = document.getElementById("profileEmail");

      if (avatar && user) {
        const displayName = (
          user.displayName ||
          user.name?.givenName ||
          user.emails?.[0]?.value ||
          "Your profile"
        ).trim();

        const email = user.email || user.emails?.[0]?.value || "";

        const photoUrl = Array.isArray(user.photos)
          ? user.photos.find((p) => p && p.value)?.value
          : (user.picture || null);

        const initial = displayName.charAt(0)?.toUpperCase() || "U";

        avatar.classList.toggle("has-photo", Boolean(photoUrl));
        avatar.classList.add("is-visible");
        avatar.title = displayName;
        avatar.setAttribute("aria-label", `${displayName} profile`);
        avatar.setAttribute("role", "button");
        avatar.setAttribute("tabindex", "0");
        avatar.setAttribute("aria-expanded", "false");

        if (photoUrl) {
          const sanitizedUrl = String(photoUrl).replace(/["')\\]/g, "");
          avatar.style.backgroundImage = `url("${sanitizedUrl}")`;
          avatar.textContent = "";
        } else {
          avatar.style.backgroundImage = "none";
          avatar.textContent = initial;
        }

        if (nameEl) nameEl.textContent = displayName;
        if (emailEl) emailEl.textContent = email;

        if (menu) {
          const openMenu = () => {
            menu.hidden = false;
            avatar.setAttribute("aria-expanded", "true");
          };

          const closeMenu = () => {
            menu.hidden = true;
            avatar.setAttribute("aria-expanded", "false");
          };

          const toggleMenu = (e) => {
            e.stopPropagation();
            if (menu.hidden) openMenu();
            else closeMenu();
          };

          menu.hidden = true;

          avatar.addEventListener("click", toggleMenu);

          avatar.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleMenu(e);
            } else if (e.key === "Escape") {
              closeMenu();
            }
          });

          document.addEventListener("click", () => closeMenu());

          menu.addEventListener("click", (e) => e.stopPropagation());

          document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeMenu();
          });
        }
      }
    }
  } catch (err) {
    console.warn("Session check failed:", err);
  }
}

async function initHeaderAndAuth() {
  const config = window.__HEADER_CONFIG__ || {};
  try {
    await loadHeaderPartial();
    hydrateNavLinks(config);
    hydrateNavActions(config);
  } catch (err) {
    console.warn("Header load failed:", err);
  } finally {
    await initAuthUI();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHeaderAndAuth();
});
