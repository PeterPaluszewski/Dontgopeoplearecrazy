import { describe, it, expect, beforeEach } from 'vitest';
import { useSettingsStore } from './settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useSettingsStore.getState();
    store.isMusicEnabled = true;
    store.isSoundEnabled = true;
  });

  it('should have music enabled by default', () => {
    const { isMusicEnabled } = useSettingsStore.getState();
    expect(isMusicEnabled).toBe(true);
  });

  it('should have sound enabled by default', () => {
    const { isSoundEnabled } = useSettingsStore.getState();
    expect(isSoundEnabled).toBe(true);
  });

  it('should toggle music off', () => {
    const { toggleMusic } = useSettingsStore.getState();
    
    toggleMusic();
    
    const { isMusicEnabled } = useSettingsStore.getState();
    expect(isMusicEnabled).toBe(false);
  });

  it('should toggle music on', () => {
    const { toggleMusic } = useSettingsStore.getState();
    
    // Toggle off
    toggleMusic();
    // Toggle on
    toggleMusic();
    
    const { isMusicEnabled } = useSettingsStore.getState();
    expect(isMusicEnabled).toBe(true);
  });

  it('should toggle sound off', () => {
    const { toggleSound } = useSettingsStore.getState();
    
    toggleSound();
    
    const { isSoundEnabled } = useSettingsStore.getState();
    expect(isSoundEnabled).toBe(false);
  });

  it('should toggle sound on', () => {
    const { toggleSound } = useSettingsStore.getState();
    
    // Toggle off
    toggleSound();
    // Toggle on
    toggleSound();
    
    const { isSoundEnabled } = useSettingsStore.getState();
    expect(isSoundEnabled).toBe(true);
  });

  it('should toggle music and sound independently', () => {
    const { toggleMusic, toggleSound } = useSettingsStore.getState();
    
    toggleMusic();
    
    let state = useSettingsStore.getState();
    expect(state.isMusicEnabled).toBe(false);
    expect(state.isSoundEnabled).toBe(true);
    
    toggleSound();
    
    state = useSettingsStore.getState();
    expect(state.isMusicEnabled).toBe(false);
    expect(state.isSoundEnabled).toBe(false);
  });

  it('should allow multiple toggles', () => {
    const { toggleMusic } = useSettingsStore.getState();
    
    toggleMusic(); // off
    toggleMusic(); // on
    toggleMusic(); // off
    toggleMusic(); // on
    
    const { isMusicEnabled } = useSettingsStore.getState();
    expect(isMusicEnabled).toBe(true);
  });
});
