const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const {
  bookingValidationRules,
  validate,
} = require("../validators/bookingValidator");

// Protect all routes in this router
router.use(authMiddleware);

router.post("/", bookingValidationRules, validate, createBooking);
router.get("/my-bookings", getMyBookings);
router.get("/:id", getBookingById);
router.patch("/:id/cancel", cancelBooking);

module.exports = router;
