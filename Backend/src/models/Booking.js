const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────────────────────
// Booking schema stores an immutable snapshot of the show at the time of
// booking.  This ensures historical records stay accurate even if the related
// Movie or Show documents are later edited or deleted.
// ─────────────────────────────────────────────────────────────────────────────
const bookingSchema = new mongoose.Schema({
  // ── References ────────────────────────────────────────────────────────────
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Movie",
    required: true,
  },
  show: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Show",
    required: true,
  },

  // ── Seat selection ────────────────────────────────────────────────────────
  selectedSeats: [{ type: String, required: true }],

  // ── Immutable snapshot – preserved even if the Show/Movie is later edited ─
  // Store the full ISO datetime so date + time can always be re-derived.
  snapshotShowDateTime: {
    type: Date,
  },
  // Human-readable display strings stored for convenience / receipts
  movieTitle:   { type: String },
  moviePoster:  { type: String },
  // Formatted string like "Thursday, 26 June 2026"
  showDateLabel: { type: String },
  // "HH:MM" string derived from snapshotShowDateTime at booking time
  showTimeLabel: { type: String },
  screenName:   { type: String },
  ticketPrice:  { type: Number },

  // ── Payment & status ──────────────────────────────────────────────────────
  totalAmount: {
    type: Number,
    required: true,
  },
  bookingStatus: {
    type: String,
    enum: ["active", "cancelled"],
    default: "active",
  },
  bookingId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

bookingSchema.index({ user: 1 });
bookingSchema.index({ show: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
