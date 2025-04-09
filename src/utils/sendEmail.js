require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, text) {
  try {
    const info = await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("✅ Email Sent!");
    console.log("📬 Accepted:", info.accepted);
    console.log("📭 Rejected:", info.rejected);
    console.log("📨 Message ID:", info.messageId);
    console.log("📨 Server Response:", info.response);
  } catch (error) {
    console.error("❌ Email sending failed:");
    console.error(error);
  }
}

module.exports = sendEmail;
