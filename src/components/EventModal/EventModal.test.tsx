import type { GameEvent } from '@/lib/events';
import { useGameStore } from '@/store/gameStore';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EventModal from './EventModal';

// Mock the store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

describe('EventModal', () => {
  const mockUpdateResources = vi.fn();

  const mockPositiveEvent: GameEvent = {
    id: 'event-1',
    title: 'Found Supplies',
    description: 'You stumbled upon a cache of supplies left by other travelers.',
    event_type: 'RANDOM',
    food_effect: 15,
    water_effect: 10,
    energy_effect: 5,
    choices: [],
    created_at: '2024-01-01',
  };

  const mockNegativeEvent: GameEvent = {
    id: 'event-2',
    title: 'Lost Supplies',
    description: 'Your backpack tore and you lost some supplies.',
    event_type: 'RANDOM',
    food_effect: -10,
    water_effect: -5,
    energy_effect: -8,
    choices: [],
    created_at: '2024-01-01',
  };

  const mockMixedEvent: GameEvent = {
    id: 'event-3',
    title: 'Traded Items',
    description: 'You traded some food for water with a local.',
    event_type: 'RANDOM',
    food_effect: -5,
    water_effect: 10,
    energy_effect: 0,
    choices: [],
    created_at: '2024-01-01',
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      updateResources: mockUpdateResources,
    });
  });

  it('should not render when isOpen is false', () => {
    render(<EventModal event={mockPositiveEvent} isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('🎲 Random Event')).not.toBeInTheDocument();
  });

  it('should render modal when isOpen is true', () => {
    render(<EventModal event={mockPositiveEvent} isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('🎲 Random Event')).toBeInTheDocument();
  });

  it('should display event title', () => {
    render(<EventModal event={mockPositiveEvent} isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('Found Supplies')).toBeInTheDocument();
  });

  it('should display event description', () => {
    render(<EventModal event={mockPositiveEvent} isOpen={true} onClose={mockOnClose} />);
    expect(
      screen.getByText('You stumbled upon a cache of supplies left by other travelers.')
    ).toBeInTheDocument();
  });

  it('should display positive effects in green', () => {
    render(<EventModal event={mockPositiveEvent} isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('+15')).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
    expect(screen.getByText('+5')).toBeInTheDocument();
  });

  it('should display negative effects in red', () => {
    render(<EventModal event={mockNegativeEvent} isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('-10')).toBeInTheDocument();
    expect(screen.getByText('-5')).toBeInTheDocument();
    expect(screen.getByText('-8')).toBeInTheDocument();
  });

  it('should display mixed positive and negative effects', () => {
    render(<EventModal event={mockMixedEvent} isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('-5')).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
    expect(screen.queryByText('+0')).not.toBeInTheDocument(); // Zero effects not displayed
  });

  it('should not display zero effects', () => {
    render(<EventModal event={mockMixedEvent} isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('🍕 Food:')).toBeInTheDocument();
    expect(screen.getByText('💧 Water:')).toBeInTheDocument();
    expect(screen.queryByText('⚡ Energy:')).not.toBeInTheDocument(); // Energy is 0
  });

  it('should display all resource types with effects', () => {
    render(<EventModal event={mockPositiveEvent} isOpen={true} onClose={mockOnClose} />);
    expect(screen.getByText('🍕 Food:')).toBeInTheDocument();
    expect(screen.getByText('💧 Water:')).toBeInTheDocument();
    expect(screen.getByText('⚡ Energy:')).toBeInTheDocument();
  });

  it('should call updateResources with correct values when Continue is clicked', () => {
    render(<EventModal event={mockPositiveEvent} isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Continue'));
    expect(mockUpdateResources).toHaveBeenCalledWith(15, 10, 5);
  });

  it('should round fractional effects when calling updateResources', () => {
    const fractionalEvent: GameEvent = {
      ...mockPositiveEvent,
      food_effect: 10.7,
      water_effect: 5.3,
      energy_effect: 8.5,
    };
    render(<EventModal event={fractionalEvent} isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Continue'));
    expect(mockUpdateResources).toHaveBeenCalledWith(11, 5, 9);
  });

  it('should call onClose when Continue button is clicked', () => {
    render(<EventModal event={mockPositiveEvent} isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Continue'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when X button is clicked', () => {
    render(<EventModal event={mockPositiveEvent} isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText('Close modal'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display green button for positive events', () => {
    render(<EventModal event={mockPositiveEvent} isOpen={true} onClose={mockOnClose} />);
    const button = screen.getByText('Continue');
    expect(button).toHaveClass('bg-green-600');
  });

  it('should display red button for negative-only events', () => {
    render(<EventModal event={mockNegativeEvent} isOpen={true} onClose={mockOnClose} />);
    const button = screen.getByText('Continue');
    expect(button).toHaveClass('bg-red-600');
  });

  it('should display green button for mixed events with positives', () => {
    render(<EventModal event={mockMixedEvent} isOpen={true} onClose={mockOnClose} />);
    const button = screen.getByText('Continue');
    expect(button).toHaveClass('bg-green-600');
  });

  it('should call onClose when clicking outside modal', () => {
    const { container } = render(
      <EventModal event={mockPositiveEvent} isOpen={true} onClose={mockOnClose} />
    );
    const backdrop = container.firstChild;
    fireEvent.click(backdrop as Element);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when clicking inside modal', () => {
    render(<EventModal event={mockPositiveEvent} isOpen={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Found Supplies'));
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
