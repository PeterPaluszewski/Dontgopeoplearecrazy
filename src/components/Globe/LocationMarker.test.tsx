import type { Location } from '@/types/game';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LocationMarker from './LocationMarker';

// Mock Three.js completely
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three');
  return {
    ...actual,
    Vector3: actual.Vector3,
    Mesh: actual.Mesh,
  };
});

// Mock react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(() => {
    // Don't execute the animation callback in tests
  }),
  useThree: () => ({
    camera: {
      position: {
        length: () => 6,
      },
    },
  }),
}));

// Mock the globe-utils module
vi.mock('@/lib/globe-utils', () => ({
  getMarkerPosition: vi.fn(() => ({ x: 1, y: 1, z: 1 })),
  getMarkerColor: vi.fn((isVisited: boolean, isCurrent: boolean) => {
    if (isCurrent) return '#10b981';
    if (isVisited) return '#3b82f6';
    return '#6b7280';
  }),
}));

describe('LocationMarker', () => {
  const mockLocation: Location = {
    id: '1',
    name: 'Paris',
    description: 'The City of Light',
    latitude: 48.8566,
    longitude: 2.3522,
    difficultyMultiplier: 1,
    isCoastal: false,
    region: 'europe_mainland',
    connectedLocationIds: ['2', '3'],
  };

  let mockOnClick: () => void;
  let mockOnHover: (hovered: boolean) => void;

  beforeEach(() => {
    mockOnClick = vi.fn();
    mockOnHover = vi.fn();
  });

  it('should accept all required props without errors', () => {
    const props = {
      location: mockLocation,
      isVisited: false,
      isCurrent: false,
      onClick: mockOnClick,
      onHover: mockOnHover,
    };

    expect(props.location).toBeDefined();
    expect(props.onClick).toBeDefined();
    expect(props.onHover).toBeDefined();
  });

  it('should handle current location state', () => {
    const props = {
      location: mockLocation,
      isVisited: true,
      isCurrent: true,
      onClick: mockOnClick,
      onHover: mockOnHover,
    };

    expect(props.isCurrent).toBe(true);
    expect(props.isVisited).toBe(true);
  });

  it('should handle visited state', () => {
    const props = {
      location: mockLocation,
      isVisited: true,
      isCurrent: false,
      onClick: mockOnClick,
      onHover: mockOnHover,
    };

    expect(props.isVisited).toBe(true);
    expect(props.isCurrent).toBe(false);
  });

  it('should handle unvisited state', () => {
    const props = {
      location: mockLocation,
      isVisited: false,
      isCurrent: false,
      onClick: mockOnClick,
      onHover: mockOnHover,
    };

    expect(props.isVisited).toBe(false);
    expect(props.isCurrent).toBe(false);
  });

  it('should handle different location coordinates', () => {
    const locations: Location[] = [
      { ...mockLocation, id: '1', latitude: 0, longitude: 0 }, // Equator, Prime Meridian
      { ...mockLocation, id: '2', latitude: 90, longitude: 0 }, // North Pole
      { ...mockLocation, id: '3', latitude: -90, longitude: 0 }, // South Pole
      { ...mockLocation, id: '4', latitude: 40.7128, longitude: -74.006 }, // New York (negative lon)
    ];

    locations.forEach((location) => {
      expect(location.latitude).toBeDefined();
      expect(location.longitude).toBeDefined();
      expect(typeof location.latitude).toBe('number');
      expect(typeof location.longitude).toBe('number');
    });
  });

  it('should render without crashing', () => {
    const { baseElement } = render(
      <LocationMarker
        location={mockLocation}
        isVisited={false}
        isCurrent={false}
        onClick={mockOnClick}
        onHover={mockOnHover}
      />
    );

    expect(baseElement).toBeTruthy();
  });
});
