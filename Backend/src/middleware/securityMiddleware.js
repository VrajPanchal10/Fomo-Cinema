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

  // Enable CORS — always permit localhost dev origins plus the deployed frontend.
  // CLIENT_URL from the environment is merged in so Render/staging overrides work too.
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://fomo-cinema.vercel.app",
    ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
  ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate

  const corsOptions = {
    origin(origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };

  // Respond to all OPTIONS preflight requests BEFORE any route or rate-limiter runs
  app.options("*", cors(corsOptions));

  app.use(cors(corsOptions));

  // Apply rate limiting to all api routes
  app.use("/api", limiter);
};

module.exports = securityMiddleware;
