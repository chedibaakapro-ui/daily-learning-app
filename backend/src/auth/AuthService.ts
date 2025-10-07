import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AuthRepository from './AuthRepository';
import EmailService from '../lib/emailService';

class AuthService {
  private authRepository: AuthRepository;
  private emailService: EmailService;

  constructor() {
    this.authRepository = new AuthRepository();
    this.emailService = new EmailService();
  }

  async register(email: string, password: string) {
    const existingUser = await this.authRepository.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = this.emailService.generateToken();
    const tokenExpiry = this.emailService.getTokenExpiry();

    const user = await this.authRepository.createUser(
      email,
      hashedPassword,
      verificationToken,
      tokenExpiry
    );

    // Try to send email but don't fail registration if it fails
    try {
      await this.emailService.sendVerificationEmail(email, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email, but user was created:', emailError);
      // Don't throw - user is already created
    }

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.authRepository.findUserByVerificationToken(token);

    if (!user) {
      throw new Error('Invalid verification token');
    }

    if (!user.emailVerificationTokenExpiry || user.emailVerificationTokenExpiry < new Date()) {
      throw new Error('Verification token has expired');
    }

    if (user.isEmailVerified) {
      throw new Error('Email already verified');
    }

    await this.authRepository.verifyUserEmail(user.id);

    return {
      message: 'Email verified successfully. You can now log in.',
    };
  }

  async login(email: string, password: string) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    return {
      user: { id: user.id, email: user.email },
      token,
    };
  }

  async requestPasswordReset(email: string) {
    const user = await this.authRepository.findUserByEmail(email);
    
    if (!user) {
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    const resetToken = this.emailService.generateToken();
    const tokenExpiry = this.emailService.getTokenExpiry();

    await this.authRepository.setPasswordResetToken(user.id, resetToken, tokenExpiry);
    
    // Try to send email but don't fail if it fails
    try {
      await this.emailService.sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.authRepository.findUserByResetToken(token);

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    if (!user.passwordResetTokenExpiry || user.passwordResetTokenExpiry < new Date()) {
      throw new Error('Reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.authRepository.updatePassword(user.id, hashedPassword);

    return {
      message: 'Password reset successful. You can now log in with your new password.',
    };
  }
}

export default AuthService;