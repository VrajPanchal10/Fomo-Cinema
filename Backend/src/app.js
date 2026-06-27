const express = require("express");
const morgan = require("morgan");
const securityMiddleware = require("./middleware/securityMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

// Import Routers
const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const showRoutes = require("./routes/showRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const contactRoutes = require("./routes/contactRoutes");
const groupBookingRoutes = require("./routes/groupBookingRoutes");
const healthRoutes = require("./routes/healthRoutes");
const adminRoutes = require("./routes/adminRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();

// ── Security (Helmet, CORS, Rate Limiting) ────────────────────────────────────
securityMiddleware(app);

// ── Request Logging ───────────────────────────────────────────────────────────
// Only enabled when DEBUG_API_LOGS=true in .env — keeps the terminal clean by default.
if (process.env.DEBUG_API_LOGS === "true") {
  app.use(morgan("dev"));
}

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/movies",        movieRoutes);
app.use("/api/shows",         showRoutes);
app.use("/api/bookings",      bookingRoutes);
app.use("/api/contact",       contactRoutes);
app.use("/api/group-booking", groupBookingRoutes);
app.use("/api/health",        healthRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/upload",        uploadRoutes);
app.use("/api/reviews",       reviewRoutes);

// ── Root Route ────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Fomo Cinema Backend API is running.",
    status: "OK",
    version: "1.0.0",
  });
});

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use("*", (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
