const Contact = require("../models/Contact");

const createContactQuery = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    await contact.save();

    res.status(201).json({
      message: "Contact query submitted successfully.",
      contact,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContactQuery,
};
