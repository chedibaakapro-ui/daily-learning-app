const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { id: 'test-user-id' }
    });

    if (existing) {
      console.log('✅ Test user already exists!');
      await prisma.$disconnect();
      return;
    }

    // Create test user
    await prisma.user.create({
      data: {
        id: 'test-user-id',
        email: 'test@example.com',
        password: 'hashed-password-placeholder',
      }
    });

    console.log('✅ Test user created successfully!');
    console.log('   ID: test-user-id');
    console.log('   Email: test@example.com');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();