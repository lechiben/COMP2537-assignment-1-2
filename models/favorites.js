const mongoose = require("mongoose");

// Define the schema for favorites
const favoriteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Create a compound index to prevent duplicate favorites for the same user
favoriteSchema.index({ name: 1, username: 1 }, { unique: true });

// Create and export the model
const Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;
