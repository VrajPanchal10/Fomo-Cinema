const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Movie = require("../models/Movie");
const connectDB = require("../config/db");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const runMigration = async () => {
  await connectDB();
  console.log("Running migration to set isSeeded: true for existing seeded movies...");

  try {
    // Seeded movies have id <= 26 based on seed.js
    const result = await Movie.updateMany(
      { id: { $lte: 26 } },
      { $set: { isSeeded: true } }
    );
    console.log(`Successfully migrated ${result.modifiedCount} movies.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

runMigration();
