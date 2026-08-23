import type { User, Vehicle, VehicleSearchFilters } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error || 'Something went wrong');
  }
  return data as T;
}

export const api = {
  register: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  listVehicles: () => request<Vehicle[]>('/vehicles'),

  searchVehicles: (filters: VehicleSearchFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value));
    });
    return request<Vehicle[]>(`/vehicles/search?${params.toString()}`);
  },

  createVehicle: (vehicle: Omit<Vehicle, 'id' | 'created_at'>) =>
    request<Vehicle>('/vehicles', { method: 'POST', body: JSON.stringify(vehicle) }),

  updateVehicle: (id: number, updates: Partial<Vehicle>) =>
    request<Vehicle>(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  deleteVehicle: (id: number) =>
    request<void>(`/vehicles/${id}`, { method: 'DELETE' }),

  purchaseVehicle: (id: number) =>
    request<Vehicle>(`/vehicles/${id}/purchase`, { method: 'POST' }),

  restockVehicle: (id: number, amount: number) =>
    request<Vehicle>(`/vehicles/${id}/restock`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
};

export { ApiError };
