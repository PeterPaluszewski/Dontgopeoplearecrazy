'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<
    'audio' | 'graphics' | 'gameplay' | 'accessibility'
  >('audio');

  const settings = useSettingsStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-2xl rounded-lg bg-slate-800 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-700">
          {['audio', 'graphics', 'gameplay', 'accessibility'].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab as typeof activeTab)
              }
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'audio' && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Music Volume: {settings.audioMusic}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.audioMusic}
                  onChange={(e) =>
                    settings.updateSettings({
                      audioMusic: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Sound Effects Volume: {settings.audioSFX}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.audioSFX}
                  onChange={(e) =>
                    settings.updateSettings({
                      audioSFX: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="mute"
                  checked={settings.audioMuted}
                  onChange={(e) =>
                    settings.updateSettings({
                      audioMuted: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="mute" className="text-sm text-gray-300">
                  Mute All Audio
                </label>
              </div>
            </>
          )}

          {activeTab === 'graphics' && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Graphics Quality
                </label>
                <select
                  value={settings.graphicsQuality}
                  onChange={(e) =>
                    settings.updateSettings({
                      graphicsQuality: e.target.value as
                        | 'low'
                        | 'medium'
                        | 'high',
                    })
                  }
                  className="w-full rounded bg-slate-700 px-3 py-2 text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="particles"
                  checked={settings.particleEffects}
                  onChange={(e) =>
                    settings.updateSettings({
                      particleEffects: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="particles" className="text-sm text-gray-300">
                  Enable Particle Effects
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="shadows"
                  checked={settings.shadows}
                  onChange={(e) =>
                    settings.updateSettings({
                      shadows: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="shadows" className="text-sm text-gray-300">
                  Enable Shadows
                </label>
              </div>
            </>
          )}

          {activeTab === 'gameplay' && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Auto-Save Frequency
                </label>
                <select
                  value={settings.autoSaveFrequency}
                  onChange={(e) =>
                    settings.updateSettings({
                      autoSaveFrequency: e.target.value as
                        | 'every_travel'
                        | 'every_5min'
                        | 'manual',
                    })
                  }
                  className="w-full rounded bg-slate-700 px-3 py-2 text-white"
                >
                  <option value="every_travel">After Every Travel</option>
                  <option value="every_5min">Every 5 Minutes</option>
                  <option value="manual">Manual Only</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hints"
                  checked={settings.tutorialHints}
                  onChange={(e) =>
                    settings.updateSettings({
                      tutorialHints: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="hints" className="text-sm text-gray-300">
                  Show Tutorial Hints
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="warnings"
                  checked={settings.dangerWarnings}
                  onChange={(e) =>
                    settings.updateSettings({
                      dangerWarnings: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="warnings" className="text-sm text-gray-300">
                  Show Danger Warnings
                </label>
              </div>
            </>
          )}

          {activeTab === 'accessibility' && (
            <>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Text Size
                </label>
                <select
                  value={settings.textSize}
                  onChange={(e) =>
                    settings.updateSettings({
                      textSize: e.target.value as
                        | 'small'
                        | 'medium'
                        | 'large',
                    })
                  }
                  className="w-full rounded bg-slate-700 px-3 py-2 text-white"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="contrast"
                  checked={settings.highContrast}
                  onChange={(e) =>
                    settings.updateSettings({
                      highContrast: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="contrast" className="text-sm text-gray-300">
                  High Contrast Mode
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="colorblind"
                  checked={settings.colorblindMode}
                  onChange={(e) =>
                    settings.updateSettings({
                      colorblindMode: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label htmlFor="colorblind" className="text-sm text-gray-300">
                  Colorblind Mode
                </label>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => settings.resetToDefaults()}
            className="rounded bg-slate-700 px-4 py-2 text-sm text-white transition-colors hover:bg-slate-600"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
