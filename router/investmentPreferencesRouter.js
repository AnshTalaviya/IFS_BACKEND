const express = require("express");
const router = express.Router();
const { saveInvestmentPreference } = require("../controller/investmentPreferencesController");

router.post("/", saveInvestmentPreference);

module.exports = router;
