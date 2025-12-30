require("dotenv").config({ path: ".env.local" });

const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const path = require("path");

const app = express();
const INACTIVITY_MS = Number(process.env.INACTIVITY_MS) || 6 * 60 * 60 * 1000; // 6 hours


// 1. TRUST PROXY (Essential for Azure/Proxies)
app.set("trust proxy", 1);

// Identify if we are running on Azure or Local
const isProduction = process.env.NODE_ENV === "production" || !!process.env.WEBSITE_HOSTNAME;

/* ======================
   2) Session Setup
   ====================== */
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      maxAge: INACTIVITY_MS, // 6 hours
      sameSite: "lax",
      secure: isProduction,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ======================
   3) Passport Strategy
   ====================== */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      proxy: true,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

/* ======================
   4) Auth Middleware
   ===================== */
function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  console.log("Blocking unauthorized access. Redirecting to /login");
  return res.redirect("/login");
}

// ⏱️ Inactivity timeout (1 minute)
const INACTIVITY_LIMIT = 10 * 1000; // 1 minute

app.use((req, res, next) => {
  if (req.session && req.isAuthenticated?.()) {
    const now = Date.now();

    if (req.session.lastActivity) {
      const idleTime = now - req.session.lastActivity;

      if (idleTime > INACTIVITY_LIMIT) {
        console.log("Session expired due to inactivity");

        return req.logout(err => {
          if (err) return next(err);
          req.session.destroy(() => {
            res.clearCookie("sid");
            return res.redirect("/login");
          });
        });
      }
    }

    // Update activity timestamp
    req.session.lastActivity = now;
  }

  next();
});


/* ======================
   5) Routes
   ====================== */

// ✅ Session check endpoint (used by script.js)
app.get("/api/session", (req, res) => {
  res.json({
    authenticated: req.isAuthenticated?.() || false,
    user: req.user || null,
  });
});

// Default Home (PUBLIC)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Public login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login", "login.html"));
});

// Start Google OAuth
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google Callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    console.log("Login Successful for:", req.user.displayName);
    // Redirect to protected dashboard route
    res.redirect("/login/dashboard.html");
  }
);

// Protected Dashboard Route
app.get("/login/dashboard.html", ensureAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "login", "dashboard.html"));
});

// Logout
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie("sid");
      res.redirect("/login");
    });
  });
});

/* ======================
   6) Static Files & Server
   ====================== */
// Serve static files AFTER defining protected routes
app.use(express.static(__dirname));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${isProduction ? "Production/Azure" : "Development"}`);
});
