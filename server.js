require("dotenv").config({ path: ".env.local" });

const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const path = require("path");

const app = express();

/* ==============
   1) Session Setup
   ============== */
app.use(
  session({
    secret: "secret_key",
    resave: false,
    saveUninitialized: false,
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

      // ✅ Always use absolute callback URL in production, but relative is okay for local.
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

/* ==============
   3) Static files
   ============== */
/**
 * ✅ Best practice: serve static from root safely
 * This keeps your current setup working without changing folders.
 */
app.use(express.static(__dirname));

/* ==============
   4) Routes
   ============== */

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login", "login.html"));
});

// Start Google OAuth
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // ✅ MUST be absolute
    return res.redirect("/dashboard");
  }
);

// Dashboard route
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard", "dashboard.html"));
});

// ✅ Safety: redirect any wrong dashboard file path
app.get("/auth/google/dashboard/dashboard.html", (req, res) => {
  res.redirect("/dashboard");
});

/* ==============
   5) Server
   ============== */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
