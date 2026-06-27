const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const uploadController = require("../controllers/uploadController");

// Protect upload endpoint: must be admin
router.post(
  "/image",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  uploadController.uploadImage
);

module.exports = router;
