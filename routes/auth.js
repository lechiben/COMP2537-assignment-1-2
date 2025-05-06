const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const session = require("express-session");

const router = express.Router();

// Register page
router.get("/register", (req, res) => {
  res.render("register", { error: req.query.error });
});

// Register handler
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      // Render with error for better UX
      return res
        .status(400)
        .render("register", { error: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS)
    );
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    // Redirect to login after successful registration
    res.redirect("/login");
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).render("register", { error: "Error registering user" });
  }
});

// Login page
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// Login handler
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).render("login", { error: "Username not found!" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      req.session.user = user;
      res.redirect("/home");
    } else {
      res
        .status(401)
        .render("login", { error: "Wrong password, please retry." });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).render("login", { error: "Server error during login" });
  }
});

// Logout route
router.get("/logout", (req, res) => {
  
})

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect("/login");
  }
};

// Protected route
router.get("/home", isAuthenticated, (req, res) => {
  res.render("index", { username: req.session.user.username });
});

module.exports = router;
