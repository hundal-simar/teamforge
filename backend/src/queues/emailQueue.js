import { Queue } from 'bullmq';
import redis from '../config/redis.js'; 


const connection = {
  host: redis.options.host,
  port: redis.options.port,
  password: redis.options.password,
};

export const emailQueue = new Queue('emailQueue', { connection });