// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Favorite = require("../models/Favorite");
const Timeline = require("../models/Timeline");
const bcrypt = require("bcrypt");

// Middleware to check if user is authenticated and is an admin
const isAdmin = (req, res, next) => {
  if (req.session.isAuthenticated && req.session.isAdmin) {
    return next();
  }
  res.status(403).render("error", {
    message: "Access denied. Admins only.",
    error: {},
  });
};

// Apply admin middleware to all routes in this file
router.use(isAdmin);

// Admin dashboard - main view
router.get("/", async (req, res) => {
  try {
    // Get counts for dashboard statistics
    const userCount = await User.countDocuments({});
    const adminCount = await User.countDocuments({ isAdmin: true });
    const favoriteCount = await Favorite.countDocuments({});
    const activityCount = await Timeline.countDocuments({});

    // Get recent users
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);

    // Get recent activity
    const recentActivity = await Timeline.find({})
      .sort({ timestamp: -1 })
      .limit(10);

    res.render("admin/dashboard", {
      username: req.session.username,
      stats: {
        users: userCount,
        admins: adminCount,
        favorites: favoriteCount,
        activities: activityCount,
      },
      recentUsers,
      recentActivity,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).render("error", {
      message: "Error loading admin dashboard",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  }
});

// View all users
router.get("/users", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalUsers = await User.countDocuments({});

    // Get users with pagination
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.render("admin/users", {
      username: req.session.username,
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        limit,
      },
    });
  } catch (err) {
    console.error("Admin users list error:", err);
    res.status(500).render("error", {
      message: "Error loading users list",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  }
});

// View single user detail
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).render("error", {
        message: "User not found",
        error: {},
      });
    }

    // Get user's favorites
    const favorites = await Favorite.find({ userId: user._id });

    // Get user's activity
    const activities = await Timeline.find({ userId: user._id })
      .sort({ timestamp: -1 })
      .limit(20);

    res.render("admin/user-detail", {
      username: req.session.username,
      user,
      favorites,
      activities,
    });
  } catch (err) {
    console.error("Admin user detail error:", err);
    res.status(500).render("error", {
      message: "Error loading user details",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  }
});

// Edit user form
router.get("/users/:id/edit", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).render("error", {
        message: "User not found",
        error: {},
      });
    }

    res.render("admin/edit-user", {
      username: req.session.username,
      user,
      error: req.session.editUserError,
    });

    // Clear any error messages
    delete req.session.editUserError;
  } catch (err) {
    console.error("Admin edit user error:", err);
    res.status(500).render("error", {
      message: "Error loading user edit form",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  }
});

// Update user
router.post("/users/:id", async (req, res) => {
  try {
    const { username, isAdmin, password } = req.body;
    const userId = req.params.id;

    // Get the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).render("error", {
        message: "User not found",
        error: {},
      });
    }

    // Prevent removing admin status from the last admin
    if (user.isAdmin && !isAdmin) {
      const adminCount = await User.countDocuments({ isAdmin: true });

      if (adminCount <= 1) {
        req.session.editUserError =
          "Cannot remove admin status from the last admin user.";
        return res.redirect(`/admin/users/${userId}/edit`);
      }
    }

    // Check if username is already taken by another user
    if (username !== user.username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: userId },
      });

      if (existingUser) {
        req.session.editUserError = "Username is already taken.";
        return res.redirect(`/admin/users/${userId}/edit`);
      }
    }

    // Update user fields
    user.username = username;
    user.isAdmin = isAdmin === "true" || isAdmin === true || isAdmin === "on";

    // Only update password if provided
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Redirect to user detail page
    res.redirect(`/admin/users/${userId}`);
  } catch (err) {
    console.error("Admin update user error:", err);
    req.session.editUserError = "Error updating user. Please try again.";
    res.redirect(`/admin/users/${req.params.id}/edit`);
  }
});

// Delete user confirmation page
router.get("/users/:id/delete", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).render("error", {
        message: "User not found",
        error: {},
      });
    }

    res.render("admin/delete-user", {
      username: req.session.username,
      user,
    });
  } catch (err) {
    console.error("Admin delete user confirmation error:", err);
    res.status(500).render("error", {
      message: "Error loading delete confirmation",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  }
});

// Delete user action
router.post("/users/:id/delete", async (req, res) => {
  try {
    const userId = req.params.id;

    // Get the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).render("error", {
        message: "User not found",
        error: {},
      });
    }

    // Prevent deleting the last admin
    if (user.isAdmin) {
      const adminCount = await User.countDocuments({ isAdmin: true });

      if (adminCount <= 1) {
        return res.status(400).render("error", {
          message: "Cannot delete the last admin user.",
          error: {},
        });
      }
    }

    // Prevent self-deletion
    if (user._id.toString() === req.session.userId) {
      return res.status(400).render("error", {
        message: "You cannot delete your own account while logged in.",
        error: {},
      });
    }

    // Delete associated data
    await Promise.all([
      Favorite.deleteMany({ userId }),
      Timeline.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    // Redirect to users list
    res.redirect("/admin/users");
  } catch (err) {
    console.error("Admin delete user error:", err);
    res.status(500).render("error", {
      message: "Error deleting user",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  }
});

// Make user an admin
router.post("/users/:id/make-admin", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).render("error", {
        message: "User not found",
        error: {},
      });
    }

    user.isAdmin = true;
    await user.save();

    res.redirect(`/admin/users/${req.params.id}`);
  } catch (err) {
    console.error("Admin make admin error:", err);
    res.status(500).render("error", {
      message: "Error updating admin status",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  }
});

// Remove admin status
router.post("/users/:id/remove-admin", async (req, res) => {
  try {
    const userId = req.params.id;

    // Get the user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).render("error", {
        message: "User not found",
        error: {},
      });
    }

    // Prevent removing admin status from the last admin
    const adminCount = await User.countDocuments({ isAdmin: true });

    if (adminCount <= 1 && user.isAdmin) {
      return res.status(400).render("error", {
        message: "Cannot remove admin status from the last admin user.",
        error: {},
      });
    }

    // Prevent removing own admin status
    if (user._id.toString() === req.session.userId) {
      return res.status(400).render("error", {
        message:
          "You cannot remove your own admin status. Another admin must do this.",
        error: {},
      });
    }

    user.isAdmin = false;
    await user.save();

    res.redirect(`/admin/users/${userId}`);
  } catch (err) {
    console.error("Admin remove admin error:", err);
    res.status(500).render("error", {
      message: "Error updating admin status",
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  }
});

module.exports = router;
