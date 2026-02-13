import { TravelCost } from '@/lib/travel-utils';
import { GameState, InventoryItem, Item } from '@/types/game';
import { create } from 'zustand';

interface GameStore extends Omit<GameState, 'userId' | 'createdAt' | 'updatedAt'> {
  updateResources: (food: number, water: number, energy: number) => void;
  addInventoryItem: (item: Item, quantity: number) => void;
  removeInventoryItem: (itemId: string, quantity: number) => void;
  setCurrentLocation: (locationId: string) => void;
  visitLocation: (locationId: string) => void;
  travelToLocation: (locationId: string, cost: TravelCost) => void;
  resetGame: () => void;
  loadGame: (gameState: GameState) => void;
}

const initialState = {
  id: '',
  currentLocationId: '',
  food: 100,
  water: 100,
  energy: 100,
  inventory: [] as InventoryItem[],
  visitedLocationIds: [] as string[],
  isActive: false,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  updateResources: (food, water, energy) =>
    set((state) => ({
      food: Math.max(0, Math.min(100, state.food + food)),
      water: Math.max(0, Math.min(100, state.water + water)),
      energy: Math.max(0, Math.min(100, state.energy + energy)),
    })),

  addInventoryItem: (item, quantity) =>
    set((state) => {
      const existingIndex = state.inventory.findIndex((i) => i.item.id === item.id);
      if (existingIndex >= 0) {
        const newInventory = [...state.inventory];
        newInventory[existingIndex].quantity += quantity;
        return { inventory: newInventory };
      }
      return {
        inventory: [...state.inventory, { item, quantity }],
      };
    }),

  removeInventoryItem: (itemId, quantity) =>
    set((state) => {
      const existingIndex = state.inventory.findIndex((i) => i.item.id === itemId);
      if (existingIndex >= 0) {
        const newInventory = [...state.inventory];
        const newQuantity = newInventory[existingIndex].quantity - quantity;
        if (newQuantity <= 0) {
          newInventory.splice(existingIndex, 1);
        } else {
          newInventory[existingIndex].quantity = newQuantity;
        }
        return { inventory: newInventory };
      }
      return {};
    }),

  setCurrentLocation: (locationId) => set({ currentLocationId: locationId }),

  visitLocation: (locationId) =>
    set((state) => ({
      visitedLocationIds: [...state.visitedLocationIds, locationId],
    })),

  travelToLocation: (locationId, cost) =>
    set((state) => {
      // Deduct travel costs
      const newFood = Math.max(0, state.food - cost.food);
      const newWater = Math.max(0, state.water - cost.water);
      const newEnergy = Math.max(0, state.energy - cost.energy);

      // Mark as visited if not already
      const newVisitedIds = state.visitedLocationIds.includes(locationId)
        ? state.visitedLocationIds
        : [...state.visitedLocationIds, locationId];

      return {
        currentLocationId: locationId,
        food: newFood,
        water: newWater,
        energy: newEnergy,
        visitedLocationIds: newVisitedIds,
      };
    }),

  resetGame: () => set(initialState),

  loadGame: (gameState) =>
    set({
      id: gameState.id,
      currentLocationId: gameState.currentLocationId,
      food: gameState.food,
      water: gameState.water,
      energy: gameState.energy,
      inventory: gameState.inventory,
      visitedLocationIds: gameState.visitedLocationIds,
      isActive: gameState.isActive,
    }),
}));
