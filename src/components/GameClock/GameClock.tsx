'use client';

import { formatTravelDays } from '@/lib/time-utils';
import { useGameStore } from '@/store/gameStore';

export default function GameClock() {
  const totalTravelDays = useGameStore((s) => s.totalTravelDays ?? 0);
  const formatted = formatTravelDays(totalTravelDays);

  return (
    <div
      className="flex items-center gap-2 rounded-lg bg-gray-700/80 px-3 py-1.5 font-mono text-sm text-gray-100 border border-gray-600"
      title="In-game time"
    >
      <span className="text-base leading-none">🕐</span>
      <span>{formatted}</span>
    </div>
  );
}
