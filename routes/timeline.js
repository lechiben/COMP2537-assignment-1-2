// routes/timeline.js
const express = require("express");
const router = express.Router();
const timelineService = require("../services/timelineService");

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.isAuthenticated) {
    return next();
  }
  res
    .status(401)
    .json({ error: "You must be logged in to access your timeline" });
};

// Apply authentication middleware to all timeline routes
router.use(isAuthenticated);

// Get user's timeline as JSON (for AJAX calls)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const timeline = await timelineService.getUserTimeline(
      req.session.userId,
      limit,
      skip
    );

    res.json(timeline);
  } catch (err) {
    console.error("Error fetching timeline:", err);
    res.status(500).json({ error: "Failed to fetch timeline" });
  }
});

// Get full timeline page for rendering
router.get("/view", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const timeline = await timelineService.getUserTimeline(
      req.session.userId,
      limit,
      skip
    );

    // Render timeline page with data
    res.render("timeline", {
      timeline,
      username: req.session.username,
      currentPage: page,
      limit,
    });
  } catch (err) {
    console.error("Error fetching timeline:", err);
    res.status(500).render("error", {
      message: "Failed to fetch timeline",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  }
});

module.exports = router;
