const InvestmentPreference = require("../model/InvestmentPreferences");
const nodemailer = require("nodemailer");

const saveInvestmentPreference = async (req, res) => {
  const {
    investmentPlan,
    investmentAmount,
    investmentTenure,
    nomineeName,
    relationshipWithNominee
  } = req.body;

  // Manual validation
  const validPlans = ['Quarterly Compounding', 'Tree Family Plan', 'Systematic Investment'];

  if (!investmentPlan || !investmentAmount || !investmentTenure || !nomineeName || !relationshipWithNominee) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (!validPlans.includes(investmentPlan)) {
    return res.status(400).json({ error: "Invalid investment plan selected" });
  }

  if (investmentAmount < 10000) {
    return res.status(400).json({ error: "Minimum investment amount is ₹10,000" });
  }

  try {
    const newPreference = new InvestmentPreference({
      investmentPlan,
      investmentAmount,
      investmentTenure,
      nomineeName,
      relationshipWithNominee
    });

    await newPreference.save();

    // Email the submitted details to admin
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const html = `
        <h3>New Investment Preference Submitted</h3>
        <p><strong>Investment Plan:</strong> ${investmentPlan}</p>
        <p><strong>Investment Amount:</strong> ₹${investmentAmount}</p>
        <p><strong>Investment Tenure:</strong> ${investmentTenure}</p>
        <p><strong>Nominee Name:</strong> ${nomineeName}</p>
        <p><strong>Relationship with Nominee:</strong> ${relationshipWithNominee}</p>
      `;

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New Investment Preference: ${investmentPlan}`,
        html,
      });

    } catch (emailError) {
      console.error("Error sending investment email to admin:", emailError.message);
    }

    res.status(201).json({
      message: "Investment preferences saved successfully",
      data: newPreference,
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message,
    });
  }
};

module.exports = { saveInvestmentPreference };
