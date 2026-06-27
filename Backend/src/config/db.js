const mongoose = require("mongoose");

/**
 * Connect to MongoDB and return the database name.
 * Exits the process if the connection fails.
 * @returns {Promise<string>} The connected database name.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("✖  MONGODB_URI is not set in .env");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    return conn.connection.name; // Return the db name for the startup banner
  } catch (error) {
    console.error(`✖  Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
