const express = require("express");
const router = express.Router();
const { createGroupBooking } = require("../controllers/groupBookingController");
const {
  groupBookingValidationRules,
  validate,
} = require("../validators/contactValidator");

router.post("/", groupBookingValidationRules, validate, createGroupBooking);

module.exports = router;
