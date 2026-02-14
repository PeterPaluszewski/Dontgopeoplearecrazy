'use client';

import EventModal from '@/components/EventModal/EventModal';
import InventoryPanel from '@/components/InventoryPanel/InventoryPanel';
import LocationInfo from '@/components/LocationInfo/LocationInfo';
import ResourcePanel from '@/components/ResourcePanel/ResourcePanel';
import SaveLoadPanel from '@/components/SaveLoadPanel/SaveLoadPanel';
import TravelModal from '@/components/TravelModal/TravelModal';
import { getAllLocations } from '@/lib/database';
import { GameEvent, triggerRandomEvent } from '@/lib/events';
import { createClient } from '@/lib/supabase';
import { calculateTravelCost } from '@/lib/travel-utils';
import { useGameStore } from '@/store/gameStore';
import type { Location } from '@/types/game';
import type { User } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [travelModalOpen, setTravelModalOpen] = useState(false);
  const [travelDestination, setTravelDestination] = useState<Location | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const router = useRouter();
  const {
    currentLocationId,
    visitedLocationIds,
    visitLocation,
    travelToLocation,
    loadGameFromDB,
    saveGame,
  } = useGameStore();

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

      // Try to load saved game
      const loadResult = await loadGameFromDB();

      // Load locations
      const locs = await getAllLocations();
      setLocations(locs);

      // Set starting location if none set (Paris as default)
      if (!currentLocationId && locs.length > 0) {
        const paris = locs.find((loc) => loc.name === 'Paris') || locs[0];
        visitLocation(paris.id);
        setSelectedLocation(paris);
      } else if (currentLocationId) {
        const current = locs.find((loc) => loc.id === currentLocationId);
        setSelectedLocation(current || null);
      }

      setLoading(false);
    };

    checkUser();
  }, [router, currentLocationId, visitLocation, loadGameFromDB]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleTravelClick = (destination: Location) => {
    setTravelDestination(destination);
    setTravelModalOpen(true);
  };

  const handleTravelConfirm = async () => {
    if (!travelDestination) return;

    const cost = calculateTravelCost(
      travelDestination.travelDays,
      travelDestination.difficultyMultiplier
    );
    travelToLocation(travelDestination.id, cost);
    setSelectedLocation(travelDestination);
    setTravelDestination(null);

    // Auto-save after travel
    await saveGame();

    // Trigger random event (30% chance)
    const event = await triggerRandomEvent(0.3);
    if (event) {
      setCurrentEvent(event);
      setEventModalOpen(true);
    }
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
        {/* Left Panel - Resources */}
        <div className="absolute top-4 left-4 w-80 z-10 space-y-4">
          <ResourcePanel />
          <InventoryPanel />
          <SaveLoadPanel />
        </div>

        {/* Right Panel - Location Info */}
        <div className="absolute top-4 right-4 w-96 z-10">
          <LocationInfo location={selectedLocation} onTravelClick={handleTravelClick} />
        </div>

        {/* Globe - Full screen */}
        <Globe
          locations={locations}
          currentLocationId={currentLocationId}
          visitedLocationIds={visitedLocationIds}
          onLocationClick={handleLocationClick}
        />

        {/* Travel Modal */}
        {travelDestination && (
          <TravelModal
            destination={travelDestination}
            isOpen={travelModalOpen}
            onClose={() => setTravelModalOpen(false)}
            onConfirm={handleTravelConfirm}
          />
        )}

        {/* Event Modal */}
        {currentEvent && (
          <EventModal
            event={currentEvent}
            isOpen={eventModalOpen}
            onClose={() => {
              setEventModalOpen(false);
              setCurrentEvent(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
