const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");

dotenv.config();

const app = express();

// Set EJS as view engine and specify views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Consolidated session middleware configuration - Fix session middleware duplication
const FileStore = require("session-file-store")(session);
const fileStoreOptions = {};

app.use(
  session({
    store: new FileStore(fileStoreOptions),
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Parse URL-encoded bodies (for form data) and JSON bodies (for API requests)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import route files
const authRoutes = require("./routes/auth");
const favoritesRoutes = require("./routes/favorites");
const timelineRoutes = require("./routes/timeline");
const adminRoutes = require("./routes/admin"); // Add admin routes

// Use route files
app.use("/", authRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/timeline", timelineRoutes);
app.use("/admin", adminRoutes); // Register admin routes

// Start server after connecting to MongoDB
(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    app.listen(process.env.PORT || 3000, () => {
      console.log(
        `Server is running on http://localhost:${process.env.PORT || 3000}`
      );
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
})();
