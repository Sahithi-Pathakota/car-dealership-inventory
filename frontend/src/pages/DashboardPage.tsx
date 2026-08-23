import { useEffect, useState, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { SearchBar } from '../components/SearchBar';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleForm } from '../components/VehicleForm';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { Vehicle, VehicleSearchFilters } from '../types';

export function DashboardPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSearch = async (filters: VehicleSearchFilters) => {
    setLoading(true);
    try {
      setVehicles(await api.searchVehicles(filters));
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (id: number) => {
    const updated = await api.purchaseVehicle(id);
    setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
  };

  const handleRestock = async (id: number, amount: number) => {
    const updated = await api.restockVehicle(id, amount);
    setVehicles((prev) => prev.map((v) => (v.id === id ? updated : v)));
  };

  const handleDelete = async (id: number) => {
    await api.deleteVehicle(id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const handleFormSubmit = async (data: Omit<Vehicle, 'id' | 'created_at'>) => {
    if (editingVehicle) {
      const updated = await api.updateVehicle(editingVehicle.id, data);
      setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    } else {
      const created = await api.createVehicle(data);
      setVehicles((prev) => [...prev, created]);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900">Vehicle Inventory</h1>
            <p className="text-sm text-slate-500">
              {vehicles.length} vehicle{vehicles.length === 1 ? '' : 's'} available
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setEditingVehicle(null);
                setFormOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add vehicle
            </button>
          )}
        </div>

        <div className="mb-6">
          <SearchBar onSearch={handleSearch} onClear={loadAll} />
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Loading vehicles…</p>
        ) : vehicles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">
            No vehicles match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isAdmin={isAdmin}
                onPurchase={handlePurchase}
                onRestock={handleRestock}
                onDelete={handleDelete}
                onEdit={(v) => {
                  setEditingVehicle(v);
                  setFormOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {formOpen && (
        <VehicleForm
          initial={editingVehicle}
          onSubmit={handleFormSubmit}
          onClose={() => setFormOpen(false)}
        />
      )}
    </div>
  );
}
