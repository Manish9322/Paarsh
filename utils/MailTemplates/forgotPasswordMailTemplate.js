export const resetPassword = (otp, username) => {
   return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forgot Password OTP</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { padding: 20px !important; }
      .otp-box { font-size: 22px !important; }
      .btn { padding: 12px 24px !important; font-size: 14px !important; width: 100% !important; }
      .header h1 { font-size: 20px !important; }
      .content h2 { font-size: 18px !important; margin-bottom: 15px !important; }
      .content p { font-size: 14px !important; }
      .copy-icon { width: 20px !important; height: 20px !important; }
      .greeting { font-size: 16px !important; }
      .info-card { margin-bottom: 20px !important; }
      .steps-grid { flex-direction: column !important; }
      .step-item { margin-bottom: 15px !important; }
    }
    @media only screen and (max-width: 400px) {
      .container { padding: 15px !important; }
      .header h1 { font-size: 18px !important; }
      .otp-box { font-size: 20px !important; }
      .content p { font-size: 13px !important; }
      .greeting { font-size: 14px !important; }
      .copy-icon { width: 18px !important; height: 18px !important; }
    }
    .floating-animation {
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    .pulse-animation {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .fade-in {
      animation: fadeIn 0.8s ease-in;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .icon-fallback {
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      font-weight: bold;
      color: white;
      font-size: 14px;
    }
    .step-number {
      background: #007bff;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: inline-block;
      text-align: center;
      line-height: 28px;
      font-weight: 600;
      font-size: 14px;
      margin-right: 15px;
      vertical-align: top;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background: linear-gradient(135deg, #f8f9fa, #e9ecef); min-height: 100vh;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; box-shadow: 0 15px 40px rgba(0,0,0,0.1); overflow: hidden;">
    
    <!-- Decorative Top Border -->
    <tr>
      <td style="height: 6px; background: linear-gradient(90deg, #007bff, #0056b3, #007bff);"></td>
    </tr>
    
    <!-- Header -->
    <tr>
      <td class="header" style="padding: 40px 0; text-align: center; background: linear-gradient(135deg, #007bff, #0056b3);">
        <!-- Lock Icon using Unicode Character -->
        <div class="floating-animation" style="margin-bottom: 20px;">
          <div style="background: rgba(255,255,255,0.15); border-radius: 50%; padding: 20px; border: 3px solid rgba(255,255,255,0.2); display: inline-block;">
            <span style="font-size: 32px; color: white;">🔒</span>
          </div>
        </div>
        
        <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">Password Reset Request</h1>
        <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 8px 0 0 0; font-weight: 400;">Secure verification code inside</p>
      </td>
    </tr>
    
    <!-- Personalized Greeting -->
    <tr>
      <td class="container fade-in" style="padding: 40px 40px 20px 40px;">
        <div class="greeting" style="background: linear-gradient(135deg, #f8f9ff, #ffffff); padding: 25px; border-radius: 15px; border-left: 5px solid #007bff;">
          <h3 style="color: #212529; font-size: 20px; margin: 0 0 12px 0; font-weight: 600;">Hello ${username}! 👋</h3>
          <p style="color: #495057; font-size: 16px; margin: 0; line-height: 1.6;">
            We received a request to reset your password. Don't worry – this happens to the best of us! 
            We've generated a secure verification code to help you regain access to your account safely.
          </p>
        </div>
      </td>
    </tr>
    
    <!-- Main Content -->
    <tr>
      <td class="container" style="padding: 20px 40px 30px 40px; text-align: center;">
        
        <h2 style="color: #212529; font-size: 22px; margin-bottom: 15px; font-weight: 600;">Your Verification Code</h2>
        <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 30px; max-width: 400px; margin-left: auto; margin-right: auto;">
          Enter this 6-digit code on the password reset page to continue. The code is valid for 5 minutes only.
        </p>
        
        <!-- OTP Section with Enhanced Design -->
        <div style="background: linear-gradient(135deg, #f8f9ff, #e8f0ff); padding: 35px; border-radius: 18px; margin: 30px 0; border: 2px solid #cce7ff; box-shadow: 0 8px 25px rgba(0,123,255,0.1);">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <!-- Key Icon using Unicode -->
            <span style="font-size: 24px; margin-right: 15px; opacity: 0.8;">🔑</span>
            
            <span id="otp" class="otp-box pulse-animation" style="color: #007bff; font-size: 32px; font-weight: 800; letter-spacing: 4px; font-family: 'Courier New', monospace;">${otp}</span>
            
            <!-- Copy Icon using Unicode -->
            <span style="font-size: 20px; margin-left: 15px; cursor: pointer; padding: 6px; border-radius: 6px; opacity: 0.7;">📋</span>
          </div>
          
          <div style="display: flex; align-items: center; justify-content: center; color: #6c757d; margin-bottom: 15px;">
            <span style="font-size: 16px; margin-right: 8px; color: #dc3545;">⏰</span>
            <span style="font-size: 14px; font-weight: 500;">Code expires in 5 minutes</span>
          </div>
          
          <p style="color: #6c757d; font-size: 13px; margin: 0; font-style: italic;">
            Copy the code above and paste it on the reset page
          </p>
        </div>
        
        <!-- How to Use Steps -->
        <div style="background: #f8f9fa; padding: 30px; border-radius: 15px; margin: 30px 0; text-align: left;">
          <h3 style="color: #212529; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; text-align: center;">How to Reset Your Password</h3>
          
          <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding: 10px; vertical-align: top;">
                <div style="display: flex; align-items: flex-start;">
                  <span class="step-number">1</span>
                  <div>
                    <h4 style="color: #212529; font-size: 15px; margin: 0 0 6px 0; font-weight: 600;">Go to Reset Page</h4>
                    <p style="color: #6c757d; font-size: 13px; margin: 0; line-height: 1.4;">Return to the password reset page where you started this process.</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; vertical-align: top;">
                <div style="display: flex; align-items: flex-start;">
                  <span class="step-number">2</span>
                  <div>
                    <h4 style="color: #212529; font-size: 15px; margin: 0 0 6px 0; font-weight: 600;">Enter OTP Code</h4>
                    <p style="color: #6c757d; font-size: 13px; margin: 0; line-height: 1.4;">Copy and paste the 6-digit code from above into the verification field.</p>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px; vertical-align: top;">
                <div style="display: flex; align-items: flex-start;">
                  <span class="step-number">3</span>
                  <div>
                    <h4 style="color: #212529; font-size: 15px; margin: 0 0 6px 0; font-weight: 600;">Create New Password</h4>
                    <p style="color: #6c757d; font-size: 13px; margin: 0; line-height: 1.4;">Choose a strong, unique password for your account security.</p>
                  </div>
                </div>
              </td>
            </tr>
          </table>
        </div>
        
        <!-- Security Tips -->
        <div class="info-card" style="background: linear-gradient(135deg, #e8f5e8, #f8fff8); padding: 25px; border-radius: 15px; margin: 30px 0; border-left: 5px solid #28a745; text-align: left;">
          <div style="display: flex; align-items: flex-start;">
            <span style="font-size: 24px; margin-right: 15px; margin-top: 2px;">✅</span>
            <div>
              <h4 style="color: #155724; font-size: 16px; margin: 0 0 10px 0; font-weight: 600;">Password Security Tips</h4>
              <ul style="color: #155724; font-size: 14px; margin: 0; padding-left: 18px; line-height: 1.6;">
                <li>Use a combination of uppercase, lowercase, numbers, and symbols</li>
                <li>Make it at least 8 characters long</li>
                <li>Avoid using personal information or common words</li>
                <li>Consider using a password manager for better security</li>
              </ul>
            </div>
          </div>
        </div>
      </td>
    </tr>
    
    <!-- Warning Section -->
    <tr>
      <td style="padding: 0 40px 30px 40px;">
        <div style="background: linear-gradient(135deg, #fff3cd, #ffeaa7); padding: 20px; border-radius: 12px; border-left: 5px solid #ffc107;">
          <div style="display: flex; align-items: flex-start;">
            <span style="font-size: 24px; margin-right: 15px; margin-top: 2px;">⚠️</span>
            <div>
              <h4 style="color: #856404; font-size: 16px; margin: 0 0 8px 0; font-weight: 600;">Important Security Notice</h4>
              <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                If you didn't request this password reset, please ignore this email and ensure your account remains secure. 
                Your password will not be changed unless you complete the reset process using this verification code.
              </p>
            </div>
          </div>
        </div>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); padding: 30px; text-align: center; border-bottom-left-radius: 20px; border-bottom-right-radius: 20px;">
        <div style="margin-bottom: 20px;">
          <div style="background: linear-gradient(135deg, #007bff, #0056b3); border-radius: 50%; padding: 12px; display: inline-block;">
            <span style="font-size: 20px; color: white;">❓</span>
          </div>
        </div>
        <h4 style="color: #495057; font-size: 16px; margin: 0 0 12px 0; font-weight: 600;">Need Help?</h4>
        <p style="color: #6c757d; font-size: 14px; margin: 0 0 15px 0; line-height: 1.5;">
          If you're having trouble with the password reset process, our support team is here to help you 24/7.
        </p>
        <p style="color: #6c757d; font-size: 14px; margin: 0 0 20px 0;">
          Contact us at <a href="mailto:support@paarshedu.com" style="color: #007bff; text-decoration: none; font-weight: 600;">support@paarshedu.com</a>
        </p>
        <p style="color: #adb5bd; font-size: 12px; margin: 0;">© 2025 Paarsh Edu. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};