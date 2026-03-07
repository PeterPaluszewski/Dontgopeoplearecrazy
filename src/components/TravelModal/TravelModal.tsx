'use client';

import {
  calculateTravelCost,
  calculateTravelDays,
  canAffordTravel,
  formatTravelDuration,
} from '@/lib/travel-utils';
import { useGameStore } from '@/store/gameStore';
import type { ConnectionDetail, Location } from '@/types/game';
import { AlertTriangle, ChevronRight, MapPin, X } from 'lucide-react';
import { useState } from 'react';

interface TravelModalProps {
  destination: Location;
  connectionOptions: ConnectionDetail[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (chosenOption: ConnectionDetail) => void;
}

interface ResourceCostProps {
  label: string;
  current: number;
  cost: number;
  icon: string;
}

function ResourceCost({ label, current, cost, icon }: ResourceCostProps) {
  const isInsufficient = current < cost;
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg ${isInsufficient ? 'bg-red-500/10 border border-red-500/30' : 'bg-gray-700'}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-medium ${isInsufficient ? 'text-red-400' : 'text-white'}`}>
          {current} - {cost}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className={`font-bold ${isInsufficient ? 'text-red-400' : 'text-green-400'}`}>
          {current - cost}
        </span>
      </div>
    </div>
  );
}

function transportIcon(slug: string): string {
  if (slug === 'on_foot') return '🥾';
  if (slug.includes('plane') || slug.includes('flight')) return '✈️';
  if (slug.includes('train')) return '🚂';
  if (slug.includes('bus')) return '🚌';
  if (slug.includes('car')) return '🚗';
  if (slug.includes('ferry') || slug.includes('ship') || slug.includes('boat')) return '⛴️';
  if (slug.includes('bicycle') || slug.includes('bike')) return '🚲';
  return '🚀';
}

export default function TravelModal({
  destination,
  connectionOptions,
  isOpen,
  onClose,
  onConfirm,
}: TravelModalProps) {
  const { food, water, energy, money } = useGameStore();
  const [selectedIdx, setSelectedIdx] = useState(connectionOptions.length - 1);

  if (!isOpen) return null;

  const safeIdx = Math.min(selectedIdx, connectionOptions.length - 1);
  const chosen = connectionOptions[safeIdx];
  const travelDays = calculateTravelDays(chosen.distanceKm, chosen.speedKmh);
  const cost = calculateTravelCost(
    travelDays,
    destination.difficultyMultiplier,
    chosen.baseCostMultiplier
  );
  const canAfford = canAffordTravel({ food, water, energy, money: money ?? 0 }, cost);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg max-w-md w-full shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Travel to {destination.name}</h2>
              <p className="text-xs text-gray-400">
                {formatTravelDuration(chosen.distanceKm, chosen.speedKmh, chosen.transportSlug)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Choose transport:</h3>
            <div className="space-y-2">
              {connectionOptions.map((opt, idx) => {
                const optDays = calculateTravelDays(opt.distanceKm, opt.speedKmh);
                const optCost = calculateTravelCost(
                  optDays,
                  destination.difficultyMultiplier,
                  opt.baseCostMultiplier
                );
                const isSelected = idx === safeIdx;
                const canAffordOpt = canAffordTravel(
                  { food, water, energy, money: money ?? 0 },
                  optCost
                );
                return (
                  <button
                    key={opt.transportSlug}
                    onClick={() => setSelectedIdx(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                    } ${!canAffordOpt ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{transportIcon(opt.transportSlug)}</span>
                      <div>
                        <div
                          className={`text-sm font-medium ${isSelected ? 'text-blue-300' : 'text-white'}`}
                        >
                          {formatTravelDuration(opt.distanceKm, opt.speedKmh, opt.transportSlug)}
                        </div>
                        {!canAffordOpt && (
                          <div className="text-xs text-red-400">Can&apos;t afford</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {optCost.money > 0 && (
                        <div
                          className={`text-sm font-bold ${isSelected ? 'text-blue-300' : 'text-gray-300'}`}
                        >
                          €{optCost.money}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        🍕{optCost.food} 💧{optCost.water} ⚡{optCost.energy}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Resource Cost:</h3>
            <ResourceCost label="Food" current={food} cost={cost.food} icon="🍕" />
            <ResourceCost label="Water" current={water} cost={cost.water} icon="💧" />
            <ResourceCost label="Energy" current={energy} cost={cost.energy} icon="⚡" />
            <ResourceCost label="Money" current={money ?? 0} cost={cost.money} icon="💰" />
          </div>

          {!canAfford && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-300">
                You don&apos;t have enough resources to make this journey. Rest and gather supplies
                before traveling.
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (canAfford) {
                onConfirm(chosen);
                onClose();
              }
            }}
            disabled={!canAfford}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${canAfford ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
          >
            Begin Journey
          </button>
        </div>
      </div>
    </div>
  );
}
