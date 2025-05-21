const nodemailer = require('nodemailer');
const Contact = require('../model/ContactModel');

// Extracted email logic into helper
const sendEmailToAdmin = async ({ name, email, phone, subject, message }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `Contact Form: ${subject}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong> ${message}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Main form submission handler
exports.submitForm = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !phone || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newContact = new Contact({ name, email, phone, subject, message });
    await newContact.save();

    await sendEmailToAdmin({ name, email, phone, subject, message });

    res.status(200).json({ message: "Form submitted successfully. Details sent to admin." });
  } catch (error) {
    console.error("Error submitting form:", error.message);
    res.status(500).json({ message: "Internal server error. Please try again." });
  }
};
