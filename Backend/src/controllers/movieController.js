const Movie = require("../models/Movie");
const Show = require("../models/Show");

const getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ status: { $in: ["now-showing", "both"] }, isActive: true });
    res.json(movies);
  } catch (error) {
    next(error);
  }
};

const getUpcomingMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({ status: { $in: ["upcoming", "both"] }, isActive: true });
    res.json(movies);
  } catch (error) {
    next(error);
  }
};

const getMovieById = async (req, res, next) => {
  try {
    // Lookup by numeric id to match frontend conventions
    const movie = await Movie.findOne({ id: Number(req.params.id), isActive: true });
    if (!movie) {
      return res.status(404).json({ message: "Movie not found or has been archived." });
    }
    res.json(movie);
  } catch (error) {
    next(error);
  }
};

const getMoviesByDay = async (req, res, next) => {
  try {
    let day = req.params.day.toLowerCase();
    
    // Resolve "today" to the current weekday name
    const daysOfWeek = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    if (day === "today") {
      day = daysOfWeek[new Date().getDay()];
    }

    const targetDayIndex = daysOfWeek.indexOf(day);
    if (targetDayIndex === -1) {
      return res.status(400).json({ message: "Invalid weekday name." });
    }

    // Find all future public shows
    const shows = await Show.find({
      showDateTime: { $gte: new Date() },
      status: { $in: ["Active", "Scheduled", "Sold Out"] },
    }).populate("movie");

    // Filter shows matching target day name and get unique movie documents
    const matchingMoviesMap = new Map();
    shows.forEach((show) => {
      if (show.movie && show.movie.isActive && show.weekday && show.weekday.toLowerCase() === day) {
        matchingMoviesMap.set(show.movie._id.toString(), show.movie);
      }
    });

    res.json(Array.from(matchingMoviesMap.values()));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovies,
  getUpcomingMovies,
  getMovieById,
  getMoviesByDay,
};
