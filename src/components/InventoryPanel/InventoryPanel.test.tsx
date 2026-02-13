import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InventoryPanel from './InventoryPanel';
import { useGameStore } from '@/store/gameStore';
import type { Item, InventoryItem } from '@/types/game';

// Mock the game store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

describe('InventoryPanel', () => {
  const mockFood: Item = {
    id: '1',
    name: 'Bread',
    description: 'Fresh bread',
    weight: 0.5,
    foodValue: 20,
    waterValue: 0,
    energyValue: 0,
    itemType: 'FOOD',
  };

  const mockWater: Item = {
    id: '2',
    name: 'Water Bottle',
    description: 'Clean water',
    weight: 1,
    foodValue: 0,
    waterValue: 30,
    energyValue: 0,
    itemType: 'WATER',
  };

  const mockEquipment: Item = {
    id: '3',
    name: 'Tent',
    description: 'Camping tent',
    weight: 5,
    foodValue: 0,
    waterValue: 0,
    energyValue: 0,
    itemType: 'EQUIPMENT',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show empty state when inventory is empty', () => {
    vi.mocked(useGameStore).mockReturnValue({
      inventory: [],
      updateResources: vi.fn(),
      removeInventoryItem: vi.fn(),
    } as unknown as ReturnType<typeof useGameStore>);

    render(<InventoryPanel />);

    expect(screen.getByText(/Your backpack is empty/i)).toBeInTheDocument();
    expect(screen.getByText(/Find items at locations/i)).toBeInTheDocument();
  });

  it('should display inventory items', () => {
    const inventory: InventoryItem[] = [
      { item: mockFood, quantity: 2 },
      { item: mockWater, quantity: 1 },
    ];

    vi.mocked(useGameStore).mockReturnValue({
      inventory,
      updateResources: vi.fn(),
      removeInventoryItem: vi.fn(),
    } as unknown as ReturnType<typeof useGameStore>);

    render(<InventoryPanel />);

    expect(screen.getByText('Bread')).toBeInTheDocument();
    expect(screen.getByText('Water Bottle')).toBeInTheDocument();
    expect(screen.getByText('Fresh bread')).toBeInTheDocument();
  });

  it('should display item quantities', () => {
    const inventory: InventoryItem[] = [{ item: mockFood, quantity: 5 }];

    vi.mocked(useGameStore).mockReturnValue({
      inventory,
      updateResources: vi.fn(),
      removeInventoryItem: vi.fn(),
    } as unknown as ReturnType<typeof useGameStore>);

    render(<InventoryPanel />);

    expect(screen.getByText('×5')).toBeInTheDocument();
  });

  it('should calculate total weight correctly', () => {
    const inventory: InventoryItem[] = [
      { item: mockFood, quantity: 2 }, // 0.5 * 2 = 1kg
      { item: mockWater, quantity: 3 }, // 1 * 3 = 3kg
      { item: mockEquipment, quantity: 1 }, // 5 * 1 = 5kg
    ]; // Total: 9kg

    vi.mocked(useGameStore).mockReturnValue({
      inventory,
      updateResources: vi.fn(),
      removeInventoryItem: vi.fn(),
    } as unknown as ReturnType<typeof useGameStore>);

    render(<InventoryPanel />);

    expect(screen.getByText('9.0/25 kg')).toBeInTheDocument();
  });

  it('should show overweight warning when exceeding max weight', () => {
    const inventory: InventoryItem[] = [
      { item: mockEquipment, quantity: 6 }, // 5 * 6 = 30kg
    ];

    vi.mocked(useGameStore).mockReturnValue({
      inventory,
      updateResources: vi.fn(),
      removeInventoryItem: vi.fn(),
    } as unknown as ReturnType<typeof useGameStore>);

    render(<InventoryPanel />);

    expect(screen.getByText('30.0/25 kg')).toBeInTheDocument();
    expect(screen.getByText(/Overweight/i)).toBeInTheDocument();
  });

  it('should display item effects for consumables', () => {
    const inventory: InventoryItem[] = [{ item: mockFood, quantity: 1 }];

    vi.mocked(useGameStore).mockReturnValue({
      inventory,
      updateResources: vi.fn(),
      removeInventoryItem: vi.fn(),
    } as unknown as ReturnType<typeof useGameStore>);

    render(<InventoryPanel />);

    expect(screen.getByText(/🍕 \+20/)).toBeInTheDocument();
  });

  it('should show Use button for items with effects', () => {
    const inventory: InventoryItem[] = [{ item: mockFood, quantity: 1 }];

    vi.mocked(useGameStore).mockReturnValue({
      inventory,
      updateResources: vi.fn(),
      removeInventoryItem: vi.fn(),
    } as unknown as ReturnType<typeof useGameStore>);

    render(<InventoryPanel />);

    expect(screen.getByRole('button', { name: /Use/i })).toBeInTheDocument();
  });

  it('should not show Use button for equipment without effects', () => {
    const inventory: InventoryItem[] = [{ item: mockEquipment, quantity: 1 }];

    vi.mocked(useGameStore).mockReturnValue({
      inventory,
      updateResources: vi.fn(),
      removeInventoryItem: vi.fn(),
    } as unknown as ReturnType<typeof useGameStore>);

    render(<InventoryPanel />);

    expect(screen.queryByRole('button', { name: /Use/i })).not.toBeInTheDocument();
  });

  it('should call updateResources and removeInventoryItem when using an item', () => {
    const updateResources = vi.fn();
    const removeInventoryItem = vi.fn();
    const inventory: InventoryItem[] = [{ item: mockFood, quantity: 1 }];

    vi.mocked(useGameStore).mockReturnValue({
      inventory,
      updateResources,
      removeInventoryItem,
    } as unknown as ReturnType<typeof useGameStore>);

    render(<InventoryPanel />);

    const useButton = screen.getByRole('button', { name: /Use/i });
    fireEvent.click(useButton);

    expect(updateResources).toHaveBeenCalledWith(20, 0, 0);
    expect(removeInventoryItem).toHaveBeenCalledWith('1', 1);
  });

  it('should call removeInventoryItem when dropping an item', () => {
    const removeInventoryItem = vi.fn();
    const inventory: InventoryItem[] = [{ item: mockFood, quantity: 1 }];

    vi.mocked(useGameStore).mockReturnValue({
      inventory,
      updateResources: vi.fn(),
      removeInventoryItem,
    } as unknown as ReturnType<typeof useGameStore>);

    render(<InventoryPanel />);

    const dropButtons = screen.getAllByRole('button');
    const dropButton = dropButtons.find((btn) => btn.title === 'Drop item');

    expect(dropButton).toBeDefined();
    fireEvent.click(dropButton!);

    expect(removeInventoryItem).toHaveBeenCalledWith('1', 1);
  });

  it('should display item count in header', () => {
    const inventory: InventoryItem[] = [
      { item: mockFood, quantity: 1 },
      { item: mockWater, quantity: 1 },
      { item: mockEquipment, quantity: 1 },
    ];

    vi.mocked(useGameStore).mockReturnValue({
      inventory,
      updateResources: vi.fn(),
      removeInventoryItem: vi.fn(),
    } as unknown as ReturnType<typeof useGameStore>);

    render(<InventoryPanel />);

    expect(screen.getByText('3 items')).toBeInTheDocument();
  });

  it('should use singular form for 1 item', () => {
    const inventory: InventoryItem[] = [{ item: mockFood, quantity: 1 }];

    vi.mocked(useGameStore).mockReturnValue({
      inventory,
      updateResources: vi.fn(),
      removeInventoryItem: vi.fn(),
    } as unknown as ReturnType<typeof useGameStore>);

    render(<InventoryPanel />);

    expect(screen.getByText('1 item')).toBeInTheDocument();
  });

  it('should display all item effect types', () => {
    const multiEffectItem: Item = {
      id: '4',
      name: 'Energy Bar',
      description: 'Nutritious snack',
      weight: 0.2,
      foodValue: 15,
      waterValue: 5,
      energyValue: 25,
      itemType: 'CONSUMABLE',
    };

    const inventory: InventoryItem[] = [{ item: multiEffectItem, quantity: 1 }];

    vi.mocked(useGameStore).mockReturnValue({
      inventory,
      updateResources: vi.fn(),
      removeInventoryItem: vi.fn(),
    } as unknown as ReturnType<typeof useGameStore>);

    render(<InventoryPanel />);

    expect(screen.getByText(/🍕 \+15/)).toBeInTheDocument();
    expect(screen.getByText(/💧 \+5/)).toBeInTheDocument();
    expect(screen.getByText(/⚡ \+25/)).toBeInTheDocument();
  });

  it('should display item type badge', () => {
    const inventory: InventoryItem[] = [{ item: mockFood, quantity: 1 }];

    vi.mocked(useGameStore).mockReturnValue({
      inventory,
      updateResources: vi.fn(),
      removeInventoryItem: vi.fn(),
    } as unknown as ReturnType<typeof useGameStore>);

    render(<InventoryPanel />);

    expect(screen.getByText('FOOD')).toBeInTheDocument();
  });
});
