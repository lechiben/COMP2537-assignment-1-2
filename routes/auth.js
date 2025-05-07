// routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

// Route for home page
router.get("/", (req, res) => {
  res.render("index", {
    username: req.session.username || null,
  });
});

// Render the combined auth page
router.get("/auth", (req, res) => {
  res.render("auth", {
    loginError: req.session.loginError,
    registerError: req.session.registerError,
  });
  // Clear any flash messages after rendering
  delete req.session.loginError;
  delete req.session.registerError;
});

// Handle login form
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      req.session.loginError = "Invalid username or password";
      return res.redirect("/auth");
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      req.session.loginError = "Invalid username or password";
      return res.redirect("/auth");
    }

    // Set session data
    req.session.isAuthenticated = true;
    req.session.userId = user._id;
    req.session.username = user.username;

    // Redirect to home page
    res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    req.session.loginError = "Server error. Please try again.";
    res.redirect("/auth");
  }
});

// Handle register form
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      req.session.registerError = "Username already exists";
      return res.redirect("/auth");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    // Set session data
    req.session.isAuthenticated = true;
    req.session.userId = newUser._id;
    req.session.username = newUser.username;

    // Redirect to home page
    res.redirect("/");
  } catch (err) {
    console.error("Registration error:", err);
    req.session.registerError = "Server error. Please try again.";
    res.redirect("/auth");
  }
});

// Logout route
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
    }
    res.redirect("/");
  });
});

// For backward compatibility - redirect old routes to new combined auth page
router.get("/login", (req, res) => {
  res.redirect("/auth");
});

router.get("/register", (req, res) => {
  res.redirect("/auth");
});

module.exports = router;
