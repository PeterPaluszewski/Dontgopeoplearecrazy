import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResourcePanel from './ResourcePanel';
import { useGameStore } from '@/store/gameStore';

// Mock the game store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

describe('ResourcePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all three resource bars', () => {
    vi.mocked(useGameStore).mockReturnValue({
      food: 100,
      water: 100,
      energy: 100,
    } as ReturnType<typeof useGameStore>);

    render(<ResourcePanel />);

    expect(screen.getByText('food')).toBeInTheDocument();
    expect(screen.getByText('water')).toBeInTheDocument();
    expect(screen.getByText('energy')).toBeInTheDocument();
  });

  it('should display current and max values', () => {
    vi.mocked(useGameStore).mockReturnValue({
      food: 75,
      water: 50,
      energy: 25,
    } as ReturnType<typeof useGameStore>);

    render(<ResourcePanel />);

    expect(screen.getByText('75/100')).toBeInTheDocument();
    expect(screen.getByText('50/100')).toBeInTheDocument();
    expect(screen.getByText('25/100')).toBeInTheDocument();
  });

  it('should show low resource warning when any resource is below 30', () => {
    vi.mocked(useGameStore).mockReturnValue({
      food: 25,
      water: 100,
      energy: 100,
    } as ReturnType<typeof useGameStore>);

    render(<ResourcePanel />);

    expect(screen.getByText(/Low resources/i)).toBeInTheDocument();
  });

  it('should show critical warning when any resource is below 15', () => {
    vi.mocked(useGameStore).mockReturnValue({
      food: 10,
      water: 100,
      energy: 100,
    } as ReturnType<typeof useGameStore>);

    render(<ResourcePanel />);

    expect(screen.getByText(/Critical/i)).toBeInTheDocument();
    expect(screen.getByText(/survival is at risk/i)).toBeInTheDocument();
  });

  it('should not show warnings when all resources are healthy', () => {
    vi.mocked(useGameStore).mockReturnValue({
      food: 80,
      water: 90,
      energy: 100,
    } as ReturnType<typeof useGameStore>);

    render(<ResourcePanel />);

    expect(screen.queryByText(/Low resources/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Critical/i)).not.toBeInTheDocument();
  });

  it('should show both warnings when resources are critical', () => {
    vi.mocked(useGameStore).mockReturnValue({
      food: 10,
      water: 20,
      energy: 5,
    } as ReturnType<typeof useGameStore>);

    render(<ResourcePanel />);

    expect(screen.getByText(/Low resources/i)).toBeInTheDocument();
    expect(screen.getByText(/Critical/i)).toBeInTheDocument();
  });

  it('should render resource icons', () => {
    vi.mocked(useGameStore).mockReturnValue({
      food: 100,
      water: 100,
      energy: 100,
    } as ReturnType<typeof useGameStore>);

    const { container } = render(<ResourcePanel />);

    // Check for emojis in the rendered HTML
    expect(container.textContent).toContain('🍕');
    expect(container.textContent).toContain('💧');
    expect(container.textContent).toContain('⚡');
  });

  it('should handle zero resources', () => {
    vi.mocked(useGameStore).mockReturnValue({
      food: 0,
      water: 0,
      energy: 0,
    } as ReturnType<typeof useGameStore>);

    render(<ResourcePanel />);

    // There are 3 resources all showing 0/100
    const zeroValues = screen.getAllByText('0/100');
    expect(zeroValues).toHaveLength(3);
    expect(screen.getByText(/Critical/i)).toBeInTheDocument();
  });

  it('should handle exactly 30 (low threshold)', () => {
    vi.mocked(useGameStore).mockReturnValue({
      food: 30,
      water: 100,
      energy: 100,
    } as ReturnType<typeof useGameStore>);

    render(<ResourcePanel />);

    // At exactly 30, should not show warning (< 30)
    expect(screen.queryByText(/Low resources/i)).not.toBeInTheDocument();
  });

  it('should handle exactly 15 (critical threshold)', () => {
    vi.mocked(useGameStore).mockReturnValue({
      food: 15,
      water: 100,
      energy: 100,
    } as ReturnType<typeof useGameStore>);

    render(<ResourcePanel />);

    // At exactly 15, should not show critical (< 15)
    expect(screen.queryByText(/Critical/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Low resources/i)).toBeInTheDocument();
  });
});
