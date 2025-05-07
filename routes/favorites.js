const express = require("express");
const router = express.Router();
const favoritesModel = require("../models/user.js");

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect("/login");
  }
};

// Apply authentication middleware to all routes in this file
router.use(isAuthenticated);

// Get all favorites for the logged-in user
router.get("/favorites", async (req, res) => {
  try {
    const favoritesFound = await favoritesModel.find({
      // find favourite based on the username got from session
      username: req.session.user.username,
    });
    res.json(favoritesFound);
  } catch (error) {
    console.log("db error", error);
    res.status(500).json({ error: "Failed to retrieve favorites" });
  }
});

// Add a new favorite for the logged-in user
router.get("/add/:favorite", async (req, res) => {
  const favorite = req.params.favorite;
  const username = req.session.user.username;

  try {
    const result = await favoritesModel.create({
      name: favorite,
      username: username,
    });
    res.json(result);
  } catch (error) {
    console.log("db error", error);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

module.exports = router;
