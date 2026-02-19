import * as database from '@/lib/database';
import * as saveLoad from '@/lib/save-load';
import { useGameStore } from '@/store/gameStore';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NewGameModal from './NewGameModal';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/database', () => ({
  getAllLocations: vi.fn(),
}));

vi.mock('@/lib/save-load', () => ({
  createNewGame: vi.fn(),
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

describe('NewGameModal', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockSetCurrentLocationId = vi.fn();

  const mockLocations = [
    {
      id: 'paris-uuid',
      name: 'Paris',
      description: 'City of Light',
      latitude: 48.8566,
      longitude: 2.3522,
      difficultyMultiplier: 1.0,
      isCoastal: false,
      region: 'europe_mainland',
      connectedLocationIds: [],
    },
    {
      id: 'berlin-uuid',
      name: 'Berlin',
      description: 'Capital of Germany',
      latitude: 52.52,
      longitude: 13.405,
      difficultyMultiplier: 1.0,
      isCoastal: false,
      region: 'europe_mainland',
      connectedLocationIds: [],
    },
    {
      id: 'amsterdam-uuid',
      name: 'Amsterdam',
      description: 'City of canals',
      latitude: 52.3676,
      longitude: 4.9041,
      difficultyMultiplier: 1.0,
      isCoastal: false,
      region: 'europe_mainland',
      connectedLocationIds: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSetCurrentLocationId);
    vi.mocked(database.getAllLocations).mockResolvedValue(mockLocations);
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<NewGameModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render modal when isOpen is true', async () => {
    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('New Game')).toBeInTheDocument();
    });
  });

  it('should load locations on mount', async () => {
    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(database.getAllLocations).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('Berlin')).toBeInTheDocument();
      expect(screen.getByText('Amsterdam')).toBeInTheDocument();
    });
  });

  it('should display loading state while fetching locations', async () => {
    vi.mocked(database.getAllLocations).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockLocations), 100))
    );

    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Loading locations...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });
  });

  it('should render all difficulty options', async () => {
    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Easy')).toBeInTheDocument();
      expect(screen.getByText('Normal')).toBeInTheDocument();
      expect(screen.getByText('Hard')).toBeInTheDocument();
    });

    expect(
      screen.getByText('More resources, lower travel costs, fewer dangers')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Balanced experience, recommended for first playthrough')
    ).toBeInTheDocument();
    expect(screen.getByText('Scarce resources, high costs, frequent dangers')).toBeInTheDocument();
  });

  it('should allow selecting difficulty', async () => {
    const user = userEvent.setup();
    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Easy')).toBeInTheDocument();
    });

    const easyButton = screen.getByText('Easy').closest('button');
    await user.click(easyButton!);

    // Check if the button has the selected styling (border-blue-500 class)
    expect(easyButton).toHaveClass('border-blue-500');
  });

  it('should allow entering character name', async () => {
    const user = userEvent.setup();
    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    const nameInput = screen.getByPlaceholderText('Enter your name...');
    await user.type(nameInput, 'Test Player');

    expect(nameInput).toHaveValue('Test Player');
  });

  it('should select Paris as default location', async () => {
    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      const parisButton = screen.getByText('Paris').closest('button');
      expect(parisButton).toHaveClass('border-blue-500');
    });
  });

  it('should allow selecting starting location', async () => {
    const user = userEvent.setup();
    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Berlin')).toBeInTheDocument();
    });

    const berlinButton = screen.getByText('Berlin').closest('button');
    await user.click(berlinButton!);

    expect(berlinButton).toHaveClass('border-blue-500');
  });

  it('should disable start button while loading locations', async () => {
    vi.mocked(database.getAllLocations).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockLocations), 100))
    );

    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    const startButton = screen.getByText('Start Adventure');
    expect(startButton).toBeDisabled();

    await waitFor(() => {
      expect(startButton).not.toBeDisabled();
    });
  });

  it('should create new game with correct parameters', async () => {
    const user = userEvent.setup();
    vi.mocked(saveLoad.createNewGame).mockResolvedValue({
      success: true,
      gameStateId: 'test-game-id',
    });

    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    // Enter character name
    const nameInput = screen.getByPlaceholderText('Enter your name...');
    await user.type(nameInput, 'Hero');

    // Select difficulty
    const hardButton = screen.getByText('Hard').closest('button');
    await user.click(hardButton!);

    // Select location (Berlin)
    const berlinButton = screen.getByText('Berlin').closest('button');
    await user.click(berlinButton!);

    // Start game
    const startButton = screen.getByText('Start Adventure');
    await user.click(startButton);

    await waitFor(() => {
      expect(saveLoad.createNewGame).toHaveBeenCalledWith('berlin-uuid', 'hard', 'Hero');
    });
  });

  it('should handle createNewGame without character name', async () => {
    const user = userEvent.setup();
    vi.mocked(saveLoad.createNewGame).mockResolvedValue({
      success: true,
      gameStateId: 'test-game-id',
    });

    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    const startButton = screen.getByText('Start Adventure');
    await user.click(startButton);

    await waitFor(() => {
      expect(saveLoad.createNewGame).toHaveBeenCalledWith('paris-uuid', 'normal', undefined);
    });
  });

  it('should navigate to game page on success', async () => {
    const user = userEvent.setup();
    vi.mocked(saveLoad.createNewGame).mockResolvedValue({
      success: true,
      gameStateId: 'test-game-id',
    });

    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    const startButton = screen.getByText('Start Adventure');
    await user.click(startButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/game');
      expect(mockSetCurrentLocationId).toHaveBeenCalledWith('paris-uuid');
    });
  });

  it('should show error message on failure', async () => {
    const user = userEvent.setup();
    const toast = await import('react-hot-toast');
    vi.mocked(saveLoad.createNewGame).mockResolvedValue({
      success: false,
      error: 'Database error',
    });

    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    const startButton = screen.getByText('Start Adventure');
    await user.click(startButton);

    await waitFor(() => {
      expect(toast.toast.error).toHaveBeenCalledWith('Database error');
    });
  });

  it('should show generic error when no error message provided', async () => {
    const user = userEvent.setup();
    const toast = await import('react-hot-toast');
    vi.mocked(saveLoad.createNewGame).mockResolvedValue({ success: false });

    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    const startButton = screen.getByText('Start Adventure');
    await user.click(startButton);

    await waitFor(() => {
      expect(toast.toast.error).toHaveBeenCalledWith('Failed to create new game');
    });
  });

  it('should handle exceptions during game creation', async () => {
    const user = userEvent.setup();
    const toast = await import('react-hot-toast');
    vi.mocked(saveLoad.createNewGame).mockRejectedValue(new Error('Network error'));

    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    const startButton = screen.getByText('Start Adventure');
    await user.click(startButton);

    await waitFor(() => {
      expect(toast.toast.error).toHaveBeenCalledWith('Failed to start new game');
    });
  });

  it('should close modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<NewGameModal isOpen={true} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should close modal when X button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<NewGameModal isOpen={true} onClose={onClose} />);

    await waitFor(() => {
      expect(screen.getByText('×')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('×');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should disable buttons while creating game', async () => {
    const user = userEvent.setup();
    vi.mocked(saveLoad.createNewGame).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true, gameStateId: 'test' }), 100)
        )
    );

    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    const startButton = screen.getByText('Start Adventure');
    await user.click(startButton);

    // Check button shows loading state
    expect(screen.getByText('Starting...')).toBeInTheDocument();
    expect(screen.getByText('Starting...')).toBeDisabled();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });

  it('should display "No locations available" when no locations match filter', async () => {
    vi.mocked(database.getAllLocations).mockResolvedValue([
      {
        id: 'tokyo-uuid',
        name: 'Tokyo',
        description: 'Capital of Japan',
        latitude: 35.6762,
        longitude: 139.6503,
        difficultyMultiplier: 1.0,
        isCoastal: false,
        region: 'japan',
        connectedLocationIds: [],
      },
    ]);

    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('No locations available')).toBeInTheDocument();
    });
  });

  it('should limit character name to 30 characters', async () => {
    render(<NewGameModal isOpen={true} onClose={vi.fn()} />);

    const nameInput = screen.getByPlaceholderText('Enter your name...') as HTMLInputElement;
    expect(nameInput).toHaveAttribute('maxLength', '30');
  });
});
