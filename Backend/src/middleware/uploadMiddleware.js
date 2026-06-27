const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "fomo-cinema/posters",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0].replace(/\s+/g, "-")}`,
    };
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
