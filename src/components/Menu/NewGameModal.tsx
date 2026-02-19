'use client';

import { getAllLocations } from '@/lib/database';
import { getLocationsByRegion, getRegionDisplayName, getUniqueRegions } from '@/lib/location-utils';
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
  const [selectedRegion, setSelectedRegion] = useState('');
  const [startingLocationId, setStartingLocationId] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  const router = useRouter();
  const setCurrentLocationId = useGameStore((state) => state.setCurrentLocationId);

  // Derived data
  const availableRegions = getUniqueRegions(allLocations);
  const citiesInRegion = selectedRegion ? getLocationsByRegion(allLocations, selectedRegion) : [];

  // Load all locations when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const loadLocations = async () => {
      setIsLoadingLocations(true);
      const locations = await getAllLocations();
      setAllLocations(locations);

      // Default to europe_mainland (most cities) or first region available
      const regions = getUniqueRegions(locations);
      const defaultRegion = regions.includes('europe_mainland')
        ? 'europe_mainland'
        : (regions[0] ?? '');
      setSelectedRegion(defaultRegion);

      // Default to Paris if available in that region, otherwise first city
      if (defaultRegion) {
        const regionCities = getLocationsByRegion(locations, defaultRegion);
        const paris = regionCities.find((loc) => loc.name === 'Paris');
        setStartingLocationId(paris?.id ?? regionCities[0]?.id ?? '');
      }

      setIsLoadingLocations(false);
    };

    loadLocations();
  }, [isOpen]);

  // When region changes, reset city selection to first in that region
  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    const regionCities = getLocationsByRegion(allLocations, region);
    setStartingLocationId(regionCities[0]?.id ?? '');
  };

  const handleStartGame = async () => {
    setIsCreating(true);

    try {
      const result = await createNewGame(
        startingLocationId,
        difficulty,
        characterName || undefined
      );

      if (result.success) {
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
      <div className="w-full max-w-2xl rounded-lg bg-slate-800 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
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
                  <div className="mt-1 text-sm text-gray-400">{diff.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Starting Region & City */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-300">
              Choose Starting Location
            </label>

            {isLoadingLocations ? (
              <div className="py-4 text-center text-gray-400">Loading locations...</div>
            ) : (
              <>
                {/* Region selector */}
                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Region
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {availableRegions.map((region) => (
                      <button
                        key={region}
                        onClick={() => handleRegionChange(region)}
                        className={`rounded-lg border-2 px-3 py-2 text-sm text-left transition-all ${
                          selectedRegion === region
                            ? 'border-blue-500 bg-blue-900/30 text-white'
                            : 'border-slate-700 bg-slate-700/50 text-gray-300 hover:border-slate-600'
                        }`}
                      >
                        {getRegionDisplayName(region)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City selector */}
                {selectedRegion && (
                  <>
                    <label className="mb-1 block text-xs font-medium text-gray-500 uppercase tracking-wide">
                      City ({citiesInRegion.length} available)
                    </label>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/40 p-2">
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {citiesInRegion.map((location) => (
                          <button
                            key={location.id}
                            onClick={() => setStartingLocationId(location.id)}
                            className={`rounded border-2 p-2 text-center text-sm transition-all ${
                              startingLocationId === location.id
                                ? 'border-blue-500 bg-blue-900/30 text-white'
                                : 'border-slate-700 bg-slate-700/50 text-gray-300 hover:border-slate-600'
                            }`}
                          >
                            {location.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </>
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
