import { useSettingsStore } from '@/store/settingsStore';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsModal from './SettingsModal';

// Mock the settings store
vi.mock('@/store/settingsStore', () => ({
  useSettingsStore: vi.fn(),
}));

describe('SettingsModal', () => {
  const mockToggleMusic = vi.fn();
  const mockToggleSound = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isMusicEnabled: true,
      isSoundEnabled: true,
      toggleMusic: mockToggleMusic,
      toggleSound: mockToggleSound,
    });
  });

  it('should not render when isOpen is false', () => {
    const { container } = render(<SettingsModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render modal when isOpen is true', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should display music toggle', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Music')).toBeInTheDocument();
  });

  it('should display sound toggle', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Sound Effects')).toBeInTheDocument();
  });

  it('should show music as enabled when music is on', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    const musicToggle = screen.getByLabelText('Music');
    expect(musicToggle).toBeChecked();
  });

  it('should show music as disabled when music is off', () => {
    (useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isMusicEnabled: false,
      isSoundEnabled: true,
      toggleMusic: mockToggleMusic,
      toggleSound: mockToggleSound,
    });

    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    const musicToggle = screen.getByLabelText('Music');
    expect(musicToggle).not.toBeChecked();
  });

  it('should toggle music when music toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    const musicToggle = screen.getByLabelText('Music');
    await user.click(musicToggle);

    expect(mockToggleMusic).toHaveBeenCalled();
  });

  it('should show sound as enabled when sound is on', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    const soundToggle = screen.getByLabelText('Sound Effects');
    expect(soundToggle).toBeChecked();
  });

  it('should show sound as disabled when sound is off', () => {
    (useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isMusicEnabled: true,
      isSoundEnabled: false,
      toggleMusic: mockToggleMusic,
      toggleSound: mockToggleSound,
    });

    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    const soundToggle = screen.getByLabelText('Sound Effects');
    expect(soundToggle).not.toBeChecked();
  });

  it('should toggle sound when sound toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    const soundToggle = screen.getByLabelText('Sound Effects');
    await user.click(soundToggle);

    expect(mockToggleSound).toHaveBeenCalled();
  });

  it('should close modal when Close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<SettingsModal isOpen={true} onClose={onClose} />);

    const closeButton = screen.getByText('Close');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should close modal when X button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<SettingsModal isOpen={true} onClose={onClose} />);

    const xButton = screen.getByText('×');
    await user.click(xButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should handle both settings being off', () => {
    (useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isMusicEnabled: false,
      isSoundEnabled: false,
      toggleMusic: mockToggleMusic,
      toggleSound: mockToggleSound,
    });

    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    const musicToggle = screen.getByLabelText('Music');
    const soundToggle = screen.getByLabelText('Sound Effects');
    
    expect(musicToggle).not.toBeChecked();
    expect(soundToggle).not.toBeChecked();
  });

  it('should allow multiple toggle interactions', async () => {
    const user = userEvent.setup();
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    const musicToggle = screen.getByLabelText('Music');
    const soundToggle = screen.getByLabelText('Sound Effects');

    await user.click(musicToggle);
    await user.click(soundToggle);
    await user.click(musicToggle);

    expect(mockToggleMusic).toHaveBeenCalledTimes(2);
    expect(mockToggleSound).toHaveBeenCalledTimes(1);
  });
});
