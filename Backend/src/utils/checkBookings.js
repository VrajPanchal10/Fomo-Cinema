const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Movie = require("../models/Movie");
const Show = require("../models/Show");
const connectDB = require("../config/db");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const auditData = async () => {
  await connectDB();
  try {
    const bookings = await Booking.find().populate("user").populate("movie").populate("show");
    console.log(`TOTAL BOOKINGS IN DB: ${bookings.length}`);
    bookings.forEach((b) => {
      console.log(`- ID: ${b.bookingId}, Status: ${b.bookingStatus}, Amount: ${b.totalAmount}`);
      console.log(`  User: ${b.user ? b.user.name : "NULL"}, Movie: ${b.movie ? b.movie.title : "NULL"}, Show: ${b.show ? b.show.time : "NULL"}`);
    });

    const movies = await Movie.find();
    console.log(`\nTOTAL MOVIES IN DB: ${movies.length}`);
    movies.forEach((m) => {
      console.log(`- ID: ${m.id}, Title: ${m.title}, isActive: ${m.isActive}, status: ${m.status}`);
    });

    const shows = await Show.find().populate("movie");
    console.log(`\nTOTAL SHOWS IN DB: ${shows.length}`);
    if (shows.length > 0) {
      console.log(`Sample Show Movie Title: ${shows[0].movie ? shows[0].movie.title : "NULL"}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Audit error:", error);
    process.exit(1);
  }
};

auditData();
