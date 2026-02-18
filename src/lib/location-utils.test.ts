import type { Location } from '@/types/game';
import { describe, expect, it } from 'vitest';
import { findLocationById, getDefaultLocation } from './location-utils';

const locations: Location[] = [
  {
    id: '1',
    name: 'Paris',
    description: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    difficultyMultiplier: 1,
    travelDays: 0,
    connectedLocationIds: [],
  },
  {
    id: '2',
    name: 'London',
    description: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    difficultyMultiplier: 1,
    travelDays: 1,
    connectedLocationIds: [],
  },
];

describe('location-utils', () => {
  it('findLocationById returns null when id is missing', () => {
    expect(findLocationById(locations, undefined)).toBeNull();
  });

  it('findLocationById returns the matching location', () => {
    expect(findLocationById(locations, '2')?.name).toBe('London');
  });

  it('getDefaultLocation prefers the preferred name when present', () => {
    expect(getDefaultLocation(locations, 'Paris')?.id).toBe('1');
  });

  it('getDefaultLocation falls back to first location', () => {
    const preferredMissing = getDefaultLocation(locations, 'Tokyo');
    expect(preferredMissing?.id).toBe('1');
  });

  it('getDefaultLocation returns null for empty list', () => {
    expect(getDefaultLocation([], 'Paris')).toBeNull();
  });
});