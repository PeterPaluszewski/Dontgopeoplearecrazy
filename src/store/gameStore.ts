import * as saveLoadLib from '@/lib/save-load';
import { TravelCost } from '@/lib/travel-utils';
import { GameState, InventoryItem, Item } from '@/types/game';
import { create } from 'zustand';

interface GameStore extends Omit<GameState, 'userId' | 'createdAt' | 'updatedAt'> {
  updateResources: (food: number, water: number, energy: number) => void;
  addInventoryItem: (item: Item, quantity: number) => void;
  removeInventoryItem: (itemId: string, quantity: number) => void;
  setCurrentLocation: (locationId: string) => void;
  setCurrentLocationId: (locationId: string) => void;
  visitLocation: (locationId: string) => void;
  travelToLocation: (locationId: string, cost: TravelCost) => void;
  resetGame: () => void;
  loadGame: (gameState: GameState) => void;
  loadGameState: (gameState: GameState) => void;
  saveGame: () => Promise<{ success: boolean; error?: string }>;
  loadGameFromDB: () => Promise<{ success: boolean; error?: string }>;
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
  difficulty: undefined as 'easy' | 'normal' | 'hard' | undefined,
  characterName: undefined as string | undefined,
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

  setCurrentLocationId: (locationId) => set({ currentLocationId: locationId }),

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
      difficulty: gameState.difficulty,
      characterName: gameState.characterName,
    }),

  loadGameState: (gameState) =>
    set({
      id: gameState.id,
      currentLocationId: gameState.currentLocationId,
      food: gameState.food,
      water: gameState.water,
      energy: gameState.energy,
      inventory: gameState.inventory,
      visitedLocationIds: gameState.visitedLocationIds,
      isActive: gameState.isActive,
      difficulty: gameState.difficulty,
      characterName: gameState.characterName,
    }),

  saveGame: async () => {
    const state = useGameStore.getState();
    const result = await saveLoadLib.saveGame({
      id: state.id || undefined,
      currentLocationId: state.currentLocationId,
      food: state.food,
      water: state.water,
      energy: state.energy,
      inventory: state.inventory,
      visitedLocationIds: state.visitedLocationIds,
      isActive: state.isActive,
    });

    // Update the ID if it was a new save
    if (result.success && result.gameStateId && !state.id) {
      set({ id: result.gameStateId });
    }

    return result;
  },

  loadGameFromDB: async () => {
    const result = await saveLoadLib.loadGame();

    if (result.success && result.gameState) {
      set({
        id: result.gameState.id,
        currentLocationId: result.gameState.currentLocationId,
        food: result.gameState.food,
        water: result.gameState.water,
        energy: result.gameState.energy,
        inventory: result.gameState.inventory,
        visitedLocationIds: result.gameState.visitedLocationIds,
        isActive: result.gameState.isActive,
      });
    }

    return result;
  },
}));
