const PersonalDetails = require('../model/PersonalDetails');
const nodemailer = require('nodemailer');

exports.savePersonalDetails = async (req, res) => {
  const {
    fullName, dob, pan, email, mobile,
    address, city, state, pincode
  } = req.body;

  if (!fullName || !dob || !pan || !email || !mobile) {
    return res.status(400).json({ error: "Please fill all required fields." });
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const mobileRegex =/^[0-9]{10}$/;
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
    const details = new PersonalDetails(req.body);
    await details.save();

    // ✅ Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "✅ Personal Details Submitted",
      text: `
🎉 Thank you for submitting your personal details!

👤 Name: ${fullName}
📅 Date of Birth: ${new Date(dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
🆔 PAN: ${pan}
📧 Email: ${email}
📱 Mobile: ${mobile}
🏠 Address: ${address || '-'}
🏙 City: ${city || '-'}
🌆 State: ${state || '-'}
📮 Pincode: ${pincode || '-'}
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Personal details saved and emailed successfully', data: details });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};