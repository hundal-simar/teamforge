import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import compression from 'compression';
import { apiLimiter } from './src/middlewares/rateLimiters.js';

import authRoutes from './src/routes/authRoutes.js';
import workspaceRoutes from './src/routes/workspaceRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import projectDetailRoutes from './src/routes/projectDetailRoutes.js';
import taskDetailRoutes from './src/routes/taskDetailRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import taskSearchRoutes from './src/routes/taskSearchRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import meRoutes from './src/routes/meRoutes.js';
import userRoutes from './src/routes/userRoutes.js';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(compression());

connectDB();

app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workspaces', projectRoutes);
app.use('/api/projects', projectDetailRoutes);
app.use('/api/tasks', taskDetailRoutes);
app.use('/api/projects', taskRoutes);
app.use('/api/tasks', taskSearchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/me', meRoutes);
app.use('/api/users', userRoutes);


app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err.message?.includes('Unsupported file type')) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

export default app; 