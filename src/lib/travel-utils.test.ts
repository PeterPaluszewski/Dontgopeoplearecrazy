import type { Location } from '@/types/game';
import { describe, expect, it } from 'vitest';
import {
  calculateTravelCost,
  canAffordTravel,
  canTravelToLocation,
  getConnectionDetail,
} from './travel-utils';

describe('travel-utils', () => {
  describe('calculateTravelCost', () => {
    it('should calculate base cost for 1 day and difficulty 1', () => {
      const cost = calculateTravelCost(1, 1);
      expect(cost).toEqual({
        food: 15,
        water: 20,
        energy: 25,
      });
    });

    it('should scale cost with travel days', () => {
      const cost = calculateTravelCost(3, 1);
      expect(cost).toEqual({
        food: 45, // 15 * 3
        water: 60, // 20 * 3
        energy: 75, // 25 * 3
      });
    });

    it('should apply difficulty multiplier', () => {
      // Difficulty 3 = multiplier of 1.5 (1 + (3-1) * 0.25)
      const cost = calculateTravelCost(2, 3);
      expect(cost).toEqual({
        food: 45, // ceil(15 * 2 * 1.5)
        water: 60, // ceil(20 * 2 * 1.5)
        energy: 75, // ceil(25 * 2 * 1.5)
      });
    });

    it('should apply maximum difficulty multiplier', () => {
      // Difficulty 5 = multiplier of 2.0 (1 + (5-1) * 0.25)
      const cost = calculateTravelCost(1, 5);
      expect(cost).toEqual({
        food: 30, // ceil(15 * 1 * 2.0)
        water: 40, // ceil(20 * 1 * 2.0)
        energy: 50, // ceil(25 * 1 * 2.0)
      });
    });

    it('should round up fractional costs', () => {
      // Difficulty 2 = multiplier of 1.25
      const cost = calculateTravelCost(1, 2);
      expect(cost).toEqual({
        food: 19, // ceil(15 * 1.25 = 18.75)
        water: 25, // ceil(20 * 1.25 = 25)
        energy: 32, // ceil(25 * 1.25 = 31.25)
      });
    });

    it('should handle zero travel days', () => {
      const cost = calculateTravelCost(0, 1);
      expect(cost).toEqual({
        food: 0,
        water: 0,
        energy: 0,
      });
    });
  });

  describe('canAffordTravel', () => {
    it('should return true when resources are sufficient', () => {
      const resources = { food: 50, water: 60, energy: 70 };
      const cost = { food: 30, water: 40, energy: 50 };
      expect(canAffordTravel(resources, cost)).toBe(true);
    });

    it('should return true when resources exactly match cost', () => {
      const resources = { food: 30, water: 40, energy: 50 };
      const cost = { food: 30, water: 40, energy: 50 };
      expect(canAffordTravel(resources, cost)).toBe(true);
    });

    it('should return false when food is insufficient', () => {
      const resources = { food: 20, water: 60, energy: 70 };
      const cost = { food: 30, water: 40, energy: 50 };
      expect(canAffordTravel(resources, cost)).toBe(false);
    });

    it('should return false when water is insufficient', () => {
      const resources = { food: 50, water: 30, energy: 70 };
      const cost = { food: 30, water: 40, energy: 50 };
      expect(canAffordTravel(resources, cost)).toBe(false);
    });

    it('should return false when energy is insufficient', () => {
      const resources = { food: 50, water: 60, energy: 40 };
      const cost = { food: 30, water: 40, energy: 50 };
      expect(canAffordTravel(resources, cost)).toBe(false);
    });

    it('should return false when all resources are insufficient', () => {
      const resources = { food: 10, water: 20, energy: 30 };
      const cost = { food: 30, water: 40, energy: 50 };
      expect(canAffordTravel(resources, cost)).toBe(false);
    });

    it('should handle zero resources', () => {
      const resources = { food: 0, water: 0, energy: 0 };
      const cost = { food: 30, water: 40, energy: 50 };
      expect(canAffordTravel(resources, cost)).toBe(false);
    });

    it('should handle zero cost', () => {
      const resources = { food: 50, water: 60, energy: 70 };
      const cost = { food: 0, water: 0, energy: 0 };
      expect(canAffordTravel(resources, cost)).toBe(true);
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
      connections: [{ toId: 'berlin', distanceKm: 1050, transportSlug: 'train', speedKmh: 200 }],
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
      connections: [{ toId: 'paris', distanceKm: 1050, transportSlug: 'train', speedKmh: 200 }],
    };

    const locations = [paris, berlin];

    it('returns the connection detail when found', () => {
      expect(getConnectionDetail(locations, 'paris', 'berlin')).toEqual({
        toId: 'berlin',
        distanceKm: 1050,
        transportSlug: 'train',
        speedKmh: 200,
      });
    });

    it('returns the reverse detail when found', () => {
      expect(getConnectionDetail(locations, 'berlin', 'paris')).toEqual({
        toId: 'paris',
        distanceKm: 1050,
        transportSlug: 'train',
        speedKmh: 200,
      });
    });

    it('returns fallback when from location not found', () => {
      const result = getConnectionDetail(locations, 'unknown', 'berlin');
      expect(result.toId).toBe('berlin');
      expect(result.speedKmh).toBe(5);
      expect(result.transportSlug).toBe('on_foot');
    });

    it('returns fallback when connection not found on location', () => {
      const result = getConnectionDetail(locations, 'paris', 'tokyo');
      expect(result.toId).toBe('tokyo');
      expect(result.speedKmh).toBe(5);
      expect(result.transportSlug).toBe('on_foot');
    });

    it('calculates correct travel days from returned detail', () => {
      // 1050 km at 200 km/h / 24h = 0.219 days → ceil = 1 day
      const detail = getConnectionDetail(locations, 'paris', 'berlin');
      const days = Math.max(1, Math.ceil(detail.distanceKm / detail.speedKmh / 24));
      expect(days).toBe(1);
    });
  });
});
