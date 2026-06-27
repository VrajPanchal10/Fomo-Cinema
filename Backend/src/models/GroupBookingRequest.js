const mongoose = require("mongoose");

const groupBookingRequestSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  numberOfPeople: {
    type: Number,
    required: true,
  },
  eventDate: {
    type: Date,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("GroupBookingRequest", groupBookingRequestSchema);
