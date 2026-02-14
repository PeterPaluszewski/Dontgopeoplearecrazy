import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoadGameModal from './LoadGameModal';
import * as saveLoad from '@/lib/save-load';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import type { GameState } from '@/types/game';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/save-load', () => ({
  loadAllSaves: vi.fn(),
  deleteSave: vi.fn(),
}));

vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('LoadGameModal', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockLoadGameState = vi.fn();

  const mockSaves: GameState[] = [
    {
      id: 'save-1',
      userId: 'user-1',
      currentLocationId: 'paris-uuid',
      food: 100,
      water: 100,
      energy: 100,
      inventory: [],
      visitedLocationIds: ['paris-uuid'],
      isActive: true,
      difficulty: 'normal',
      characterName: 'Hero 1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 'save-2',
      userId: 'user-1',
      currentLocationId: 'berlin-uuid',
      food: 50,
      water: 60,
      energy: 80,
      inventory: [],
      visitedLocationIds: ['paris-uuid', 'berlin-uuid'],
      isActive: false,
      difficulty: 'hard',
      characterName: 'Hero 2',
      createdAt: '2024-01-05T00:00:00Z',
      updatedAt: '2024-01-06T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockLoadGameState);
    vi.mocked(saveLoad.loadAllSaves).mockResolvedValue({ success: true, saves: mockSaves });
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<LoadGameModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render modal when isOpen is true', async () => {
    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);
    
    await waitFor(() => {
      expect(screen.getByText('Load Game')).toBeInTheDocument();
    });
  });

  it('should load saves when modal opens', async () => {
    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(saveLoad.loadAllSaves).toHaveBeenCalled();
    });
  });

  it('should display loading state while fetching saves', async () => {
    vi.mocked(saveLoad.loadAllSaves).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true, saves: mockSaves }), 100))
    );

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Loading saves...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });
  });

  it('should display all saves', async () => {
    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
      expect(screen.getByText('Hero 2')).toBeInTheDocument();
    });
  });

  it('should display save details correctly', async () => {
    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      // Check for difficulty and character name
      expect(screen.getByText('normal')).toBeInTheDocument();
      expect(screen.getByText('hard')).toBeInTheDocument();
      
      // Check for resource values
      expect(screen.getByText('100')).toBeInTheDocument(); // food
      expect(screen.getByText('50')).toBeInTheDocument(); // food from save 2
    });
  });

  it('should show "No saves found" when there are no saves', async () => {
    vi.mocked(saveLoad.loadAllSaves).mockResolvedValue({ success: true, saves: [] });

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('No saves found')).toBeInTheDocument();
    });
  });

  it('should show error message when loading fails', async () => {
    const toast = await import('react-hot-toast');
    vi.mocked(saveLoad.loadAllSaves).mockResolvedValue({ 
      success: false, 
      error: 'Database error' 
    });

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(toast.toast.error).toHaveBeenCalledWith('Failed to load saves');
    });
  });

  it('should load game and navigate when Load button is clicked', async () => {
    const user = userEvent.setup();
    const toast = await import('react-hot-toast');

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });

    const loadButtons = screen.getAllByText('Load');
    await user.click(loadButtons[0]);

    expect(mockLoadGameState).toHaveBeenCalledWith(mockSaves[0]);
    expect(toast.toast.success).toHaveBeenCalledWith('Game loaded!');
    expect(mockRouter.push).toHaveBeenCalledWith('/game');
  });

  it('should show delete confirmation when Delete button is clicked', async () => {
    const user = userEvent.setup();

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    });
  });

  it('should cancel delete when Cancel is clicked', async () => {
    const user = userEvent.setup();

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });

    // Click Delete
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    // Click Cancel
    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
    
    const cancelButtons = screen.getAllByText('Cancel');
    await user.click(cancelButtons[cancelButtons.length - 1]); // Get the last Cancel button (from confirmation)

    // Confirmation should be hidden
    await waitFor(() => {
      expect(screen.queryByText('Confirm Delete')).not.toBeInTheDocument();
    });
  });

  it('should delete save when Confirm Delete is clicked', async () => {
    const user = userEvent.setup();
    const toast = await import('react-hot-toast');
    vi.mocked(saveLoad.deleteSave).mockResolvedValue({ success: true });

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });

    // Click Delete
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    // Click Confirm Delete
    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    });
    
    const confirmButton = screen.getByText('Confirm Delete');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(saveLoad.deleteSave).toHaveBeenCalledWith('save-1');
      expect(toast.toast.success).toHaveBeenCalledWith('Save deleted');
    });
  });

  it('should show error when delete fails', async () => {
    const user = userEvent.setup();
    const toast = await import('react-hot-toast');
    vi.mocked(saveLoad.deleteSave).mockResolvedValue({ 
      success: false, 
      error: 'Delete failed' 
    });

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });

    // Click Delete
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    // Click Confirm Delete
    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    });
    
    const confirmButton = screen.getByText('Confirm Delete');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.toast.error).toHaveBeenCalledWith('Delete failed');
    });
  });

  it('should refresh saves list after successful delete', async () => {
    const user = userEvent.setup();
    vi.mocked(saveLoad.deleteSave).mockResolvedValue({ success: true });

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });

    // Initial load
    expect(saveLoad.loadAllSaves).toHaveBeenCalledTimes(1);

    // Click Delete and confirm
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    const confirmButton = await screen.findByText('Confirm Delete');
    await user.click(confirmButton);

    await waitFor(() => {
      // Should call loadAllSaves again to refresh the list
      expect(saveLoad.loadAllSaves).toHaveBeenCalledTimes(2);
    });
  });

  it('should disable delete button while deleting', async () => {
    const user = userEvent.setup();
    vi.mocked(saveLoad.deleteSave).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });

    // Click Delete
    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    // Click Confirm Delete
    const confirmButton = await screen.findByText('Confirm Delete');
    await user.click(confirmButton);

    // Button should be disabled
    await waitFor(() => {
      expect(screen.getByText('Deleting...')).toBeInTheDocument();
    });
  });

  it('should close modal when Close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<LoadGameModal isOpen={true} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('Close');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should close modal when X button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<LoadGameModal isOpen={true} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('×')).toBeInTheDocument();
    });

    const xButton = screen.getByText('×');
    await user.click(xButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should not fetch saves when modal is closed', () => {
    render(<LoadGameModal isOpen={false} onClose={vi.fn()} />);

    expect(saveLoad.loadAllSaves).not.toHaveBeenCalled();
  });

  it('should fetch saves again when modal reopens', async () => {
    const { rerender } = render(<LoadGameModal isOpen={false} onClose={vi.fn()} />);

    expect(saveLoad.loadAllSaves).not.toHaveBeenCalled();

    rerender(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(saveLoad.loadAllSaves).toHaveBeenCalledTimes(1);
    });

    rerender(<LoadGameModal isOpen={false} onClose={vi.fn()} />);
    rerender(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(saveLoad.loadAllSaves).toHaveBeenCalledTimes(2);
    });
  });
});
