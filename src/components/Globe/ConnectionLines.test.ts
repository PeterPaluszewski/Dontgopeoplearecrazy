import type { Location } from '@/types/game';
import { describe, expect, it } from 'vitest';
import { buildConnectionSegments } from './ConnectionLines';

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
