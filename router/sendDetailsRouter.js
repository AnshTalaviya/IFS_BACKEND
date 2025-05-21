const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const PersonalDetails = require("../model/PersonalDetails");
const InvestmentPreference = require("../model/InvestmentPreferences");
const KYC = require("../model/kycModel");

router.post("/send-details", async (req, res) => {
  const userEmail = req.body.email;

  if (!userEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const personal = await PersonalDetails.findOne({ email: userEmail });
    const invest = await InvestmentPreference.findOne({ email: userEmail });
    const kyc = await KYC.findOne({ email: userEmail });

    if (!personal || !invest || !kyc) {
      return res.status(404).json({ error: "User data incomplete or not found" });
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

 const mailOptions = {
  from: process.env.EMAIL_USER,
  to: process.env.ADMIN_EMAIL,
  subject: "New Investment Form Submission",
  text: `
========= PERSONAL DETAILS =========
Full Name             : ${personal.fullName}
Date of Birth         : ${personal.dob}
PAN                   : ${personal.pan}
Email                 : ${personal.email}
Mobile                : ${personal.mobile}
Address               : ${personal.address || "N/A"}
City                  : ${personal.city || "N/A"}
State                 : ${personal.state || "N/A"}
Pincode               : ${personal.pincode || "N/A"}

======= INVESTMENT PREFERENCES =======
Investment Plan       : ${invest.investmentPlan}
Investment Amount     : ₹${invest.investmentAmount}
Investment Tenure     : ${invest.investmentTenure}
Nominee Name          : ${invest.nomineeName || "N/A"}
Relationship with Nominee : ${invest.relationshipWithNominee || "N/A"}

============== KYC DETAILS ==============
Account Number        : ${kyc.accountNumber}
Confirm Account No.   : ${kyc.confirmAccountNumber}
IFSC Code             : ${kyc.ifscCode}
Account Type          : ${kyc.accountType}
ID Proof File         : ${kyc.idProof}
Address Proof File    : ${kyc.addressProof}
  `,
};



    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Details sent to admin successfully." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Server error while sending email" });
  }
});

module.exports = router;
