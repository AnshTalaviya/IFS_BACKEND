const express = require("express");
const router = express.Router();
const contactController = require("../controller/contactController");

// Access the function inside the object
router.post("/contact", contactController.submitForm);

module.exports = router;
