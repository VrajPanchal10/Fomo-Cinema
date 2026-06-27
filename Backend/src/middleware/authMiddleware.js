const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT Secret is not configured.");
    }
    const decoded = jwt.verify(token, secret);
    
    // Attach decoded user info (id, email, role) to request
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid." });
  }
};

module.exports = authMiddleware;
