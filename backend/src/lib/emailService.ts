import crypto from 'crypto';

// test

class EmailService {
  private sendgridApiKey: string;
  private fromEmail: string;
  private frontendUrl: string;

  constructor() {
    this.sendgridApiKey = process.env.SENDGRID_API_KEY || '';
    this.fromEmail = process.env.FROM_EMAIL || 'chedibaaka.pro@gmail.com';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // DEBUG: Log configuration (hide most of API key for security)
    console.log('📧 EmailService Configuration:');
    console.log('  - SendGrid API Key present:', !!this.sendgridApiKey);
    console.log('  - SendGrid API Key format:', this.sendgridApiKey ? `${this.sendgridApiKey.substring(0, 10)}...` : 'MISSING');
    console.log('  - From Email:', this.fromEmail);
    console.log('  - Frontend URL:', this.frontendUrl);
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
    console.log('\n🔍 DEBUG: Starting sendVerificationEmail');
    console.log('  - Target email:', email);
    console.log('  - Token generated:', token.substring(0, 10) + '...');

    const verificationLink = `${this.frontendUrl}/auth/verify-email?token=${token}`;
    console.log('  - Verification link:', verificationLink);
    
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

    console.log('  - Email payload prepared');
    console.log('  - Attempting to send via SendGrid API...');

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sendgridApiKey}`,
        },
        body: JSON.stringify(emailData),
      });

      console.log('  - SendGrid API response status:', response.status);
      console.log('  - SendGrid API response statusText:', response.statusText);

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ SendGrid API Error Response:', error);
        console.error('  - Full response status:', response.status);
        console.error('  - Response headers:', JSON.stringify([...response.headers.entries()]));
        throw new Error(`Failed to send verification email: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Verification email sent successfully to:', email);
    } catch (error: any) {
      console.error('\n❌ ERROR in sendVerificationEmail:');
      console.error('  - Error name:', error.name);
      console.error('  - Error message:', error.message);
      console.error('  - Error code:', error.code);
      console.error('  - Error cause:', error.cause);
      console.error('  - Full error:', error);
      
      // Specific handling for SSL errors
      if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || error.cause?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
        console.error('\n⚠️  SSL CERTIFICATE ERROR DETECTED:');
        console.error('  This is likely one of these issues:');
        console.error('  1. Invalid/expired SendGrid API key');
        console.error('  2. SSL certificate issue in your Node.js environment');
        console.error('  3. Network/firewall blocking the connection');
        console.error('  4. SendGrid account not verified or suspended');
        console.error('\n  RECOMMENDED ACTIONS:');
        console.error('  - Verify your SendGrid API key is active at https://app.sendgrid.com/settings/api_keys');
        console.error('  - Check if your SendGrid account is verified');
        console.error('  - Check your SendGrid sender verification at https://app.sendgrid.com/settings/sender_auth');
      }
      
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    console.log('\n🔍 DEBUG: Starting sendPasswordResetEmail');
    console.log('  - Target email:', email);
    console.log('  - Token generated:', token.substring(0, 10) + '...');

    const resetLink = `${this.frontendUrl}/auth/reset-password?token=${token}`;
    console.log('  - Reset link:', resetLink);
    
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

    console.log('  - Email payload prepared');
    console.log('  - Attempting to send via SendGrid API...');

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.sendgridApiKey}`,
        },
        body: JSON.stringify(emailData),
      });

      console.log('  - SendGrid API response status:', response.status);
      console.log('  - SendGrid API response statusText:', response.statusText);

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ SendGrid API Error Response:', error);
        console.error('  - Full response status:', response.status);
        console.error('  - Response headers:', JSON.stringify([...response.headers.entries()]));
        throw new Error(`Failed to send password reset email: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Password reset email sent successfully to:', email);
    } catch (error: any) {
      console.error('\n❌ ERROR in sendPasswordResetEmail:');
      console.error('  - Error name:', error.name);
      console.error('  - Error message:', error.message);
      console.error('  - Error code:', error.code);
      console.error('  - Error cause:', error.cause);
      console.error('  - Full error:', error);
      
      // Specific handling for SSL errors
      if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || error.cause?.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
        console.error('\n⚠️  SSL CERTIFICATE ERROR DETECTED:');
        console.error('  This is likely one of these issues:');
        console.error('  1. Invalid/expired SendGrid API key');
        console.error('  2. SSL certificate issue in your Node.js environment');
        console.error('  3. Network/firewall blocking the connection');
        console.error('  4. SendGrid account not verified or suspended');
        console.error('\n  RECOMMENDED ACTIONS:');
        console.error('  - Verify your SendGrid API key is active at https://app.sendgrid.com/settings/api_keys');
        console.error('  - Check if your SendGrid account is verified');
        console.error('  - Check your SendGrid sender verification at https://app.sendgrid.com/settings/sender_auth');
      }
      
      throw new Error('Failed to send password reset email');
    }
  }
}

export default EmailService;