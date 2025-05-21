// completeFormRoutes.js
const express = require("express");
const { submitCompleteForm } = require("../controller/completeFormController");
const upload = require("../middleware/kycUpload");
const router = express.Router();

// Multer fields for idProof and addressProof
router.post(
  "/submit-complete-form",
  upload.fields([
    { name: "idProof", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
  ]),
  submitCompleteForm
);

module.exports = router;
