const { body, validationResult } = require("express-validator");

const reviewValidationRules = [
  body("movieId")
    .notEmpty()
    .withMessage("Movie ID is required."),
  body("bookingId")
    .notEmpty()
    .withMessage("Booking ID is required."),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be an integer between 1 and 5."),
  body("review")
    .isString()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Review must be between 10 and 1000 characters long."),
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
  reviewValidationRules,
  validate,
};
