const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const reviewController = require("../controllers/reviewController");
const { reviewValidationRules, validate } = require("../validators/reviewValidator");

// Public routes
router.get("/footer", reviewController.getFooterReviews);
router.get("/movie/:movieId", reviewController.getMovieReviews);

// Protected routes
router.post("/", authMiddleware, reviewValidationRules, validate, reviewController.createReview);

module.exports = router;
