'use client';

import { GameEvent } from '@/lib/events';
import { useGameStore } from '@/store/gameStore';
import { X } from 'lucide-react';

interface EventModalProps {
  event: GameEvent;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  const { updateResources } = useGameStore();

  if (!isOpen) return null;

  const handleAccept = () => {
    // Apply event effects
    updateResources(
      Math.round(event.food_effect),
      Math.round(event.water_effect),
      Math.round(event.energy_effect)
    );
    onClose();
  };

  const hasPositiveEffect =
    event.food_effect > 0 || event.water_effect > 0 || event.energy_effect > 0;
  const hasNegativeEffect =
    event.food_effect < 0 || event.water_effect < 0 || event.energy_effect < 0;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg max-w-md w-full shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">🎲 Random Event</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <h3 className="text-xl font-bold text-white">{event.title}</h3>
          <p className="text-gray-300">{event.description}</p>

          {/* Effects */}
          {(event.food_effect !== 0 || event.water_effect !== 0 || event.energy_effect !== 0) && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400">Effects:</h4>
              <div className="space-y-1">
                {event.food_effect !== 0 && (
                  <div
                    className={`flex items-center gap-2 ${event.food_effect > 0 ? 'text-green-400' : 'text-red-400'}`}
                  >
                    <span>🍕 Food:</span>
                    <span className="font-bold">
                      {event.food_effect > 0 ? '+' : ''}
                      {Math.round(event.food_effect)}
                    </span>
                  </div>
                )}
                {event.water_effect !== 0 && (
                  <div
                    className={`flex items-center gap-2 ${event.water_effect > 0 ? 'text-green-400' : 'text-red-400'}`}
                  >
                    <span>💧 Water:</span>
                    <span className="font-bold">
                      {event.water_effect > 0 ? '+' : ''}
                      {Math.round(event.water_effect)}
                    </span>
                  </div>
                )}
                {event.energy_effect !== 0 && (
                  <div
                    className={`flex items-center gap-2 ${event.energy_effect > 0 ? 'text-green-400' : 'text-red-400'}`}
                  >
                    <span>⚡ Energy:</span>
                    <span className="font-bold">
                      {event.energy_effect > 0 ? '+' : ''}
                      {Math.round(event.energy_effect)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleAccept}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
              hasNegativeEffect && !hasPositiveEffect
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : hasPositiveEffect
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
