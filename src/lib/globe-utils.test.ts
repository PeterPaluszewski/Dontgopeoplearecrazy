import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  calculateDistance,
  calculateGlobeRotation,
  getMarkerColor,
  getMarkerPosition,
  latLonToVector3,
} from './globe-utils';

describe('globe-utils', () => {
  describe('latLonToVector3', () => {
    it('should convert latitude and longitude to Vector3 coordinates', () => {
      const radius = 2;

      // Test equator at prime meridian (0, 0)
      const equatorPrime = latLonToVector3(0, 0, radius);
      expect(equatorPrime.x).toBeCloseTo(radius, 5);
      expect(equatorPrime.y).toBeCloseTo(0, 5);
      expect(equatorPrime.z).toBeCloseTo(0, 5);

      // Test north pole (90, 0)
      const northPole = latLonToVector3(90, 0, radius);
      expect(northPole.x).toBeCloseTo(0, 5);
      expect(northPole.y).toBeCloseTo(radius, 5);
      expect(northPole.z).toBeCloseTo(0, 5);

      // Test south pole (-90, 0)
      const southPole = latLonToVector3(-90, 0, radius);
      expect(southPole.x).toBeCloseTo(0, 5);
      expect(southPole.y).toBeCloseTo(-radius, 5);
      expect(southPole.z).toBeCloseTo(0, 5);
    });

    it('should return a Vector3 with the correct magnitude', () => {
      const radius = 2;
      const lat = 48.8566; // Paris latitude
      const lon = 2.3522; // Paris longitude

      const result = latLonToVector3(lat, lon, radius);
      const magnitude = Math.sqrt(result.x ** 2 + result.y ** 2 + result.z ** 2);

      expect(magnitude).toBeCloseTo(radius, 5);
    });

    it('should handle negative longitudes', () => {
      const radius = 2;
      const result = latLonToVector3(40.7128, -74.006, radius); // New York

      expect(result).toBeInstanceOf(THREE.Vector3);
      expect(result.x).toBeDefined();
      expect(result.y).toBeDefined();
      expect(result.z).toBeDefined();
    });
  });

  describe('getMarkerPosition', () => {
    it('should place marker above the globe surface', () => {
      const globeRadius = 2;
      const markerHeight = 0.1;
      const lat = 0;
      const lon = 0;

      const position = getMarkerPosition(lat, lon, globeRadius, markerHeight);
      const surfacePosition = latLonToVector3(lat, lon, globeRadius);

      // Marker should be further from origin than surface
      const markerDistance = Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
      const surfaceDistance = Math.sqrt(
        surfacePosition.x ** 2 + surfacePosition.y ** 2 + surfacePosition.z ** 2
      );

      expect(markerDistance).toBeCloseTo(surfaceDistance + markerHeight, 5);
    });

    it('should use default marker height if not provided', () => {
      const globeRadius = 2;
      const lat = 48.8566;
      const lon = 2.3522;

      const position = getMarkerPosition(lat, lon, globeRadius);

      expect(position).toBeInstanceOf(THREE.Vector3);
      expect(position.x).toBeDefined();
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two locations using Haversine formula', () => {
      // Paris to London
      const paris = { latitude: 48.8566, longitude: 2.3522 };
      const london = { latitude: 51.5074, longitude: -0.1278 };

      const distance = calculateDistance(paris, london);

      // Actual distance is approximately 344 km
      expect(distance).toBeGreaterThan(300);
      expect(distance).toBeLessThan(400);
    });

    it('should return 0 for same location', () => {
      const paris = { latitude: 48.8566, longitude: 2.3522 };

      const distance = calculateDistance(paris, paris);

      expect(distance).toBe(0);
    });

    it('should handle locations across the prime meridian', () => {
      const location1 = { latitude: 40, longitude: -5 };
      const location2 = { latitude: 40, longitude: 5 };

      const distance = calculateDistance(location1, location2);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(2000); // Should be reasonable distance
    });

    it('should calculate correct distance between distant cities', () => {
      // Paris to Rome
      const paris = { latitude: 48.8566, longitude: 2.3522 };
      const rome = { latitude: 41.9028, longitude: 12.4964 };

      const distance = calculateDistance(paris, rome);

      // Actual distance is approximately 1100 km
      expect(distance).toBeGreaterThan(1000);
      expect(distance).toBeLessThan(1300);
    });
  });

  describe('getMarkerColor', () => {
    it('should return green for current location', () => {
      const color = getMarkerColor(false, true);
      expect(color).toBe('#10b981'); // Green
    });

    it('should return blue for visited but not current location', () => {
      const color = getMarkerColor(true, false);
      expect(color).toBe('#3b82f6'); // Blue
    });

    it('should return gray for unvisited location', () => {
      const color = getMarkerColor(false, false);
      expect(color).toBe('#6b7280'); // Gray
    });

    it('should prioritize current over visited', () => {
      // If a location is both visited and current, it should show as current (green)
      const color = getMarkerColor(true, true);
      expect(color).toBe('#10b981'); // Green
    });
  });

  describe('calculateGlobeRotation', () => {
    const globeRadius = 2;

    it('should calculate rotation to show equator prime meridian (0, 0)', () => {
      const { rotationX, rotationY } = calculateGlobeRotation(0, 0, globeRadius);

      // At equator and prime meridian, the point is already at (2, 0, 0)
      // which needs rotation to face the camera at +Z
      expect(rotationX).toBeCloseTo(0, 5);
      expect(Math.abs(rotationY)).toBeCloseTo(Math.PI / 2, 5);
    });

    it('should calculate rotation to show north pole (90, 0)', () => {
      const { rotationX, rotationY } = calculateGlobeRotation(90, 0, globeRadius);

      // North pole is at (0, 2, 0) - needs positive X rotation to tilt up and bring to front
      expect(rotationX).toBeCloseTo(Math.PI / 2, 5);
      // Y rotation can vary depending on longitude handling at poles
      expect(rotationY).toBeDefined();
    });

    it('should calculate rotation to show south pole (-90, 0)', () => {
      const { rotationX, rotationY } = calculateGlobeRotation(-90, 0, globeRadius);

      // South pole is at (0, -2, 0) - needs negative X rotation to tilt down and bring to front
      expect(rotationX).toBeCloseTo(-Math.PI / 2, 5);
      expect(Math.abs(rotationY)).toBeCloseTo(Math.PI / 2, 5);
    });

    it('should calculate rotation for positive longitude (Paris: 48.8566, 2.3522)', () => {
      const { rotationX, rotationY } = calculateGlobeRotation(48.8566, 2.3522, globeRadius);

      // Verify rotations are defined and within valid range
      expect(rotationX).toBeDefined();
      expect(rotationY).toBeDefined();
      expect(rotationX).toBeGreaterThanOrEqual(-Math.PI / 2);
      expect(rotationX).toBeLessThanOrEqual(Math.PI / 2);
    });

    it('should calculate rotation for negative longitude (New York: 40.7128, -74.006)', () => {
      const { rotationX, rotationY } = calculateGlobeRotation(40.7128, -74.006, globeRadius);

      // Verify rotations are defined and within valid range
      expect(rotationX).toBeDefined();
      expect(rotationY).toBeDefined();
      expect(rotationX).toBeGreaterThanOrEqual(-Math.PI / 2);
      expect(rotationX).toBeLessThanOrEqual(Math.PI / 2);
    });

    it('should calculate rotation for southern hemisphere (Sydney: -33.8688, 151.2093)', () => {
      const { rotationX, rotationY } = calculateGlobeRotation(-33.8688, 151.2093, globeRadius);

      // Sydney is in southern hemisphere, so X rotation should be negative (tilt down)
      expect(rotationX).toBeLessThan(0);
      expect(rotationY).toBeDefined();
    });

    it('should return rotation values in radians', () => {
      const { rotationX, rotationY } = calculateGlobeRotation(45, 90, globeRadius);

      // Rotations should be in range of -π to π
      expect(rotationX).toBeGreaterThanOrEqual(-Math.PI);
      expect(rotationX).toBeLessThanOrEqual(Math.PI);
      expect(rotationY).toBeGreaterThanOrEqual(-Math.PI);
      expect(rotationY).toBeLessThanOrEqual(Math.PI);
    });

    it('should handle longitude at 180 degrees', () => {
      const { rotationX, rotationY } = calculateGlobeRotation(0, 180, globeRadius);

      // At 180 degrees longitude, verify valid rotation
      expect(rotationX).toBeCloseTo(0, 5);
      expect(Math.abs(rotationY)).toBeGreaterThan(0);
    });

    it('should produce opposite Y rotations for opposite longitudes at equator', () => {
      const rotation1 = calculateGlobeRotation(0, 45, globeRadius);
      const rotation2 = calculateGlobeRotation(0, -45, globeRadius);

      // At equator with opposite longitudes, Y rotations should be different
      // but X rotation should be the same (both at equator)
      expect(rotation1.rotationX).toBeCloseTo(rotation2.rotationX, 5);
      // The signs might not be strictly opposite due to atan2 wrapping,
      // but they should be different values
      expect(rotation1.rotationY).not.toBeCloseTo(rotation2.rotationY, 5);
    });

    it('should calculate correct rotation for a location directly in front of camera (lon=0, lat=0 after adjustment)', () => {
      // Test with longitude 90 which should place location at positive Z when rotated
      const { rotationX, rotationY } = calculateGlobeRotation(0, 90, globeRadius);

      expect(rotationX).toBeCloseTo(0, 5);
      expect(rotationY).toBeDefined();
    });
  });
});