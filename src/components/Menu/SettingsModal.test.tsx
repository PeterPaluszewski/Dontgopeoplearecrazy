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
  const mockUpdateSettings = vi.fn();
  const mockResetToDefaults = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      audioMusic: 70,
      audioSFX: 80,
      audioMuted: false,
      graphicsQuality: 'medium',
      particleEffects: true,
      shadows: true,
      autoSaveFrequency: 'every_travel',
      tutorialHints: true,
      dangerWarnings: true,
      textSize: 'medium',
      highContrast: false,
      colorblindMode: false,
      updateSettings: mockUpdateSettings,
      resetToDefaults: mockResetToDefaults,
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

  it('should render all tabs', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('audio')).toBeInTheDocument();
    expect(screen.getByText('graphics')).toBeInTheDocument();
    expect(screen.getByText('gameplay')).toBeInTheDocument();
    expect(screen.getByText('accessibility')).toBeInTheDocument();
  });

  it('should show audio tab by default', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Music Volume: 70%')).toBeInTheDocument();
    expect(screen.getByText('Sound Effects Volume: 80%')).toBeInTheDocument();
  });

  it('should switch to graphics tab when clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    const graphicsTab = screen.getByText('graphics');
    await user.click(graphicsTab);

    expect(screen.getByText('Graphics Quality')).toBeInTheDocument();
    expect(screen.getByLabelText('Enable Particle Effects')).toBeInTheDocument();
  });

  it('should switch to gameplay tab when clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    const gameplayTab = screen.getByText('gameplay');
    await user.click(gameplayTab);

    expect(screen.getByText('Auto-Save Frequency')).toBeInTheDocument();
    expect(screen.getByLabelText('Show Tutorial Hints')).toBeInTheDocument();
  });

  it('should switch to accessibility tab when clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    const accessibilityTab = screen.getByText('accessibility');
    await user.click(accessibilityTab);

    expect(screen.getByText('Text Size')).toBeInTheDocument();
    expect(screen.getByLabelText('High Contrast Mode')).toBeInTheDocument();
  });

  it('should update music volume when slider is changed', async () => {
    const user = userEvent.setup();
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    // Find the music volume slider (first range input in audio tab)
    const sliders = screen.getAllByRole('slider');
    const musicSlider = sliders[0]; // First slider is music volume
    
    await user.click(musicSlider);
    
    // Slider interactions call updateSettings
    expect(mockUpdateSettings).toHaveBeenCalled();
  });

  it('should toggle mute all audio when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    const muteCheckbox = screen.getByLabelText('Mute All Audio');
    await user.click(muteCheckbox);

    expect(mockUpdateSettings).toHaveBeenCalledWith({ audioMuted: true });
  });

  it('should call resetToDefaults when Reset button is clicked', async () => {
    const user = userEvent.setup();
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);

    const resetButton = screen.getByText('Reset to Defaults');
    await user.click(resetButton);

    expect(mockResetToDefaults).toHaveBeenCalled();
  });

  it('should close modal when Done button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<SettingsModal isOpen={true} onClose={onClose} />);

    const doneButton = screen.getByText('Done');
    await user.click(doneButton);

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
});
