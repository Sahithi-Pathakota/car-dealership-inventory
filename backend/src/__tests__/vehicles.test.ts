import request from 'supertest';
import { Express } from 'express';
import { createApp } from '../app';
import { createDatabase } from '../db/database';

async function registerAndLogin(app: Express, role: 'user' | 'admin' = 'user') {
  const email = `${role}-${Date.now()}-${Math.random()}@example.com`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password: 'password123', role });
  return res.body.token as string;
}

describe('Vehicles API', () => {
  let app: Express;
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    const db = createDatabase(':memory:');
    app = createApp(db);
    userToken = await registerAndLogin(app, 'user');
    adminToken = await registerAndLogin(app, 'admin');
  });

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });

  it('creates a vehicle when authenticated', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 22000, quantity: 5 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ make: 'Toyota', model: 'Corolla', quantity: 5 });
  });

  it('rejects vehicle creation with missing fields', async () => {
    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota' });
    expect(res.status).toBe(400);
  });

  it('lists all vehicles', async () => {
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Honda', model: 'Civic', category: 'Sedan', price: 21000, quantity: 3 });

    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('searches vehicles by make and price range', async () => {
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 2 });
    await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Ford', model: 'F-150', category: 'Truck', price: 40000, quantity: 4 });

    const res = await request(app)
      .get('/api/vehicles/search?make=Toyota&minPrice=20000&maxPrice=30000')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].make).toBe('Toyota');
  });

  it('updates a vehicle', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Mazda', model: '3', category: 'Sedan', price: 19000, quantity: 1 });

    const res = await request(app)
      .put(`/api/vehicles/${created.body.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 18500 });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(18500);
  });

  it('returns 404 when updating a non-existent vehicle', async () => {
    const res = await request(app)
      .put('/api/vehicles/9999')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ price: 100 });
    expect(res.status).toBe(404);
  });

  it('allows an admin to delete a vehicle', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ make: 'Kia', model: 'Soul', category: 'Hatchback', price: 17000, quantity: 2 });

    const res = await request(app)
      .delete(`/api/vehicles/${created.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it('forbids a non-admin from deleting a vehicle', async () => {
    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Kia', model: 'Soul', category: 'Hatchback', price: 17000, quantity: 2 });

    const res = await request(app)
      .delete(`/api/vehicles/${created.body.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});
