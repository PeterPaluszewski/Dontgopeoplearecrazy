import SaveLoadPanel from '@/components/SaveLoadPanel/SaveLoadPanel';
import { useGameStore } from '@/store/gameStore';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the game store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

describe('SaveLoadPanel', () => {
  const mockSaveGame = vi.fn();
  const mockLoadGameFromDB = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useGameStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector) =>
      selector({
        saveGame: mockSaveGame,
        loadGameFromDB: mockLoadGameFromDB,
      })
    );
  });

  it('should render save and load buttons', () => {
    render(<SaveLoadPanel />);

    expect(screen.getByText('Save / Load')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save game/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /load game/i })).toBeInTheDocument();
  });

  it('should call saveGame when Save button is clicked', async () => {
    mockSaveGame.mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<SaveLoadPanel />);

    const saveButton = screen.getByRole('button', { name: /save game/i });
    await user.click(saveButton);

    expect(mockSaveGame).toHaveBeenCalledTimes(1);
  });

  it('should show success message after successful save', async () => {
    mockSaveGame.mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<SaveLoadPanel />);

    const saveButton = screen.getByRole('button', { name: /save game/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Game saved successfully!')).toBeInTheDocument();
    });
  });

  it('should show error message when save fails', async () => {
    mockSaveGame.mockResolvedValue({ success: false, error: 'Save failed' });
    const user = userEvent.setup();

    render(<SaveLoadPanel />);

    const saveButton = screen.getByRole('button', { name: /save game/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });

  it('should disable save button while saving', async () => {
    mockSaveGame.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );
    const user = userEvent.setup();

    render(<SaveLoadPanel />);

    const saveButton = screen.getByRole('button', { name: /save game/i });
    await user.click(saveButton);

    expect(screen.getByRole('button', { name: /saving.../i })).toBeDisabled();
  });

  it('should call loadGameFromDB when Load button is clicked', async () => {
    mockLoadGameFromDB.mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<SaveLoadPanel />);

    const loadButton = screen.getByRole('button', { name: /load game/i });
    await user.click(loadButton);

    expect(mockLoadGameFromDB).toHaveBeenCalledTimes(1);
  });

  it('should show success message after successful load', async () => {
    mockLoadGameFromDB.mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<SaveLoadPanel />);

    const loadButton = screen.getByRole('button', { name: /load game/i });
    await user.click(loadButton);

    await waitFor(() => {
      expect(screen.getByText('Game loaded successfully!')).toBeInTheDocument();
    });
  });

  it('should show error message when load fails', async () => {
    mockLoadGameFromDB.mockResolvedValue({ success: false, error: 'Load failed' });
    const user = userEvent.setup();

    render(<SaveLoadPanel />);

    const loadButton = screen.getByRole('button', { name: /load game/i });
    await user.click(loadButton);

    await waitFor(() => {
      expect(screen.getByText('Load failed')).toBeInTheDocument();
    });
  });

  it('should disable load button while loading', async () => {
    mockLoadGameFromDB.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );
    const user = userEvent.setup();

    render(<SaveLoadPanel />);

    const loadButton = screen.getByRole('button', { name: /load game/i });
    await user.click(loadButton);

    expect(screen.getByRole('button', { name: /loading.../i })).toBeDisabled();
  });

  it('should show last saved timestamp after save', async () => {
    mockSaveGame.mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<SaveLoadPanel />);

    const saveButton = screen.getByRole('button', { name: /save game/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/last saved:/i)).toBeInTheDocument();
    });
  });

  it('should show success message with green styling', async () => {
    mockSaveGame.mockResolvedValue({ success: true });
    const user = userEvent.setup();

    render(<SaveLoadPanel />);

    const saveButton = screen.getByRole('button', { name: /save game/i });
    await user.click(saveButton);

    await waitFor(() => {
      const message = screen.getByText('Game saved successfully!');
      expect(message.className).toContain('bg-green-900');
      expect(message.className).toContain('text-green-200');
    });
  });

  it('should show error message with red styling', async () => {
    mockSaveGame.mockResolvedValue({ success: false, error: 'Error' });
    const user = userEvent.setup();

    render(<SaveLoadPanel />);

    const saveButton = screen.getByRole('button', { name: /save game/i });
    await user.click(saveButton);

    await waitFor(() => {
      const message = screen.getByText('Error');
      expect(message.className).toContain('bg-red-900');
      expect(message.className).toContain('text-red-200');
    });
  });
});
