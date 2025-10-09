import './env';

import cors from 'cors';
import express from 'express';
import AuthController from './auth/AuthController';
import LearningController from './learning/LearningController';
import TopicsController from './topics/TopicsController';

const app = express();
const PORT = process.env.PORT || 5001;

// Proper CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json());

app.use('/api/auth', AuthController);
app.use('/api/topics', TopicsController);
app.use('/api/learning', LearningController);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
    console.error(`\nTo fix this, run one of these commands:\n`);
    console.error(`Option 1 (recommended):`);
    console.error(`  lsof -ti:${PORT} | xargs kill -9\n`);
    console.error(`Option 2:`);
    console.error(`  killall node\n`);
    console.error(`Then restart the server with: npm run dev\n`);
    process.exit(1);
  } else {
    console.error('Server error:', error);
    process.exit(1);
  }
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;