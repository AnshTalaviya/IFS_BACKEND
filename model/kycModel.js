const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
  accountNumber: { type: String, required: true },
  confirmAccountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  accountType: { type: String, enum: ["Savings", "Current"], required: true },
  idProof: { type: String, required: true },
  addressProof: { type: String, required: true },
});

module.exports = mongoose.model("KYC", kycSchema);
