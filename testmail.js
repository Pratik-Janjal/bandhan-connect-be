require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const userData = {
  name: 'Test User',
  email: process.env.TEST_EMAIL || process.env.EMAIL_USER,
  tempPassword: 'testpassword123',
  role: 'vendor'
};

const mailOptions = {
  from: `"BandhaConnect" <${process.env.EMAIL_USER}>`,
  to: userData.email,
  subject: `BandhaConnect: Your ${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} Application Approved!`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🎉 Application Approved!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to BandhaConnect</p>
      </div>
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-bottom: 20px;">Congratulations, ${userData.name}!</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Your application to join BandhaConnect as a <strong>${userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</strong> has been approved!
        </p>
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeeba;">
          <h3 style="color: #856404; margin-top: 0;">Your Login Credentials</h3>
          <p style="color: #856404; font-size: 16px;"><strong>Email:</strong> ${userData.email}<br/><strong>Temporary Password:</strong> ${userData.tempPassword}</p>
          <p style="color: #856404; font-size: 14px;">Please log in and change your password after your first login for security.</p>
        </div>
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h3 style="color: #333; margin-top: 0;">Next Steps</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Log in using your credentials below</li>
            <li>After login, you will be redirected to your <strong>${userData.role}</strong> dashboard</li>
            <li>Complete your profile and start using BandhaConnect</li>
          </ul>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://bc-project-pbiz.vercel.app'}/login" 
             style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Access Your Dashboard
          </a>
        </div>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          <strong>Note:</strong> After login, you will be redirected to your <strong>${userData.role}</strong> dashboard.<br>
          If you have any questions, please contact our support team.
        </p>
        <p style="color: #666; line-height: 1.6;">
          Welcome to the BandhaConnect family!<br>
          Best regards,<br>
          The BandhaConnect Team
        </p>
      </div>
    </div>
  `
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    return console.error('Error sending test email:', err);
  }
  console.log('Test email sent:', info.messageId);
}); 