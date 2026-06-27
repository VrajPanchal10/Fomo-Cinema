const express = require("express");
const router = express.Router();
const {
  getMovies,
  getUpcomingMovies,
  getMovieById,
  getMoviesByDay,
} = require("../controllers/movieController");

router.get("/", getMovies);
router.get("/upcoming", getUpcomingMovies);
router.get("/film-by-day/:day", getMoviesByDay);
router.get("/:id", getMovieById);

module.exports = router;
