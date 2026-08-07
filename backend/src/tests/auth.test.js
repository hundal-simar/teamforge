import request from 'supertest';
import app from './helpers/testApp.js';
import { registerAndLogin } from './helpers/createTestUser.js';

describe('Auth flow', () => {
  it('registers a new user', async () => {
    console.log('Registering a new user...');
    const res = await request(app).post('/api/auth/register').send({
      username: 'alice',
      email: 'alice@example.com',
      password: 'Password123!',
    });
    console.log('expecting res')
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User created successfully');
    console.log('User registered successfully');
  });

  it('rejects registration with missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'bob@example.com' });
    expect(res.status).toBe(400);
  });

  it('logs in with correct credentials and sets auth cookies', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'carol',
      email: 'carol@example.com',
      password: 'Password123!',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'carol@example.com', password: 'Password123!' });

    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies.some((c) => c.startsWith('token='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refreshToken='))).toBe(true);
  });

  it('rejects login with wrong password', async () => {
    await request(app).post('/api/auth/register').send({
      username: 'dave',
      email: 'dave@example.com',
      password: 'Password123!',
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dave@example.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
  });

  it('fetches the current user via /me when authenticated', async () => {
    const { cookie } = await registerAndLogin();
    const res = await request(app).get('/api/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username');
  });

  it('rejects /me without a valid token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});