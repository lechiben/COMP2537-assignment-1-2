// models/Favorite.js
const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  pokemonId: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure a user can only favorite a Pokémon once
favoriteSchema.index({ userId: 1, pokemonId: 1 }, { unique: true });

module.exports = mongoose.model("Favorite", favoriteSchema);
