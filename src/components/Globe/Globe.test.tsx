import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Globe from './Globe';
import type { Location } from '@/types/game';

// Mock Three.js components
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="canvas">{children}</div>
  ),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  PerspectiveCamera: () => <div data-testid="camera" />,
}));

vi.mock('./GlobeSphere', () => ({
  default: () => <div data-testid="globe-sphere" />,
}));

vi.mock('./LocationMarker', () => ({
  default: ({ location, onClick }: { location: Location; onClick: () => void }) => (
    <div data-testid={`marker-${location.id}`} onClick={onClick}>
      {location.name}
    </div>
  ),
}));

describe('Globe', () => {
  const mockLocations: Location[] = [
    {
      id: '1',
      name: 'Paris',
      description: 'The City of Light',
      latitude: 48.8566,
      longitude: 2.3522,
      difficultyMultiplier: 1,
      travelDays: 0,
      connectedLocationIds: ['2', '3'],
    },
    {
      id: '2',
      name: 'London',
      description: 'The capital of England',
      latitude: 51.5074,
      longitude: -0.1278,
      difficultyMultiplier: 1,
      travelDays: 1,
      connectedLocationIds: ['1'],
    },
    {
      id: '3',
      name: 'Berlin',
      description: 'The capital of Germany',
      latitude: 52.52,
      longitude: 13.405,
      difficultyMultiplier: 2,
      travelDays: 2,
      connectedLocationIds: ['1'],
    },
  ];

  const mockOnLocationClick = vi.fn();

  it('should render the canvas', () => {
    render(
      <Globe
        locations={mockLocations}
        currentLocationId="1"
        visitedLocationIds={['1']}
        onLocationClick={mockOnLocationClick}
      />
    );

    expect(screen.getByTestId('canvas')).toBeInTheDocument();
  });

  it('should render the globe sphere', () => {
    render(
      <Globe
        locations={mockLocations}
        currentLocationId="1"
        visitedLocationIds={['1']}
        onLocationClick={mockOnLocationClick}
      />
    );

    expect(screen.getByTestId('globe-sphere')).toBeInTheDocument();
  });

  it('should render all location markers', () => {
    render(
      <Globe
        locations={mockLocations}
        currentLocationId="1"
        visitedLocationIds={['1']}
        onLocationClick={mockOnLocationClick}
      />
    );

    expect(screen.getByTestId('marker-1')).toBeInTheDocument();
    expect(screen.getByTestId('marker-2')).toBeInTheDocument();
    expect(screen.getByTestId('marker-3')).toBeInTheDocument();
  });

  it('should render orbit controls', () => {
    render(
      <Globe
        locations={mockLocations}
        currentLocationId="1"
        visitedLocationIds={['1']}
        onLocationClick={mockOnLocationClick}
      />
    );

    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
  });

  it('should display instructions text', () => {
    render(
      <Globe
        locations={mockLocations}
        currentLocationId="1"
        visitedLocationIds={['1']}
        onLocationClick={mockOnLocationClick}
      />
    );

    expect(screen.getByText(/Drag to rotate/i)).toBeInTheDocument();
    expect(screen.getByText(/Scroll to zoom/i)).toBeInTheDocument();
    expect(screen.getByText(/Click markers to select location/i)).toBeInTheDocument();
  });

  it('should handle empty locations array', () => {
    render(
      <Globe
        locations={[]}
        currentLocationId={undefined}
        visitedLocationIds={[]}
        onLocationClick={mockOnLocationClick}
      />
    );

    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('globe-sphere')).toBeInTheDocument();
  });

  it('should call onLocationClick when marker is clicked', () => {
    render(
      <Globe
        locations={mockLocations}
        currentLocationId="1"
        visitedLocationIds={['1']}
        onLocationClick={mockOnLocationClick}
      />
    );

    const parisMarker = screen.getByTestId('marker-1');
    parisMarker.click();

    expect(mockOnLocationClick).toHaveBeenCalledWith(mockLocations[0]);
  });

  it('should handle locations without currentLocationId', () => {
    render(
      <Globe
        locations={mockLocations}
        currentLocationId={undefined}
        visitedLocationIds={[]}
        onLocationClick={mockOnLocationClick}
      />
    );

    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    mockLocations.forEach((location) => {
      expect(screen.getByTestId(`marker-${location.id}`)).toBeInTheDocument();
    });
  });

  it('should pass correct visited status to markers', () => {
    const { rerender } = render(
      <Globe
        locations={mockLocations}
        currentLocationId="1"
        visitedLocationIds={['1', '2']}
        onLocationClick={mockOnLocationClick}
      />
    );

    expect(screen.getByTestId('marker-1')).toBeInTheDocument();
    expect(screen.getByTestId('marker-2')).toBeInTheDocument();
    expect(screen.getByTestId('marker-3')).toBeInTheDocument();

    // Update visited locations
    rerender(
      <Globe
        locations={mockLocations}
        currentLocationId="2"
        visitedLocationIds={['1', '2', '3']}
        onLocationClick={mockOnLocationClick}
      />
    );

    expect(screen.getByTestId('marker-1')).toBeInTheDocument();
    expect(screen.getByTestId('marker-2')).toBeInTheDocument();
    expect(screen.getByTestId('marker-3')).toBeInTheDocument();
  });
});
