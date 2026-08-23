import express, { Express } from 'express';
import cors from 'cors';
import { AppDatabase } from './db/database';
import { UserModel } from './models/User';
import { VehicleModel } from './models/Vehicle';
import { AuthController } from './controllers/authController';
import { VehicleController } from './controllers/vehicleController';
import { requireAuth, requireAdmin } from './middleware/auth';

/**
 * Builds a fully wired Express app against the given database.
 * Kept as a factory (rather than a module-level singleton) so tests
 * can build an app against an isolated in-memory database.
 */
export function createApp(db: AppDatabase): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const users = new UserModel(db);
  const vehicles = new VehicleModel(db);
  const authController = new AuthController(users);
  const vehicleController = new VehicleController(vehicles);

  app.post('/api/auth/register', authController.register);
  app.post('/api/auth/login', authController.login);

  // Search must be registered before /:id routes to avoid "search" being
  // parsed as an :id parameter.
  app.get('/api/vehicles/search', requireAuth, vehicleController.search);
  app.get('/api/vehicles', requireAuth, vehicleController.list);
  app.post('/api/vehicles', requireAuth, vehicleController.create);
  app.put('/api/vehicles/:id', requireAuth, vehicleController.update);
  app.delete('/api/vehicles/:id', requireAuth, requireAdmin, vehicleController.delete);

  app.post('/api/vehicles/:id/purchase', requireAuth, vehicleController.purchase);
  app.post(
    '/api/vehicles/:id/restock',
    requireAuth,
    requireAdmin,
    vehicleController.restock
  );

  app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  return app;
}
