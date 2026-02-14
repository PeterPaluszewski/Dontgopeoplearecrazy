import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GameSettings {
  // Audio
  audioMusic: number; // 0-100
  audioSFX: number; // 0-100
  audioMuted: boolean;

  // Graphics
  graphicsQuality: 'low' | 'medium' | 'high';
  particleEffects: boolean;
  shadows: boolean;

  // Gameplay
  autoSaveFrequency: 'every_travel' | 'every_5min' | 'manual';
  tutorialHints: boolean;
  dangerWarnings: boolean;

  // Accessibility
  textSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  colorblindMode: boolean;
}

interface SettingsStore extends GameSettings {
  // Actions
  updateSettings: (settings: Partial<GameSettings>) => void;
  resetToDefaults: () => void;
}

const defaultSettings: GameSettings = {
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
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),

      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'game-settings',
    }
  )
);
