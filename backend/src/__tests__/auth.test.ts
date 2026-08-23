import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../app';
import { createDatabase } from '../db/database';

describe('Auth API', () => {
  let app: Express;

  beforeEach(() => {
    const db = createDatabase(':memory:');
    app = createApp(db);
  });

  describe('POST /api/auth/register', () => {
    it('creates a new user and returns a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'jane@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('jane@example.com');
      expect(res.body.user.role).toBe('user');
      expect(res.body.user.password_hash).toBeUndefined();
    });

    it('rejects registration with a duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'jane@example.com', password: 'password123' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'jane@example.com', password: 'anotherpassword' });

      expect(res.status).toBe(409);
    });

    it('rejects registration missing required fields', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: 'jane@example.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'jane@example.com', password: 'password123' });
    });

    it('logs in with correct credentials and returns a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('rejects login with a wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'jane@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
    });

    it('rejects login for a non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });
});
