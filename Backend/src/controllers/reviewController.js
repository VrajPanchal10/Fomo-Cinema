const mongoose = require("mongoose");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Movie = require("../models/Movie");

const recalculateMovieStats = async (movieId) => {
  try {
    const stats = await Review.aggregate([
      {
        $match: {
          movie: new mongoose.Types.ObjectId(movieId),
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$movie",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      const avg = Math.round(stats[0].averageRating * 10) / 10;
      await Movie.findByIdAndUpdate(movieId, {
        averageRating: avg,
        reviewCount: stats[0].reviewCount,
      });
    } else {
      await Movie.findByIdAndUpdate(movieId, {
        averageRating: 0,
        reviewCount: 0,
      });
    }
  } catch (err) {
    console.error(`[Stats Recalculation Failed] Movie: ${movieId}`, err);
  }
};

const createReview = async (req, res, next) => {
  try {
    const { movieId, bookingId, rating, review } = req.body;
    const userId = req.user.id;

    // 1. Resolve Movie
    let movieDoc;
    if (mongoose.Types.ObjectId.isValid(movieId)) {
      movieDoc = await Movie.findById(movieId);
    }
    if (!movieDoc && !isNaN(movieId)) {
      movieDoc = await Movie.findOne({ id: Number(movieId) });
    }

    if (!movieDoc) {
      return res.status(404).json({ message: "Movie not found." });
    }

    // 2. Resolve Booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // 3. Ownership & Validity Checks
    if (booking.user.toString() !== userId) {
      return res.status(403).json({ message: "You can only review your own bookings." });
    }

    if (booking.bookingStatus !== "active") {
      return res.status(400).json({ message: "You cannot review a cancelled booking." });
    }

    if (booking.movie.toString() !== movieDoc._id.toString()) {
      return res.status(400).json({ message: "Booking does not match this movie." });
    }

    // 4. Duplicate Check
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this booking." });
    }

    // 5. Create Review
    const newReview = new Review({
      user: userId,
      movie: movieDoc._id,
      booking: bookingId,
      rating,
      review: review.trim(),
      status: "pending",
    });

    await newReview.save();
    
    // Stats remain unchanged since review is pending, but run to verify schema
    await recalculateMovieStats(movieDoc._id);

    res.status(201).json({
      message: "Review submitted successfully. Waiting for admin approval.",
      review: newReview,
    });
  } catch (error) {
    next(error);
  }
};

const getMovieReviews = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    let movieDoc;
    if (mongoose.Types.ObjectId.isValid(movieId)) {
      movieDoc = await Movie.findById(movieId);
    }
    if (!movieDoc && !isNaN(movieId)) {
      movieDoc = await Movie.findOne({ id: Number(movieId) });
    }

    if (!movieDoc) {
      return res.status(404).json({ message: "Movie not found." });
    }

    const reviews = await Review.find({ movie: movieDoc._id, status: "approved" })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

const getFooterReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ status: "approved" })
      .populate("user", "name")
      .populate("movie", "title")
      .sort({ createdAt: -1 })
      .limit(6);

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

const getAdminReviews = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      filter.status = status;
    }

    let reviewQuery = Review.find(filter)
      .populate("user", "name email")
      .populate("movie", "title")
      .populate("booking", "bookingId")
      .sort({ createdAt: -1 });

    let reviews = await reviewQuery;

    if (search) {
      const searchLower = search.toLowerCase();
      reviews = reviews.filter((r) => {
        const username = r.user ? r.user.name.toLowerCase() : "";
        const userEmail = r.user ? r.user.email.toLowerCase() : "";
        const movieTitle = r.movie ? r.movie.title.toLowerCase() : "";
        const text = r.review.toLowerCase();
        const bId = r.booking ? r.booking.bookingId.toLowerCase() : "";
        return (
          username.includes(searchLower) ||
          userEmail.includes(searchLower) ||
          movieTitle.includes(searchLower) ||
          text.includes(searchLower) ||
          bId.includes(searchLower)
        );
      });
    }

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};

const approveReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    review.status = "approved";
    await review.save();

    await recalculateMovieStats(review.movie);

    res.json({ message: "Review approved successfully.", review });
  } catch (error) {
    next(error);
  }
};

const rejectReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    review.status = "rejected";
    await review.save();

    await recalculateMovieStats(review.movie);

    res.json({ message: "Review rejected successfully.", review });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found." });
    }

    const movieId = review.movie;
    await Review.findByIdAndDelete(req.params.id);

    await recalculateMovieStats(movieId);

    res.json({ message: "Review deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getMovieReviews,
  getFooterReviews,
  getAdminReviews,
  approveReview,
  rejectReview,
  deleteReview,
};
