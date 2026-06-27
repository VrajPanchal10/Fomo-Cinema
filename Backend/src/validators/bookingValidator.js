const { body, validationResult } = require("express-validator");

// ─── Updated validation for new Show-centric booking architecture ─────────────
// The booking payload now only requires:
//   showId         – MongoDB ObjectId of the Show document
//   selectedSeats  – Array of seat identifier strings (e.g. ["A-1", "B-3"])
//   totalAmount    – Numeric price total calculated on the frontend
//
// The old movieId / day / time fields are no longer accepted.
const bookingValidationRules = [
  body("showId")
    .notEmpty()
    .withMessage("Show ID is required.")
    .isMongoId()
    .withMessage("Show ID must be a valid MongoDB ObjectId."),
  body("selectedSeats")
    .isArray({ min: 1 })
    .withMessage("At least one seat must be selected."),
  body("selectedSeats.*")
    .isString()
    .withMessage("Each seat identifier must be a string."),
  body("totalAmount")
    .isNumeric()
    .withMessage("Total amount must be a numeric value."),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const formattedErrors = errors.array().map((err) => ({
    field: err.path || err.param,
    message: err.msg,
  }));
  return res.status(400).json({ success: false, errors: formattedErrors });
};

module.exports = {
  bookingValidationRules,
  validate,
};
