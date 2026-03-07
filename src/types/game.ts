export interface TransportType {
  id: string;
  slug: string;
  name: string;
  speedKmh: number;
  baseCostMultiplier: number;
  requiresItemSlug: string | null;
  requiresCoastal: boolean;
}

export interface ConnectionTransportType {
  id: string;
  connectionId: string;
  transportTypeId: string;
  transportType?: TransportType;
  isForward: boolean;
  costMultiplierOverride: number | null;
}

export interface LocationConnection {
  id: string;
  fromId: string;
  toId: string;
  distanceKm: number | null;
  difficultyModifier: number;
  isBidirectional: boolean;
  transportOptions?: ConnectionTransportType[];
}

/**
 * Lightweight travel detail for one connection endpoint + one transport mode,
 * pre-joined from location_connections + connection_transport_types + transport_types.
 */
export interface ConnectionDetail {
  toId: string;
  distanceKm: number;
  transportSlug: string;
  speedKmh: number;
  /** Multiplier applied to the base money cost per day (1.0 = normal, higher = more expensive). */
  baseCostMultiplier: number;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  difficultyMultiplier: number;
  isCoastal: boolean;
  /**
   * Overland region identifier (e.g. 'europe_mainland', 'british_isles', 'north_america').
   * Two cities in the same region are assumed to be overland-reachable;
   * different regions require a water crossing.
   */
  region: string;
  /** IDs of directly reachable locations — assembled from the location_connections table */
  connectedLocationIds: string[];
  /**
   * All available transport options per outbound connection, one entry per transport type.
   * Populated by getAllLocations(). Each unique `toId` may appear multiple times (one per mode).
   * Sorted by speedKmh ascending (slowest first) so the UI can present cheapest → fastest.
   */
  connections: ConnectionDetail[];
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
  money: number;
  inventory: InventoryItem[];
  visitedLocationIds: string[];
  isActive: boolean;
  difficulty?: 'easy' | 'normal' | 'hard';
  characterName?: string;
  /** Total fractional travel days elapsed since the game started. Used for the in-game clock. */
  totalTravelDays?: number;
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
