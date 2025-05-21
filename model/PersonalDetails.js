const mongoose = require('mongoose');

const personalDetailsSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  dob: { type: Date, required: true },
  pan: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PersonalDetails', personalDetailsSchema);
