import { Response } from 'express';
import { VehicleModel } from '../models/Vehicle';
import { AuthenticatedRequest } from '../middleware/auth';

export class VehicleController {
  constructor(private vehicles: VehicleModel) {}

  create = (req: AuthenticatedRequest, res: Response): void => {
    const { make, model, category, price, quantity } = req.body ?? {};

    if (!make || !model || !category || price === undefined || quantity === undefined) {
      res
        .status(400)
        .json({ error: 'make, model, category, price and quantity are required' });
      return;
    }
    if (typeof price !== 'number' || price < 0) {
      res.status(400).json({ error: 'price must be a non-negative number' });
      return;
    }
    if (typeof quantity !== 'number' || quantity < 0) {
      res.status(400).json({ error: 'quantity must be a non-negative number' });
      return;
    }

    const vehicle = this.vehicles.create({ make, model, category, price, quantity });
    res.status(201).json(vehicle);
  };

  list = (_req: AuthenticatedRequest, res: Response): void => {
    res.status(200).json(this.vehicles.findAll());
  };

  search = (req: AuthenticatedRequest, res: Response): void => {
    const { make, model, category, minPrice, maxPrice } = req.query;

    const results = this.vehicles.search({
      make: make as string | undefined,
      model: model as string | undefined,
      category: category as string | undefined,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
    });
    res.status(200).json(results);
  };

  update = (req: AuthenticatedRequest, res: Response): void => {
    const id = Number(req.params.id);
    const updated = this.vehicles.update(id, req.body ?? {});
    if (!updated) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.status(200).json(updated);
  };

  delete = (req: AuthenticatedRequest, res: Response): void => {
    const id = Number(req.params.id);
    const deleted = this.vehicles.delete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.status(204).send();
  };

  purchase = (req: AuthenticatedRequest, res: Response): void => {
    const id = Number(req.params.id);
    const vehicle = this.vehicles.findById(id);
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    if (vehicle.quantity <= 0) {
      res.status(409).json({ error: 'Vehicle is out of stock' });
      return;
    }
    const updated = this.vehicles.decrementQuantity(id);
    res.status(200).json(updated);
  };

  restock = (req: AuthenticatedRequest, res: Response): void => {
    const id = Number(req.params.id);
    const amount = Number(req.body?.amount ?? 1);

    if (!Number.isFinite(amount) || amount <= 0) {
      res.status(400).json({ error: 'amount must be a positive number' });
      return;
    }

    const updated = this.vehicles.incrementQuantity(id, amount);
    if (!updated) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.status(200).json(updated);
  };
}
