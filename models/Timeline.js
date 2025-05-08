// models/Timeline.js
const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    enum: ["login", "register", "logout", "favorite_added", "favorite_removed"],
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index for faster querying
timelineSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model("Timeline", timelineSchema);
