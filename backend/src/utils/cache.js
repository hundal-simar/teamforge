import redis from '../config/redis.js';

const DEFAULT_TTL = 60 * 5; 

export const cacheGet = async (key) => {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('Cache get error:', err);
    return null; 
  }
};

export const cacheSet = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttl);
  } catch (err) {
    console.error('Cache set error:', err);
  }
};

export const cacheDel = async (key) => {
  try {
    await redis.del(key);
  } catch (err) {
    console.error('Cache del error:', err);
  }
};

export const boardCacheKey = (projectId) => `board:${projectId}`;