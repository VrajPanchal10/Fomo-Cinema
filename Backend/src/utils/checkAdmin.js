const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require("../models/User");
const connectDB = require("../config/db");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const checkUsers = async () => {
  await connectDB();
  try {
    const users = await User.find();
    console.log("ALL USERS IN DB:");
    users.forEach((u) => {
      console.log(`- Name: ${u.name}, Email: ${u.email}, Role: ${u.role}, ID: ${u._id}`);
    });
    process.exit(0);
  } catch (error) {
    console.error("Error fetching users:", error);
    process.exit(1);
  }
};

checkUsers();
