'use client';

import { calculateGlobeRotation } from '@/lib/globe-utils';
import type { Location } from '@/types/game';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
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
  const controlsRef = useRef<OrbitControlsType>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Rotate globe to show current location on load
  useEffect(() => {
    if (currentLocationId && locations.length > 0 && groupRef.current?.rotation) {
      const currentLocation = locations.find(loc => loc.id === currentLocationId);
      if (currentLocation) {
        const { rotationX, rotationY } = calculateGlobeRotation(
          currentLocation.latitude,
          currentLocation.longitude,
          2 // globe radius
        );
        
        groupRef.current.rotation.y = rotationY;
        groupRef.current.rotation.x = rotationX;
      }
    }
  }, [currentLocationId, locations]);

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
          <group ref={groupRef}>
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
            ref={controlsRef}
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
