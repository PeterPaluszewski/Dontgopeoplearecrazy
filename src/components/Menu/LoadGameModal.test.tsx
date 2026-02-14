import * as saveLoad from '@/lib/save-load';
import { useGameStore } from '@/store/gameStore';
import type { GameState } from '@/types/game';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoadGameModal from './LoadGameModal';

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
      
      // Check for resource values (they appear multiple times with %)
      const percentValues = screen.getAllByText(/100%/);
      expect(percentValues.length).toBeGreaterThan(0);
      
      expect(screen.getByText(/50%/)).toBeInTheDocument();
    });
  });

  it('should show "No saved games found" when there are no saves', async () => {
    vi.mocked(saveLoad.loadAllSaves).mockResolvedValue({ success: true, saves: [] });

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('No saved games found')).toBeInTheDocument();
      expect(screen.getByText('Close')).toBeInTheDocument();
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

  it('should load game and navigate when save card is clicked', async () => {
    const user = userEvent.setup();
    const toast = await import('react-hot-toast');

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });

    // Click on the save card itself (it has cursor-pointer)
    const saveCard = screen.getByText('Hero 1').closest('div.group');
    await user.click(saveCard!);

    expect(mockLoadGameState).toHaveBeenCalledWith(mockSaves[0]);
    expect(toast.toast.success).toHaveBeenCalledWith('Game loaded!');
    expect(mockRouter.push).toHaveBeenCalledWith('/game');
  });

  it('should show delete confirmation when Delete button is clicked', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this save?');
    confirmSpy.mockRestore();
  });

  it('should not delete save when confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    expect(confirmSpy).toHaveBeenCalled();
    expect(saveLoad.deleteSave).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('should delete save when confirmation is accepted', async () => {
    const user = userEvent.setup();
    const toast = await import('react-hot-toast');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(saveLoad.deleteSave).mockResolvedValue({ success: true });

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(saveLoad.deleteSave).toHaveBeenCalledWith('save-1');
      expect(toast.toast.success).toHaveBeenCalledWith('Save deleted');
    });
    
    confirmSpy.mockRestore();
  });

  it('should show error when delete fails', async () => {
    const user = userEvent.setup();
    const toast = await import('react-hot-toast');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(saveLoad.deleteSave).mockResolvedValue({ 
      success: false, 
      error: 'Delete failed' 
    });

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(toast.toast.error).toHaveBeenCalledWith('Failed to delete save');
    });
    
    confirmSpy.mockRestore();
  });

  it('should remove save from list after successful delete', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(saveLoad.deleteSave).mockResolvedValue({ success: true });

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
      expect(screen.getByText('Hero 2')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Hero 1')).not.toBeInTheDocument();
      expect(screen.getByText('Hero 2')).toBeInTheDocument();
    });
    
    confirmSpy.mockRestore();
  });

  it('should show deleting state while deleting', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(saveLoad.deleteSave).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<LoadGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Deleting...')).toBeInTheDocument();
    });
    
    confirmSpy.mockRestore();
  });

  it('should close modal when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<LoadGameModal isOpen={true} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('Hero 1')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

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
