'use client';

import type { Location } from '@/types/game';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import GlobeSphere from './GlobeSphere';
import LocationMarker from './LocationMarker';

interface GlobeProps {
  locations: Location[];
  currentLocationId?: string;
  visitedLocationIds: string[];
  onLocationClick: (location: Location) => void;
}

export default function Globe({
  locations,
  currentLocationId,
  visitedLocationIds,
  onLocationClick,
}: GlobeProps) {
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);

  return (
    <div className="relative w-full h-full">
      <Canvas>
        <Suspense fallback={null}>
          {/* Camera */}
          <PerspectiveCamera makeDefault position={[0, 0, 6]} />

          {/* Lights */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, -5, -5]} intensity={0.5} />

          {/* Globe and Markers - grouped together so they rotate as one */}
          <group>
            <GlobeSphere />
            {/* Location Markers */}
            {locations.map((location) => (
              <LocationMarker
                key={location.id}
                location={location}
                isCurrent={location.id === currentLocationId}
                isVisited={visitedLocationIds.includes(location.id)}
                onClick={() => onLocationClick(location)}
                onHover={(hovered) => setHoveredLocation(hovered ? location : null)}
              />
            ))}
          </group>

          {/* Controls for rotation and zoom */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={4}
            maxDistance={10}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>

      {/* Hover tooltip */}
      {hoveredLocation && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700 pointer-events-none">
          <p className="font-bold">{hoveredLocation.name}</p>
          <p className="text-sm text-gray-300">{hoveredLocation.description}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800/90 text-white px-4 py-2 rounded-lg text-sm">
        🖱️ Drag to rotate • 🔍 Scroll to zoom • 📍 Click markers to select location
      </div>
    </div>
  );
}
