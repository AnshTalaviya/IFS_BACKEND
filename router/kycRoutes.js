const express = require("express");
const router = express.Router();
const upload = require("../middleware/kycUpload"); // Import multer setup
const kycController = require("../controller/kycController"); // Your controller

// Route to handle KYC submission
router.post(
  "/submit",
  upload.fields([
    { name: "idProof", Count: 1 }, 
    { name: "addressProof", Count: 1 }, 
  ]),
  kycController.submitKYC 
);

module.exports = router;