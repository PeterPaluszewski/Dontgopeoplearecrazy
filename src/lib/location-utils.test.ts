import type { Location } from '@/types/game';
import { describe, expect, it } from 'vitest';
import {
  findLocationById,
  getDefaultLocation,
  getLocationsByRegion,
  getRegionDisplayName,
  getUniqueRegions,
  REGION_DISPLAY_NAMES,
} from './location-utils';

const locations: Location[] = [
  {
    id: '1',
    name: 'Paris',
    description: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    difficultyMultiplier: 1,
    isCoastal: false,
    region: 'europe_mainland',
    connectedLocationIds: [],
  },
  {
    id: '2',
    name: 'London',
    description: 'London',
    latitude: 51.5074,
    longitude: -0.1278,
    difficultyMultiplier: 1,
    isCoastal: false,
    region: 'british_isles',
    connectedLocationIds: [],
  },
  {
    id: '3',
    name: 'Berlin',
    description: 'Berlin',
    latitude: 52.52,
    longitude: 13.405,
    difficultyMultiplier: 1,
    isCoastal: false,
    region: 'europe_mainland',
    connectedLocationIds: [],
  },
  {
    id: '4',
    name: 'Tokyo',
    description: 'Tokyo',
    latitude: 35.6762,
    longitude: 139.6503,
    difficultyMultiplier: 1.2,
    isCoastal: true,
    region: 'japan',
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
    const preferredMissing = getDefaultLocation(locations, 'Sydney');
    expect(preferredMissing?.id).toBe('1');
  });

  it('getDefaultLocation returns null for empty list', () => {
    expect(getDefaultLocation([], 'Paris')).toBeNull();
  });

  describe('getRegionDisplayName', () => {
    it('returns human-readable label for known region slugs', () => {
      expect(getRegionDisplayName('europe_mainland')).toBe('Central & Western Europe');
      expect(getRegionDisplayName('british_isles')).toBe('British Isles');
      expect(getRegionDisplayName('japan')).toBe('Japan');
      expect(getRegionDisplayName('north_america')).toBe('North America');
    });

    it('capitalises unknown region slugs as fallback', () => {
      expect(getRegionDisplayName('mystery_land')).toBe('Mystery Land');
    });

    it('handles single-word region slugs', () => {
      expect(getRegionDisplayName('oceania')).toBe('Oceania');
    });
  });

  describe('REGION_DISPLAY_NAMES', () => {
    it('contains entries for all major game regions', () => {
      const expectedRegions = [
        'europe_mainland',
        'scandinavia',
        'north_america',
        'south_america',
        'east_asia',
        'south_asia',
        'southeast_asia',
        'africa',
        'oceania',
        'japan',
      ];
      for (const region of expectedRegions) {
        expect(REGION_DISPLAY_NAMES).toHaveProperty(region);
      }
    });
  });

  describe('getUniqueRegions', () => {
    it('returns deduplicated region slugs', () => {
      const regions = getUniqueRegions(locations);
      expect(regions).toHaveLength(3);
      expect(regions).toContain('europe_mainland');
      expect(regions).toContain('british_isles');
      expect(regions).toContain('japan');
    });

    it('returns regions sorted by display name', () => {
      const regions = getUniqueRegions(locations);
      const displayNames = regions.map(getRegionDisplayName);
      expect(displayNames).toEqual([...displayNames].sort());
    });

    it('returns empty array for empty locations', () => {
      expect(getUniqueRegions([])).toEqual([]);
    });
  });

  describe('getLocationsByRegion', () => {
    it('returns only locations in the given region', () => {
      const europeLocations = getLocationsByRegion(locations, 'europe_mainland');
      expect(europeLocations).toHaveLength(2);
      expect(europeLocations.map((l) => l.name)).toContain('Paris');
      expect(europeLocations.map((l) => l.name)).toContain('Berlin');
    });

    it('returns cities sorted alphabetically by name', () => {
      const europeLocations = getLocationsByRegion(locations, 'europe_mainland');
      expect(europeLocations[0].name).toBe('Berlin');
      expect(europeLocations[1].name).toBe('Paris');
    });

    it('returns empty array when no cities match the region', () => {
      expect(getLocationsByRegion(locations, 'south_america')).toEqual([]);
    });
  });
});
