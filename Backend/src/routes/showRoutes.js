const express = require("express");
const router = express.Router();
const {
  getShows,
  getShowById,
  getShowsByMovie,
  findShow,
} = require("../controllers/showController");

router.get("/", getShows);
router.get("/find", findShow);
router.get("/movie/:movieId", getShowsByMovie);
router.get("/:id", getShowById);

module.exports = router;
