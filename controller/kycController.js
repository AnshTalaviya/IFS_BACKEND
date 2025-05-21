const KYC = require("../model/kycModel");

exports.submitKYC = async (req, res) => {
  try {
    const {
      accountNumber,
      confirmAccountNumber,
      ifscCode,
      accountType,
    } = req.body;

    // Account number match check
    if (accountNumber !== confirmAccountNumber) {
      return res.status(400).json({ error: "Account numbers do not match." });
    }

    // Length check based on bank format
    const accountNumberLength = accountNumber.length;
    if (
      (accountNumber.startsWith("SBI") && accountNumberLength !== 11) ||
      (accountNumber.startsWith("HDFC") && accountNumberLength !== 14) ||
      (accountNumber.startsWith("ICICI") && accountNumberLength !== 12) ||
      (accountNumber.startsWith("AXIS") && accountNumberLength !== 15) ||
      (accountNumberLength < 9 || accountNumberLength > 18)
    ) {
      return res.status(400).json({
        error: "Account number length is invalid for the provided bank.",
      });
    }

    // IFSC Code Validation
    if (!/^([A-Z]{4})(\d{7})$/.test(ifscCode)) {
      return res.status(400).json({
        error: "Invalid IFSC code format. Ensure it's in uppercase.",
      });
    }

    // Convert IFSC code to uppercase for consistency
    const formattedIfscCode = ifscCode.toUpperCase();

    // File check
    const idProof = req.files?.idProof?.[0]?.filename;
    const addressProof = req.files?.addressProof?.[0]?.filename;

    if (!idProof || !addressProof) {
      return res.status(400).json({ error: "Both ID and Address proof are required." });
    }

    // Create new KYC document
    const newKYC = new KYC({
      accountNumber,
      confirmAccountNumber,
      ifscCode: formattedIfscCode,
      accountType,
      idProof,
      addressProof,
    });

    await newKYC.save();
    res.status(200).json({ message: "KYC Submitted Successfully!" });

  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(", ") });
    }

    console.error("KYC Submit Error:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
};
