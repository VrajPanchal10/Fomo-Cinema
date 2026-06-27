const GroupBookingRequest = require("../models/GroupBookingRequest");

const createGroupBooking = async (req, res, next) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      numberOfPeople,
      eventDate,
      message,
    } = req.body;

    const request = new GroupBookingRequest({
      companyName,
      contactPerson,
      email,
      phone,
      numberOfPeople,
      eventDate,
      message,
    });

    await request.save();

    res.status(201).json({
      message: "Group booking request submitted successfully.",
      request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createGroupBooking,
};
