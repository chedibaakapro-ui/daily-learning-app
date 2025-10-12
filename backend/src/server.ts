import express from 'express';
import cors from 'cors';
import authRoutes from './auth/AuthController';
import learningRoutes from './learning/LearningController';
import topicsRoutes from './topics/TopicsController';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/topics', topicsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API endpoints:`);
  console.log(`   - Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   - Learning: http://localhost:${PORT}/api/learning`);
  console.log(`   - Topics: http://localhost:${PORT}/api/topics`);
});