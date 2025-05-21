const express = require('express');
const router = express.Router();
const { savePersonalDetails } = require('../controller/personalDetailsController');

router.post('/personal-details', savePersonalDetails);

module.exports = router;