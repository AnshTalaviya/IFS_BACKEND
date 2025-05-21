const nodemailer = require('nodemailer');

const sendFormDetailsToAdmin = async (formData) => {
  try {
    const {
      fullName, dob, pan, email, mobile,
      address, city, state, pincode
    } = formData;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const adminEmail = process.env.ADMIN_EMAIL;

    const html = `
      <h3>New Personal Details Submitted</h3>
      <p><strong>Full Name:</strong> ${fullName}</p>
      <p><strong>DOB:</strong> ${dob}</p>
      <p><strong>PAN:</strong> ${pan}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>
      <p><strong>Address:</strong> ${address}, ${city}, ${state} - ${pincode}</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `New Form Submission: ${fullName}`,
      html,
    });

    console.log('Email sent to admin');
  } catch (error) {
    console.error('Error sending email to admin:', error.message);
  }
};


module.exports = sendFormDetailsToAdmin;
