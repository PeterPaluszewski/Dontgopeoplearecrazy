export interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  difficultyMultiplier: number;
  travelDays: number;
  connectedLocationIds: string[];
}

export interface Item {
  id: string;
  name: string;
  description: string;
  weight: number;
  foodValue: number;
  waterValue: number;
  energyValue: number;
  itemType: 'FOOD' | 'WATER' | 'EQUIPMENT' | 'CONSUMABLE';
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}

export interface GameState {
  id: string;
  userId: string;
  currentLocationId: string;
  food: number;
  water: number;
  energy: number;
  inventory: InventoryItem[];
  visitedLocationIds: string[];
  isActive: boolean;
  difficulty?: 'easy' | 'normal' | 'hard';
  characterName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  eventType: 'RANDOM' | 'LOCATION_BASED' | 'RESOURCE_BASED';
  foodEffect: number;
  waterEffect: number;
  energyEffect: number;
  choices: EventChoice[];
}

export interface EventChoice {
  id: string;
  text: string;
  foodEffect: number;
  waterEffect: number;
  energyEffect: number;
}
