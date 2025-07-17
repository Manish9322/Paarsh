 const pushNotificationEmail = (message, username) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media only screen and (max-width: 600px) {
      .container { padding: 15px !important; }
      .header { font-size: 22px !important; }
      .message-box { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 20px; font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; min-height: 100vh;">
  
  <div class="container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden;">
    
    <!-- Header -->
    <div style="background: #2c3e50; color: white; padding: 30px; text-align: center;">
      <div style="background: rgba(255,255,255,0.1); border-radius: 50%; width: 60px; height: 60px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 24px;">📩</span>
      </div>
      <h1 class="header" style="margin: 0; font-size: 26px; font-weight: 600;">New Message</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px;">
      <p style="color: #333; font-size: 18px; margin: 0 0 25px 0; font-weight: 500;">Hello ${username}! 👋</p>
      
      <div class="message-box" style="background: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #2c3e50; position: relative; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="position: absolute; top: 15px; right: 15px; background: #6c757d; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: 500;">
          ${new Date().toLocaleDateString()}
        </div>
        <p style="color: #2d3748; font-size: 16px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
      </div>
      
      <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 6px; border: 1px solid #dee2e6;">
        <p style="color: #495057; font-size: 14px; margin: 0; text-align: center;">
          <strong>Questions?</strong> Contact us at 
          <a href="mailto:support@paarshedu.com" style="color: #2c3e50; text-decoration: none; font-weight: 500;">support@paarshedu.com</a>
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef;">
      <p style="color: #6c757d; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">
        Best regards,<br>
        <span style="color: #2c3e50; font-weight: 600;">Paarsh Edu Team</span>
      </p>
      <p style="color: #adb5bd; font-size: 12px; margin: 0;">© 2025 Paarsh Edu. All rights reserved.</p>
    </div>
    
  </div>
  
</body>
</html>
`
};

export default pushNotificationEmail;