// Email template functions for MingleX

const getEmailHeader = () => `
  <div style="background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 40px 20px; text-align: center;">
    <div style="background: white; width: 80px; height: 80px; margin: 0 auto 20px; border-radius: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
      <h1 style="margin: 0; font-size: 36px; font-weight: bold; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">MX</h1>
    </div>
    <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">MingleX</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Connect, Chat, and Share</p>
  </div>
`;

const getEmailFooter = () => `
  <div style="background: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
      This email was sent by <strong style="color: #6366f1;">MingleX</strong>
    </p>
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
      If you didn't request this email, you can safely ignore it.
    </p>
    <div style="margin-top: 20px;">
      <a href="#" style="color: #6366f1; text-decoration: none; margin: 0 10px; font-size: 12px;">Privacy Policy</a>
      <span style="color: #d1d5db;">•</span>
      <a href="#" style="color: #6366f1; text-decoration: none; margin: 0 10px; font-size: 12px;">Terms of Service</a>
      <span style="color: #d1d5db;">•</span>
      <a href="#" style="color: #6366f1; text-decoration: none; margin: 0 10px; font-size: 12px;">Contact Us</a>
    </div>
  </div>
`;

const getEmailWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MingleX</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f3f4f6;
    }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td>
              ${getEmailHeader()}
              ${content}
              ${getEmailFooter()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Verification Email Template
exports.getVerificationEmail = (verificationCode, userName = 'there') => {
    const content = `
    <div style="padding: 40px 30px; text-align: center;">
      <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); width: 100px; height: 100px; margin: 0 auto 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15L12 12M12 9L12.01 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      
      <h2 style="color: #111827; font-size: 28px; font-weight: 700; margin: 0 0 15px 0;">
        Welcome to MingleX! 🎉
      </h2>
      
      <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Hi <strong style="color: #374151;">${userName}</strong>, we're excited to have you on board!<br/>
        Please verify your email address to get started.
      </p>
      
      <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; padding: 30px; margin: 0 0 30px 0;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
          Your Verification Code
        </p>
        <div style="background: white; border: 2px dashed #6366f1; border-radius: 8px; padding: 20px; margin: 0 auto; max-width: 250px;">
          <p style="font-size: 36px; font-weight: 700; color: #6366f1; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
            ${verificationCode}
          </p>
        </div>
        <p style="color: #9ca3af; font-size: 13px; margin: 15px 0 0 0;">
          This code will expire in <strong>10 minutes</strong>
        </p>
      </div>
      
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; text-align: left; margin: 0 0 20px 0;">
        <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
          <strong>Security Tip:</strong> Never share this code with anyone. MingleX will never ask for your verification code via email or phone.
        </p>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
        Once verified, you'll be able to connect with friends, share moments, and enjoy seamless conversations!
      </p>
    </div>
  `;

    return getEmailWrapper(content);
};

// Welcome Email Template (after verification)
exports.getWelcomeEmail = (userName) => {
    const content = `
    <div style="padding: 40px 30px; text-align: center;">
      <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); width: 100px; height: 100px; margin: 0 auto 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      
      <h2 style="color: #111827; font-size: 28px; font-weight: 700; margin: 0 0 15px 0;">
        You're All Set, ${userName}! ✨
      </h2>
      
      <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Your account has been successfully verified. Welcome to the MingleX community!
      </p>
      
      <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border-radius: 12px; padding: 30px; margin: 0 0 30px 0; text-align: left;">
        <h3 style="color: #6366f1; font-size: 20px; font-weight: 600; margin: 0 0 20px 0;">
          🚀 Get Started:
        </h3>
        <ul style="color: #4b5563; font-size: 15px; line-height: 2; margin: 0; padding-left: 20px;">
          <li>Add friends and start conversations</li>
          <li>Share photos, videos, and files</li>
          <li>Use emojis and voice messages</li>
          <li>See who's online in real-time</li>
        </ul>
      </div>
      
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); transition: transform 0.2s;">
        Open MingleX
      </a>
      
      <p style="color: #9ca3af; font-size: 13px; margin: 30px 0 0 0;">
        Need help? Check out our <a href="#" style="color: #6366f1; text-decoration: none;">Help Center</a>
      </p>
    </div>
  `;

    return getEmailWrapper(content);
};

// Password Reset Email Template
exports.getPasswordResetEmail = (resetLink, userName = 'there') => {
    const content = `
    <div style="padding: 40px 30px; text-align: center;">
      <div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); width: 100px; height: 100px; margin: 0 auto 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      
      <h2 style="color: #111827; font-size: 28px; font-weight: 700; margin: 0 0 15px 0;">
        Reset Your Password
      </h2>
      
      <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        Hi <strong style="color: #374151;">${userName}</strong>, we received a request to reset your password.
      </p>
      
      <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4); margin: 0 0 30px 0;">
        Reset Password
      </a>
      
      <p style="color: #9ca3af; font-size: 13px; margin: 0 0 20px 0;">
        This link will expire in <strong>1 hour</strong>
      </p>
      
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; text-align: left;">
        <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.5;">
          <strong>Didn't request this?</strong> You can safely ignore this email. Your password won't be changed.
        </p>
      </div>
    </div>
  `;

    return getEmailWrapper(content);
};

// Friend Request Notification Email
exports.getFriendRequestEmail = (senderName, userName) => {
    const content = `
    <div style="padding: 40px 30px; text-align: center;">
      <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); width: 100px; height: 100px; margin: 0 auto 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      
      <h2 style="color: #111827; font-size: 28px; font-weight: 700; margin: 0 0 15px 0;">
        New Friend Request! 👋
      </h2>
      
      <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
        <strong style="color: #6366f1;">${senderName}</strong> wants to connect with you on MingleX!
      </p>
      
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);">
        View Request
      </a>
      
      <p style="color: #9ca3af; font-size: 13px; margin: 30px 0 0 0;">
        Accept or decline this request in your MingleX dashboard
      </p>
    </div>
  `;

    return getEmailWrapper(content);
};
