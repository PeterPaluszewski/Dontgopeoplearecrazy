'use client';

import { deleteSave, loadAllSaves } from '@/lib/save-load';
import { useGameStore } from '@/store/gameStore';
import type { GameState } from '@/types/game';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface LoadGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoadGameModal({ isOpen, onClose }: LoadGameModalProps) {
  const [saves, setSaves] = useState<GameState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const router = useRouter();
  const loadGameState = useGameStore((state) => state.loadGameState);

  const fetchSaves = async () => {
    setIsLoading(true);
    const result = await loadAllSaves();
    
    if (result.success && result.saves) {
      setSaves(result.saves);
    } else {
      toast.error('Failed to load saves');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchSaves();
    }
  }, [isOpen]);

  const handleLoadGame = (save: GameState) => {
    loadGameState(save);
    toast.success('Game loaded!');
    router.push('/game');
  };

  const handleDeleteSave = async (saveId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this save?')) {
      return;
    }

    setDeletingId(saveId);
    const result = await deleteSave(saveId);

    if (result.success) {
      toast.success('Save deleted');
      setSaves(saves.filter((s) => s.id !== saveId));
    } else {
      toast.error('Failed to delete save');
    }
    setDeletingId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getResourceColor = (value: number) => {
    if (value >= 70) return 'text-green-400';
    if (value >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-4xl rounded-lg bg-slate-800 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Load Game</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-white"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-400">Loading saves...</div>
          </div>
        ) : saves.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <div className="mb-4 text-gray-400">No saved games found</div>
            <button
              onClick={onClose}
              className="rounded bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {saves.map((save) => (
              <div
                key={save.id}
                onClick={() => handleLoadGame(save)}
                className="group relative rounded-lg border-2 border-slate-700 bg-slate-700/50 p-4 text-left transition-all hover:border-blue-500 hover:bg-slate-700 cursor-pointer"
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteSave(save.id, e)}
                  disabled={deletingId === save.id}
                  className="absolute right-2 top-2 rounded bg-red-600 px-2 py-1 text-xs text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100 disabled:opacity-50 z-10"
                >
                  {deletingId === save.id ? 'Deleting...' : 'Delete'}
                </button>

                {/* Character Name */}
                {save.characterName && (
                  <div className="mb-2 text-lg font-semibold text-white">
                    {save.characterName}
                  </div>
                )}

                {/* Location */}
                <div className="mb-3 text-sm text-gray-300">
                  📍 Location ID: {save.currentLocationId}
                </div>

                {/* Resources */}
                <div className="mb-3 flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Food:</span>{' '}
                    <span className={getResourceColor(save.food)}>
                      {save.food}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Water:</span>{' '}
                    <span className={getResourceColor(save.water)}>
                      {save.water}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Energy:</span>{' '}
                    <span className={getResourceColor(save.energy)}>
                      {save.energy}%
                    </span>
                  </div>
                </div>

                {/* Difficulty */}
                {save.difficulty && (
                  <div className="mb-2 text-xs text-gray-400">
                    Difficulty:{' '}
                    <span className="capitalize">{save.difficulty}</span>
                  </div>
                )}

                {/* Inventory Count */}
                <div className="mb-2 text-xs text-gray-400">
                  Inventory: {save.inventory.length} items
                </div>

                {/* Locations Visited */}
                <div className="mb-3 text-xs text-gray-400">
                  Locations Visited: {save.visitedLocationIds.length}
                </div>

                {/* Timestamp */}
                <div className="text-xs text-gray-500">
                  Last Saved: {formatDate(save.updatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {!isLoading && saves.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded bg-slate-700 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
