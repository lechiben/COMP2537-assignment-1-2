// routes/favorites.js
const express = require("express");
const router = express.Router();
const Favorite = require("../models/Favorite");

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.status(401).json({ error: "You must be logged in to access favorites" });
};

// Apply authentication middleware to all favorites routes
router.use(isAuthenticated);

// Get all favorites for the current user
router.get("/", async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.session.userId });
    res.json(favorites);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// Add a new favorite
router.post("/", async (req, res) => {
  try {
    const { pokemonId, name } = req.body;

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      userId: req.session.userId,
      pokemonId,
    });

    if (existingFavorite) {
      return res.status(400).json({ error: "Already added to favorites" });
    }

    // Create new favorite
    const newFavorite = new Favorite({
      userId: req.session.userId,
      pokemonId,
      name,
    });

    await newFavorite.save();
    res.status(201).json(newFavorite);
  } catch (err) {
    console.error("Error adding favorite:", err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// Remove a favorite
router.delete("/:id", async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      _id: req.params.id,
      userId: req.session.userId,
    });

    if (!favorite) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    await favorite.deleteOne();
    res.json({ message: "Favorite removed successfully" });
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

module.exports = router;
