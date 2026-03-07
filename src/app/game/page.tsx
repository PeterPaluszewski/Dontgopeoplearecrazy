'use client';

import EventModal from '@/components/EventModal/EventModal';
import GameClock from '@/components/GameClock/GameClock';
import type { GlobeDebugInfo } from '@/components/Globe/Globe';
import InventoryPanel from '@/components/InventoryPanel/InventoryPanel';
import LocationInfo from '@/components/LocationInfo/LocationInfo';
import InGameMenu from '@/components/Menu/InGameMenu';
import ResourcePanel from '@/components/ResourcePanel/ResourcePanel';
import TravelModal from '@/components/TravelModal/TravelModal';
import { getAllLocations } from '@/lib/database';
import { GameEvent, triggerRandomEvent } from '@/lib/events';
import { calculateGlobeQuaternion } from '@/lib/globe-utils';
import { findLocationById, getDefaultLocation } from '@/lib/location-utils';
import { appendToRoute, areDirectlyConnected } from '@/lib/route-utils';
import { createClient } from '@/lib/supabase';
import { calculateTravelCost, calculateTravelDays, getConnectionDetail } from '@/lib/travel-utils';
import { useGameStore } from '@/store/gameStore';
import type { Location } from '@/types/game';
import type { User } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as THREE from 'three';

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
  const [showInGameMenu, setShowInGameMenu] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [routeLocationIds, setRouteLocationIds] = useState<string[]>([]);
  const [travelModalOpen, setTravelModalOpen] = useState(false);
  const [travelDestination, setTravelDestination] = useState<Location | null>(null);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [globeDebug, setGlobeDebug] = useState<GlobeDebugInfo | null>(null);
  const [showGlobeDebug, setShowGlobeDebug] = useState(true);
  const router = useRouter();
  const {
    currentLocationId,
    visitedLocationIds,
    visitLocation,
    setCurrentLocationId,
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
      await loadGameFromDB();

      // Load locations
      const locs = await getAllLocations();
      setLocations(locs);

      const latestLocationId = useGameStore.getState().currentLocationId;
      const current = findLocationById(locs, latestLocationId);
      const fallback = getDefaultLocation(locs);

      // Set starting location if none set (Paris as default)
      if (!latestLocationId && fallback) {
        visitLocation(fallback.id);
        setCurrentLocationId(fallback.id);
        setSelectedLocation(fallback);
      } else {
        setSelectedLocation(current || fallback || null);
      }

      setLoading(false);
    };

    checkUser();
  }, [router, visitLocation, setCurrentLocationId, loadGameFromDB]);

  // ESC key handler for in-game menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowInGameMenu((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const handleLocationClick = (location: Location, ctrlKey: boolean) => {
    if (ctrlKey && currentLocationId) {
      // Ctrl+click: attempt to append to the planned route.
      // If the route is empty but there is already a selected location that sits
      // between the current city and the clicked city, auto-seed the route with
      // that selected city first so the user doesn't have to re-click it.
      // e.g. current=Jakarta, selected=Manila, Ctrl+click=HCMC
      //   → route becomes [Manila, HCMC] not just [HCMC]
      let baseRoute = routeLocationIds;
      if (
        baseRoute.length === 0 &&
        selectedLocation &&
        selectedLocation.id !== currentLocationId &&
        selectedLocation.id !== location.id
      ) {
        const withSelected = appendToRoute(locations, [], currentLocationId, selectedLocation.id);
        if (withSelected.length > 0) {
          baseRoute = withSelected;
        }
      }

      const next = appendToRoute(locations, baseRoute, currentLocationId, location.id);
      if (next !== baseRoute) {
        setRouteLocationIds(next);
        setSelectedLocation(location);
      }
    } else {
      // Plain click: update the info panel selection.
      // If a route is active and the clicked city is already part of it (or is
      // the current location), keep the route intact — the user is just browsing
      // info along the planned path.
      // Only clear the route when the user clicks an unrelated city.
      const isPartOfRoute =
        location.id === currentLocationId || routeLocationIds.includes(location.id);
      if (!isPartOfRoute) {
        setRouteLocationIds([]);
      }
      setSelectedLocation(location);
    }
  };

  const handleTravelClick = (destination: Location) => {
    setTravelDestination(destination);
    setTravelModalOpen(true);
  };

  const handleTravelConfirm = async () => {
    if (!travelDestination) return;

    const connection = getConnectionDetail(locations, currentLocationId, travelDestination.id);
    const travelDays = calculateTravelDays(connection.distanceKm, connection.speedKmh);
    const cost = calculateTravelCost(travelDays, travelDestination.difficultyMultiplier);
    travelToLocation(travelDestination.id, cost, travelDays);

    // Advance the route: drop the waypoint we just travelled to, then
    // select the next waypoint (so Travel Here stays active for the next leg).
    const nextRoute =
      routeLocationIds[0] === travelDestination.id ? routeLocationIds.slice(1) : routeLocationIds;
    setRouteLocationIds(nextRoute);
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
          <GameClock />
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowInGameMenu(true)}
              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-white transition-all hover:bg-slate-600"
              title="Open Menu (ESC)"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span className="font-medium">Menu</span>
            </button>
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
        {/* Left Panel - Resources and Inventory */}
        <div className="absolute top-4 left-4 z-10 space-y-4">
          <ResourcePanel />
          <InventoryPanel />
        </div>

        {/* Right Panel - Location Info */}
        <div className="absolute top-4 right-4 w-96 z-10">
          <LocationInfo
            location={selectedLocation}
            onTravelClick={handleTravelClick}
            isReachable={
              !!currentLocationId &&
              !!selectedLocation &&
              selectedLocation.id !== currentLocationId &&
              areDirectlyConnected(locations, currentLocationId, selectedLocation.id)
            }
          />

          {/* Route Planner Panel — only shown when a route is being built */}
          {routeLocationIds.length > 0 && (
            <div className="mt-4 bg-gray-800/95 rounded-lg p-4 shadow-xl border border-violet-700 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-violet-300">🗺️ Planned Route</div>
                <button
                  type="button"
                  className="text-xs text-red-400 hover:text-red-300"
                  onClick={() => setRouteLocationIds([])}
                >
                  Clear
                </button>
              </div>
              <ol className="space-y-1 text-xs text-gray-300">
                {[currentLocationId, ...routeLocationIds].map((id, index) => {
                  const loc = locations.find((l) => l.id === id);
                  const isStart = index === 0;
                  const isEnd = index === routeLocationIds.length;
                  return (
                    <li key={id} className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isStart
                            ? 'bg-emerald-600 text-white'
                            : isEnd
                              ? 'bg-violet-600 text-white'
                              : 'bg-gray-600 text-gray-200'
                        }`}
                      >
                        {index === 0 ? '📍' : index}
                      </span>
                      <span
                        className={isStart ? 'text-emerald-400' : isEnd ? 'text-violet-300' : ''}
                      >
                        {loc?.name ?? id}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-3 text-xs text-gray-500">
                Ctrl+click a connected city to extend the route
              </p>
              {(() => {
                const nextWaypoint = findLocationById(locations, routeLocationIds[0]);
                return nextWaypoint ? (
                  <button
                    type="button"
                    onClick={() => handleTravelClick(nextWaypoint)}
                    className="mt-3 w-full py-2 px-4 rounded-lg font-medium bg-violet-600 text-white hover:bg-violet-500 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <span>🗺️</span>
                    Travel to {nextWaypoint.name}
                  </button>
                ) : null;
              })()}
            </div>
          )}
          <div className="mt-4 bg-gray-800/95 rounded-lg p-4 shadow-xl border border-gray-700 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-gray-200">Globe Debug</div>
              <button
                type="button"
                className="text-xs text-blue-300 hover:text-blue-200"
                onClick={() => setShowGlobeDebug((prev) => !prev)}
              >
                {showGlobeDebug ? 'Hide' : 'Show'}
              </button>
            </div>
            {showGlobeDebug && (
              <div className="space-y-2 text-xs text-gray-300">
                <div>
                  <div className="text-gray-400">Camera Position</div>
                  <div className="font-mono">
                    {globeDebug
                      ? `${globeDebug.cameraPosition.x.toFixed(2)}, ${globeDebug.cameraPosition.y.toFixed(2)}, ${globeDebug.cameraPosition.z.toFixed(2)}`
                      : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Globe Rotation (rad)</div>
                  <div className="font-mono">
                    {globeDebug
                      ? `${globeDebug.globeRotation.x.toFixed(2)}, ${globeDebug.globeRotation.y.toFixed(2)}, ${globeDebug.globeRotation.z.toFixed(2)}`
                      : '—'}
                  </div>
                  <div className="font-mono text-gray-400">
                    {selectedLocation
                      ? (() => {
                          const expectedQuat = calculateGlobeQuaternion(
                            selectedLocation.latitude,
                            selectedLocation.longitude,
                            2
                          );
                          const expectedEuler = new THREE.Euler().setFromQuaternion(
                            expectedQuat,
                            'YXZ'
                          );
                          return `exp ${expectedEuler.x.toFixed(2)}, ${expectedEuler.y.toFixed(2)}, ${expectedEuler.z.toFixed(2)}`;
                        })()
                      : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Current Coordinates</div>
                  <div className="font-mono">
                    {selectedLocation
                      ? `${selectedLocation.latitude.toFixed(2)}°, ${selectedLocation.longitude.toFixed(2)}°`
                      : '—'}
                  </div>
                  <div className="font-mono text-gray-400">
                    {selectedLocation
                      ? `${(selectedLocation.latitude * (Math.PI / 180)).toFixed(3)} rad, ${(
                          selectedLocation.longitude *
                          (Math.PI / 180)
                        ).toFixed(3)} rad`
                      : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Compass Up</div>
                  <div className="font-mono">
                    {globeDebug
                      ? `${globeDebug.compassUp.label} (${globeDebug.compassUp.headingDegrees.toFixed(1)}°)`
                      : '—'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Globe - Full screen */}
        <Globe
          locations={locations}
          currentLocationId={currentLocationId}
          selectedLocationId={selectedLocation?.id}
          routeLocationIds={routeLocationIds}
          visitedLocationIds={visitedLocationIds}
          onLocationClick={handleLocationClick}
          onDebugUpdate={setGlobeDebug}
        />

        {/* Travel Modal */}
        {travelDestination &&
          (() => {
            const conn = getConnectionDetail(locations, currentLocationId, travelDestination.id);
            const days = calculateTravelDays(conn.distanceKm, conn.speedKmh);
            return (
              <TravelModal
                destination={travelDestination}
                travelDays={days}
                isOpen={travelModalOpen}
                onClose={() => setTravelModalOpen(false)}
                onConfirm={handleTravelConfirm}
              />
            );
          })()}

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

        {/* In-Game Menu (ESC) */}
        <InGameMenu isOpen={showInGameMenu} onClose={() => setShowInGameMenu(false)} />
      </main>
    </div>
  );
}
