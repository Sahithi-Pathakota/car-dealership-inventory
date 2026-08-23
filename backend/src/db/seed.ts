/**
 * Seeds the SQLite database with sample vehicle inventory.
 *
 * Usage (from the backend/ folder):
 *   npx ts-node src/db/seed.ts
 *
 * Safe to re-run: it clears the vehicles table first, so you won't
 * get duplicate rows if you run it more than once.
 */
import { createDatabase } from './database';
import { VehicleModel, NewVehicle } from '../models/Vehicle';

const sampleVehicles: NewVehicle[] = [
  { make: 'Toyota', model: 'Camry', category: 'car', price: 2800000, quantity: 5 },
  { make: 'Toyota', model: 'Corolla', category: 'car', price: 2100000, quantity: 8 },
  { make: 'Toyota', model: 'Fortuner', category: 'suv', price: 4200000, quantity: 3 },
  { make: 'Toyota', model: 'Innova Crysta', category: 'suv', price: 3600000, quantity: 4 },
  { make: 'Honda', model: 'City', category: 'car', price: 1400000, quantity: 10 },
  { make: 'Honda', model: 'Civic', category: 'car', price: 2200000, quantity: 6 },
  { make: 'Honda', model: 'CR-V', category: 'suv', price: 3800000, quantity: 2 },
  { make: 'Hyundai', model: 'Creta', category: 'suv', price: 1600000, quantity: 7 },
  { make: 'Hyundai', model: 'i20', category: 'car', price: 900000, quantity: 12 },
  { make: 'Hyundai', model: 'Venue', category: 'suv', price: 1200000, quantity: 5 },
  { make: 'Suzuki', model: 'Swift', category: 'car', price: 750000, quantity: 15 },
  { make: 'Suzuki', model: 'Baleno', category: 'car', price: 850000, quantity: 9 },
  { make: 'Ford', model: 'EcoSport', category: 'suv', price: 1300000, quantity: 0 },
  { make: 'Ford', model: 'Endeavour', category: 'suv', price: 3900000, quantity: 1 },
  { make: 'Mahindra', model: 'Thar', category: 'suv', price: 1500000, quantity: 6 },
  { make: 'Mahindra', model: 'XUV700', category: 'suv', price: 2400000, quantity: 4 },
  { make: 'Kia', model: 'Seltos', category: 'suv', price: 1750000, quantity: 5 },
  { make: 'Tata', model: 'Nexon', category: 'suv', price: 1250000, quantity: 8 },
  { make: 'Tata', model: 'Harrier', category: 'suv', price: 2200000, quantity: 3 },
  { make: 'Volvo', model: 'XC90', category: 'suv', price: 9500000, quantity: 1 },
];

function seed() {
  const db = createDatabase();
  const vehicles = new VehicleModel(db);

  db.exec('DELETE FROM vehicles');
  db.exec("DELETE FROM sqlite_sequence WHERE name = 'vehicles'");

  for (const v of sampleVehicles) {
    vehicles.create(v);
  }

  console.log(`Seeded ${sampleVehicles.length} vehicles into the database.`);
  db.close();
}

seed();
