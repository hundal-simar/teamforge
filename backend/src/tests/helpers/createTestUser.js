import request from 'supertest';
import app from './testApp.js';

export const registerAndLogin = async (overrides = {}) => {
  const userData = {
    username: `testuser${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'Password123!',
    ...overrides,
  };

  await request(app).post('/api/auth/register').send(userData);

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: userData.email, password: userData.password });

  const cookie = loginRes.headers['set-cookie']; 
  return { cookie, userData };
};