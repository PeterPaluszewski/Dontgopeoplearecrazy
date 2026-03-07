import { haversineKm } from '@/lib/globe-utils';
import { ConnectionDetail, Location } from '@/types/game';

export interface TravelCost {
  food: number;
  water: number;
  energy: number;
  /** Monetary cost in euros (€). Scales with transport baseCostMultiplier. */
  money: number;
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
 * Returns the fastest available option (highest speedKmh).
 * Falls back to walking if no connection data is found.
 */
export function getConnectionDetail(
  locations: Location[],
  fromId: string,
  toId: string
): ConnectionDetail {
  const options = getAllConnectionOptions(locations, fromId, toId);
  // Return fastest option
  return options.reduce((best, opt) => (opt.speedKmh > best.speedKmh ? opt : best), options[0]);
}

/**
 * Return all available transport options for a from→to leg, sorted slowest→fastest.
 * Falls back to a single walking entry if no connection data is found.
 */
export function getAllConnectionOptions(
  locations: Location[],
  fromId: string,
  toId: string
): ConnectionDetail[] {
  const from = locations.find((l) => l.id === fromId);
  if (from) {
    const options = from.connections.filter((c) => c.toId === toId);
    if (options.length > 0) return options.slice().sort((a, b) => a.speedKmh - b.speedKmh);
  }

  // Fallback: compute distance from coordinates, return walking only
  const fromLoc = locations.find((l) => l.id === fromId);
  const toLoc = locations.find((l) => l.id === toId);
  const distanceKm =
    fromLoc && toLoc
      ? haversineKm(fromLoc.latitude, fromLoc.longitude, toLoc.latitude, toLoc.longitude)
      : 0;

  return [
    {
      toId,
      distanceKm,
      transportSlug: FALLBACK_TRANSPORT_SLUG,
      speedKmh: FALLBACK_SPEED_KMH,
      baseCostMultiplier: 0,
    },
  ];
}

/**
 * Derive a human-readable transport label from a slug.
 * Slugs use snake_case: 'on_foot' → 'on foot', everything else → 'by <words>'.
 * e.g. 'cruise_ship' → 'by cruise ship', 'tuk_tuk' → 'by tuk tuk'
 */
export function slugToTransportName(slug: string): string {
  const words = slug.replace(/_/g, ' ');
  if (slug === 'on_foot') return words; // 'on foot' needs no prefix
  return `by ${words}`;
}

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

  const transportName = slugToTransportName(transportSlug);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  if (remainingHours > 0)
    parts.push(`${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`);
  if (parts.length === 0) parts.push('< 1 hour');

  return `${parts.join(' ')} ${transportName}`;
}

/**
 * Calculate the (fractional) travel days for clock advancement and resource costs.
 * Preserves hours within a day so the game clock advances correctly and
 * resource costs scale proportionally with actual journey time.
 * e.g. 1050 km at 200 km/h, 8h/day = 0.656 days (≈ 15h 44min of clock time)
 * @param distanceKm Distance in kilometres
 * @param speedKmh Transport speed in km/h
 * @returns Fractional days, exact value (no rounding)
 */
export function calculateTravelDays(distanceKm: number, speedKmh: number): number {
  if (speedKmh <= 0) return distanceKm / FALLBACK_SPEED_KMH / TRAVEL_HOURS_PER_DAY;
  return distanceKm / speedKmh / TRAVEL_HOURS_PER_DAY;
}

/**
 * Flat booking/ticket cost per journey, scaled by baseCostMultiplier.
 * Ensures fast transport (plane) stays expensive even over short distances,
 * because the fare is paid regardless of travel time.
 * Walking/free transport (multiplier 0) incurs no flat fare.
 */
export const BASE_FARE = 20;

/**
 * Additional per-day cost on top of the flat fare, scaled by baseCostMultiplier.
 * Covers en-route expenses (food on board, fuel share, etc.).
 */
export const BASE_MONEY_RATE_PER_DAY = 5;

/**
 * Calculate resource costs for traveling to a location.
 *
 * Food/water/energy scale purely with travel days and destination difficulty —
 * they represent physical exertion and consumption regardless of transport mode.
 *
 * Money uses a two-part model so that fast-but-expensive transport (plane) and
 * slow-but-cheap transport (walking) both price correctly:
 *
 *   money = ceil( BASE_FARE × m + BASE_MONEY_RATE_PER_DAY × travelDays × m )
 *
 * where m = baseCostMultiplier (0 = free, 1 = budget, 5 = luxury/air).
 *
 * Examples at m=5 (plane, 0.2 days):  ceil(20×5 + 5×0.2×5) = €105
 * Examples at m=1.5 (ship, 6 days):   ceil(20×1.5 + 5×6×1.5) = €75
 *
 * @param travelDays Fractional travel days
 * @param difficulty Difficulty rating of the destination (1–5)
 * @param baseCostMultiplier Transport cost tier (0 = free/walking, 1 = budget, higher = expensive)
 * @returns Resource costs for the journey
 */
export function calculateTravelCost(
  travelDays: number,
  difficulty: number,
  baseCostMultiplier = 0
): TravelCost {
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
    money: Math.ceil(
      BASE_FARE * baseCostMultiplier + BASE_MONEY_RATE_PER_DAY * travelDays * baseCostMultiplier
    ),
  };
}

/**
 * Check if player has sufficient resources for travel
 */
export function canAffordTravel(
  currentResources: { food: number; water: number; energy: number; money: number },
  cost: TravelCost
): boolean {
  return (
    currentResources.food >= cost.food &&
    currentResources.water >= cost.water &&
    currentResources.energy >= cost.energy &&
    currentResources.money >= cost.money
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
