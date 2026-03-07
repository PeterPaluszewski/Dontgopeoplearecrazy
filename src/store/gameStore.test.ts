import { useGameStore } from '@/store/gameStore';
import { describe, expect, it } from 'vitest';

describe('GameStore', () => {
  it('should initialize with default values', () => {
    const state = useGameStore.getState();

    expect(state.food).toBe(100);
    expect(state.water).toBe(100);
    expect(state.energy).toBe(100);
    expect(state.money).toBe(200);
    expect(state.inventory).toEqual([]);
    expect(state.visitedLocationIds).toEqual([]);
    expect(state.isActive).toBe(false);
  });

  it('should update resources correctly', () => {
    const { updateResources } = useGameStore.getState();

    updateResources(-10, -5, -15);

    const state = useGameStore.getState();
    expect(state.food).toBe(90);
    expect(state.water).toBe(95);
    expect(state.energy).toBe(85);
  });

  it('should not allow resources below 0', () => {
    const { updateResources, resetGame } = useGameStore.getState();

    resetGame();
    updateResources(-150, -150, -150);

    const state = useGameStore.getState();
    expect(state.food).toBe(0);
    expect(state.water).toBe(0);
    expect(state.energy).toBe(0);
  });

  it('should not allow resources above 100', () => {
    const { updateResources, resetGame } = useGameStore.getState();

    resetGame();
    updateResources(50, 50, 50);

    const state = useGameStore.getState();
    expect(state.food).toBe(100);
    expect(state.water).toBe(100);
    expect(state.energy).toBe(100);
  });

  it('should add inventory items correctly', () => {
    const { addInventoryItem, resetGame } = useGameStore.getState();

    resetGame();

    const testItem = {
      id: '1',
      name: 'Test Item',
      description: 'Test',
      weight: 1,
      foodValue: 10,
      waterValue: 0,
      energyValue: 0,
      itemType: 'FOOD' as const,
    };

    addInventoryItem(testItem, 2);

    const state = useGameStore.getState();
    expect(state.inventory).toHaveLength(1);
    expect(state.inventory[0].item.id).toBe('1');
    expect(state.inventory[0].quantity).toBe(2);
  });

  it('should stack same items in inventory', () => {
    const { addInventoryItem, resetGame } = useGameStore.getState();

    resetGame();

    const testItem = {
      id: '1',
      name: 'Test Item',
      description: 'Test',
      weight: 1,
      foodValue: 10,
      waterValue: 0,
      energyValue: 0,
      itemType: 'FOOD' as const,
    };

    addInventoryItem(testItem, 2);
    addInventoryItem(testItem, 3);

    const state = useGameStore.getState();
    expect(state.inventory).toHaveLength(1);
    expect(state.inventory[0].quantity).toBe(5);
  });

  it('should remove inventory items correctly', () => {
    const { addInventoryItem, removeInventoryItem, resetGame } = useGameStore.getState();

    resetGame();

    const testItem = {
      id: '1',
      name: 'Test Item',
      description: 'Test',
      weight: 1,
      foodValue: 10,
      waterValue: 0,
      energyValue: 0,
      itemType: 'FOOD' as const,
    };

    addInventoryItem(testItem, 5);
    removeInventoryItem('1', 2);

    const state = useGameStore.getState();
    expect(state.inventory[0].quantity).toBe(3);
  });

  it('should remove item from inventory when quantity reaches 0', () => {
    const { addInventoryItem, removeInventoryItem, resetGame } = useGameStore.getState();

    resetGame();

    const testItem = {
      id: '1',
      name: 'Test Item',
      description: 'Test',
      weight: 1,
      foodValue: 10,
      waterValue: 0,
      energyValue: 0,
      itemType: 'FOOD' as const,
    };

    addInventoryItem(testItem, 3);
    removeInventoryItem('1', 3);

    const state = useGameStore.getState();
    expect(state.inventory).toHaveLength(0);
  });
});
