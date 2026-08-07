import rateLimit from 'express-rate-limit';


export const authLimiter = 
process.env.NODE_ENV=== 'test' ? (req, res, next) => next() : 
rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per IP per window
  message: { message: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});


export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, 
  message: { message: 'Too many requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});