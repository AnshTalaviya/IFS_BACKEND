const mongoose = require('mongoose');

const investmentPreferencesSchema = new mongoose.Schema({
  investmentPlan: {
    type: String,
    enum: ['Quarterly Compounding', 'Tree Family Plan', 'Systematic Investment'],
    required: true
  },
  investmentAmount: {
    type: Number,
    required: true,
    min: 10000
  },
  investmentTenure: {
    type: String,
    required: true
  },
  nomineeName: {
    type: String
  },
  relationshipWithNominee: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('InvestmentPreferences', investmentPreferencesSchema);
