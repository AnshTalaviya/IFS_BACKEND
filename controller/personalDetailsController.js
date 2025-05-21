const PersonalDetails = require('../model/PersonalDetails');
const sendFormDetailsToAdmin = require('../utils/sendFormDetailsToAdmin');

exports.savePersonalDetails = async (req, res) => {
  const {
    fullName, dob, pan, email, mobile,
    address, city, state, pincode
  } = req.body;

  // Manual validation
  if (!fullName || !dob || !pan || !email || !mobile) {
    return res.status(400).json({ error: "Please fill all required fields." });
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const mobileRegex = /^\+91\s?[0-9]{10}$/;
  const emailRegex = /^\S+@\S+\.\S+$/;

  if (!panRegex.test(pan)) {
    return res.status(400).json({ error: "Invalid PAN format." });
  }

  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({ error: "Invalid mobile number format." });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  try {
    // Save user details in the database
    const details = new PersonalDetails(req.body);
    await details.save();

    // Log details to ensure the flow
    // console.log('Personal details saved:', req.body);

    // Send the form details to the admin via email
    console.log('Sending form details to admin:', req.body);
    await sendFormDetailsToAdmin(req.body);

    res.status(201).json({ message: 'Personal details saved successfully', data: details });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};
