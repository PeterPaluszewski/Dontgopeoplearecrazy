import { haversineKm } from '@/lib/globe-utils';
import { ConnectionDetail, Location } from '@/types/game';

export interface TravelCost {
  food: number;
  water: number;
  energy: number;
}

/**
 * Hours of active travel assumed per in-game day, for all transport types.
 * A plane covers 800 km/h × 8 h = 6,400 km/day; a walker covers 5 × 8 = 40 km/day.
 * Using the same constant keeps the model simple and gives meaningful multi-day results
 * even for fast transport over very long distances.
 */
export const TRAVEL_HOURS_PER_DAY = 8;

/** Fallback transport slug/speed when a connection has no transport data (5 km/h walking). */
const FALLBACK_SPEED_KMH = 5;
const FALLBACK_TRANSPORT_SLUG = 'on_foot';

/**
 * Find the pre-loaded ConnectionDetail for a specific from→to leg.
 * If the connection isn't in the loaded data, calculates distance from
 * coordinates (haversine) and falls back to walking speed.
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

  // Compute distance from coordinates so travel days aren't always 1.
  const fromLoc = locations.find((l) => l.id === fromId);
  const toLoc = locations.find((l) => l.id === toId);
  const distanceKm =
    fromLoc && toLoc
      ? haversineKm(fromLoc.latitude, fromLoc.longitude, toLoc.latitude, toLoc.longitude)
      : 0;

  return { toId, distanceKm, transportSlug: FALLBACK_TRANSPORT_SLUG, speedKmh: FALLBACK_SPEED_KMH };
}

/** Maps a transport slug to a readable name shown in the UI. */
export const TRANSPORT_NAMES: Record<string, string> = {
  on_foot: 'on foot',
  bicycle: 'by bicycle',
  rickshaw: 'by rickshaw',
  tuk_tuk: 'by tuk-tuk',
  hitchhike: 'by hitchhike',
  car: 'by car',
  bus: 'by bus',
  train: 'by train',
  ferry: 'by ferry',
  sailboat: 'by sailboat',
  freight_ship: 'by freight ship',
  cruise_ship: 'by cruise ship',
  plane: 'by plane',
};

/**
 * Format a journey duration as a human-readable string with optional transport name.
 * e.g. "2 days 4 hours by plane", "6 hours by train", "1 day on foot".
 */
export function formatTravelDuration(
  distanceKm: number,
  speedKmh: number,
  transportSlug: string
): string {
  const totalHours = speedKmh > 0 ? distanceKm / speedKmh : distanceKm / FALLBACK_SPEED_KMH;
  const days = Math.floor(totalHours / TRAVEL_HOURS_PER_DAY);
  const remainingHours = Math.round(totalHours % TRAVEL_HOURS_PER_DAY);

  const transportName = TRANSPORT_NAMES[transportSlug] ?? `by ${transportSlug}`;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  if (remainingHours > 0)
    parts.push(`${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`);
  if (parts.length === 0) parts.push('< 1 hour');

  return `${parts.join(' ')} ${transportName}`;
}

/**
 * Calculate the number of travel days given distance and transport speed.
 * Uses ceiling so that even a short journey costs at least 1 day of resources.
 * e.g. plane 800 km/h × 8 h = 6,400 km/day; on foot 5 km/h × 8 h = 40 km/day.
 * @param distanceKm Distance in kilometres
 * @param speedKmh Transport speed in km/h
 * @returns Number of days (ceiling), minimum 1
 */
export function calculateTravelDays(distanceKm: number, speedKmh: number): number {
  if (speedKmh <= 0) return 1;
  return Math.max(1, Math.ceil(distanceKm / speedKmh / TRAVEL_HOURS_PER_DAY));
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
