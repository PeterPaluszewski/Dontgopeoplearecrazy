import * as saveLoad from '@/lib/save-load';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InGameMenu from './InGameMenu';

// Mock dependencies
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/save-load', () => ({
  saveGame: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
  })),
}));

describe('InGameMenu', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<InGameMenu isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render menu when isOpen is true', () => {
    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Game Menu')).toBeInTheDocument();
  });

  it('should display all menu options', () => {
    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Resume')).toBeInTheDocument();
    expect(screen.getByText('Save Game')).toBeInTheDocument();
    expect(screen.getByText('Load Game')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Main Menu')).toBeInTheDocument();
  });

  it('should close menu when Resume is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<InGameMenu isOpen={true} onClose={onClose} />);

    const resumeButton = screen.getByText('Resume');
    await user.click(resumeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should save game when Save Game is clicked', async () => {
    const user = userEvent.setup();
    const toast = await import('react-hot-toast');
    vi.mocked(saveLoad.saveGame).mockResolvedValue({ success: true });

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    const saveButton = screen.getByText('Save Game');
    await user.click(saveButton);

    expect(saveLoad.saveGame).toHaveBeenCalled();
    expect(toast.toast.success).toHaveBeenCalledWith('Game saved!');
  });

  it('should show error when save fails', async () => {
    const user = userEvent.setup();
    const toast = await import('react-hot-toast');
    vi.mocked(saveLoad.saveGame).mockResolvedValue({ 
      success: false, 
      error: 'Database error' 
    });

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    const saveButton = screen.getByText('Save Game');
    await user.click(saveButton);

    expect(toast.toast.error).toHaveBeenCalledWith('Database error');
  });

  it('should show generic error when save fails without message', async () => {
    const user = userEvent.setup();
    const toast = await import('react-hot-toast');
    vi.mocked(saveLoad.saveGame).mockResolvedValue({ success: false });

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    const saveButton = screen.getByText('Save Game');
    await user.click(saveButton);

    expect(toast.toast.error).toHaveBeenCalledWith('Failed to save game');
  });

  it('should disable save button while saving', async () => {
    const user = userEvent.setup();
    vi.mocked(saveLoad.saveGame).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    const saveButton = screen.getByText('Save Game');
    await user.click(saveButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(screen.getByText('Saving...')).toBeDisabled();
  });

  it('should open LoadGameModal when Load Game is clicked', async () => {
    const user = userEvent.setup();

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    const loadButton = screen.getByText('Load Game');
    await user.click(loadButton);

    // LoadGameModal should render
    expect(screen.getByText('Load Game')).toBeInTheDocument();
  });

  it('should open SettingsModal when Settings is clicked', async () => {
    const user = userEvent.setup();

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    // SettingsModal should render
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should sign out and navigate to menu when Main Menu is clicked', async () => {
    const user = userEvent.setup();
    const supabase = await import('@/lib/supabase');

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    const mainMenuButton = screen.getByText('Main Menu');
    await user.click(mainMenuButton);

    const client = supabase.createClient();
    expect(client.auth.signOut).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/menu');
  });

  it('should close menu when X button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<InGameMenu isOpen={true} onClose={onClose} />);

    const xButton = screen.getByText('×');
    await user.click(xButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should close LoadGameModal when it is closed', async () => {
    const user = userEvent.setup();

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    // Open LoadGameModal
    const loadButton = screen.getByText('Load Game');
    await user.click(loadButton);

    // The X button to close the modal
    const xButtons = screen.getAllByText('×');
    await user.click(xButtons[xButtons.length - 1]); // Click the last X (from LoadGameModal)

    // LoadGameModal should be closed
    await waitFor(() => {
      expect(screen.queryByText('No saved games found')).not.toBeInTheDocument();
    });
  });

  it('should close SettingsModal when it is closed', async () => {
    const user = userEvent.setup();

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    // Open SettingsModal
    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    // Close SettingsModal using X button
    const xButtons = screen.getAllByText('×');
    await user.click(xButtons[xButtons.length - 1]); // Click the last X (from SettingsModal)

    // SettingsModal should be closed
    await waitFor(() => {
      expect(screen.queryByLabelText('Music')).not.toBeInTheDocument();
    });
  });

  it('should handle multiple modal openings', async () => {
    const user = userEvent.setup();

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    // Open Settings
    await user.click(screen.getByText('Settings'));
    expect(screen.getByLabelText('Music')).toBeInTheDocument();

    // Close Settings
    const closeButtons = screen.getAllByText('Close');
    await user.click(closeButtons[closeButtons.length - 1]);

    // Open Load Game
    await user.click(screen.getByText('Load Game'));
    
    // Both modals shouldn't be open simultaneously
    expect(screen.queryByLabelText('Music')).not.toBeInTheDocument();
  });
});
