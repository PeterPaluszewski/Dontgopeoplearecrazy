import { describe, expect, it } from 'vitest';
import {
  TRANSPORT_RULES,
  WATER_BARRIERS,
  generateConnections,
  isCrossWater,
  isEligible,
  type CityInput,
  type TransportRule,
} from './connection-rules';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const BUDAPEST: CityInput = {
  id: 'bud',
  name: 'Budapest',
  latitude: 47.4979,
  longitude: 19.0402,
  isCoastal: false,
};
const VIENNA: CityInput = {
  id: 'vie',
  name: 'Vienna',
  latitude: 48.2082,
  longitude: 16.3738,
  isCoastal: false,
};
const BERLIN: CityInput = {
  id: 'ber',
  name: 'Berlin',
  latitude: 52.52,
  longitude: 13.405,
  isCoastal: false,
};
const PRAGUE: CityInput = {
  id: 'prg',
  name: 'Prague',
  latitude: 50.0755,
  longitude: 14.4378,
  isCoastal: false,
};
const AMSTERDAM: CityInput = {
  id: 'ams',
  name: 'Amsterdam',
  latitude: 52.3676,
  longitude: 4.9041,
  isCoastal: false,
};
const PARIS: CityInput = {
  id: 'par',
  name: 'Paris',
  latitude: 48.8566,
  longitude: 2.3522,
  isCoastal: false,
};
const LONDON: CityInput = {
  id: 'lon',
  name: 'London',
  latitude: 51.5074,
  longitude: -0.1278,
  isCoastal: false,
};
const LISBON: CityInput = {
  id: 'lis',
  name: 'Lisbon',
  latitude: 38.7223,
  longitude: -9.1393,
  isCoastal: true,
};
const BARCELONA: CityInput = {
  id: 'bcn',
  name: 'Barcelona',
  latitude: 41.3851,
  longitude: 2.1734,
  isCoastal: true,
};

const ALL_CITIES = [BUDAPEST, VIENNA, BERLIN, PRAGUE, AMSTERDAM, PARIS, LONDON, LISBON, BARCELONA];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ruleFor(slug: string): TransportRule {
  const rule = TRANSPORT_RULES.find((r) => r.slug === slug);
  if (!rule) throw new Error(`No rule found for slug "${slug}"`);
  return rule;
}

// ---------------------------------------------------------------------------
// TRANSPORT_RULES shape
// ---------------------------------------------------------------------------

describe('TRANSPORT_RULES', () => {
  const expectedSlugs = [
    'on_foot',
    'bicycle',
    'rickshaw',
    'tuk_tuk',
    'hitchhike',
    'car',
    'sailboat',
    'freight_ship',
    'cruise_ship',
    'plane',
  ];

  it('contains exactly the 10 expected transport slugs', () => {
    expect(TRANSPORT_RULES.map((r) => r.slug).sort()).toEqual(expectedSlugs.sort());
  });

  it('every rule has a non-empty description', () => {
    for (const rule of TRANSPORT_RULES) {
      expect(rule.description.length).toBeGreaterThan(0);
    }
  });

  it('plane has no maxDistanceKm (global)', () => {
    expect(ruleFor('plane').maxDistanceKm).toBeNull();
  });

  it('coastal transport types require both coastal', () => {
    for (const slug of ['sailboat', 'freight_ship', 'cruise_ship']) {
      expect(ruleFor(slug).requiresBothCoastal).toBe(true);
    }
  });

  it('overland transport types do not require coastal', () => {
    for (const slug of ['on_foot', 'bicycle', 'rickshaw', 'tuk_tuk', 'hitchhike', 'car', 'plane']) {
      expect(ruleFor(slug).requiresBothCoastal).toBe(false);
    }
  });

  it('rickshaw is the most range-limited overland type', () => {
    const rickshaw = ruleFor('rickshaw');
    const bicycle = ruleFor('bicycle');
    expect(rickshaw.maxDistanceKm!).toBeLessThan(bicycle.maxDistanceKm!);
  });
});

// ---------------------------------------------------------------------------
// isCrossWater
// ---------------------------------------------------------------------------

describe('isCrossWater', () => {
  it('returns true for London ↔ Paris (English Channel)', () => {
    expect(isCrossWater(LONDON, PARIS, 344)).toBe(true);
    expect(isCrossWater(PARIS, LONDON, 344)).toBe(true);
  });

  it('returns true for London ↔ Amsterdam (English Channel)', () => {
    expect(isCrossWater(LONDON, AMSTERDAM, 358)).toBe(true);
  });

  it('returns false for Budapest ↔ Vienna (overland)', () => {
    expect(isCrossWater(BUDAPEST, VIENNA, 214)).toBe(false);
  });

  it('returns false for Amsterdam ↔ Paris (overland via Belgium)', () => {
    expect(isCrossWater(AMSTERDAM, PARIS, 430)).toBe(false);
  });

  it('returns false for cities not mentioned in any barrier', () => {
    const unknown: CityInput = {
      id: 'x',
      name: 'Atlantis',
      latitude: 0,
      longitude: 0,
      isCoastal: false,
    };
    expect(isCrossWater(BUDAPEST, unknown, 999)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// WATER_BARRIERS completeness
// ---------------------------------------------------------------------------

describe('WATER_BARRIERS', () => {
  it('has at least one entry for the English Channel', () => {
    const channel = WATER_BARRIERS.find((b) => b.name === 'English Channel');
    expect(channel).toBeDefined();
    expect(channel!.sideA).toContain('London');
  });

  it('Atlantic Ocean barrier separates London from New York', () => {
    const atlantic = WATER_BARRIERS.find((b) => b.name === 'Atlantic Ocean');
    expect(atlantic).toBeDefined();
    expect(atlantic!.sideA).toContain('London');
    expect(atlantic!.sideB).toContain('New York');
  });
});

// ---------------------------------------------------------------------------
// isEligible
// ---------------------------------------------------------------------------

describe('isEligible', () => {
  describe('distance filtering', () => {
    it('accepts pair within maxDistanceKm', () => {
      expect(isEligible(BUDAPEST, VIENNA, 214, ruleFor('on_foot'))).toBe(true);
    });

    it('rejects pair beyond maxDistanceKm', () => {
      expect(isEligible(PARIS, LISBON, 1450, ruleFor('on_foot'))).toBe(false);
    });

    it('accepts pair above minDistanceKm (plane)', () => {
      expect(isEligible(PARIS, LISBON, 1450, ruleFor('plane'))).toBe(true);
    });

    it('rejects pair below minDistanceKm (plane)', () => {
      // Budapest–Vienna 214 km < 500 km plane minimum
      expect(isEligible(BUDAPEST, VIENNA, 214, ruleFor('plane'))).toBe(false);
    });

    it('accepts pair satisfying both min and max (cruise_ship between coastal cities)', () => {
      expect(isEligible(LISBON, BARCELONA, 990, ruleFor('cruise_ship'))).toBe(true);
    });
  });

  describe('coastal requirement', () => {
    it('rejects sailboat between two inland cities', () => {
      expect(isEligible(BUDAPEST, VIENNA, 214, ruleFor('sailboat'))).toBe(false);
    });

    it('rejects sailboat where only one city is coastal', () => {
      expect(isEligible(LISBON, PARIS, 1440, ruleFor('sailboat'))).toBe(false);
    });

    it('accepts sailboat between two coastal cities within range', () => {
      expect(isEligible(LISBON, BARCELONA, 990, ruleFor('sailboat'))).toBe(true);
    });
  });

  describe('cross-water predicate', () => {
    it('rejects on_foot London ↔ Paris (English Channel)', () => {
      expect(isEligible(LONDON, PARIS, 344, ruleFor('on_foot'))).toBe(false);
    });

    it('rejects bicycle London ↔ Paris (English Channel)', () => {
      expect(isEligible(LONDON, PARIS, 344, ruleFor('bicycle'))).toBe(false);
    });

    it('accepts on_foot Amsterdam ↔ Paris (overland)', () => {
      expect(isEligible(AMSTERDAM, PARIS, 430, ruleFor('on_foot'))).toBe(true);
    });

    it('plane has no cross-water predicate — accepts London ↔ New York regardless', () => {
      const nyc: CityInput = {
        id: 'nyc',
        name: 'New York',
        latitude: 40.71,
        longitude: -74.0,
        isCoastal: false,
      };
      expect(isEligible(LONDON, nyc, 5570, ruleFor('plane'))).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// generateConnections
// ---------------------------------------------------------------------------

describe('generateConnections', () => {
  it('returns a GeneratedConnection for every eligible pair × rule combination', () => {
    const connections = generateConnections(ALL_CITIES);
    // Every result should have valid IDs and a known transport slug
    const slugs = new Set(TRANSPORT_RULES.map((r) => r.slug));
    for (const c of connections) {
      expect(c.fromId).toBeDefined();
      expect(c.toId).toBeDefined();
      expect(c.distanceKm).toBeGreaterThan(0);
      expect(slugs.has(c.transportSlug)).toBe(true);
    }
  });

  it('includes all 5 confirmed walking connections', () => {
    const walking = generateConnections(ALL_CITIES)
      .filter((c) => c.transportSlug === 'on_foot')
      .map((c) => [c.fromId, c.toId].sort().join('-'))
      .sort();

    const expected = [
      ['bud', 'vie'],
      ['prg', 'vie'],
      ['ber', 'prg'],
      ['ams', 'par'],
      ['bud', 'prg'],
    ]
      .map(([a, b]) => [a, b].sort().join('-'))
      .sort();

    expect(walking).toEqual(expected);
  });

  it('does NOT include a walking connection for London ↔ Paris', () => {
    const walking = generateConnections(ALL_CITIES).filter((c) => c.transportSlug === 'on_foot');
    const lonPar = walking.find(
      (c) => [c.fromId, c.toId].sort().join('-') === ['lon', 'par'].sort().join('-')
    );
    expect(lonPar).toBeUndefined();
  });

  it('does NOT include a walking connection for London ↔ Amsterdam', () => {
    const walking = generateConnections(ALL_CITIES).filter((c) => c.transportSlug === 'on_foot');
    const lonAms = walking.find(
      (c) => [c.fromId, c.toId].sort().join('-') === ['ams', 'lon'].sort().join('-')
    );
    expect(lonAms).toBeUndefined();
  });

  it('includes sailboat only for coastal-coastal pairs', () => {
    const boats = generateConnections(ALL_CITIES).filter((c) => c.transportSlug === 'sailboat');
    for (const conn of boats) {
      const a = ALL_CITIES.find((c) => c.id === conn.fromId)!;
      const b = ALL_CITIES.find((c) => c.id === conn.toId)!;
      expect(a.isCoastal && b.isCoastal).toBe(true);
    }
  });

  it('results are sorted by slug then distance', () => {
    const connections = generateConnections(ALL_CITIES);
    for (let i = 1; i < connections.length; i++) {
      const prev = connections[i - 1];
      const curr = connections[i];
      const slugCmp = prev.transportSlug.localeCompare(curr.transportSlug);
      if (slugCmp === 0) {
        expect(prev.distanceKm).toBeLessThanOrEqual(curr.distanceKm);
      } else {
        expect(slugCmp).toBeLessThanOrEqual(0);
      }
    }
  });

  it('each pair appears at most once per transport slug', () => {
    const connections = generateConnections(ALL_CITIES);
    const seen = new Set<string>();
    for (const c of connections) {
      const key = `${c.transportSlug}|${[c.fromId, c.toId].sort().join('|')}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('respects a custom single-rule override', () => {
    const singleRule: TransportRule[] = [
      {
        slug: 'on_foot',
        description: 'test',
        maxDistanceKm: 250,
        minDistanceKm: null,
        requiresBothCoastal: false,
      },
    ];
    const results = generateConnections(ALL_CITIES, singleRule);
    for (const r of results) {
      expect(r.distanceKm).toBeLessThanOrEqual(250);
    }
  });
});
