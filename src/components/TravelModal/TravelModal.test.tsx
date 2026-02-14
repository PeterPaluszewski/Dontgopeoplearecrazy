import { useGameStore } from '@/store/gameStore';
import type { Location } from '@/types/game';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TravelModal from './TravelModal';

// Mock the store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

describe('TravelModal', () => {
  const mockDestination: Location = {
    id: 'location-2',
    name: 'Berlin',
    description: 'Capital of Germany',
    latitude: 52.52,
    longitude: 13.405,
    difficultyMultiplier: 2,
    travelDays: 3,
    connectedLocationIds: ['location-1'],
  };

  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      food: 75,
      water: 80,
      energy: 85,
    });
  });

  it('should not render when isOpen is false', () => {
    render(
      <TravelModal
        destination={mockDestination}
        isOpen={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(screen.queryByText('Travel to Berlin')).not.toBeInTheDocument();
  });

  it('should render modal when isOpen is true', () => {
    render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(screen.getByText('Travel to Berlin')).toBeInTheDocument();
  });

  it('should display journey duration', () => {
    render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(screen.getByText('3 days')).toBeInTheDocument();
  });

  it('should display singular day for 1 travel day', () => {
    const singleDayDestination = { ...mockDestination, travelDays: 1 };
    render(
      <TravelModal
        destination={singleDayDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );
    expect(screen.getByText('1 day')).toBeInTheDocument();
  });

  it('should calculate and display resource costs', () => {
    render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    // Difficulty 2 = multiplier 1.25, 3 days
    // Food: ceil(15 * 3 * 1.25) = 57
    // Water: ceil(20 * 3 * 1.25) = 75
    // Energy: ceil(25 * 3 * 1.25) = 94
    expect(screen.getByText(/75 - 57/)).toBeInTheDocument(); // Food
    expect(screen.getByText(/80 - 75/)).toBeInTheDocument(); // Water
    expect(screen.getByText(/85 - 94/)).toBeInTheDocument(); // Energy
  });

  it('should show remaining resources after travel', () => {
    render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    // 75 - 57 = 18
    expect(screen.getByText('18')).toBeInTheDocument();
    // 80 - 75 = 5
    expect(screen.getByText('5')).toBeInTheDocument();
    // 85 - 94 = -9
    expect(screen.getByText('-9')).toBeInTheDocument();
  });

  it('should highlight insufficient resources in red', () => {
    render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    // Energy should be insufficient (needs 94, has 85)
    // Find the parent container, not the text element
    const containers = screen.getAllByText('Energy')[0].closest('div')?.parentElement;
    expect(containers).toHaveClass('bg-red-500/10');
  });

  it('should show warning when resources are insufficient', () => {
    render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(
      screen.getByText(/You don't have enough resources to make this journey/)
    ).toBeInTheDocument();
  });

  it('should not show warning when resources are sufficient', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      food: 100,
      water: 100,
      energy: 100,
    });

    render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(
      screen.queryByText(/You don't have enough resources to make this journey/)
    ).not.toBeInTheDocument();
  });

  it('should disable Begin Journey button when resources are insufficient', () => {
    render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const button = screen.getByText('Begin Journey');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-not-allowed');
  });

  it('should enable Begin Journey button when resources are sufficient', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      food: 100,
      water: 100,
      energy: 100,
    });

    render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const button = screen.getByText('Begin Journey');
    expect(button).not.toBeDisabled();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when X button is clicked', () => {
    render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm and onClose when Begin Journey is clicked with sufficient resources', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      food: 100,
      water: 100,
      energy: 100,
    });

    render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('Begin Journey'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onConfirm when Begin Journey is clicked with insufficient resources', () => {
    render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('Begin Journey'));
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should call onClose when clicking outside modal', () => {
    const { container } = render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    const backdrop = container.firstChild;
    fireEvent.click(backdrop as Element);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when clicking inside modal', () => {
    render(
      <TravelModal
        destination={mockDestination}
        isOpen={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('Travel to Berlin'));
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
