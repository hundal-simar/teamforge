import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import redis from '../config/redis.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  console.log('before connection')
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  console.log('after connection')
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();

});