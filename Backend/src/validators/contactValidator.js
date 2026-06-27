const { body, validationResult } = require("express-validator");

const contactValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required."),
  body("email")
    .isEmail()
    .withMessage("Must be a valid email address.")
    .normalizeEmail(),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required."),
];

const groupBookingValidationRules = [
  body("companyName")
    .trim()
    .notEmpty()
    .withMessage("Organization/Group name is required."),
  body("numberOfPeople")
    .isInt({ min: 1 })
    .withMessage("Number of people must be a positive integer."),
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Details/message are required."),
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
  contactValidationRules,
  groupBookingValidationRules,
  validate,
};
