import { Queue } from 'bullmq';
import redis from '../config/redis.js';

let emailQueue = null;

if (process.env.NODE_ENV !== 'test') {
  

  emailQueue = new Queue('emailQueue',{connection: {
    url: process.env.REDIS_URL, 
  },});
}

export { emailQueue };