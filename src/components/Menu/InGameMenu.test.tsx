import * as saveLoad from '@/lib/save-load';
import { render, screen, waitFor } from '@testing-library/react';
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

  it('should open SettingsModal when Settings is clicked', async () => {
    const user = userEvent.setup();

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    // SettingsModal should render with audio tab by default
    await waitFor(() => {
      expect(screen.getByText(/Music Volume:/)).toBeInTheDocument();
    });
  });

  it('should show exit confirmation when Exit to Main Menu is clicked', async () => {
    const user = userEvent.setup();

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    const exitButton = screen.getByText('Exit to Main Menu');
    await user.click(exitButton);

    await waitFor(() => {
      expect(screen.getByText(/Return to main menu/)).toBeInTheDocument();
      expect(screen.getByText('Exit to Menu')).toBeInTheDocument();
    });
  });

  it('should navigate to menu after confirming exit', async () => {
    const user = userEvent.setup();

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    const exitButton = screen.getByText('Exit to Main Menu');
    await user.click(exitButton);

    const confirmButton = await screen.findByText('Exit to Menu');
    await user.click(confirmButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/menu');
  });

  it('should close SettingsModal when it is closed', async () => {
    const user = userEvent.setup();

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    // Open SettingsModal
    const settingsButton = screen.getByText('Settings');
    await user.click(settingsButton);

    // Close SettingsModal using Done button
    const doneButton = await screen.findByText('Done');
    await user.click(doneButton);

    // SettingsModal should be closed
    await waitFor(() => {
      expect(screen.queryByText(/Music Volume:/)).not.toBeInTheDocument();
    });
  });

  it('should handle opening and closing settings multiple times', async () => {
    const user = userEvent.setup();

    render(<InGameMenu isOpen={true} onClose={vi.fn()} />);

    // Open Settings
    await user.click(screen.getByText('Settings'));
    expect(await screen.findByText(/Music Volume:/)).toBeInTheDocument();

    // Close Settings
    const doneButton = screen.getByText('Done');
    await user.click(doneButton);

    await waitFor(() => {
      expect(screen.queryByText(/Music Volume:/)).not.toBeInTheDocument();
    });

    // Open again
    await user.click(screen.getByText('Settings'));
    expect(await screen.findByText(/Music Volume:/)).toBeInTheDocument();
  });
});
