const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const adminController = require("../controllers/adminController");
const reviewController = require("../controllers/reviewController");

// Protect all routes with authMiddleware and adminMiddleware
router.use(authMiddleware);
router.use(adminMiddleware);

// Stats route
router.get("/stats", adminController.getStats);

// Users route
router.get("/users", adminController.getUsers);

// Movies CRUD
router.get("/movies", adminController.getMovies);
router.get("/movies/archived", adminController.getArchivedMovies);
router.post("/movies", adminController.createMovie);
router.put("/movies/:id", adminController.updateMovie);
router.patch("/movies/:id/archive", adminController.archiveMovie);
router.patch("/movies/:id/restore", adminController.restoreMovie);

// Shows CRUD
router.get("/shows", adminController.getShows);
router.post("/shows", adminController.createShow);
router.put("/shows/:id", adminController.updateShow);
router.delete("/shows/:id", adminController.deleteShow);

// Bookings route
router.get("/bookings", adminController.getBookings);

// Reviews moderation
router.get("/reviews", reviewController.getAdminReviews);
router.patch("/reviews/:id/approve", reviewController.approveReview);
router.patch("/reviews/:id/reject", reviewController.rejectReview);
router.delete("/reviews/:id", reviewController.deleteReview);

module.exports = router;
