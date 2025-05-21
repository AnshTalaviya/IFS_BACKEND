const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { saveInvestmentPreference } = require("../controller/investmentPreferencesController");

router.post("/", auth, saveInvestmentPreference);

module.exports = router;
