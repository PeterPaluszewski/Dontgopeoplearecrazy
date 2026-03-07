import type { Location } from '@/types/game';
import { describe, expect, it } from 'vitest';
import {
  calculateTravelCost,
  calculateTravelDays,
  canAffordTravel,
  canTravelToLocation,
  formatTravelDuration,
  getConnectionDetail,
  slugToTransportName,
  TRAVEL_HOURS_PER_DAY,
} from './travel-utils';

describe('travel-utils', () => {
  describe('calculateTravelCost', () => {
    it('should calculate base cost for 1 day and difficulty 1', () => {
      const cost = calculateTravelCost(1, 1);
      expect(cost).toEqual({
        food: 15,
        water: 20,
        energy: 25,
        money: 0, // baseCostMultiplier defaults to 0 (free)
      });
    });

    it('should scale cost with travel days', () => {
      const cost = calculateTravelCost(3, 1);
      expect(cost).toEqual({
        food: 45, // 15 * 3
        water: 60, // 20 * 3
        energy: 75, // 25 * 3
        money: 0,
      });
    });

    it('should apply difficulty multiplier', () => {
      // Difficulty 3 = multiplier of 1.5 (1 + (3-1) * 0.25)
      const cost = calculateTravelCost(2, 3);
      expect(cost).toEqual({
        food: 45, // ceil(15 * 2 * 1.5)
        water: 60, // ceil(20 * 2 * 1.5)
        energy: 75, // ceil(25 * 2 * 1.5)
        money: 0,
      });
    });

    it('should apply maximum difficulty multiplier', () => {
      // Difficulty 5 = multiplier of 2.0 (1 + (5-1) * 0.25)
      const cost = calculateTravelCost(1, 5);
      expect(cost).toEqual({
        food: 30, // ceil(15 * 1 * 2.0)
        water: 40, // ceil(20 * 1 * 2.0)
        energy: 50, // ceil(25 * 1 * 2.0)
        money: 0,
      });
    });

    it('should round up fractional costs', () => {
      // Difficulty 2 = multiplier of 1.25
      const cost = calculateTravelCost(1, 2);
      expect(cost).toEqual({
        food: 19, // ceil(15 * 1.25 = 18.75)
        water: 25, // ceil(20 * 1.25 = 25)
        energy: 32, // ceil(25 * 1.25 = 31.25)
        money: 0,
      });
    });

    it('should handle zero travel days', () => {
      const cost = calculateTravelCost(0, 1);
      expect(cost).toEqual({
        food: 0,
        water: 0,
        energy: 0,
        money: 0,
      });
    });

    it('should scale money cost with baseCostMultiplier', () => {
      // baseCostMultiplier=2, 1 day, difficulty 1 → money = ceil(10 * 1 * 2) = 20
      const cost = calculateTravelCost(1, 1, 2);
      expect(cost.money).toBe(20);
      // baseCostMultiplier=1.5, 3 days → money = ceil(10 * 3 * 1.5) = 45
      const cost2 = calculateTravelCost(3, 1, 1.5);
      expect(cost2.money).toBe(45);
    });
  });

  describe('canAffordTravel', () => {
    it('should return true when resources are sufficient', () => {
      const resources = { food: 50, water: 60, energy: 70, money: 100 };
      const cost = { food: 30, water: 40, energy: 50, money: 0 };
      expect(canAffordTravel(resources, cost)).toBe(true);
    });

    it('should return true when resources exactly match cost', () => {
      const resources = { food: 30, water: 40, energy: 50, money: 20 };
      const cost = { food: 30, water: 40, energy: 50, money: 20 };
      expect(canAffordTravel(resources, cost)).toBe(true);
    });

    it('should return false when food is insufficient', () => {
      const resources = { food: 20, water: 60, energy: 70, money: 100 };
      const cost = { food: 30, water: 40, energy: 50, money: 0 };
      expect(canAffordTravel(resources, cost)).toBe(false);
    });

    it('should return false when water is insufficient', () => {
      const resources = { food: 50, water: 30, energy: 70, money: 100 };
      const cost = { food: 30, water: 40, energy: 50, money: 0 };
      expect(canAffordTravel(resources, cost)).toBe(false);
    });

    it('should return false when energy is insufficient', () => {
      const resources = { food: 50, water: 60, energy: 40, money: 100 };
      const cost = { food: 30, water: 40, energy: 50, money: 0 };
      expect(canAffordTravel(resources, cost)).toBe(false);
    });

    it('should return false when all resources are insufficient', () => {
      const resources = { food: 10, water: 20, energy: 30, money: 0 };
      const cost = { food: 30, water: 40, energy: 50, money: 0 };
      expect(canAffordTravel(resources, cost)).toBe(false);
    });

    it('should handle zero resources', () => {
      const resources = { food: 0, water: 0, energy: 0, money: 0 };
      const cost = { food: 30, water: 40, energy: 50, money: 0 };
      expect(canAffordTravel(resources, cost)).toBe(false);
    });

    it('should handle zero cost', () => {
      const resources = { food: 50, water: 60, energy: 70, money: 0 };
      const cost = { food: 0, water: 0, energy: 0, money: 0 };
      expect(canAffordTravel(resources, cost)).toBe(true);
    });

    it('should return false when money is insufficient', () => {
      const resources = { food: 100, water: 100, energy: 100, money: 10 };
      const cost = { food: 15, water: 20, energy: 25, money: 20 };
      expect(canAffordTravel(resources, cost)).toBe(false);
    });
  });

  describe('canTravelToLocation', () => {
    const mockDestination: Location = {
      id: 'location-2',
      name: 'Berlin',
      description: 'Capital of Germany',
      latitude: 52.52,
      longitude: 13.405,
      difficultyMultiplier: 2,
      isCoastal: false,
      region: 'europe_mainland',
      connectedLocationIds: ['location-1'],
      connections: [],
    };

    it('should allow travel to connected location', () => {
      const result = canTravelToLocation('location-1', mockDestination, ['location-2']);
      expect(result).toEqual({ canTravel: true });
    });

    it('should prevent travel to current location', () => {
      const result = canTravelToLocation('location-2', mockDestination, ['location-2']);
      expect(result).toEqual({
        canTravel: false,
        reason: 'You are already at this location',
      });
    });

    it('should prevent travel to unconnected location', () => {
      const result = canTravelToLocation('location-1', mockDestination, ['location-3']);
      expect(result).toEqual({
        canTravel: false,
        reason: 'This location is not directly accessible from your current position',
      });
    });

    it('should handle empty connected locations', () => {
      const result = canTravelToLocation('location-1', mockDestination, []);
      expect(result).toEqual({
        canTravel: false,
        reason: 'This location is not directly accessible from your current position',
      });
    });

    it('should handle multiple connected locations', () => {
      const result = canTravelToLocation('location-1', mockDestination, [
        'location-2',
        'location-3',
        'location-4',
      ]);
      expect(result).toEqual({ canTravel: true });
    });
  });

  describe('getConnectionDetail', () => {
    const paris: Location = {
      id: 'paris',
      name: 'Paris',
      description: '',
      latitude: 48.85,
      longitude: 2.35,
      difficultyMultiplier: 1,
      isCoastal: false,
      region: 'europe_mainland',
      connectedLocationIds: ['berlin'],
      connections: [
        {
          toId: 'berlin',
          distanceKm: 1050,
          transportSlug: 'train',
          speedKmh: 200,
          baseCostMultiplier: 0,
        },
      ],
    };

    const berlin: Location = {
      id: 'berlin',
      name: 'Berlin',
      description: '',
      latitude: 52.52,
      longitude: 13.4,
      difficultyMultiplier: 1,
      isCoastal: false,
      region: 'europe_mainland',
      connectedLocationIds: ['paris'],
      connections: [
        {
          toId: 'paris',
          distanceKm: 1050,
          transportSlug: 'train',
          speedKmh: 200,
          baseCostMultiplier: 0,
        },
      ],
    };

    const locations = [paris, berlin];

    it('returns the connection detail when found', () => {
      expect(getConnectionDetail(locations, 'paris', 'berlin')).toEqual({
        toId: 'berlin',
        distanceKm: 1050,
        transportSlug: 'train',
        speedKmh: 200,
        baseCostMultiplier: 0,
      });
    });

    it('returns the reverse detail when found', () => {
      expect(getConnectionDetail(locations, 'berlin', 'paris')).toEqual({
        toId: 'paris',
        distanceKm: 1050,
        transportSlug: 'train',
        speedKmh: 200,
        baseCostMultiplier: 0,
      });
    });

    it('returns fallback when from location not found', () => {
      const result = getConnectionDetail(locations, 'unknown', 'berlin');
      expect(result.toId).toBe('berlin');
      expect(result.speedKmh).toBe(5);
      expect(result.transportSlug).toBe('on_foot');
      expect(result.distanceKm).toBe(0); // neither location has coords in this fallback
      expect(result.baseCostMultiplier).toBe(0); // fallback is free
    });

    it('returns fallback with computed distance when connection not found on location', () => {
      // paris (48.85, 2.35) → tokyo is not in the locations array so distanceKm = 0
      const result = getConnectionDetail(locations, 'paris', 'tokyo');
      expect(result.toId).toBe('tokyo');
      expect(result.speedKmh).toBe(5);
      expect(result.transportSlug).toBe('on_foot');
      expect(result.distanceKm).toBe(0); // tokyo not in locations array
      expect(result.baseCostMultiplier).toBe(0); // fallback is free
    });

    it('calculates correct travel days for motorised transport (train)', () => {
      // train: 1050 km at 200 km/h, 8h/day = 1050/200/8 = 0.65625 fractional days
      const detail = getConnectionDetail(locations, 'paris', 'berlin');
      const days = calculateTravelDays(detail.distanceKm, detail.speedKmh);
      expect(days).toBeCloseTo(0.65625);
      expect(TRAVEL_HOURS_PER_DAY).toBe(8);
    });

    it('returns correct constant for all transport types', () => {
      expect(TRAVEL_HOURS_PER_DAY).toBe(8);
    });

    it('calculates multi-day journey for walking distance', () => {
      // 1050 km on foot at 5 km/h, 8h/day = 1050/5/8 = 26.25 days
      expect(calculateTravelDays(1050, 5)).toBeCloseTo(26.25);
    });

    it('calculates realistic plane journey days', () => {
      // London → Tokyo ~9217 km at 800 km/h, 8h/day = 9217/800/8 = 1.44
      expect(calculateTravelDays(9217, 800)).toBeCloseTo(1.44, 1);
      // Sydney → London ~16546 km at 800 km/h = 16546/800/8 = 2.58
      expect(calculateTravelDays(16546, 800)).toBeCloseTo(2.58, 1);
    });

    it('calculates realistic car journey days', () => {
      // 365 km at 90 km/h, 8h/day = 365/90/8 = 0.507
      expect(calculateTravelDays(365, 90)).toBeCloseTo(0.507, 2);
    });

    it('returns 0 for zero distance', () => {
      expect(calculateTravelDays(0, 90)).toBe(0);
    });
  });

  describe('formatTravelDuration', () => {
    it('shows days and hours for a multi-day journey', () => {
      // 9217 km at 800 km/h = 11.52 hours total → 1 day 4 hours (floor(11.52/8)=1, round(11.52%8)=4)
      expect(formatTravelDuration(9217, 800, 'plane')).toBe('1 day 4 hours by plane');
    });

    it('shows only hours for a sub-day journey', () => {
      // 200 km at 90 km/h = 2.22 hours → 0 days, 2 hours
      expect(formatTravelDuration(200, 90, 'car')).toBe('2 hours by car');
    });

    it('shows days only when hours remainder is zero', () => {
      // 720 km at 90 km/h = 8 hours → 1 day, 0 hours remaining
      expect(formatTravelDuration(720, 90, 'car')).toBe('1 day by car');
    });

    it('shows "< 1 hour" when journey is very short', () => {
      // 1 km at 800 km/h = 0.00125 hours → rounds to 0
      expect(formatTravelDuration(1, 800, 'plane')).toBe('< 1 hour by plane');
    });

    it('uses on-foot label for on_foot slug', () => {
      expect(formatTravelDuration(40, 5, 'on_foot')).toBe('1 day on foot');
    });

    it('falls back to "by <slug>" for unknown transport slugs', () => {
      expect(formatTravelDuration(100, 50, 'hovercraft')).toContain('by hovercraft');
    });

    it('slugToTransportName derives label from slug without a hardcoded map', () => {
      expect(slugToTransportName('plane')).toBe('by plane');
      expect(slugToTransportName('bicycle')).toBe('by bicycle');
      expect(slugToTransportName('on_foot')).toBe('on foot');
      expect(slugToTransportName('cruise_ship')).toBe('by cruise ship');
      expect(slugToTransportName('tuk_tuk')).toBe('by tuk tuk');
      expect(slugToTransportName('freight_ship')).toBe('by freight ship');
      // Any new slug works automatically
      expect(slugToTransportName('hovercraft')).toBe('by hovercraft');
      expect(slugToTransportName('dog_sled')).toBe('by dog sled');
    });
  });
});
