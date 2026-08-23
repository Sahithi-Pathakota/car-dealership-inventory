import { useState } from 'react';
import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Vehicle } from '../types';

interface VehicleFormProps {
  initial?: Vehicle | null;
  onSubmit: (data: Omit<Vehicle, 'id' | 'created_at'>) => Promise<void>;
  onClose: () => void;
}

export function VehicleForm({ initial, onSubmit, onClose }: VehicleFormProps) {
  const [make, setMake] = useState(initial?.make ?? '');
  const [model, setModel] = useState(initial?.model ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [price, setPrice] = useState(initial?.price?.toString() ?? '');
  const [quantity, setQuantity] = useState(initial?.quantity?.toString() ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        make,
        model,
        category,
        price: Number(price),
        quantity: Number(quantity),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">
            {initial ? 'Edit vehicle' : 'Add a new vehicle'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              value={make}
              onChange={(e) => setMake(e.target.value)}
              placeholder="Make"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
            <input
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Model"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>
          <input
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Category (Sedan, SUV, Truck...)"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              min={0}
              placeholder="Price"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
            <input
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              type="number"
              min={0}
              placeholder="Quantity"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : initial ? 'Save changes' : 'Add vehicle'}
          </button>
        </form>
      </div>
    </div>
  );
}
