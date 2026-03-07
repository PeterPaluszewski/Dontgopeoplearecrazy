import { useGameStore } from '@/store/gameStore';
import type { Location } from '@/types/game';
import { MapPin } from 'lucide-react';

interface LocationInfoProps {
  location: Location | null;
  onTravelClick?: (location: Location) => void;
  isReachable?: boolean;
}

export default function LocationInfo({
  location,
  onTravelClick,
  isReachable = false,
}: LocationInfoProps) {
  const { visitedLocationIds, currentLocationId } = useGameStore();

  if (!location) {
    return (
      <div className="bg-gray-800/95 rounded-lg p-4 shadow-xl border border-gray-700 backdrop-blur-sm">
        <p className="text-gray-400 text-sm">Select a location to view details</p>
      </div>
    );
  }

  const isVisited = visitedLocationIds.includes(location.id);
  const isNew = !isVisited;
  const isCurrent = currentLocationId === location.id;

  const canTravel = !isCurrent && onTravelClick && isReachable;

  return (
    <div className="bg-gray-800/95 rounded-lg p-4 shadow-xl border border-gray-700 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{location.name}</h2>
          {isNew && (
            <span className="inline-block px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded">
              NEW
            </span>
          )}
          {isVisited && (
            <span className="inline-block px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
              VISITED
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Difficulty</div>
          <div className="text-lg font-bold text-yellow-400">
            {'⭐'.repeat(Math.min(5, location.difficultyMultiplier))}
          </div>
        </div>
      </div>

      <p className="text-gray-300 mb-4">{location.description}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-700 rounded p-3">
          <div className="text-xs text-gray-400 mb-1">Terrain</div>
          <div className="text-lg font-bold text-white">
            {location.isCoastal ? 'Coastal' : 'Inland'}
          </div>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <div className="text-xs text-gray-400 mb-1">Coordinates</div>
          <div className="text-sm font-mono text-white">
            {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
          </div>
        </div>
      </div>

      {location.connectedLocationIds.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-sm text-gray-400 mb-2">
            Connected to {location.connectedLocationIds.length} locations
          </div>
        </div>
      )}

      {!isCurrent && onTravelClick && (
        <div className="mt-4">
          <button
            onClick={() => {
              if (canTravel) onTravelClick(location);
            }}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              canTravel
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!canTravel}
          >
            <MapPin className="w-5 h-5" />
            Travel Here
          </button>
        </div>
      )}
    </div>
  );
}
