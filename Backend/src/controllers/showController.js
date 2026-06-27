const Show = require("../models/Show");
const Movie = require("../models/Movie");

// ─── Auto-expire helper ───────────────────────────────────────────────────────
// Marks past Active/Scheduled/Sold Out shows as Completed so they stop
// appearing in public listings while remaining visible in admin history.
const autoExpireShows = async () => {
  try {
    await Show.updateMany(
      {
        showDateTime: { $lt: new Date() },
        status: { $in: ["Active", "Scheduled", "Sold Out"] },
      },
      { status: "Completed" }
    );
  } catch (err) {
    console.error("[autoExpireShows] failed:", err.message);
  }
};

// ─── Public: GET /api/shows ────────────────────────────────────────────────────
// Returns all non-Archived, non-Cancelled shows (future + recent).
const getShows = async (req, res, next) => {
  try {
    await autoExpireShows();
    const shows = await Show.find({
      status: { $nin: ["Archived", "Cancelled", "Completed"] },
    })
      .populate("movie")
      .sort({ showDateTime: 1 });
    res.json(shows);
  } catch (err) {
    next(err);
  }
};

// ─── Public: GET /api/shows/:id ───────────────────────────────────────────────
const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id).populate("movie");
    if (!show) {
      return res.status(404).json({ message: "Show not found." });
    }
    res.json(show);
  } catch (err) {
    next(err);
  }
};

// ─── Public: GET /api/shows/movie/:movieId ────────────────────────────────────
// Returns only FUTURE Active/Scheduled/Sold-Out shows for a specific movie.
const getShowsByMovie = async (req, res, next) => {
  try {
    await autoExpireShows();
    const { movieId } = req.params;

    // Accept both 24-char ObjectId and numeric id
    let movieDoc;
    if (/^[0-9a-fA-F]{24}$/.test(movieId)) {
      movieDoc = await Movie.findOne({ _id: movieId, isActive: true });
    } else if (!isNaN(movieId)) {
      movieDoc = await Movie.findOne({ id: Number(movieId), isActive: true });
    }

    if (!movieDoc) {
      return res.status(404).json({ message: "Movie not found or archived." });
    }

    const shows = await Show.find({
      movie: movieDoc._id,
      showDateTime: { $gte: new Date() },
      status: { $in: ["Active", "Scheduled", "Sold Out"] },
    })
      .populate("movie")
      .sort({ showDateTime: 1 });

    res.json(shows);
  } catch (err) {
    next(err);
  }
};

// ─── Internal: GET /api/shows/find?showId=xxx ─────────────────────────────────
// Legacy compat endpoint – kept so existing callers don't break.
const findShow = async (req, res, next) => {
  try {
    const { showId } = req.query;
    if (!showId) {
      return res.status(400).json({ message: "showId is required." });
    }
    const show = await Show.findById(showId).populate("movie");
    if (!show) {
      return res.status(404).json({ message: "Show not found." });
    }
    res.json(show);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getShows,
  getShowById,
  getShowsByMovie,
  findShow,
};
