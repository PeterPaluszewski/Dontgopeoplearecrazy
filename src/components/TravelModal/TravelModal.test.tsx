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
    isCoastal: false,
    region: 'europe_mainland',
    connectedLocationIds: ['location-1'],
    connections: [],
  };

  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  /** travelDays=1 matches the previous hardcoded value so existing cost assertions stay valid */
  const defaultProps = () => ({
    destination: mockDestination,
    travelDays: 1,
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      food: 75,
      water: 80,
      energy: 85,
    });
  });

  it('should not render when isOpen is false', () => {
    render(<TravelModal {...defaultProps()} isOpen={false} />);
    expect(screen.queryByText('Travel to Berlin')).not.toBeInTheDocument();
  });

  it('should render modal when isOpen is true', () => {
    render(<TravelModal {...defaultProps()} />);
    expect(screen.getByText('Travel to Berlin')).toBeInTheDocument();
  });

  it('should calculate and display resource costs', () => {
    render(<TravelModal {...defaultProps()} />);

    // Difficulty 2 = multiplier 1.25, 1 day
    // Food: ceil(15 * 1 * 1.25) = 19
    // Water: ceil(20 * 1 * 1.25) = 25
    // Energy: ceil(25 * 1 * 1.25) = 32
    expect(screen.getByText(/75 - 19/)).toBeInTheDocument(); // Food
    expect(screen.getByText(/80 - 25/)).toBeInTheDocument(); // Water
    expect(screen.getByText(/85 - 32/)).toBeInTheDocument(); // Energy
  });

  it('should show remaining resources after travel', () => {
    render(<TravelModal {...defaultProps()} />);

    // 75 - 19 = 56
    expect(screen.getByText('56')).toBeInTheDocument();
    // 80 - 25 = 55
    expect(screen.getByText('55')).toBeInTheDocument();
    // 85 - 32 = 53
    expect(screen.getByText('53')).toBeInTheDocument();
  });

  it('should highlight insufficient resources in red', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      food: 10,
      water: 10,
      energy: 10,
    });

    render(<TravelModal {...defaultProps()} />);

    // Energy should be insufficient (needs 32, has 10)
    const containers = screen.getAllByText('Energy')[0].closest('div')?.parentElement;
    expect(containers).toHaveClass('bg-red-500/10');
  });

  it('should show warning when resources are insufficient', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      food: 10,
      water: 10,
      energy: 10,
    });

    render(<TravelModal {...defaultProps()} />);

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

    render(<TravelModal {...defaultProps()} />);

    expect(
      screen.queryByText(/You don't have enough resources to make this journey/)
    ).not.toBeInTheDocument();
  });

  it('should disable Begin Journey button when resources are insufficient', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      food: 10,
      water: 10,
      energy: 10,
    });

    render(<TravelModal {...defaultProps()} />);

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

    render(<TravelModal {...defaultProps()} />);

    const button = screen.getByText('Begin Journey');
    expect(button).not.toBeDisabled();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(<TravelModal {...defaultProps()} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when X button is clicked', () => {
    render(<TravelModal {...defaultProps()} />);

    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onConfirm and onClose when Begin Journey is clicked with sufficient resources', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      food: 100,
      water: 100,
      energy: 100,
    });

    render(<TravelModal {...defaultProps()} />);

    fireEvent.click(screen.getByText('Begin Journey'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onConfirm when Begin Journey is clicked with insufficient resources', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      food: 10,
      water: 10,
      energy: 10,
    });

    render(<TravelModal {...defaultProps()} />);

    fireEvent.click(screen.getByText('Begin Journey'));
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should call onClose when clicking outside modal', () => {
    const { container } = render(<TravelModal {...defaultProps()} />);

    const backdrop = container.firstChild;
    fireEvent.click(backdrop as Element);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when clicking inside modal', () => {
    render(<TravelModal {...defaultProps()} />);

    fireEvent.click(screen.getByText('Travel to Berlin'));
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
