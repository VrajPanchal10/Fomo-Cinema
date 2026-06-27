const path = require("path");
const dotenv = require("dotenv");

// Load environment variables — must happen before any other import
dotenv.config({ path: path.join(__dirname, "../.env") });

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5001;
const MODE = process.env.NODE_ENV || "development";
const API_BASE = `http://localhost:${PORT}/api`;

const startServer = async () => {
  // Connect to MongoDB Atlas
  const dbName = await connectDB();

  // Start listening
  app.listen(PORT, () => {
    const debugNote = process.env.DEBUG_API_LOGS === "true"
      ? "  ⚡ API request logging is ON  (DEBUG_API_LOGS=true)"
      : "  ℹ  Set DEBUG_API_LOGS=true to enable request logging";

    console.log(`
=========================================
  🎬  FOMO CINEMA BACKEND
=========================================
  ✅  Database Connected
      Database : ${dbName || "fomo-cinema"}

  ✅  Server Running
      Mode     : ${MODE.charAt(0).toUpperCase() + MODE.slice(1)}
      Port     : ${PORT}

  🌐  API Base URL
      ${API_BASE}

${debugNote}
=========================================
`);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    console.error(`\n✖  Unhandled Rejection: ${err.message}`);
    process.exit(1);
  });
};

startServer().catch((error) => {
  console.error(`\n✖  Server failed to start: ${error.message}`);
  process.exit(1);
});
