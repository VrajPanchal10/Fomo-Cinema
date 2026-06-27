const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const {
  registerValidationRules,
  loginValidationRules,
  validate,
} = require("../validators/authValidator");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerValidationRules, validate, register);
router.post("/login", loginValidationRules, validate, login);
router.get("/me", authMiddleware, getMe);

module.exports = router;
