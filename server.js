require("dotenv").config({ path: ".env.local" });

const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const path = require("path");

const app = express();
app.set('trust proxy', true);

/* ==============
   1) Session Setup (6-hr inactivity)
   ============== */
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "secret_key",
    resave: false,
    saveUninitialized: false,

    // ✅ 6 hours inactivity timeout (cookie expires after 6 hours)
    cookie: {
      httpOnly: true,
      maxAge: 10 * 1000, // 6 hours
      sameSite: "lax",
      secure: false, // ✅ local HTTP
    },

    // ✅ sliding expiration (refresh cookie expiry on every request)
    rolling: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* ==============
   2) Passport Strategy
   ============== */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // ✅ Keep this as the callback registered in Google Console
      callbackURL: "/auth/google/callback",
      proxy: true, // ✅ THIS IS CRITICAL for Azure/Proxies
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

/* ==============
   3) Static files
   ============== */
app.use(express.static(__dirname));

/* ==============
   4) Routes
   ============== */

// Helper to protect routes
function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.redirect("/login");
}

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login", "login.html"));
});

// Logout: ✅ destroy session + clear cookie
app.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);

    req.session.destroy(err2 => {
      if (err2) return next(err2);

      res.clearCookie("sid");
      return res.redirect("/login");
    });
  });
});

// Start Google OAuth
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // ✅ redirect to your desired dashboard URL
    return res.redirect("/auth/google/callback/dashboard/dashboard.html");
  }
);

// Serve the dashboard (protected)
app.get("/auth/google/callback/dashboard/dashboard.html", ensureAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "auth", "google", "dashboard", "dashboard.html"));
});

/* ==============
   5) Server
   ============== */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
