'use client';

import { getAllLocations } from '@/lib/database';
import { createNewGame } from '@/lib/save-load';
import { useGameStore } from '@/store/gameStore';
import type { Location } from '@/types/game';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DIFFICULTIES = [
  {
    value: 'easy',
    label: 'Easy',
    description: 'More resources, lower travel costs, fewer dangers',
  },
  {
    value: 'normal',
    label: 'Normal',
    description: 'Balanced experience, recommended for first playthrough',
  },
  {
    value: 'hard',
    label: 'Hard',
    description: 'Scarce resources, high costs, frequent dangers',
  },
] as const;

export default function NewGameModal({ isOpen, onClose }: NewGameModalProps) {
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [startingLocationId, setStartingLocationId] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  const router = useRouter();
  const setCurrentLocationId = useGameStore((state) => state.setCurrentLocationId);

  // Load available starting locations from database
  useEffect(() => {
    const loadLocations = async () => {
      setIsLoadingLocations(true);
      const locations = await getAllLocations();
      
      // Filter to popular starting cities (Paris, Berlin, Amsterdam)
      const startingCities = locations.filter(loc => 
        ['Paris', 'Berlin', 'Amsterdam'].includes(loc.name)
      );
      
      setAvailableLocations(startingCities);
      
      // Set Paris as default if available
      const paris = startingCities.find(loc => loc.name === 'Paris');
      if (paris) {
        setStartingLocationId(paris.id);
      } else if (startingCities.length > 0) {
        setStartingLocationId(startingCities[0].id);
      }
      
      setIsLoadingLocations(false);
    };

    if (isOpen) {
      loadLocations();
    }
  }, [isOpen]);

  const handleStartGame = async () => {
    setIsCreating(true);

    try {
      // Create new game with selected parameters
      const result = await createNewGame(startingLocationId, difficulty, characterName || undefined);

      if (result.success) {
        // Update game store with starting location
        setCurrentLocationId(startingLocationId);
        
        toast.success('New game started!');
        router.push('/game');
      } else {
        toast.error(result.error || 'Failed to create new game');
      }
    } catch (error) {
      console.error('Error creating new game:', error);
      toast.error('Failed to start new game');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-2xl rounded-lg bg-slate-800 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">New Game</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
            disabled={isCreating}
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Character Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Character Name (Optional)
            </label>
            <input
              type="text"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full rounded bg-slate-700 px-4 py-2 text-white placeholder-gray-500"
              maxLength={30}
            />
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-300">
              Select Difficulty
            </label>
            <div className="space-y-3">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.value}
                  onClick={() => setDifficulty(diff.value)}
                  className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                    difficulty === diff.value
                      ? 'border-blue-500 bg-blue-900/30'
                      : 'border-slate-700 bg-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="font-semibold text-white">{diff.label}</div>
                  <div className="mt-1 text-sm text-gray-400">
                    {diff.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Starting Location */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-300">
              Choose Starting Location
            </label>
            {isLoadingLocations ? (
              <div className="text-center text-gray-400 py-4">Loading locations...</div>
            ) : availableLocations.length === 0 ? (
              <div className="text-center text-red-400 py-4">No locations available</div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {availableLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => setStartingLocationId(location.id)}
                    className={`rounded-lg border-2 p-3 text-center transition-all ${
                      startingLocationId === location.id
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-slate-700 bg-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-semibold text-white">{location.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="rounded bg-slate-700 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleStartGame}
            disabled={isCreating || isLoadingLocations || !startingLocationId}
            className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {isCreating ? 'Starting...' : 'Start Adventure'}
          </button>
        </div>
      </div>
    </div>
  );
}
