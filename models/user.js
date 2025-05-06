const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  favourites: [
    {
      name: { type: String, required: true },
      pokemonID: { type: Number, required: true },
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
