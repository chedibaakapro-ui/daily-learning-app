import cors from 'cors';
import express from 'express';
import authRoutes from './auth/AuthController';
import learningRoutes from './learning/LearningController';
import topicsRoutes from './topics/TopicsController';
import prisma from './lib/prisma';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// AUTO-SEED DATABASE IF EMPTY
// ============================================
async function autoSeedDatabase() {
  try {
    console.log('🔍 Checking if database needs seeding...');
    
    // Check if we have any users
    const userCount = await prisma.user.count();
    const topicCount = await prisma.topic.count();
    const categoryCount = await prisma.category.count();
    
    if (userCount === 0 && topicCount === 0 && categoryCount === 0) {
      console.log('📦 Database is empty. Running auto-seed...');
      
      // Run the seed script
      await execAsync('npx prisma db seed', { cwd: __dirname + '/../' });
      
      console.log('✅ Database seeded successfully!');
      console.log('   - Test user: test@example.com / Test123!');
    } else {
      console.log('✅ Database already has data. Skipping seed.');
      console.log(`   - Users: ${userCount}`);
      console.log(`   - Topics: ${topicCount}`);
      console.log(`   - Categories: ${categoryCount}`);
    }
  } catch (error) {
    console.error('❌ Auto-seed failed:', error);
    console.error('   You may need to run: npm run seed');
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/topics', topicsRoutes);

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get database stats
    const userCount = await prisma.user.count();
    const topicCount = await prisma.topic.count();
    const categoryCount = await prisma.category.count();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        users: userCount,
        topics: topicCount,
        categories: categoryCount
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        error: 'Database connection failed'
      }
    });
  }
});

// ============================================
// START SERVER
// ============================================
async function startServer() {
  try {
    // Auto-seed if needed
    await autoSeedDatabase();
    
    // Start listening
    app.listen(PORT, () => {
      console.log('\n🚀 ═══════════════════════════════════════');
      console.log(`   Server running on http://localhost:${PORT}`);
      console.log('   ═══════════════════════════════════════');
      console.log('📚 API Endpoints:');
      console.log(`   - Auth:     http://localhost:${PORT}/api/auth`);
      console.log(`   - Learning: http://localhost:${PORT}/api/learning`);
      console.log(`   - Topics:   http://localhost:${PORT}/api/topics`);
      console.log(`   - Health:   http://localhost:${PORT}/health`);
      console.log('   ═══════════════════════════════════════\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();