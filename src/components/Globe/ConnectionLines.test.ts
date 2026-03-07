import type { Location } from '@/types/game';
import { describe, expect, it } from 'vitest';
import {
  buildConnectionSegments,
  buildCurrentLocationSegments,
  buildHighlightedSegments,
  buildRouteSegments,
} from './ConnectionLines';

const baseLocation: Location = {
  id: '1',
  name: 'Origin',
  description: 'Origin',
  latitude: 0,
  longitude: 0,
  difficultyMultiplier: 1,
  isCoastal: false,
  region: 'europe_mainland',
  connectedLocationIds: [],
  connections: [],
};

describe('buildConnectionSegments', () => {
  it('returns empty array when there are no connections', () => {
    const segments = buildConnectionSegments([baseLocation], 2, 0.02, 32);
    expect(segments).toHaveLength(0);
  });

  it('creates expected segment count for a single unique connection', () => {
    const locations: Location[] = [
      {
        ...baseLocation,
        id: 'a',
        name: 'A',
        latitude: 0,
        longitude: 0,
        connectedLocationIds: ['b'],
      },
      {
        ...baseLocation,
        id: 'b',
        name: 'B',
        latitude: 0,
        longitude: 90,
        connectedLocationIds: ['a'],
      },
    ];

    const arcSegments = 16;
    const segments = buildConnectionSegments(locations, 2, 0.02, arcSegments);
    expect(segments).toHaveLength(arcSegments);
  });

  it('keeps arc points on the globe surface height', () => {
    const locations: Location[] = [
      {
        ...baseLocation,
        id: 'a',
        name: 'A',
        latitude: 10,
        longitude: 20,
        connectedLocationIds: ['b'],
      },
      {
        ...baseLocation,
        id: 'b',
        name: 'B',
        latitude: -25,
        longitude: 100,
        connectedLocationIds: ['a'],
      },
    ];

    const globeRadius = 2;
    const lineHeight = 0.02;
    const segments = buildConnectionSegments(locations, globeRadius, lineHeight, 12);
    const targetRadius = globeRadius + lineHeight;

    segments.forEach((segment) => {
      const startRadius = segment.start.length();
      const endRadius = segment.end.length();
      expect(Math.abs(startRadius - targetRadius)).toBeLessThan(1e-6);
      expect(Math.abs(endRadius - targetRadius)).toBeLessThan(1e-6);
    });
  });
});

describe('buildCurrentLocationSegments', () => {
  const arcSegments = 16;
  const globeRadius = 2;
  const lineHeight = 0.02;

  const locA: Location = {
    ...baseLocation,
    id: 'a',
    name: 'A',
    latitude: 0,
    longitude: 0,
    connectedLocationIds: ['b', 'c'],
  };
  const locB: Location = {
    ...baseLocation,
    id: 'b',
    name: 'B',
    latitude: 0,
    longitude: 90,
    connectedLocationIds: ['a'],
  };
  const locC: Location = {
    ...baseLocation,
    id: 'c',
    name: 'C',
    latitude: 45,
    longitude: 45,
    connectedLocationIds: ['a'],
  };
  const locD: Location = {
    ...baseLocation,
    id: 'd',
    name: 'D',
    latitude: -30,
    longitude: 120,
    connectedLocationIds: [], // no connection to A
  };

  const locations = [locA, locB, locC, locD];

  it('returns empty array when currentLocationId is undefined', () => {
    expect(
      buildCurrentLocationSegments(locations, globeRadius, lineHeight, arcSegments, undefined)
    ).toHaveLength(0);
  });

  it('returns empty array when currentLocationId does not exist in list', () => {
    expect(
      buildCurrentLocationSegments(locations, globeRadius, lineHeight, arcSegments, 'missing')
    ).toHaveLength(0);
  });

  it('returns empty array when current location has no connections', () => {
    expect(
      buildCurrentLocationSegments(locations, globeRadius, lineHeight, arcSegments, 'd')
    ).toHaveLength(0);
  });

  it('only draws connections touching the current location', () => {
    // A connects to B and C → 2 arcs × arcSegments segments each
    const segments = buildCurrentLocationSegments(
      locations,
      globeRadius,
      lineHeight,
      arcSegments,
      'a'
    );
    expect(segments).toHaveLength(2 * arcSegments);
  });

  it('includes connections listed only on the neighbour side', () => {
    // E lists A, but A does not list E — should still appear
    const locE: Location = {
      ...baseLocation,
      id: 'e',
      name: 'E',
      latitude: -45,
      longitude: -90,
      connectedLocationIds: ['a'],
    };
    const extendedLocations = [...locations, locE];
    const segments = buildCurrentLocationSegments(
      extendedLocations,
      globeRadius,
      lineHeight,
      arcSegments,
      'a'
    );
    // A→B, A→C (from A's list) + A→E (from E's list) = 3 arcs
    expect(segments).toHaveLength(3 * arcSegments);
  });

  it('does not draw connections between two non-current locations', () => {
    // B and C are both neighbours of A but not connected to each other —
    // segments for B→C must NOT appear
    const locBConnectedToC: Location = { ...locB, connectedLocationIds: ['a', 'c'] };
    const locCConnectedToB: Location = { ...locC, connectedLocationIds: ['a', 'b'] };
    const mixed = [locA, locBConnectedToC, locCConnectedToB, locD];
    const segments = buildCurrentLocationSegments(mixed, globeRadius, lineHeight, arcSegments, 'a');
    // Still only A→B and A→C, not B→C
    expect(segments).toHaveLength(2 * arcSegments);
  });
});

describe('buildCurrentLocationSegments – selected location as focal point', () => {
  // Component logic (no active route): focalId = selectedLocationId ?? currentLocationId
  // Component logic (active route):    focalId = currentLocationId  (always show where you are)
  // A (current) → B, C
  // B → A, D
  const arcSegments = 16;
  const globeRadius = 2;
  const lineHeight = 0.02;

  const locA: Location = {
    ...baseLocation,
    id: 'a',
    name: 'A',
    latitude: 0,
    longitude: 0,
    connectedLocationIds: ['b', 'c'],
  };
  const locB: Location = {
    ...baseLocation,
    id: 'b',
    name: 'B',
    latitude: 0,
    longitude: 90,
    connectedLocationIds: ['a', 'd'],
  };
  const locC: Location = {
    ...baseLocation,
    id: 'c',
    name: 'C',
    latitude: 45,
    longitude: 45,
    connectedLocationIds: ['a'],
  };
  const locD: Location = {
    ...baseLocation,
    id: 'd',
    name: 'D',
    latitude: -30,
    longitude: 120,
    connectedLocationIds: ['b'],
  };

  const locations = [locA, locB, locC, locD];

  it('falls back to current location when selectedLocationId is undefined', () => {
    // Component uses: focalId = selectedLocationId ?? currentLocationId
    // When selectedLocationId is undefined, focalId = currentLocationId = 'a'
    const segments = buildCurrentLocationSegments(
      locations,
      globeRadius,
      lineHeight,
      arcSegments,
      'a'
    );
    // A→B and A→C = 2 arcs
    expect(segments).toHaveLength(2 * arcSegments);
  });

  it('shows connections from the selected location when one is provided', () => {
    // selectedLocationId = 'b' takes precedence over currentLocationId = 'a'
    const focalId = 'b';
    const segments = buildCurrentLocationSegments(
      locations,
      globeRadius,
      lineHeight,
      arcSegments,
      focalId
    );
    // B→A and B→D = 2 arcs
    expect(segments).toHaveLength(2 * arcSegments);
  });

  it('shows the selected location connections even if there is no connection back to current', () => {
    // D only connects to B (not back to A), selecting D from A should show D's connections
    const locDOneWay: Location = { ...locD, connectedLocationIds: ['b'] };
    const focalId = 'd';
    const segments = buildCurrentLocationSegments(
      [locA, locB, locC, locDOneWay],
      globeRadius,
      lineHeight,
      arcSegments,
      focalId
    );
    // D→B = 1 arc (D has no connection to A)
    expect(segments).toHaveLength(1 * arcSegments);
  });

  it('returns current location connections when selectedLocationId equals currentLocationId', () => {
    const focalId = 'a'; // same as current
    const segments = buildCurrentLocationSegments(
      locations,
      globeRadius,
      lineHeight,
      arcSegments,
      focalId
    );
    expect(segments).toHaveLength(2 * arcSegments);
  });
});

describe('buildHighlightedSegments', () => {
  const arcSegments = 16;
  const globeRadius = 2;
  const lineHeight = 0.02;

  const locationA: Location = {
    ...baseLocation,
    id: 'a',
    name: 'A',
    latitude: 0,
    longitude: 0,
    connectedLocationIds: ['b'],
  };
  const locationB: Location = {
    ...baseLocation,
    id: 'b',
    name: 'B',
    latitude: 0,
    longitude: 90,
    connectedLocationIds: ['a'],
  };
  const locationC: Location = {
    ...baseLocation,
    id: 'c',
    name: 'C',
    latitude: 45,
    longitude: 45,
    connectedLocationIds: [], // not connected to A or B
  };

  const locations = [locationA, locationB, locationC];

  it('returns empty array when highlightedFromId is undefined', () => {
    const result = buildHighlightedSegments(
      locations,
      globeRadius,
      lineHeight,
      arcSegments,
      undefined,
      'b'
    );
    expect(result).toHaveLength(0);
  });

  it('returns empty array when highlightedToId is undefined', () => {
    const result = buildHighlightedSegments(
      locations,
      globeRadius,
      lineHeight,
      arcSegments,
      'a',
      undefined
    );
    expect(result).toHaveLength(0);
  });

  it('returns empty array when from location does not exist', () => {
    const result = buildHighlightedSegments(
      locations,
      globeRadius,
      lineHeight,
      arcSegments,
      'missing',
      'b'
    );
    expect(result).toHaveLength(0);
  });

  it('returns empty array when to location does not exist', () => {
    const result = buildHighlightedSegments(
      locations,
      globeRadius,
      lineHeight,
      arcSegments,
      'a',
      'missing'
    );
    expect(result).toHaveLength(0);
  });

  it('returns empty array when the two locations are not directly connected', () => {
    const result = buildHighlightedSegments(
      locations,
      globeRadius,
      lineHeight,
      arcSegments,
      'a',
      'c'
    );
    expect(result).toHaveLength(0);
  });

  it('returns arc segments for a valid bidirectionally-connected pair', () => {
    const result = buildHighlightedSegments(
      locations,
      globeRadius,
      lineHeight,
      arcSegments,
      'a',
      'b'
    );
    expect(result).toHaveLength(arcSegments);
  });

  it('highlights when the connection is only listed on the "from" side', () => {
    // A lists B, but B does not list A
    const oneSidedLocations: Location[] = [
      { ...locationA, connectedLocationIds: ['b'] },
      { ...locationB, connectedLocationIds: [] },
      locationC,
    ];
    const result = buildHighlightedSegments(
      oneSidedLocations,
      globeRadius,
      lineHeight,
      arcSegments,
      'a',
      'b'
    );
    expect(result).toHaveLength(arcSegments);
  });

  it('highlights when the connection is only listed on the "to" side', () => {
    // B lists A, but A does not list B — still a valid connection
    const oneSidedLocations: Location[] = [
      { ...locationA, connectedLocationIds: [] },
      { ...locationB, connectedLocationIds: ['a'] },
      locationC,
    ];
    const result = buildHighlightedSegments(
      oneSidedLocations,
      globeRadius,
      lineHeight,
      arcSegments,
      'a',
      'b'
    );
    expect(result).toHaveLength(arcSegments);
  });

  it('places highlighted arc slightly above the regular line height', () => {
    const regularSegments = buildConnectionSegments(
      [locationA, locationB],
      globeRadius,
      lineHeight,
      arcSegments
    );
    const highlightedResult = buildHighlightedSegments(
      locations,
      globeRadius,
      lineHeight,
      arcSegments,
      'a',
      'b'
    );

    // All highlighted points should be further from origin than regular points
    const regularRadius = regularSegments[0].start.length();
    const highlightedRadius = highlightedResult[0].start.length();
    expect(highlightedRadius).toBeGreaterThan(regularRadius);
    expect(highlightedRadius).toBeCloseTo(globeRadius + lineHeight + 0.005, 5);
  });
});

describe('buildRouteSegments', () => {
  const arcSegments = 16;
  const globeRadius = 2;
  const lineHeight = 0.025; // lineHeight + 0.005 offset applied inside

  const locA: Location = {
    ...baseLocation,
    id: 'a',
    name: 'A',
    latitude: 0,
    longitude: 0,
    connectedLocationIds: ['b'],
  };
  const locB: Location = {
    ...baseLocation,
    id: 'b',
    name: 'B',
    latitude: 0,
    longitude: 90,
    connectedLocationIds: ['a', 'c'],
  };
  const locC: Location = {
    ...baseLocation,
    id: 'c',
    name: 'C',
    latitude: 45,
    longitude: 45,
    connectedLocationIds: ['b'],
  };

  const locations = [locA, locB, locC];

  it('returns empty when route is empty', () => {
    expect(
      buildRouteSegments(locations, globeRadius, lineHeight, arcSegments, 'a', [])
    ).toHaveLength(0);
  });

  it('returns empty when currentLocationId is undefined', () => {
    expect(
      buildRouteSegments(locations, globeRadius, lineHeight, arcSegments, undefined, ['b'])
    ).toHaveLength(0);
  });

  it('draws one arc for a single-leg route (current → first waypoint)', () => {
    const segments = buildRouteSegments(locations, globeRadius, lineHeight, arcSegments, 'a', [
      'b',
    ]);
    expect(segments).toHaveLength(arcSegments);
  });

  it('draws two arcs for a two-leg route (current → wp1 → wp2)', () => {
    const segments = buildRouteSegments(locations, globeRadius, lineHeight, arcSegments, 'a', [
      'b',
      'c',
    ]);
    expect(segments).toHaveLength(2 * arcSegments);
  });

  it('returns empty for a leg whose two cities are not connected', () => {
    // A and C are not directly connected
    const segments = buildRouteSegments(locations, globeRadius, lineHeight, arcSegments, 'a', [
      'c',
    ]);
    expect(segments).toHaveLength(0);
  });
});
