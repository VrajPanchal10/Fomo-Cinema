const Movie = require("../models/Movie");
const Show = require("../models/Show");
const Booking = require("../models/Booking");
const User = require("../models/User");

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolves a movie document by either a 24-char ObjectId hex string
 * or a numeric ID.  Returns null if not found.
 */
const resolveMovie = async (movieId) => {
  if (/^[0-9a-fA-F]{24}$/.test(movieId)) {
    return Movie.findById(movieId);
  }
  if (!isNaN(movieId)) {
    return Movie.findOne({ id: Number(movieId) });
  }
  return null;
};

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMovies = await Movie.countDocuments({ isActive: { $ne: false } });
    const totalShows = await Show.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ bookingStatus: "active" });
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: "cancelled" });

    const revenueResult = await Booking.aggregate([
      { $match: { bookingStatus: "active" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    const recentBookings = await Booking.find()
      .populate("user", "name email")
      .populate("movie", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentMovies = await Movie.find()
      .select("title createdAt status")
      .sort({ id: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalMovies,
        totalShows,
        totalBookings,
        activeBookings,
        cancelledBookings,
        revenue,
      },
      recentActivity: {
        bookings: recentBookings,
        users: recentUsers,
        movies: recentMovies,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/movies
const getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ isActive: { $ne: false } }).sort({ id: -1 });
    res.json(movies);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/movies/archived
const getArchivedMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ isActive: false }).sort({ id: -1 });
    res.json(movies);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/movies
const createMovie = async (req, res, next) => {
  try {
    const { title, status, poster } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Movie Title is required." });
    }
    if (!status || !["now-showing", "upcoming", "both"].includes(status)) {
      return res.status(400).json({ message: "Invalid movie status." });
    }
    if (
      !poster ||
      typeof poster !== "string" ||
      (!poster.startsWith("http://") && !poster.startsWith("https://"))
    ) {
      return res.status(400).json({ message: "Valid poster image URL is required." });
    }

    const maxMovie = await Movie.findOne().sort({ id: -1 });
    const newId = maxMovie ? maxMovie.id + 1 : 1;

    const movieData = {
      ...req.body,
      id: newId,
      isActive: true,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    };

    const movie = new Movie(movieData);
    await movie.save();
    res.status(201).json(movie);
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/movies/:id
const updateMovie = async (req, res, next) => {
  try {
    const { title, status, poster } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Movie Title is required." });
    }
    if (!status || !["now-showing", "upcoming", "both"].includes(status)) {
      return res.status(400).json({ message: "Invalid movie status." });
    }
    if (
      !poster ||
      typeof poster !== "string" ||
      (!poster.startsWith("http://") && !poster.startsWith("https://"))
    ) {
      return res.status(400).json({ message: "Valid poster image URL is required." });
    }

    const movieData = { ...req.body, updatedBy: req.user.id };

    const movie = await Movie.findOneAndUpdate(
      { id: Number(req.params.id) },
      movieData,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }
    res.json(movie);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/movies/:id/archive
const archiveMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findOneAndUpdate(
      { id: Number(req.params.id) },
      { isActive: false, deletedAt: new Date(), updatedBy: req.user.id },
      { new: true }
    );
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    res.json({ message: "Movie archived successfully.", movie });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/admin/movies/:id/restore
const restoreMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findOneAndUpdate(
      { id: Number(req.params.id) },
      { isActive: true, deletedAt: null, updatedBy: req.user.id },
      { new: true }
    );
    if (!movie) return res.status(404).json({ message: "Movie not found." });
    res.json({ message: "Movie restored successfully.", movie });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/shows
const getShows = async (req, res, next) => {
  try {
    // Auto-mark past Active/Scheduled/Sold Out shows as Completed in admin view
    await Show.updateMany(
      {
        showDateTime: { $lt: new Date() },
        status: { $in: ["Active", "Scheduled", "Sold Out"] },
      },
      { status: "Completed" }
    );

    const shows = await Show.find()
      .populate("movie")
      .sort({ showDateTime: 1 });
    res.json(shows);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/shows
const createShow = async (req, res, next) => {
  try {
    const { movieId, showDateTime, ticketPrice, screenName, totalSeats, seatConfiguration, status } =
      req.body;

    if (!movieId) {
      return res.status(400).json({ message: "Movie ID is required." });
    }
    if (!showDateTime) {
      return res.status(400).json({ message: "Show date/time is required." });
    }

    const movieDoc = await resolveMovie(String(movieId));
    if (!movieDoc) {
      return res.status(404).json({ message: "Movie not found." });
    }

    const showDateObj = new Date(showDateTime);
    if (isNaN(showDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid showDateTime format." });
    }

    // Duplicate check
    const existingShow = await Show.findOne({
      showDateTime: showDateObj,
      screenName: screenName || "Screen 1",
    });
    if (existingShow) {
      return res.status(409).json({
        message: `A show on ${screenName || "Screen 1"} at this exact date and time already exists.`,
      });
    }

    const showData = {
      movie: movieDoc._id,
      showDateTime: showDateObj,
      ticketPrice: Number(ticketPrice) || 15.0,
      screenName: screenName || "Screen 1",
      totalSeats: Number(totalSeats) || 44,
      status: status || "Active",
      bookedSeats: [],
    };
    if (seatConfiguration) showData.seatConfiguration = seatConfiguration;

    const show = new Show(showData);
    await show.save();
    const populatedShow = await Show.findById(show._id).populate("movie");
    res.status(201).json(populatedShow);
  } catch (error) {
    // Handle MongoDB unique-index violation
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A show on this screen at this date and time already exists.",
      });
    }
    next(error);
  }
};

// PUT /api/admin/shows/:id
const updateShow = async (req, res, next) => {
  try {
    const { movieId, showDateTime, ticketPrice, screenName, totalSeats, seatConfiguration, status } =
      req.body;

    if (!movieId) {
      return res.status(400).json({ message: "Movie ID is required." });
    }
    if (!showDateTime) {
      return res.status(400).json({ message: "Show date/time is required." });
    }

    const movieDoc = await resolveMovie(String(movieId));
    if (!movieDoc) {
      return res.status(404).json({ message: "Movie not found." });
    }

    const showDateObj = new Date(showDateTime);
    if (isNaN(showDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid showDateTime format." });
    }

    // Duplicate check excluding this show
    const duplicateShow = await Show.findOne({
      _id: { $ne: req.params.id },
      showDateTime: showDateObj,
      screenName: screenName || "Screen 1",
    });
    if (duplicateShow) {
      return res.status(409).json({
        message: `A show on ${screenName || "Screen 1"} at this exact date and time already exists.`,
      });
    }

    const updateData = {
      movie: movieDoc._id,
      showDateTime: showDateObj,
      ticketPrice: Number(ticketPrice) || 15.0,
      screenName: screenName || "Screen 1",
      totalSeats: Number(totalSeats) || 44,
      status: status || "Active",
    };
    if (seatConfiguration) updateData.seatConfiguration = seatConfiguration;

    const show = await Show.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate(
      "movie"
    );
    if (!show) return res.status(404).json({ message: "Show not found." });
    res.json(show);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A show on this screen at this date and time already exists.",
      });
    }
    next(error);
  }
};

// DELETE /api/admin/shows/:id
const deleteShow = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ show: req.params.id });
    if (bookings.length > 0) {
      return res.status(400).json({
        message:
          "Cannot delete show. Bookings or history exist for this session. Please Archive or Cancel instead.",
      });
    }

    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ message: "Show not found." });
    res.json({ message: "Show deleted successfully." });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/bookings
const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email phone")
      .populate("movie", "title")
      .populate("show", "showDateTime screenName ticketPrice")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUsers,
  getMovies,
  createMovie,
  updateMovie,
  getArchivedMovies,
  archiveMovie,
  restoreMovie,
  getShows,
  createShow,
  updateShow,
  deleteShow,
  getBookings,
};
