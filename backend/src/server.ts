import './env'; // This MUST be first

import express from 'express';
import cors from 'cors';
import AuthController from './auth/AuthController';
import TopicsController from './topics/TopicsController';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', AuthController);
app.use('/api/topics', TopicsController);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});