const helmet = require("helmet");
const cors = require("cors");
const { rateLimit } = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP, please try again later.",
  },
});

const securityMiddleware = (app) => {
  // Set security HTTP headers
  app.use(helmet());

  // Enable CORS with customizable origin from env
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const allowedOrigins = [clientUrl, "http://localhost:5173", "http://localhost:5000"];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);

        // Allow any localhost origin
        const isLocalhost = /^http:\/\/localhost(:\d+)?$/.test(origin);
        if (isLocalhost || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  // Apply rate limiting to all api routes
  app.use("/api", limiter);
};

module.exports = securityMiddleware;
