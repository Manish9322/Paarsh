const nodemailer = require("nodemailer");
const { EMAIL_FROM, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER } = require("../config/config");

const emailSender = async (options) => {
  try {
    // Validate required options
    if (!options.email || !options.subject || !options.message) {
      throw new Error("Missing required email options: email, subject, or message");
    }

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT == 465, // Use secure connection for port 465
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      // Add additional options for better reliability
      tls: {
        rejectUnauthorized: false // Only use this for development/testing
      }
    });

    // Verify transporter configuration
    await transporter.verify();

    // Compose email message
    const message = {
      from: EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    console.log(`📧 [${new Date().toISOString()}] Sending email to: ${options.email}`);

    // Send email
    const info = await transporter.sendMail(message);
    
    console.log(`✅ [${new Date().toISOString()}] Email sent successfully to ${options.email}. Message ID: ${info.messageId}`);
    
    // Return success object that your worker expects
    return {
      success: true,
      messageId: info.messageId,
      email: options.email
    };

  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] Error sending email to ${options.email}:`, error.message);
    
    // Return error object that your worker expects
    return {
      success: false,
      error: error.message,
      email: options.email
    };
  }
};

// Test function to verify SMTP configuration
const testEmailConfig = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT == 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();
    console.log("✅ SMTP configuration is valid");
    return true;
  } catch (error) {
    console.error("❌ SMTP configuration error:", error.message);
    return false;
  }
};

export default emailSender;
export  { testEmailConfig };