const InvestmentPreference = require("../model/InvestmentPreferences");

const saveInvestmentPreference = async (req, res) => {
  const { investmentPlan, investmentAmount, investmentTenure, nomineeName, relationshipWithNominee } = req.body;

  // Check if all required fields are provided
  if (!investmentPlan || !investmentAmount || !investmentTenure || !nomineeName || !relationshipWithNominee) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Validate the investment plan
  const validPlans = ['Quarterly Compounding', 'Tree Family Plan', 'Systematic Investment'];
  if (!validPlans.includes(investmentPlan)) {
    return res.status(400).json({ error: "Invalid investment plan selected" });
  }

  // Validate the minimum investment amount
  if (investmentAmount < 10000) {
    return res.status(400).json({ error: "Minimum investment amount is ₹10,000" });
  }

  try {
    // Save investment preference in the database
    const newPreference = new InvestmentPreference({
      investmentPlan,
      investmentAmount,
      investmentTenure,
      nomineeName,
      relationshipWithNominee
    });

    await newPreference.save();

    res.status(201).json({ message: "Investment preferences saved successfully", data: newPreference });

  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

module.exports = { saveInvestmentPreference };
