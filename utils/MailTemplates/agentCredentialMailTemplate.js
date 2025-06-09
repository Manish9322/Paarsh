export const agentCredentialsMail = (firstName, agentCode, email, randomPassword, resetUrl) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Your Agent Account</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      background-color: #f8fafc;
      color: #333;
      padding: 20px 0;
    }
    
    .email-wrapper {
      width: 100%;
      max-width: 650px;
      margin: 0 auto;
    }
    
    .container {
      background: #ffffff;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
    }
    
    .container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
    }
    
    .header {
      text-align: center;
      margin-bottom: 35px;
    }
    
    .welcome-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      margin-bottom: 20px;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
    
    h2 {
      color: #2d3748;
      font-size: 28px;
      margin: 0;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    
    .subtitle {
      font-size: 16px;
      color: #718096;
      margin: 8px 0 0 0;
      font-weight: 400;
    }
    
    .credential-label {
      color: #4a5568;
      font-weight: 600;
      font-size: 16px;
    }
    
    .credential-value {
      color: #667eea;
      font-weight: 700;
      font-size: 16px;
      background: #edf2f7;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', monospace;
      margin-left: 8px;
    }
    
    .main-content {
      text-align: center;
      margin: 30px 0;
    }
    
    .main-text {
      font-size: 16px;
      line-height: 1.6;
      color: #4a5568;
      margin: 0 0 25px 0;
    }
    
    .btn {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
    }
    
    .security-notice {
      background: #fff5f5;
      border-left: 4px solid #f56565;
      padding: 16px 20px;
      margin: 25px 0;
      border-radius: 0 8px 8px 0;
    }
    
    .security-notice p {
      margin: 0;
      color: #742a2a;
      font-size: 14px;
      font-weight: 500;
    }
    
    .support-section {
      text-align: center;
      margin-top: 35px;
      padding-top: 25px;
      border-top: 1px solid #e2e8f0;
    }
    
    .support {
      color: #718096;
      font-size: 14px;
      margin: 0;
    }
    
    .support a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;
    }
    
    .support a:hover {
      color: #764ba2;
    }
    
    .footer {
      text-align: center;
      font-size: 12px;
      color: #a0aec0;
      margin-top: 20px;
      padding-top: 15px;
      border-top: 1px solid #f1f5f9;
    }
    
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 10px;
      }
      
      .container {
        padding: 25px 20px;
        border-radius: 12px;
      }
      
      .welcome-icon {
        width: 60px;
        height: 60px;
        font-size: 28px;
      }
      
      h2 {
        font-size: 24px;
      }
      
      .subtitle {
        font-size: 14px;
      }
      
      .credentials-section {
        padding: 20px 15px;
      }
      
      .credential-row {
        flex-direction: column;
        text-align: center;
        gap: 8px;
      }
      
      .credential-value {
        font-size: 14px;
        word-break: break-all;
      }
      
      .btn {
        width: 100%;
        box-sizing: border-box;
        font-size: 14px;
        padding: 14px 20px;
      }
      
      .main-text {
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="container">
      <div class="header">
        <div class="welcome-icon">🎉</div>
        <h2>Welcome, ${firstName}!</h2>
        <p class="subtitle">Your agent account is ready to go</p>
      </div>
      
      <div class="main-content">
        <p class="main-text">We're excited to have you as part of the Paarsh Edu family! Your agent account has been successfully created and is ready for you to explore.</p>
        
        <p class="main-text">Here are your login credentials to access your account:</p>
        <p class="main-text"><span class="credential-label">Email Address:</span> <span class="credential-value">${email}</span></p>
        <p class="main-text"><span class="credential-label">Agent Code:</span> <span class="credential-value">${agentCode}</span></p>
        <p class="main-text"><span class="credential-label">Temporary Password:</span> <span class="credential-value">${randomPassword}</span></p>
        
        <p class="main-text">🔒 <strong>Important:</strong> For your account security, please change your temporary password immediately after logging in. This helps protect your account and personal information.</p>
        
        <p class="main-text">Once you've secured your account with your personalized password, you'll have access to all the tools and resources you need to succeed as an agent with us.</p>
        
        <a href="${resetUrl}" class="btn">Set Up Your Password</a>
      </div>
      
      <div class="support-section">
        <p class="support">Questions about getting started? Our dedicated support team is available to help you every step of the way.<br>
        Don't hesitate to reach out at <a href="mailto:support@paarshedu.com">support@paarshedu.com</a> - we're here to ensure your success!</p>
      </div>
      
      <div class="footer">
        <p>© 2025 Paarsh Edu. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
};