import { useGameStore } from '@/store/gameStore';
import type { ConnectionDetail, Location } from '@/types/game';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TravelModal from './TravelModal';

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

  // car: 200 km at 90 km/h = 0.2778 days
  // Difficulty 2 = multiplier 1.25
  // Food: ceil(15 * 0.2778 * 1.25) = ceil(5.208) = 6  -- but test data uses travelDays=1 logic
  // To keep costs predictable we use 720 km / 90 km/h = 1.0 day exactly.
  const carOption: ConnectionDetail = {
    toId: 'location-2',
    distanceKm: 720,
    transportSlug: 'car',
    speedKmh: 90,
    baseCostMultiplier: 0,
  };

  const trainOption: ConnectionDetail = {
    toId: 'location-2',
    distanceKm: 720,
    transportSlug: 'train',
    speedKmh: 200,
    baseCostMultiplier: 1,
  };

  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  /** Single-option props for basic tests. Car (720 km/90 kmh = 1 day exactly), free. */
  const defaultProps = () => ({
    destination: mockDestination,
    connectionOptions: [carOption],
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
  });

  /** Two-option props: car (slower, free) then train (faster, costs money). */
  const multiOptionProps = () => ({
    destination: mockDestination,
    connectionOptions: [carOption, trainOption],
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
      money: 200,
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

  it('should show transport selector section', () => {
    render(<TravelModal {...defaultProps()} />);
    expect(screen.getByText('Choose transport:')).toBeInTheDocument();
  });

  it('should render one button per transport option', () => {
    render(<TravelModal {...multiOptionProps()} />);
    // Both options should appear in the selector buttons
    expect(screen.getByText(/by car/i)).toBeInTheDocument();
    // "by train" also appears in the header subtitle for the selected (fastest) option
    expect(screen.getAllByText(/by train/i).length).toBeGreaterThanOrEqual(1);
  });

  it('should calculate and display resource costs for default (fastest) option', () => {
    render(<TravelModal {...defaultProps()} />);

    // car: 720 km / 90 kmh / 8 h/day = 1 day; difficulty 2 = x1.25; baseCostMultiplier 0 (free)
    // Food: ceil(15 * 1 * 1.25) = 19
    // Water: ceil(20 * 1 * 1.25) = 25
    // Energy: ceil(25 * 1 * 1.25) = 32
    expect(screen.getByText(/75 - 19/)).toBeInTheDocument();
    expect(screen.getByText(/80 - 25/)).toBeInTheDocument();
    expect(screen.getByText(/85 - 32/)).toBeInTheDocument();
  });

  it('should show remaining resources after travel', () => {
    render(<TravelModal {...defaultProps()} />);
    expect(screen.getByText('56')).toBeInTheDocument(); // 75 - 19
    expect(screen.getByText('55')).toBeInTheDocument(); // 80 - 25
    expect(screen.getByText('53')).toBeInTheDocument(); // 85 - 32
  });

  it('should highlight insufficient resources in red', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      food: 10,
      water: 10,
      energy: 10,
      money: 200,
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
      money: 200,
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
      money: 200,
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
      money: 200,
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
      money: 200,
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

  it('should call onConfirm with chosen option and onClose when Begin Journey is clicked', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      food: 100,
      water: 100,
      energy: 100,
      money: 200,
    });

    render(<TravelModal {...defaultProps()} />);

    fireEvent.click(screen.getByText('Begin Journey'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).toHaveBeenCalledWith(carOption);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not call onConfirm when Begin Journey is clicked with insufficient resources', () => {
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      food: 10,
      water: 10,
      energy: 10,
      money: 200,
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

  it('should default to fastest (last) option with multiple transports', () => {
    render(<TravelModal {...multiOptionProps()} />);
    // Train is faster (200 kmh) so it is the default — its costs should be shown in detail section
    // train: 720/200/8 = 0.45 day; difficulty 2 = x1.25; baseCostMultiplier 1
    // money: ceil(20*1 + 5*0.45*1) = ceil(22.25) = 23
    expect(screen.getByText(/€23/)).toBeInTheDocument();
  });

  it('should update cost breakdown when a different transport is selected', () => {
    render(<TravelModal {...multiOptionProps()} />);

    // Click the car option button (by finding its label text in the selector)
    const carButtons = screen.getAllByText(/by car/i);
    fireEvent.click(carButtons[0]);

    // Car has baseCostMultiplier 0 so money cost is 0 — no euro amount shown in detail
    // Food for car (1 day, difficulty 2): 19
    expect(screen.getByText(/75 - 19/)).toBeInTheDocument();
  });
});
