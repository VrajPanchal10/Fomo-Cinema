const Booking = require("../models/Booking");
const Show = require("../models/Show");
const Review = require("../models/Review");
const generateBookingId = require("../utils/bookingIdGenerator");

// IST offset helper (must stay in sync with Show model's toIST)
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Format an IST-display date label for a booking snapshot.
 * Returns e.g. "Thursday, 26 June 2026"
 */
const formatSnapshotDateLabel = (dateUTC) => {
  const ist = new Date(dateUTC.getTime() + IST_OFFSET_MS);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${days[ist.getUTCDay()]}, ${ist.getUTCDate()} ${months[ist.getUTCMonth()]} ${ist.getUTCFullYear()}`;
};

/**
 * Format HH:MM in IST from a UTC Date.
 */
const formatSnapshotTimeLabel = (dateUTC) => {
  const ist = new Date(dateUTC.getTime() + IST_OFFSET_MS);
  const hh = String(ist.getUTCHours()).padStart(2, "0");
  const mm = String(ist.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { showId, selectedSeats, totalAmount } = req.body;
    const userId = req.user.id;

    if (!showId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({ message: "Show ID and selected seats are required." });
    }

    // 1. Resolve Show + populate Movie
    const show = await Show.findById(showId).populate("movie");
    if (!show) {
      return res.status(404).json({ message: "Show session not found." });
    }

    if (["Cancelled", "Archived", "Completed"].includes(show.status)) {
      return res.status(400).json({
        message: `This show session is ${show.status.toLowerCase()} and cannot be booked.`,
      });
    }

    // 2. Duplicate seat check
    const duplicateSeats = selectedSeats.filter((s) => show.bookedSeats.includes(s));
    if (duplicateSeats.length > 0) {
      return res.status(409).json({
        message: `Seats already booked: ${duplicateSeats.join(", ")}`,
        bookedSeats: duplicateSeats,
      });
    }

    // 3. Seat capacity check
    if (show.bookedSeats.length + selectedSeats.length > show.totalSeats) {
      return res.status(400).json({ message: "Not enough seats available." });
    }

    // 4. Reserve seats on Show document
    show.bookedSeats.push(...selectedSeats);
    if (show.bookedSeats.length >= show.totalSeats) {
      show.status = "Sold Out";
    }
    await show.save();

    // 5. Build immutable booking snapshot using show.showDateTime virtuals
    const bookingId = generateBookingId();
    const newBooking = new Booking({
      user: userId,
      movie: show.movie._id,
      show: show._id,
      selectedSeats,
      totalAmount,
      bookingId,
      bookingStatus: "active",
      // ── Immutable snapshot (from virtual derivation) ───────────────────
      snapshotShowDateTime: show.showDateTime,
      showDateLabel: formatSnapshotDateLabel(show.showDateTime),
      showTimeLabel: formatSnapshotTimeLabel(show.showDateTime),
      movieTitle: show.movie.title,
      moviePoster: show.movie.poster,
      screenName: show.screenName,
      ticketPrice: show.ticketPrice,
    });

    await newBooking.save();
    res.status(201).json({ message: "Booking successful.", booking: newBooking });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/my-bookings
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("movie")
      .populate("show")
      .sort({ createdAt: -1 });

    const reviews = await Review.find({ user: req.user.id });
    const reviewsMap = new Map(reviews.map((r) => [r.booking.toString(), r.status]));

    const bookingsWithReviewStatus = bookings.map((b) => {
      const obj = b.toObject();
      obj.isReviewed = reviewsMap.has(b._id.toString());
      obj.reviewStatus = reviewsMap.get(b._id.toString()) || null;
      return obj;
    });

    res.json(bookingsWithReviewStatus);
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("movie")
      .populate("show")
      .populate("user", "name email");

    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (
      booking.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied." });
    }

    if (booking.bookingStatus === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled." });
    }

    // Release seats back to Show
    const show = await Show.findById(booking.show);
    if (show) {
      show.bookedSeats = show.bookedSeats.filter((s) => !booking.selectedSeats.includes(s));
      // If show was sold out, reactivate it
      if (show.status === "Sold Out") show.status = "Active";
      await show.save();
    }

    booking.bookingStatus = "cancelled";
    await booking.save();
    res.json({ message: "Booking cancelled successfully.", booking });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking };
