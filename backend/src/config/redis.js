import Redis from 'ioredis';

let redis=null;

if(process.env.NODE_ENV!=='test'){
 redis = new Redis(process.env.REDIS_URL);


redis.on('error', (err) => console.error('Redis connection error:', err));
redis.on('connect', () => console.log('Redis connected'));
}

export default redis;