const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized. Authentication required." });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      console.log(`[Admin Access Denied] User ID: ${req.user.id}, Role in DB: ${user ? user.role : "none"}`);
      return res.status(403).json({ message: "Access denied. Admin role required." });
    }
    next();
  } catch (error) {
    console.error("[Admin Middleware Error]:", error);
    return res.status(500).json({ message: "Internal server error during admin validation." });
  }
};

module.exports = adminMiddleware;
