import { useState } from 'react';
import type { FormEvent } from 'react';
import { Search, X } from 'lucide-react';
import type { VehicleSearchFilters } from '../types';

interface SearchBarProps {
  onSearch: (filters: VehicleSearchFilters) => void;
  onClear: () => void;
}

export function SearchBar({ onSearch, onClear }: SearchBarProps) {
  const [make, setMake] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch({
      make: make || undefined,
      category: category || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  const handleClear = () => {
    setMake('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onClear();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-5"
    >
      <input
        value={make}
        onChange={(e) => setMake(e.target.value)}
        placeholder="Make (e.g. Toyota)"
        className="col-span-2 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 sm:col-span-1"
      />
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="Category"
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
      />
      <input
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        placeholder="Min price"
        type="number"
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
      />
      <input
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        placeholder="Max price"
        type="number"
        className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
      />
      <div className="col-span-2 flex gap-2 sm:col-span-1">
        <button
          type="submit"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink-900 px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
        <button
          type="button"
          onClick={handleClear}
          title="Clear filters"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
