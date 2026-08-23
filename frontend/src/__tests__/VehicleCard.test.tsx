import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VehicleCard } from '../components/VehicleCard';
import type { Vehicle } from '../types';

const baseVehicle: Vehicle = {
  id: 1,
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 22000,
  quantity: 3,
  created_at: '2025-01-01T00:00:00.000Z',
};

function renderCard(overrides: Partial<Vehicle> = {}, isAdmin = false) {
  const onPurchase = vi.fn().mockResolvedValue(undefined);
  const onRestock = vi.fn().mockResolvedValue(undefined);
  const onDelete = vi.fn().mockResolvedValue(undefined);
  const onEdit = vi.fn();

  render(
    <VehicleCard
      vehicle={{ ...baseVehicle, ...overrides }}
      isAdmin={isAdmin}
      onPurchase={onPurchase}
      onRestock={onRestock}
      onDelete={onDelete}
      onEdit={onEdit}
    />
  );

  return { onPurchase, onRestock, onDelete, onEdit };
}

describe('VehicleCard', () => {
  it('renders vehicle details', () => {
    renderCard();
    expect(screen.getByText('Toyota Corolla')).toBeInTheDocument();
    expect(screen.getByText('Sedan')).toBeInTheDocument();
    expect(screen.getByText('3 in stock')).toBeInTheDocument();
  });

  it('disables the purchase button when out of stock', () => {
    renderCard({ quantity: 0 });
    expect(screen.getByText('Purchase').closest('button')).toBeDisabled();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('calls onPurchase when the purchase button is clicked', async () => {
    const { onPurchase } = renderCard();
    await userEvent.click(screen.getByText('Purchase'));
    expect(onPurchase).toHaveBeenCalledWith(1);
  });

  it('does not show admin controls for non-admin users', () => {
    renderCard({}, false);
    expect(screen.queryByTitle('Delete')).not.toBeInTheDocument();
  });

  it('shows admin controls for admin users', () => {
    renderCard({}, true);
    expect(screen.getByTitle('Delete')).toBeInTheDocument();
    expect(screen.getByTitle('Edit')).toBeInTheDocument();
  });
});
