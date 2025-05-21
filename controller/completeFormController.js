const PersonalDetails = require("../model/PersonalDetails");
const InvestmentPreference = require("../model/InvestmentPreferences");
const KYC = require("../model/kycModel");
const nodemailer = require("nodemailer");

exports.submitCompleteForm = async (req, res) => {
  try {
    const { personalDetails, investmentPreferences, kycDetails } = req.body;

    if (!personalDetails || !investmentPreferences || !kycDetails) {
      return res.status(400).json({ error: "Please provide all three sections data." });
    }

    // Parse JSON strings if coming from multipart/form-data
    const personal = typeof personalDetails === "string" ? JSON.parse(personalDetails) : personalDetails;
    const invest = typeof investmentPreferences === "string" ? JSON.parse(investmentPreferences) : investmentPreferences;
    const kyc = typeof kycDetails === "string" ? JSON.parse(kycDetails) : kycDetails;

    // === VALIDATIONS ===
    const { fullName, dob, pan, mobile } = personal;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const mobileRegex = /^[0-9]{10}$/;
    if (!fullName || !dob || !pan || !mobile) {
      return res.status(400).json({ error: "Missing required personal details fields." });
    }
    if (!panRegex.test(pan)) return res.status(400).json({ error: "Invalid PAN format." });
    if (!mobileRegex.test(mobile)) return res.status(400).json({ error: "Invalid mobile number." });

    const { investmentPlan, investmentAmount, investmentTenure, nomineeName, relationshipWithNominee } = invest;
    const validPlans = ['Quarterly Compounding', 'Tree Family Plan', 'Systematic Investment'];
    if (!investmentPlan || !investmentAmount || !investmentTenure || !nomineeName || !relationshipWithNominee) {
      return res.status(400).json({ error: "Missing required investment preference fields." });
    }
    if (!validPlans.includes(investmentPlan)) return res.status(400).json({ error: "Invalid investment plan." });
    if (investmentAmount < 10000) return res.status(400).json({ error: "Minimum investment is ₹10,000." });

    const { accountNumber, confirmAccountNumber, ifscCode, accountType } = kyc;
    if (!accountNumber || !confirmAccountNumber || !ifscCode || !accountType) {
      return res.status(400).json({ error: "Missing required KYC fields." });
    }
    if (accountNumber !== confirmAccountNumber) {
      return res.status(400).json({ error: "Account numbers do not match." });
    }
    if (!/^([A-Z]{4})(\d{7})$/.test(ifscCode)) {
      return res.status(400).json({ error: "Invalid IFSC code format." });
    }

    // === FILES ===
    const idProofFile = req.files?.idProof?.[0];
    const addressProofFile = req.files?.addressProof?.[0];

    if (!idProofFile || !addressProofFile) {
      return res.status(400).json({ error: "Both ID proof and Address proof files are required." });
    }

    // Add filenames to kycDetails
    kyc.idProof = idProofFile.filename;
    kyc.addressProof = addressProofFile.filename;

    // === SAVE TO DB ===
    const personalDoc = new PersonalDetails(personal);
    const investDoc = new InvestmentPreference(invest);
    const kycDoc = new KYC(kyc);

    try {
      await Promise.all([
        personalDoc.save().catch(err => { throw new Error("PersonalDetails Save Failed: " + err.message) }),
        investDoc.save().catch(err => { throw new Error("InvestmentPreference Save Failed: " + err.message) }),
        kycDoc.save().catch(err => { throw new Error("KYC Save Failed: " + err.message) }),
      ]);
    } catch (saveError) {
      console.error("❌ Error saving data:", saveError.message);
      return res.status(500).json({ error: "Failed to save form data", details: saveError.message });
    }

    // === SEND EMAIL TO ADMIN ===
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
  subject: `New User Submission: ${personal.fullName}`,
  
  // Email me text format me details
  text: `
New form submitted with details:

--- Personal Details ---
Full Name: ${personal.fullName}
Date of Birth: ${personal.dob}
PAN: ${personal.pan}
Mobile: ${personal.mobile}
Address: ${personal.address || "N/A"}
Email: ${personal.email || "N/A"}
City: ${personal.city || "N/A"}
State: ${personal.state || "N/A"}
Pincode: ${personal.pincode || "N/A"}

--- Investment Preferences ---
Investment Plan: ${invest.investmentPlan}
Investment Amount: ₹${invest.investmentAmount}
Investment Tenure: ${invest.investmentTenure}
Nominee Name: ${invest.nomineeName}
Relationship with Nominee: ${invest.relationshipWithNominee}

--- KYC Details ---
Account Number: ${kyc.accountNumber}
IFSC Code: ${kyc.ifscCode}
Account Type: ${kyc.accountType}
ID Proof File: ${kyc.idProof}
Address Proof File: ${kyc.addressProof}
  `,

  // Attach images as files
  attachments: [
    {
      filename: kyc.idProof,
      path: `uploads/${kyc.idProof}` // example path, adjust as per your folder
    },
    {
      filename: kyc.addressProof,
      path: `uploads/${kyc.addressProof}`
    }
  ]
};
  

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: "All data saved and email sent successfully." });
  } catch (error) {
    console.error("Complete Form Submission Error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
