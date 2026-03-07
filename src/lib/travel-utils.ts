import { ConnectionDetail, Location } from '@/types/game';

export interface TravelCost {
  food: number;
  water: number;
  energy: number;
}

/** Fallback when a connection has no transport data (5 km/h walking). */
const FALLBACK_CONNECTION: Omit<ConnectionDetail, 'toId'> = {
  distanceKm: 0,
  transportSlug: 'on_foot',
  speedKmh: 5,
};

/**
 * Find the pre-loaded ConnectionDetail for a specific from→to leg.
 * Returns a fallback (walking, 0 km) if the locations array doesn't have
 * connection data — this keeps tests simple and handles legacy saves.
 */
export function getConnectionDetail(
  locations: Location[],
  fromId: string,
  toId: string
): ConnectionDetail {
  const from = locations.find((l) => l.id === fromId);
  if (from) {
    const detail = from.connections.find((c) => c.toId === toId);
    if (detail) return detail;
  }
  return { toId, ...FALLBACK_CONNECTION };
}

/**
 * Calculate the number of travel days given distance and transport speed.
 * @param distanceKm Distance in kilometres
 * @param speedKmh Transport speed in km/h
 * @returns Number of days, minimum 1
 */
export function calculateTravelDays(distanceKm: number, speedKmh: number): number {
  if (speedKmh <= 0) return 1;
  return Math.max(1, Math.ceil(distanceKm / speedKmh / 24));
}

/**
 * Calculate resource costs for traveling to a location
 * Formula: base cost per day * travel days * difficulty multiplier
 * @param travelDays Number of days to travel
 * @param difficulty Difficulty rating of the destination (1-5)
 * @returns Resource costs for the journey
 */
export function calculateTravelCost(travelDays: number, difficulty: number): TravelCost {
  // Base cost per day
  const baseFoodCost = 15;
  const baseWaterCost = 20;
  const baseEnergyCost = 25;

  // Difficulty multiplier (1.0 to 2.0)
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.25;

  return {
    food: Math.ceil(baseFoodCost * travelDays * difficultyMultiplier),
    water: Math.ceil(baseWaterCost * travelDays * difficultyMultiplier),
    energy: Math.ceil(baseEnergyCost * travelDays * difficultyMultiplier),
  };
}

/**
 * Check if player has sufficient resources for travel
 */
export function canAffordTravel(
  currentResources: { food: number; water: number; energy: number },
  cost: TravelCost
): boolean {
  return (
    currentResources.food >= cost.food &&
    currentResources.water >= cost.water &&
    currentResources.energy >= cost.energy
  );
}

/**
 * Validate if travel to a location is possible
 */
export function canTravelToLocation(
  currentLocationId: string,
  destination: Location,
  connectedLocationIds: string[]
): { canTravel: boolean; reason?: string } {
  if (currentLocationId === destination.id) {
    return { canTravel: false, reason: 'You are already at this location' };
  }

  if (!connectedLocationIds.includes(destination.id)) {
    return {
      canTravel: false,
      reason: 'This location is not directly accessible from your current position',
    };
  }

  return { canTravel: true };
}
