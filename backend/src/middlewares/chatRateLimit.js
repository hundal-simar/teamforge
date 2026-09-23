const userRequestLog = new Map(); // userId -> array of timestamps
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 10;

export function chatRateLimit(req, res, next) {
  const userId = req.user._id.toString();
  const now = Date.now();
  const timestamps = (userRequestLog.get(userId) || []).filter(
    t => now - t < WINDOW_MS
  );

  if (timestamps.length >= MAX_PER_WINDOW) {
    return res.status(429).json({ error: "Too many messages, slow down." });
  }

  timestamps.push(now);
  userRequestLog.set(userId, timestamps);
  next();
}