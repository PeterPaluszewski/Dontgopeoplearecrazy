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
  /**
   * Overland region identifier. Cities in the same region are assumed to be
   * reachable by land; cities in different regions require a water crossing.
   * Examples: 'europe_mainland', 'british_isles', 'north_america', 'south_america',
   *           'africa', 'asia', 'oceania'
   */
  region: string;
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
   * fields above (e.g. same-region / cross-water checks).
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
 * - Overland transport types (on_foot, bicycle, hitchhike, car) use
 *   `sameRegion(a, b)` as their predicate: cities must share the same
 *   overland `region` value (set on each location in the DB) to be
 *   connected.  Adding new cities just requires setting their `region`.
 * - "Coastal" routes (sailboat, freight_ship, cruise_ship) require both
 *   endpoints to be coastal; the `is_coastal` flag on each location controls
 *   this — it should be set by whoever seeds / updates the locations table.
 *
 * Speed reference (from transport_types seed):
 *   on_foot=5, bicycle=15, rickshaw=12, tuk_tuk=30,
 *   hitchhike=80, car=90, sailboat=20, freight_ship=30,
 *   cruise_ship=40, plane=800
 */
export const TRANSPORT_RULES: TransportRule[] = [
  {
    slug: 'on_foot',
    description: 'Walking: same region (overland), ≤500 km',
    maxDistanceKm: 500,
    minDistanceKm: null,
    requiresBothCoastal: false,
    predicate: (a, b) => sameRegion(a, b),
  },
  {
    slug: 'bicycle',
    description: 'Bicycle: same region (overland), ≤800 km',
    maxDistanceKm: 800,
    minDistanceKm: null,
    requiresBothCoastal: false,
    predicate: (a, b) => sameRegion(a, b),
  },
  {
    slug: 'rickshaw',
    description: 'Rickshaw: same region, short urban hops, ≤150 km',
    maxDistanceKm: 150,
    minDistanceKm: null,
    requiresBothCoastal: false,
    predicate: (a, b) => sameRegion(a, b),
  },
  {
    slug: 'tuk_tuk',
    description: 'Tuk-Tuk: same region, short regional hops, ≤300 km',
    maxDistanceKm: 300,
    minDistanceKm: null,
    requiresBothCoastal: false,
    predicate: (a, b) => sameRegion(a, b),
  },
  {
    slug: 'hitchhike',
    description: 'Hitchhike: same region (overland), ≤2000 km',
    maxDistanceKm: 2000,
    minDistanceKm: null,
    requiresBothCoastal: false,
    predicate: (a, b) => sameRegion(a, b),
  },
  {
    slug: 'car',
    description: 'Car: same region (overland), ≤2000 km',
    maxDistanceKm: 2000,
    minDistanceKm: null,
    requiresBothCoastal: false,
    predicate: (a, b) => sameRegion(a, b),
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
// Region check
// ---------------------------------------------------------------------------

/**
 * Returns true if two cities share the same overland region and can therefore
 * be connected by land-based transport without a water crossing.
 *
 * The `region` field on each location is the single source of truth.  To add
 * a new landmass or island group, just define a new region slug and assign it
 * to the relevant cities in the DB — no code changes needed here.
 *
 * Suggested region slugs:
 *   europe_mainland  — Continental Europe (France, Germany, Spain, …)
 *   british_isles    — UK, Ireland
 *   north_africa     — Morocco, Algeria, Tunisia, Egypt, …
 *   sub_saharan_africa
 *   north_america    — USA, Canada, Mexico (connected overland)
 *   central_america
 *   south_america
 *   asia_mainland    — Russia, China, India, SE Asia (… all connected overland)
 *   japan            — Japanese archipelago
 *   indonesia        — Indonesian archipelago
 *   philippines
 *   oceania          — Australia + NZ (separate islands — assign individually)
 *   australia
 *   new_zealand
 */
export function sameRegion(a: CityInput, b: CityInput): boolean {
  return a.region === b.region;
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
