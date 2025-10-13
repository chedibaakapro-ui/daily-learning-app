import crypto from 'crypto';

class EmailService {
  private sendgridApiKey: string;
  private fromEmail: string;
  private frontendUrl: string;
  private isConfigured: boolean;

  constructor() {
    this.sendgridApiKey = process.env.SENDGRID_API_KEY || '';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@dailylearn.app';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    this.isConfigured = !!this.sendgridApiKey && this.sendgridApiKey.length > 10;

    console.log('📧 EmailService Configuration:');
    console.log('  - SendGrid configured:', this.isConfigured);
    console.log('  - From Email:', this.fromEmail);
    console.log('  - Frontend URL:', this.frontendUrl);
    
    if (!this.isConfigured) {
      console.warn('⚠️  SendGrid API key not configured. Email features will be disabled.');
      console.warn('   Set SENDGRID_API_KEY in your .env file to enable emails.');
    }
  }

  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  getTokenExpiry(): Date {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    return expiry;
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    console.log('\n🔍 Sending verification email to:', email);
    
    // ✅ If SendGrid not configured, log but don't fail
    if (!this.isConfigured) {
      console.warn('⚠️  SendGrid not configured. Skipping email send.');
      console.log('📝 Verification link (for testing):', `${this.frontendUrl}/auth/verify-email?token=${token}`);
      return; // Don't throw error
    }

    const verificationLink = `${this.frontendUrl}/auth/verify-email?token=${token}`;
    
    const emailData = {
      personalizations: [
        {
          to: [{ email }],
          subject: 'Verify Your Email Address',
        },
      ],
      from: {
        email: this.fromEmail,
        name: 'Daily Learning App',
      },
      content: [
        {
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Welcome to Daily Learning App!</h2>
              <p>Please verify your email address by clicking the button below:</p>
              <a href="${verificationLink}" 
                 style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; 
                        color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Verify Email
              </a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="color: #666; word-break: break-all;">${verificationLink}</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This link will expire in 24 hours. If you didn't create an account, please ignore this email.
              </p>
            </div>
          `,
        },
      ],
    };

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sendgridApiKey}`,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ SendGrid Error:', response.status, error);
        throw new Error(`Email service error: ${response.status}`);
      }

      console.log('✅ Verification email sent successfully');
    } catch (error: any) {
      console.error('❌ Failed to send verification email:', error.message);
      // ✅ FIX: Throw error so user knows email failed
      throw new Error('Failed to send verification email. Please try again or contact support.');
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    console.log('\n🔍 Sending password reset email to:', email);
    
    // ✅ If SendGrid not configured, log but don't fail
    if (!this.isConfigured) {
      console.warn('⚠️  SendGrid not configured. Skipping email send.');
      console.log('📝 Reset link (for testing):', `${this.frontendUrl}/auth/reset-password?token=${token}`);
      return; // Don't throw error
    }

    const resetLink = `${this.frontendUrl}/auth/reset-password?token=${token}`;
    
    const emailData = {
      personalizations: [
        {
          to: [{ email }],
          subject: 'Reset Your Password',
        },
      ],
      from: {
        email: this.fromEmail,
        name: 'Daily Learning App',
      },
      content: [
        {
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Password Reset Request</h2>
              <p>You requested to reset your password. Click the button below to proceed:</p>
              <a href="${resetLink}" 
                 style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; 
                        color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                Reset Password
              </a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="color: #666; word-break: break-all;">${resetLink}</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This link will expire in 24 hours. If you didn't request a password reset, please ignore this email.
              </p>
            </div>
          `,
        },
      ],
    };

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sendgridApiKey}`,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ SendGrid Error:', response.status, error);
        throw new Error(`Email service error: ${response.status}`);
      }

      console.log('✅ Password reset email sent successfully');
    } catch (error: any) {
      console.error('❌ Failed to send reset email:', error.message);
      // ✅ FIX: Throw error so user knows email failed
      throw new Error('Failed to send password reset email. Please try again or contact support.');
    }
  }
}

export default EmailService;