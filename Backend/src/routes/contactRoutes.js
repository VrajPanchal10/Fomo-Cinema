const express = require("express");
const router = Router = express.Router();
const { createContactQuery } = require("../controllers/contactController");
const {
  contactValidationRules,
  validate,
} = require("../validators/contactValidator");

router.post("/", contactValidationRules, validate, createContactQuery);

module.exports = router;
