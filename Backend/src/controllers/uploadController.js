const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const secureUrl = req.file.path || req.file.secure_url;
    if (!secureUrl) {
      return res.status(500).json({ success: false, message: "Failed to retrieve Cloudinary secure URL." });
    }

    res.json({
      success: true,
      url: secureUrl,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadImage,
};
