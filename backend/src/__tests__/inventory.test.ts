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

describe('Inventory operations', () => {
  let app: Express;
  let userToken: string;
  let adminToken: string;
  let vehicleId: number;

  beforeEach(async () => {
    const db = createDatabase(':memory:');
    app = createApp(db);
    userToken = await registerAndLogin(app, 'user');
    adminToken = await registerAndLogin(app, 'admin');

    const created = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ make: 'Subaru', model: 'Outback', category: 'SUV', price: 30000, quantity: 1 });
    vehicleId = created.body.id;
  });

  it('decrements quantity on purchase', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(0);
  });

  it('rejects purchase when out of stock', async () => {
    await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(409);
  });

  it('returns 404 when purchasing a non-existent vehicle', async () => {
    const res = await request(app)
      .post('/api/vehicles/9999/purchase')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(404);
  });

  it('allows an admin to restock a vehicle', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 5 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(6);
  });

  it('forbids a non-admin from restocking a vehicle', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 5 });

    expect(res.status).toBe(403);
  });

  it('rejects restock with a non-positive amount', async () => {
    const res = await request(app)
      .post(`/api/vehicles/${vehicleId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: -1 });

    expect(res.status).toBe(400);
  });
});
