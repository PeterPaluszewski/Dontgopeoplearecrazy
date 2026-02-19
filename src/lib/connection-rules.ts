/**
 * connection-rules.ts
 *
 * Defines the eligibility ruleset for each transport type and provides a
 * pure generator function that, given a list of locations with distances,
 * returns the set of (fromId, toId, transportSlug) tuples that should exist
 * in the database.
 *
 * Keeping this logic in TypeScript (rather than SQL) means:
 *  - It can be unit-tested without a DB
 *  - It can be re-run any time new cities or transport types are added
 *  - The output can be diffed against the current DB state before applying
 */

import { haversineKm } from '@/lib/globe-utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CityInput {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  isCoastal: boolean;
}

export interface GeneratedConnection {
  fromId: string;
  toId: string;
  distanceKm: number;
  transportSlug: string;
}

/**
 * A transport rule defines which city pairs are eligible for a given
 * transport type. All conditions must be satisfied simultaneously.
 */
export interface TransportRule {
  /** The transport_types.slug this rule corresponds to */
  slug: string;
  /** Human-readable description for logging/debugging */
  description: string;
  /** Maximum great-circle distance between the two cities (km). Null = no limit. */
  maxDistanceKm: number | null;
  /** Minimum great-circle distance between the two cities (km). Null = no limit. */
  minDistanceKm: number | null;
  /**
   * When true, both city endpoints must have isCoastal = true.
   * This models sea/river routes that only make sense between port cities.
   */
  requiresBothCoastal: boolean;
  /**
   * Optional arbitrary predicate for rules that can't be expressed by the
   * fields above (e.g. "same continent" or "not cross-water").
   * Return false to reject the pair.
   */
  predicate?: (a: CityInput, b: CityInput, distanceKm: number) => boolean;
}

// ---------------------------------------------------------------------------
// Ruleset
// ---------------------------------------------------------------------------

/**
 * Master ruleset — one entry per transport slug.
 *
 * Design notes:
 * - Distances are approximate gameplay values, not precise geography.
 * - "Coastal" routes (sailboat, freight_ship, cruise_ship) require both
 *   endpoints to be coastal; the `is_coastal` flag on each location controls
 *   this — it should be set by whoever seeds / updates the locations table.
 * - The `predicate` hook is used for qualitative exclusions that are hard to
 *   capture with a single number (e.g. cross-water walking).
 *
 * Speed reference (from transport_types seed):
 *   on_foot=5, bicycle=15, rickshaw=12, tuk_tuk=30,
 *   hitchhike=80, car=90, sailboat=20, freight_ship=30,
 *   cruise_ship=40, plane=800
 */
export const TRANSPORT_RULES: TransportRule[] = [
  {
    slug: 'on_foot',
    description: 'Walking: overland only, ≤500 km',
    maxDistanceKm: 500,
    minDistanceKm: null,
    requiresBothCoastal: false,
    predicate: (a, b, distanceKm) => !isCrossWater(a, b, distanceKm),
  },
  {
    slug: 'bicycle',
    description: 'Bicycle: overland only, ≤800 km',
    maxDistanceKm: 800,
    minDistanceKm: null,
    requiresBothCoastal: false,
    predicate: (a, b, distanceKm) => !isCrossWater(a, b, distanceKm),
  },
  {
    slug: 'rickshaw',
    description: 'Rickshaw: short urban hops, ≤150 km',
    maxDistanceKm: 150,
    minDistanceKm: null,
    requiresBothCoastal: false,
  },
  {
    slug: 'tuk_tuk',
    description: 'Tuk-Tuk: short regional hops, ≤300 km',
    maxDistanceKm: 300,
    minDistanceKm: null,
    requiresBothCoastal: false,
  },
  {
    slug: 'hitchhike',
    description: 'Hitchhike: overland only, ≤2000 km',
    maxDistanceKm: 2000,
    minDistanceKm: null,
    requiresBothCoastal: false,
    predicate: (a, b, distanceKm) => !isCrossWater(a, b, distanceKm),
  },
  {
    slug: 'car',
    description: 'Car: overland only, ≤2000 km',
    maxDistanceKm: 2000,
    minDistanceKm: null,
    requiresBothCoastal: false,
    predicate: (a, b, distanceKm) => !isCrossWater(a, b, distanceKm),
  },
  {
    slug: 'sailboat',
    description: 'Sailboat: coastal cities only, ≤1500 km',
    maxDistanceKm: 1500,
    minDistanceKm: null,
    requiresBothCoastal: true,
  },
  {
    slug: 'freight_ship',
    description: 'Freight ship: coastal cities only, ≤5000 km',
    maxDistanceKm: 5000,
    minDistanceKm: null,
    requiresBothCoastal: true,
  },
  {
    slug: 'cruise_ship',
    description: 'Cruise ship: coastal cities only, 200–3000 km',
    maxDistanceKm: 3000,
    minDistanceKm: 200,
    requiresBothCoastal: true,
  },
  {
    slug: 'plane',
    description: 'Plane: any pair, ≥500 km (no point flying next door)',
    maxDistanceKm: null,
    minDistanceKm: 500,
    requiresBothCoastal: false,
  },
];

// ---------------------------------------------------------------------------
// Cross-water heuristic
// ---------------------------------------------------------------------------

/**
 * A simple geographic heuristic: if two cities are separated by a known
 * body of water that cannot be crossed on land, return true.
 *
 * This is expressed as a list of named "water barriers", each defined by
 * a bounding box and the pairs of cities it separates.  Adding a new known
 * water barrier here automatically blocks it for all overland transport types
 * (on_foot, bicycle, hitchhike, car).
 *
 * This is intentionally a denylist — if a pair is NOT in the list we assume
 * it is overland-reachable.  Real geography is more complex, but this is a
 * game and the list can be extended city-by-city.
 */
interface WaterBarrier {
  name: string;
  /** Cities on the "west/north" side */
  sideA: string[];
  /** Cities on the "east/south" side */
  sideB: string[];
}

export const WATER_BARRIERS: WaterBarrier[] = [
  {
    name: 'English Channel',
    sideA: ['London'],
    sideB: ['Paris', 'Amsterdam', 'Brussels', 'Calais'],
  },
  {
    name: 'Strait of Gibraltar',
    sideA: ['Madrid', 'Lisbon', 'Seville'],
    sideB: ['Casablanca', 'Tangier', 'Marrakech'],
  },
  {
    name: 'Mediterranean Sea (Italy–Africa)',
    sideA: ['Rome', 'Naples', 'Palermo', 'Milan'],
    sideB: ['Tunis', 'Tripoli', 'Algiers'],
  },
  {
    name: 'Bosphorus / Black Sea (minor — overland via Turkey exists)',
    sideA: [],
    sideB: [],
    // Left empty intentionally — Istanbul bridges Europe and Asia overland.
  },
  {
    name: 'Atlantic Ocean',
    sideA: ['London', 'Paris', 'Madrid', 'Lisbon', 'Dublin'],
    sideB: [
      'New York',
      'Boston',
      'Philadelphia',
      'Washington',
      'Miami',
      'Toronto',
      'Montreal',
      'Quebec City',
    ],
  },
  {
    name: 'Pacific Ocean (Americas–Asia)',
    sideA: ['Los Angeles', 'San Francisco', 'Seattle', 'Vancouver', 'San Diego', 'Portland'],
    sideB: [
      'Tokyo',
      'Osaka',
      'Seoul',
      'Beijing',
      'Shanghai',
      'Hong Kong',
      'Taipei',
      'Manila',
      'Singapore',
    ],
  },
  {
    name: 'Pacific Ocean (Americas–Oceania)',
    sideA: [
      'Los Angeles',
      'San Francisco',
      'Seattle',
      'Vancouver',
      'San Diego',
      'Lima',
      'Santiago',
    ],
    sideB: ['Sydney', 'Melbourne', 'Brisbane', 'Auckland', 'Perth'],
  },
  {
    name: 'Indian Ocean',
    sideA: ['Nairobi', 'Dar es Salaam', 'Johannesburg', 'Cape Town', 'Mombasa'],
    sideB: ['Mumbai', 'Chennai', 'Colombo', 'Perth'],
  },
];

/**
 * Returns true if city pair (a, b) is separated by a known water barrier.
 * Distance is passed in to allow future heuristics (e.g. a 3km strait is
 * not the same barrier as a 5000km ocean).
 */
export function isCrossWater(a: CityInput, b: CityInput, _distanceKm: number): boolean {
  for (const barrier of WATER_BARRIERS) {
    const aInA = barrier.sideA.includes(a.name);
    const bInB = barrier.sideB.includes(b.name);
    const aInB = barrier.sideB.includes(a.name);
    const bInA = barrier.sideA.includes(b.name);
    if ((aInA && bInB) || (aInB && bInA)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Given a list of cities, return every (from, to, transportSlug) triple that
 * satisfies the ruleset. Each pair is only evaluated once (a→b, not b→a again)
 * because all connections are stored as bidirectional rows.
 *
 * @param cities   - Full list of city inputs (all locations in the DB)
 * @param rules    - Ruleset to apply (defaults to TRANSPORT_RULES)
 * @returns Array of GeneratedConnection objects, sorted by slug then distance
 */
export function generateConnections(
  cities: CityInput[],
  rules: TransportRule[] = TRANSPORT_RULES
): GeneratedConnection[] {
  const results: GeneratedConnection[] = [];

  for (let i = 0; i < cities.length; i++) {
    for (let j = i + 1; j < cities.length; j++) {
      const a = cities[i];
      const b = cities[j];
      const distanceKm = haversineKm(a.latitude, a.longitude, b.latitude, b.longitude);

      for (const rule of rules) {
        if (!isEligible(a, b, distanceKm, rule)) continue;
        results.push({ fromId: a.id, toId: b.id, distanceKm, transportSlug: rule.slug });
      }
    }
  }

  results.sort((x, y) =>
    x.transportSlug !== y.transportSlug
      ? x.transportSlug.localeCompare(y.transportSlug)
      : x.distanceKm - y.distanceKm
  );

  return results;
}

/**
 * Test whether a single city pair satisfies a given rule.
 * Exported so individual rules can be unit-tested directly.
 */
export function isEligible(
  a: CityInput,
  b: CityInput,
  distanceKm: number,
  rule: TransportRule
): boolean {
  if (rule.maxDistanceKm !== null && distanceKm > rule.maxDistanceKm) return false;
  if (rule.minDistanceKm !== null && distanceKm < rule.minDistanceKm) return false;
  if (rule.requiresBothCoastal && !(a.isCoastal && b.isCoastal)) return false;
  if (rule.predicate && !rule.predicate(a, b, distanceKm)) return false;
  return true;
}
