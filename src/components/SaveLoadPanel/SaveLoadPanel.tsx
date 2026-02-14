'use client';

import { useGameStore } from '@/store/gameStore';
import { useState } from 'react';

export default function SaveLoadPanel() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveGame = useGameStore((state) => state.saveGame);
  const loadGameFromDB = useGameStore((state) => state.loadGameFromDB);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    const result = await saveGame();

    if (result.success) {
      setLastSaved(new Date());
      setMessage({ type: 'success', text: 'Game saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to save game' });
    }

    setIsSaving(false);
  };

  const handleLoad = async () => {
    setIsLoading(true);
    setMessage(null);

    const result = await loadGameFromDB();

    if (result.success) {
      setMessage({ type: 'success', text: 'Game loaded successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to load game' });
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <h2 className="text-xl font-bold text-white mb-4">Save / Load</h2>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Game'}
        </button>

        <button
          onClick={handleLoad}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          {isLoading ? 'Loading...' : 'Load Game'}
        </button>

        {lastSaved && (
          <p className="text-sm text-gray-400 text-center">
            Last saved: {lastSaved.toLocaleTimeString()}
          </p>
        )}

        {message && (
          <div
            className={`text-sm p-2 rounded ${
              message.type === 'success'
                ? 'bg-green-900/50 text-green-200'
                : 'bg-red-900/50 text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
