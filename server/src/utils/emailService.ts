import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// For email service specifically, try to load from various possible locations
dotenv.config({ path: '../.env' }); // In case it's run from different context

// Import the createTransport function from nodemailer
const createTransporter = nodemailer.createTransport;

// SMTP Configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@pasarantar.com';

console.log('SMTP Configuration loaded:', {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER: SMTP_USER ? '***HIDDEN***' : '', // Don't log actual email
  SMTP_SECURE,
  EMAIL_FROM
});

// Create transporter using SMTP configuration if all required fields are present
let transporter: nodemailer.Transporter | null = null;

if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
  transporter = createTransporter({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
  console.log('Email transporter created successfully');
} else {
  console.warn('Email transporter not created: missing SMTP configuration');
  console.warn('Required: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
}

// Verify SMTP configuration
export const verifyEmailConfig = async (): Promise<boolean> => {
  if (!transporter) {
    console.error('Email transporter not initialized');
    return false;
  }
  try {
    await transporter.verify();
    console.log('SMTP configuration verified successfully');
    return true;
  } catch (error) {
    console.error('SMTP configuration verification failed:', error);
    return false;
  }
};

// Interface for email options
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

// Function to send email
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  // If transporter is not configured, log a warning and return success to avoid failing the request
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping email sending.');
    console.warn('To enable email functionality, please configure SMTP settings in your .env file.');
    return true; // Return true to indicate success (even though no email was sent)
  }

  try {
    // Only verify transporter configuration in development
    if (process.env.NODE_ENV !== 'production') {
      if (!(await verifyEmailConfig())) {
        console.error('Email transporter not properly configured');
        return false;
      }
    }

    // Define email parameters
    const mailOptions = {
      from: `"PasarAntar" <${EMAIL_FROM}>`, // sender address
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to, // list of receivers
      subject: options.subject, // Subject line
      text: options.text, // plain text body
      html: options.html, // html body
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(', ') : options.cc) : undefined,
      bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc.join(', ') : options.bcc) : undefined,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Function to send password reset email
export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<boolean> => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>You have requested to reset your password. Click the button below to proceed:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>If the button above doesn't work, copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">This is an automated email from PasarAntar. Please do not reply to this email.</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: 'Password Reset Request - PasarAntar',
    html: htmlContent,
    text: `You have requested to reset your password. Visit this link to reset: ${resetUrl}\n\nThis link will expire in 1 hour.`
  });
};

// Function to send welcome email to new users
export const sendWelcomeEmail = async (email: string, name: string): Promise<boolean> => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to PasarAntar, ${name}!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with PasarAntar. We're excited to have you on board!</p>
      <p>Now you can browse our products, place orders, and enjoy our services.</p>
      <p>If you have any questions, feel free to contact our support team.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">This is an automated email from PasarAntar. Please do not reply to this email.</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Welcome to PasarAntar, ${name}!`,
    html: htmlContent,
    text: `Welcome to PasarAntar, ${name}!\n\nThank you for registering with PasarAntar. We're excited to have you on board!`
  });
};

// Function to send order confirmation email
export const sendOrderConfirmationEmail = async (
  email: string, 
  orderNumber: string, 
  items: Array<{productName: string, quantity: number, unitPrice: number, totalPrice: number}>,
  totalAmount: number
): Promise<boolean> => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rp ${item.unitPrice.toLocaleString()}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">Rp ${item.totalPrice.toLocaleString()}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Order Confirmation - ${orderNumber}</h2>
      <p>Dear Customer,</p>
      <p>Your order <strong>${orderNumber}</strong> has been received and is being processed.</p>
      
      <h3 style="color: #333;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; text-align: left;">Product</th>
            <th style="padding: 8px; text-align: center;">Quantity</th>
            <th style="padding: 8px; text-align: right;">Unit Price</th>
            <th style="padding: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">Total:</td>
            <td style="padding: 8px; text-align: right; font-weight: bold; border-top: 2px solid #ddd;">Rp ${totalAmount.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
      
      <p>Thank you for shopping with us. We will notify you when your order is shipped.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">This is an automated email from PasarAntar. Please do not reply to this email.</p>
    </div>
  `;

  return await sendEmail({
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    html: htmlContent,
    text: `Dear Customer,\n\nYour order ${orderNumber} has been received and is being processed.\n\nThank you for shopping with us.`
  });
};