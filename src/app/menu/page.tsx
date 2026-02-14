'use client';

import LoadGameModal from '@/components/Menu/LoadGameModal';
import NewGameModal from '@/components/Menu/NewGameModal';
import SettingsModal from '@/components/Menu/SettingsModal';
import { loadGame } from '@/lib/save-load';
import { useGameStore } from '@/store/gameStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MenuPage() {
  const [hasSave, setHasSave] = useState(false);
  const [isCheckingSave, setIsCheckingSave] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showNewGame, setShowNewGame] = useState(false);
  const [showLoadGame, setShowLoadGame] = useState(false);

  const router = useRouter();
  const loadGameState = useGameStore((state) => state.loadGameState);

  const checkForSave = async () => {
    setIsCheckingSave(true);
    const result = await loadGame();
    setHasSave(result.success && result.gameState !== null);
    setIsCheckingSave(false);
  };

  useEffect(() => {
    checkForSave();
  }, []);

  const handleContinue = async () => {
    const result = await loadGame();
    if (result.success && result.gameState) {
      loadGameState(result.gameState);
      router.push('/game');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-500 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-purple-500 blur-3xl"></div>
      </div>

      {/* Main Menu Card */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-slate-800/80 p-8 shadow-2xl backdrop-blur-sm">
        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">
            Backpacking Game
          </h1>
          <p className="text-sm text-gray-400">
            Explore Europe. Survive. Adventure awaits.
          </p>
        </div>

        {/* Menu Buttons */}
        <div className="space-y-3">
          {/* Continue Button (only if save exists) */}
          {hasSave && !isCheckingSave && (
            <button
              onClick={handleContinue}
              className="w-full rounded-lg bg-blue-600 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-lg"
            >
              Continue
            </button>
          )}

          {/* New Game Button */}
          <button
            onClick={() => setShowNewGame(true)}
            className={`w-full rounded-lg py-4 text-lg font-semibold text-white transition-all hover:shadow-lg ${
              !hasSave && !isCheckingSave
                ? 'bg-blue-600 hover:bg-blue-500'
                : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            New Game
          </button>

          {/* Load Game Button */}
          <button
            onClick={() => setShowLoadGame(true)}
            className="w-full rounded-lg bg-slate-700 py-4 text-lg font-semibold text-white transition-all hover:bg-slate-600 hover:shadow-lg"
          >
            Load Game
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-full rounded-lg bg-slate-700 py-4 text-lg font-semibold text-white transition-all hover:bg-slate-600 hover:shadow-lg"
          >
            Settings
          </button>
        </div>

        {/* Loading indicator */}
        {isCheckingSave && (
          <div className="mt-4 text-center text-sm text-gray-400">
            Checking for saved games...
          </div>
        )}

        {/* Version/Credits */}
        <div className="mt-8 text-center text-xs text-gray-500">
          v1.0.0 | Made with ❤️
        </div>
      </div>

      {/* Modals */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <NewGameModal isOpen={showNewGame} onClose={() => setShowNewGame(false)} />
      <LoadGameModal isOpen={showLoadGame} onClose={() => setShowLoadGame(false)} />
    </div>
  );
}
