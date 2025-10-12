import prisma from '../lib/prisma';

class AuthRepository {
  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
      }
    });
  }

  async findUserByVerificationToken(token: string) {
    return await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });
  }

  async findUserByResetToken(token: string) {
    return await prisma.user.findUnique({
      where: { passwordResetToken: token },
    });
  }

  async createUser(
    email: string, 
    hashedPassword: string, 
    verificationToken: string,
    tokenExpiry: Date
  ) {
    return await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiry: tokenExpiry,
      },
    });
  }

  async verifyUserEmail(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
      },
    });
  }

  async setPasswordResetToken(userId: string, token: string, expiry: Date) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        passwordResetToken: token,
        passwordResetTokenExpiry: expiry,
      },
    });
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      },
    });
  }
}

export default AuthRepository;