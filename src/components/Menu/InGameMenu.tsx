'use client';

import SettingsModal from '@/components/Menu/SettingsModal';
import { saveGame } from '@/lib/save-load';
import { useGameStore } from '@/store/gameStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface InGameMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InGameMenu({ isOpen, onClose }: InGameMenuProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmExit, setShowConfirmExit] = useState(false);

  const router = useRouter();
  const gameState = useGameStore();

  // Close menu on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !showSettings && !showConfirmExit) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, showSettings, showConfirmExit, onClose]);

  const handleSaveGame = async () => {
    setIsSaving(true);

    const result = await saveGame({
      currentLocationId: gameState.currentLocationId,
      food: gameState.food,
      water: gameState.water,
      energy: gameState.energy,
      money: gameState.money ?? 200,
      inventory: gameState.inventory,
      visitedLocationIds: gameState.visitedLocationIds,
      isActive: true,
    });

    setIsSaving(false);

    if (result.success) {
      toast.success('Game saved!');
    } else {
      toast.error('Failed to save game');
    }
  };

  const handleReturnToMenu = () => {
    router.push('/menu');
  };

  const handleConfirmExit = () => {
    setShowConfirmExit(false);
    handleReturnToMenu();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-lg bg-slate-800 p-6 shadow-2xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white">Game Menu</h2>
            <p className="mt-1 text-sm text-gray-400">ESC to close</p>
          </div>

          {/* Confirm Exit Dialog */}
          {showConfirmExit ? (
            <div className="space-y-4">
              <p className="text-center text-gray-300">
                Return to main menu? Make sure your game is saved!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmExit(false)}
                  className="flex-1 rounded bg-slate-700 py-3 text-white transition-colors hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmExit}
                  className="flex-1 rounded bg-red-600 py-3 text-white transition-colors hover:bg-red-500"
                >
                  Exit to Menu
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Menu Buttons */}
              <div className="space-y-3">
                <button
                  onClick={onClose}
                  className="w-full rounded-lg bg-blue-600 py-3 text-lg font-semibold text-white transition-all hover:bg-blue-500"
                >
                  Resume Game
                </button>

                <button
                  onClick={handleSaveGame}
                  disabled={isSaving}
                  className="w-full rounded-lg bg-green-600 py-3 text-lg font-semibold text-white transition-all hover:bg-green-500 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Game'}
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full rounded-lg bg-slate-700 py-3 text-lg font-semibold text-white transition-all hover:bg-slate-600"
                >
                  Settings
                </button>

                <button
                  onClick={() => setShowConfirmExit(true)}
                  className="w-full rounded-lg bg-red-600 py-3 text-lg font-semibold text-white transition-all hover:bg-red-500"
                >
                  Exit to Main Menu
                </button>
              </div>

              {/* Hint */}
              <div className="mt-6 text-center text-xs text-gray-500">
                Press ESC anytime to open this menu
              </div>
            </>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
