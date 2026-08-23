import { useState } from 'react';
import { PackagePlus, Pencil, ShoppingCart, Trash2 } from 'lucide-react';
import type { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  isAdmin: boolean;
  onPurchase: (id: number) => Promise<void>;
  onRestock: (id: number, amount: number) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onEdit: (vehicle: Vehicle) => void;
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function VehicleCard({
  vehicle,
  isAdmin,
  onPurchase,
  onRestock,
  onDelete,
  onEdit,
}: VehicleCardProps) {
  const [busy, setBusy] = useState(false);
  const outOfStock = vehicle.quantity <= 0;

  const withBusy = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink-900">
              {vehicle.make} {vehicle.model}
            </h3>
            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {vehicle.category}
            </span>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              outOfStock
                ? 'bg-red-50 text-red-600'
                : vehicle.quantity <= 2
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {outOfStock ? 'Out of stock' : `${vehicle.quantity} in stock`}
          </span>
        </div>

        <p className="mt-4 text-2xl font-semibold text-brand-700">
          {currency.format(vehicle.price)}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          disabled={outOfStock || busy}
          onClick={() => withBusy(() => onPurchase(vehicle.id))}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
        >
          <ShoppingCart className="h-4 w-4" />
          Purchase
        </button>

        {isAdmin && (
          <>
            <button
              disabled={busy}
              onClick={() => withBusy(() => onRestock(vehicle.id, 1))}
              title="Restock +1"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <PackagePlus className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(vehicle)}
              title="Edit"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              disabled={busy}
              onClick={() => withBusy(() => onDelete(vehicle.id))}
              title="Delete"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
