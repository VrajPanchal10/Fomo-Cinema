const { body, validationResult } = require("express-validator");

// ─── Registration Validation Rules ───────────────────────────────────────────
const registerValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required.")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required.")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    // NOTE: .normalizeEmail() is intentionally NOT used here.
    // express-validator's normalizeEmail() transforms the raw email before the
    // controller runs, which can cause the admin-email guard comparison to
    // silently mismatch (e.g. dots in Gmail addresses).  We lowercase manually
    // in the controller instead.
    .customSanitizer((val) => val.toLowerCase().trim()),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[A-Za-z]/)
    .withMessage("Password must contain at least one letter.")
    .matches(/\d/)
    .withMessage("Password must contain at least one number."),

  body("phone")
    .customSanitizer((value) => (value ? value.replace(/[^\d]/g, "") : ""))
    .isLength({ min: 8 })
    .withMessage("Please enter a valid mobile number (minimum 8 digits)."),
];

// ─── Login Validation Rules ───────────────────────────────────────────────────
const loginValidationRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required.")
    .isEmail()
    .withMessage("Please enter a valid email address.")
    .customSanitizer((val) => val.toLowerCase().trim()),

  body("password")
    .notEmpty()
    .withMessage("Password is required."),
];

// ─── Shared validate middleware ───────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const formattedErrors = errors.array().map((err) => ({
    field: err.path || err.param,
    message: err.msg,
  }));

  return res.status(400).json({
    success: false,
    message: "Validation failed. Please check your input.",
    errorCode: "VALIDATION_ERROR",
    errors: formattedErrors,
  });
};

module.exports = { registerValidationRules, loginValidationRules, validate };
