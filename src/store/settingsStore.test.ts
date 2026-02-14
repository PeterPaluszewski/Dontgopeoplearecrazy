import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from './settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    // Reset store to defaults before each test
    useSettingsStore.getState().resetToDefaults();
  });

  it('should have default music volume of 70', () => {
    const { audioMusic } = useSettingsStore.getState();
    expect(audioMusic).toBe(70);
  });

  it('should have default sound volume of 80', () => {
    const { audioSFX } = useSettingsStore.getState();
    expect(audioSFX).toBe(80);
  });

  it('should update music volume', () => {
    const { updateSettings } = useSettingsStore.getState();
    
    updateSettings({ audioMusic: 50 });
    
    const { audioMusic } = useSettingsStore.getState();
    expect(audioMusic).toBe(50);
  });

  it('should update sound volume', () => {
    const { updateSettings } = useSettingsStore.getState();
    
    updateSettings({ audioSFX: 30 });
    
    const { audioSFX } = useSettingsStore.getState();
    expect(audioSFX).toBe(30);
  });

  it('should mute audio', () => {
    const { updateSettings } = useSettingsStore.getState();
    
    updateSettings({ audioMuted: true });
    
    const { audioMuted } = useSettingsStore.getState();
    expect(audioMuted).toBe(true);
  });

  it('should unmute audio', () => {
    const { updateSettings } = useSettingsStore.getState();
    
    updateSettings({ audioMuted: true });
    updateSettings({ audioMuted: false });
    
    const { audioMuted } = useSettingsStore.getState();
    expect(audioMuted).toBe(false);
  });

  it('should update music and sound independently', () => {
    const { updateSettings } = useSettingsStore.getState();
    
    updateSettings({ audioMusic: 20 });
    
    let state = useSettingsStore.getState();
    expect(state.audioMusic).toBe(20);
    expect(state.audioSFX).toBe(80); // unchanged
    
    updateSettings({ audioSFX: 40 });
    
    state = useSettingsStore.getState();
    expect(state.audioMusic).toBe(20); // unchanged
    expect(state.audioSFX).toBe(40);
  });

  it('should reset to defaults', () => {
    const { updateSettings, resetToDefaults } = useSettingsStore.getState();
    
    updateSettings({ audioMusic: 10, audioSFX: 10, audioMuted: true });
    resetToDefaults();
    
    const state = useSettingsStore.getState();
    expect(state.audioMusic).toBe(70);
    expect(state.audioSFX).toBe(80);
    expect(state.audioMuted).toBe(false);
  });
});
