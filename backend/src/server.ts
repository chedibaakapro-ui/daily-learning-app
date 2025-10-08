import './env';

import express from 'express';
import cors from 'cors';
import AuthController from './auth/AuthController';
import TopicsController from './topics/TopicsController';
import LearningController from './learning/LearningController';

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
