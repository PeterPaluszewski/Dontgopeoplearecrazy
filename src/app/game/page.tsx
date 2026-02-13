'use client';

import { createClient } from '@/lib/supabase';
import { getAllLocations } from '@/lib/database';
import { useGameStore } from '@/store/gameStore';
import type { User } from '@supabase/supabase-js';
import type { Location } from '@/types/game';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Globe to prevent SSR issues with Three.js
const Globe = dynamic(() => import('@/components/Globe/Globe'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="text-white text-xl">Loading globe...</div>
    </div>
  ),
});

export default function GamePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const router = useRouter();
  const { currentLocationId, visitedLocationIds, visitLocation } = useGameStore();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      // Load locations
      const locs = await getAllLocations();
      setLocations(locs);

      // Set starting location if none set (Paris as default)
      if (!currentLocationId && locs.length > 0) {
        const paris = locs.find((loc) => loc.name === 'Paris') || locs[0];
        visitLocation(paris.id);
      }

      setLoading(false);
    };

    checkUser();
  }, [router, currentLocationId, visitLocation]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const handleLocationClick = (location: Location) => {
    // TODO: Check if location is reachable from current location
    // TODO: Implement travel cost calculation (days, resource consumption)
    // TODO: Show travel confirmation modal with costs
    console.log('Selected location:', location.name);
    visitLocation(location.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🌍</div>
          <p className="text-gray-400">Loading your adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">🎒 Backpacking Adventure</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden">
        <Globe
          locations={locations}
          currentLocationId={currentLocationId}
          visitedLocationIds={visitedLocationIds}
          onLocationClick={handleLocationClick}
        />
      </main>
    </div>
  );
}
