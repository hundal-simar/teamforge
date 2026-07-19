import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cookieParser());
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Default Vite port
  'http://localhost:5174',

];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, postman, curl)
    if (!origin) return callback(null, true);

    // Check if origin matches allowed list or is a Vercel preview/production deployment
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app');

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
const PORT = process.env.PORT || 5000;

connectDB();

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});