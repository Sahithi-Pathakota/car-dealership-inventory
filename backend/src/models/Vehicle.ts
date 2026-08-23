import { AppDatabase } from '../db/database';

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  created_at: string;
}

export interface NewVehicle {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

export interface VehicleUpdate {
  make?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export interface VehicleSearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export class VehicleModel {
  constructor(private db: AppDatabase) {}

  create(vehicle: NewVehicle): Vehicle {
    const stmt = this.db.prepare(
      'INSERT INTO vehicles (make, model, category, price, quantity) VALUES (?, ?, ?, ?, ?)'
    );
    const info = stmt.run(
      vehicle.make,
      vehicle.model,
      vehicle.category,
      vehicle.price,
      vehicle.quantity
    );
    return this.findById(info.lastInsertRowid as number)!;
  }

  findAll(): Vehicle[] {
    return this.db.prepare('SELECT * FROM vehicles ORDER BY id').all() as Vehicle[];
  }

  findById(id: number): Vehicle | undefined {
    return this.db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id) as
      | Vehicle
      | undefined;
  }

  search(filters: VehicleSearchFilters): Vehicle[] {
    const clauses: string[] = [];
    const params: (string | number)[] = [];

    if (filters.make) {
      clauses.push('make LIKE ?');
      params.push(`%${filters.make}%`);
    }
    if (filters.model) {
      clauses.push('model LIKE ?');
      params.push(`%${filters.model}%`);
    }
    if (filters.category) {
      clauses.push('category LIKE ?');
      params.push(`%${filters.category}%`);
    }
    if (filters.minPrice !== undefined) {
      clauses.push('price >= ?');
      params.push(filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      clauses.push('price <= ?');
      params.push(filters.maxPrice);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    return this.db
      .prepare(`SELECT * FROM vehicles ${where} ORDER BY id`)
      .all(...params) as Vehicle[];
  }

  update(id: number, updates: VehicleUpdate): Vehicle | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const merged = { ...existing, ...updates };
    this.db
      .prepare(
        'UPDATE vehicles SET make = ?, model = ?, category = ?, price = ?, quantity = ? WHERE id = ?'
      )
      .run(merged.make, merged.model, merged.category, merged.price, merged.quantity, id);
    return this.findById(id);
  }

  delete(id: number): boolean {
    const info = this.db.prepare('DELETE FROM vehicles WHERE id = ?').run(id);
    return info.changes > 0;
  }

  /** Decrease quantity by 1 (purchase). Returns undefined if not found or out of stock. */
  decrementQuantity(id: number): Vehicle | undefined {
    const vehicle = this.findById(id);
    if (!vehicle || vehicle.quantity <= 0) return undefined;
    this.db
      .prepare('UPDATE vehicles SET quantity = quantity - 1 WHERE id = ?')
      .run(id);
    return this.findById(id);
  }

  /** Increase quantity by a given amount (restock). */
  incrementQuantity(id: number, amount: number): Vehicle | undefined {
    const vehicle = this.findById(id);
    if (!vehicle) return undefined;
    this.db
      .prepare('UPDATE vehicles SET quantity = quantity + ? WHERE id = ?')
      .run(amount, id);
    return this.findById(id);
  }
}
