import type { Location } from '@/types/game';
import { describe, expect, it } from 'vitest';
import { buildConnectionSegments, buildHighlightedSegments } from './ConnectionLines';

const baseLocation: Location = {
  id: '1',
  name: 'Origin',
  description: 'Origin',
  latitude: 0,
  longitude: 0,
  difficultyMultiplier: 1,
  travelDays: 0,
  connectedLocationIds: [],
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
