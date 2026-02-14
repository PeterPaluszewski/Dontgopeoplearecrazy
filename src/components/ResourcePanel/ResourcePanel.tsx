import { useGameStore } from '@/store/gameStore';

interface ResourceBarProps {
  type: 'food' | 'water' | 'energy';
  current: number;
  max: number;
  icon: string;
  color: string;
  bgColor: string;
}

function ResourceBar({ type, current, max, icon, color, bgColor }: ResourceBarProps) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  const isLow = percentage < 30;
  const isCritical = percentage < 15;

  return (
    <div className="flex items-center gap-3">
      <div className="text-3xl">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-white capitalize">{type}</span>
          <span
            className={`text-sm font-bold ${isCritical ? 'text-red-400 animate-pulse' : isLow ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            {current}/{max}
          </span>
        </div>
        <div className={`w-full h-3 rounded-full overflow-hidden ${bgColor}`}>
          <div
            className={`h-full transition-all duration-500 ease-out ${color} ${isCritical ? 'animate-pulse' : ''}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ResourcePanel() {
  const { food, water, energy } = useGameStore();

  const FOOD_MAX = 100;
  const WATER_MAX = 100;
  const ENERGY_MAX = 100;

  return (
    <div className="bg-gray-800/95 rounded-lg p-4 shadow-xl border border-gray-700 backdrop-blur-sm">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>📊</span>
        Resources
      </h2>
      <div className="space-y-4">
        <ResourceBar
          type="food"
          current={food}
          max={FOOD_MAX}
          icon="🍕"
          color="bg-orange-500"
          bgColor="bg-gray-700"
        />
        <ResourceBar
          type="water"
          current={water}
          max={WATER_MAX}
          icon="💧"
          color="bg-blue-500"
          bgColor="bg-gray-700"
        />
        <ResourceBar
          type="energy"
          current={energy}
          max={ENERGY_MAX}
          icon="⚡"
          color="bg-yellow-500"
          bgColor="bg-gray-700"
        />
      </div>

      {/* Warning messages */}
      {(food < 30 || water < 30 || energy < 30) && (
        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
          <p className="text-yellow-200 text-sm font-medium">
            ⚠️ Low resources! Find supplies soon.
          </p>
        </div>
      )}

      {(food < 15 || water < 15 || energy < 15) && (
        <div className="mt-2 p-3 bg-red-900/30 border border-red-600 rounded-lg">
          <p className="text-red-200 text-sm font-medium">🚨 Critical! Your survival is at risk!</p>
        </div>
      )}
    </div>
  );
}
