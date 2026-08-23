import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchBar } from '../components/SearchBar';

describe('SearchBar', () => {
  it('calls onSearch with the entered filters', async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} onClear={vi.fn()} />);

    await userEvent.type(screen.getByPlaceholderText('Make (e.g. Toyota)'), 'Toyota');
    await userEvent.type(screen.getByPlaceholderText('Min price'), '10000');
    await userEvent.click(screen.getByText('Search'));

    expect(onSearch).toHaveBeenCalledWith(
      expect.objectContaining({ make: 'Toyota', minPrice: 10000 })
    );
  });

  it('calls onClear when the clear button is clicked', async () => {
    const onClear = vi.fn();
    render(<SearchBar onSearch={vi.fn()} onClear={onClear} />);

    await userEvent.click(screen.getByTitle('Clear filters'));
    expect(onClear).toHaveBeenCalled();
  });
});
