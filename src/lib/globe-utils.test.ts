import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  calculateDistance,
  calculateDragRadiansPerPixel,
  calculateGlobeQuaternion,
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

    const expectRotatesToCamera = (lat: number, lon: number) => {
      const { rotationX, rotationY, rotationZ } = calculateGlobeRotation(lat, lon, globeRadius);
      const rotationEuler = new THREE.Euler(rotationX, rotationY, rotationZ, 'YXZ');
      const rotationQuat = new THREE.Quaternion().setFromEuler(rotationEuler);
      const targetDir = latLonToVector3(lat, lon, globeRadius).normalize();
      const rotated = targetDir.clone().applyQuaternion(rotationQuat);

      expect(rotated.x).toBeCloseTo(0, 5);
      expect(rotated.y).toBeCloseTo(0, 5);
      expect(rotated.z).toBeCloseTo(1, 5);
    };

    it('should calculate rotation to show equator prime meridian (0, 0)', () => {
      expectRotatesToCamera(0, 0);
    });

    it('should calculate rotation to show north pole (90, 0)', () => {
      expectRotatesToCamera(90, 0);
    });

    it('should calculate rotation to show south pole (-90, 0)', () => {
      expectRotatesToCamera(-90, 0);
    });

    it('should calculate rotation for positive longitude (Paris: 48.8566, 2.3522)', () => {
      expectRotatesToCamera(48.8566, 2.3522);
    });

    it('should calculate rotation for negative longitude (New York: 40.7128, -74.006)', () => {
      expectRotatesToCamera(40.7128, -74.006);
    });

    it('should calculate rotation for southern hemisphere (Sydney: -33.8688, 151.2093)', () => {
      expectRotatesToCamera(-33.8688, 151.2093);
    });

    it('should return rotation values in radians', () => {
      const { rotationX, rotationY, rotationZ } = calculateGlobeRotation(45, 90, globeRadius);

      expect(rotationX).toBeGreaterThanOrEqual(-Math.PI);
      expect(rotationX).toBeLessThanOrEqual(Math.PI);
      expect(rotationY).toBeGreaterThanOrEqual(-Math.PI);
      expect(rotationY).toBeLessThanOrEqual(Math.PI);
      expect(rotationZ).toBeGreaterThanOrEqual(-Math.PI);
      expect(rotationZ).toBeLessThanOrEqual(Math.PI);
    });

    it('should handle longitude at 180 degrees', () => {
      expectRotatesToCamera(0, 180);
    });

    it('should produce opposite Y rotations for opposite longitudes at equator', () => {
      const rotation1 = calculateGlobeRotation(0, 45, globeRadius);
      const rotation2 = calculateGlobeRotation(0, -45, globeRadius);

      expect(rotation1.rotationX).toBeCloseTo(rotation2.rotationX, 5);
      expect(rotation1.rotationY).not.toBeCloseTo(rotation2.rotationY, 5);
    });

    it('should calculate correct rotation for a location directly in front of camera (lon=90, lat=0)', () => {
      expectRotatesToCamera(0, 90);
    });
  });

  describe('calculateGlobeQuaternion', () => {
    const globeRadius = 2;

    const expectQuaternionRotatesToCamera = (lat: number, lon: number) => {
      const rotationQuat = calculateGlobeQuaternion(lat, lon, globeRadius);
      const targetDir = latLonToVector3(lat, lon, globeRadius).normalize();
      const rotated = targetDir.clone().applyQuaternion(rotationQuat);

      expect(rotated.x).toBeCloseTo(0, 5);
      expect(rotated.y).toBeCloseTo(0, 5);
      expect(rotated.z).toBeCloseTo(1, 5);
    };

    it('should align equator prime meridian', () => {
      expectQuaternionRotatesToCamera(0, 0);
    });

    it('should align north pole', () => {
      expectQuaternionRotatesToCamera(90, 0);
    });

    it('should align southern hemisphere', () => {
      expectQuaternionRotatesToCamera(-33.8688, 151.2093);
    });
  });

  describe('calculateDragRadiansPerPixel', () => {
    // These tests lock in the current calibrated formula.
    // If the drag feel needs changing, update these values intentionally.
    const FOV = 75;       // degrees — matches PerspectiveCamera default
    const HEIGHT = 600;   // pixels — representative viewport height

    it('should return the calibrated value at zoom 4 (tuning reference point)', () => {
      const result = calculateDragRadiansPerPixel(FOV, HEIGHT, 4);
      // 2 * tan(37.5°) / 600 * (4/4) — tan(37.5°) ≈ 0.7673, so ≈ 0.002558
      expect(result).toBeCloseTo(0.002558, 4);
    });

    it('should be half as fast at zoom 2 (precise close-up control)', () => {
      const atZoom2 = calculateDragRadiansPerPixel(FOV, HEIGHT, 2);
      const atZoom4 = calculateDragRadiansPerPixel(FOV, HEIGHT, 4);
      expect(atZoom2).toBeCloseTo(atZoom4 / 2, 6);
    });

    it('should be 1.5× faster at zoom 6 (wider sweeps when zoomed out)', () => {
      const atZoom6 = calculateDragRadiansPerPixel(FOV, HEIGHT, 6);
      const atZoom4 = calculateDragRadiansPerPixel(FOV, HEIGHT, 4);
      expect(atZoom6).toBeCloseTo(atZoom4 * 1.5, 6);
    });

    it('should scale linearly with camera distance', () => {
      const at4 = calculateDragRadiansPerPixel(FOV, HEIGHT, 4);
      const at8 = calculateDragRadiansPerPixel(FOV, HEIGHT, 8);
      expect(at8).toBeCloseTo(at4 * 2, 6);
    });

    it('should scale inversely with viewport height', () => {
      const at600 = calculateDragRadiansPerPixel(FOV, 600, 4);
      const at1200 = calculateDragRadiansPerPixel(FOV, 1200, 4);
      expect(at1200).toBeCloseTo(at600 / 2, 6);
    });

    it('should use calibrationDistance parameter to override tuning point', () => {
      // calibrationDistance=2 means distance=4 is 2× above calibration → 2× faster
      const defaultAt4 = calculateDragRadiansPerPixel(FOV, HEIGHT, 4, 4);
      const customAt4 = calculateDragRadiansPerPixel(FOV, HEIGHT, 4, 2);
      expect(customAt4).toBeCloseTo(defaultAt4 * 2, 6);
    });
  });
});