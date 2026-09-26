const nodemailer = require('nodemailer');

const sendWelcomeEmail = async (email, username, tempPassword) => {
  try {
    let transporter;
    
    // Check if real SMTP credentials are provided in .env
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Fallback to testing (Ethereal Email) if no real credentials
      console.log('No SMTP credentials found in .env, using Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: '"My Claim Admin" <no-reply@myclaim.com>',
      to: email,
      subject: 'Welcome to My Claim - Your Account Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #0f172a;">Welcome to My Claim!</h2>
          <p style="color: #334155; font-size: 16px;">Hello,</p>
          <p style="color: #334155; font-size: 16px;">An account has been created for you. Here are your login credentials:</p>
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Username / Email:</strong> ${username}</p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>
          <p style="color: #334155; font-size: 14px;"><strong>Important:</strong> You will be asked to change your password upon your first login.</p>
          <p style="color: #334155; font-size: 16px; margin-top: 30px;">Best regards,<br>My Claim Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    
    if (info.messageId && !process.env.SMTP_HOST) {
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

const sendOtpEmail = async (email, otp) => {
  try {
    let transporter;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const port = Number(process.env.SMTP_PORT) || 587;
      const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: isSecure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Direct Gmail service configuration
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      console.log('[Nodemailer] No SMTP credentials in .env, using Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || '"Wealtharth IEPF Services" <no-reply@wealtharth.com>',
      to: email,
      subject: `Your OTP for Free IEPF Recovery Report: ${otp}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #065f46; margin: 0; font-size: 24px; font-weight: 800;">My Claim India</h2>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">IEPF Share & Dividend Recovery Services</p>
          </div>
          <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
            <p style="color: #1e293b; font-size: 15px; margin: 0 0 12px;">Hello,</p>
            <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 20px;">
              You requested verification for your <strong>Free IEPF Share & Dividend Recovery Report</strong>. Use the One-Time Password (OTP) below to verify your email address:
            </p>
            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1.5px dashed #10b981; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #065f46; display: block;">${otp}</span>
              <span style="font-size: 12px; color: #047857; margin-top: 6px; display: block; font-weight: 600;">Valid for 10 minutes</span>
            </div>
            <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 20px 0 0;">
              If you didn't request this code, you can safely ignore this email. Never share your OTP with anyone.
            </p>
          </div>
          <div style="border-top: 1px solid #f1f5f9; margin-top: 24px; padding-top: 16px; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} My Claim India · Wealtharth. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Nodemailer] OTP email sent to ${email} (MessageId: ${info.messageId})`);
    if (info.messageId && !process.env.SMTP_HOST) {
      console.log(`[Nodemailer] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Nodemailer] Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendOtpEmail,
};
