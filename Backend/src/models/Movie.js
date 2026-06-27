const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  genre: [
    {
      type: String,
      trim: true,
    },
  ],
  language: {
    type: String,
    default: "English",
  },
  duration: {
    type: String,
  },
  rating: {
    type: String,
  },
  imdb: {
    type: String,
  },
  releaseDate: {
    type: Date,
  },
  poster: {
    type: String, // Storing reference filename e.g. "movie1.jpg"
  },
  trailerUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ["now-showing", "upcoming", "both"],
    default: "now-showing",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  cast: [
    {
      type: String,
      trim: true,
    },
  ],
  isSeeded: {
    type: Boolean,
    default: false,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
});

module.exports = mongoose.model("Movie", movieSchema);
