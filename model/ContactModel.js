const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    match: [/^[A-Za-z\s]+$/, "Name can only contain letters and spaces"], // Only letters and spaces allowed
  },
  email: {
    type: String,
    required: true,
    match: [
      /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com)$/,
      "Please enter a valid email with a supported domain (e.g., gmail.com, yahoo.com, etc.)",
    ],
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, "Phone number must be exactly 10 digits"], // Ensure exactly 10 digits
  },
  subject: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Contact", contactSchema);
