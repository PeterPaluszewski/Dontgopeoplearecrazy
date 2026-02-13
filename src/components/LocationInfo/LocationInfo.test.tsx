import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LocationInfo from './LocationInfo';
import type { Location } from '@/types/game';
import { useGameStore } from '@/store/gameStore';

// Mock the game store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

describe('LocationInfo', () => {
  const mockLocation: Location = {
    id: '1',
    name: 'Paris',
    description: 'The City of Light',
    latitude: 48.8566,
    longitude: 2.3522,
    difficultyMultiplier: 3,
    travelDays: 2,
    connectedLocationIds: ['2', '3', '4'],
  };

  it('should show placeholder when no location is selected', () => {
    vi.mocked(useGameStore).mockReturnValue({
      visitedLocationIds: [],
    } as ReturnType<typeof useGameStore>);

    render(<LocationInfo location={null} />);

    expect(screen.getByText(/Select a location to view details/i)).toBeInTheDocument();
  });

  it('should display location name and description', () => {
    vi.mocked(useGameStore).mockReturnValue({
      visitedLocationIds: [],
    } as ReturnType<typeof useGameStore>);

    render(<LocationInfo location={mockLocation} />);

    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('The City of Light')).toBeInTheDocument();
  });

  it('should show NEW badge for unvisited location', () => {
    vi.mocked(useGameStore).mockReturnValue({
      visitedLocationIds: [],
    } as ReturnType<typeof useGameStore>);

    render(<LocationInfo location={mockLocation} />);

    expect(screen.getByText('NEW')).toBeInTheDocument();
    expect(screen.queryByText('VISITED')).not.toBeInTheDocument();
  });

  it('should show VISITED badge for visited location', () => {
    vi.mocked(useGameStore).mockReturnValue({
      visitedLocationIds: ['1', '2'],
    } as ReturnType<typeof useGameStore>);

    render(<LocationInfo location={mockLocation} />);

    expect(screen.getByText('VISITED')).toBeInTheDocument();
    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
  });

  it('should display difficulty with star rating', () => {
    vi.mocked(useGameStore).mockReturnValue({
      visitedLocationIds: [],
    } as ReturnType<typeof useGameStore>);

    render(<LocationInfo location={mockLocation} />);

    const difficultyElement = screen.getByText(/⭐⭐⭐/);
    expect(difficultyElement).toBeInTheDocument();
  });

  it('should cap difficulty stars at 5', () => {
    const highDifficultyLocation: Location = {
      ...mockLocation,
      difficultyMultiplier: 10,
    };

    vi.mocked(useGameStore).mockReturnValue({
      visitedLocationIds: [],
    } as ReturnType<typeof useGameStore>);

    render(<LocationInfo location={highDifficultyLocation} />);

    const stars = screen.getByText(/⭐{5}$/);
    expect(stars).toBeInTheDocument();
  });

  it('should display travel time correctly', () => {
    vi.mocked(useGameStore).mockReturnValue({
      visitedLocationIds: [],
    } as ReturnType<typeof useGameStore>);

    render(<LocationInfo location={mockLocation} />);

    expect(screen.getByText('2 days')).toBeInTheDocument();
  });

  it('should display singular day for 1 travel day', () => {
    const oneDayLocation: Location = {
      ...mockLocation,
      travelDays: 1,
    };

    vi.mocked(useGameStore).mockReturnValue({
      visitedLocationIds: [],
    } as ReturnType<typeof useGameStore>);

    render(<LocationInfo location={oneDayLocation} />);

    expect(screen.getByText('1 day')).toBeInTheDocument();
  });

  it('should display coordinates with 2 decimal places', () => {
    vi.mocked(useGameStore).mockReturnValue({
      visitedLocationIds: [],
    } as ReturnType<typeof useGameStore>);

    render(<LocationInfo location={mockLocation} />);

    expect(screen.getByText('48.86°, 2.35°')).toBeInTheDocument();
  });

  it('should show connected locations count', () => {
    vi.mocked(useGameStore).mockReturnValue({
      visitedLocationIds: [],
    } as ReturnType<typeof useGameStore>);

    render(<LocationInfo location={mockLocation} />);

    expect(screen.getByText(/Connected to 3 locations/i)).toBeInTheDocument();
  });

  it('should handle location with no connections', () => {
    const isolatedLocation: Location = {
      ...mockLocation,
      connectedLocationIds: [],
    };

    vi.mocked(useGameStore).mockReturnValue({
      visitedLocationIds: [],
    } as ReturnType<typeof useGameStore>);

    render(<LocationInfo location={isolatedLocation} />);

    expect(screen.queryByText(/Connected to/i)).not.toBeInTheDocument();
  });

  it('should handle negative coordinates', () => {
    const southWestLocation: Location = {
      ...mockLocation,
      latitude: -33.8688,
      longitude: -151.2093,
    };

    vi.mocked(useGameStore).mockReturnValue({
      visitedLocationIds: [],
    } as ReturnType<typeof useGameStore>);

    render(<LocationInfo location={southWestLocation} />);

    expect(screen.getByText('-33.87°, -151.21°')).toBeInTheDocument();
  });
});
