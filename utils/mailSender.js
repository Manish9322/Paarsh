const nodemailer = require("nodemailer");
const { EMAIL_FROM, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } = require("../config/config");

const emailSender = async (options) => {
  try {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Compose email message
    const message = {
      from: EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    console.log("Sending email to:", options.email); // Debugging

    // Send email
    await transporter.sendMail(message);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = emailSender;
