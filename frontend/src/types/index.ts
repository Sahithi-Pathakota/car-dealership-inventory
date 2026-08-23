export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  created_at: string;
}

export interface VehicleSearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}
