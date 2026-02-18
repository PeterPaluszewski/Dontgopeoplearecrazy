'use client';

import { getCompassLabel, getHeadingDegreesFromVector } from '@/lib/compass-utils';
import { calculateDragRadiansPerPixel, calculateGlobeQuaternion } from '@/lib/globe-utils';
import type { Location } from '@/types/game';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
import ConnectionLines from './ConnectionLines';
import CountryBordersOverlay from './CountryBordersOverlay';
import GlobeSphere from './GlobeSphere';
import LocationMarker from './LocationMarker';

interface GlobeProps {
  locations: Location[];
  currentLocationId?: string;
  visitedLocationIds: string[];
  onLocationClick: (location: Location) => void;
  onDebugUpdate?: (debug: GlobeDebugInfo) => void;
}

export interface GlobeDebugInfo {
  cameraPosition: { x: number; y: number; z: number };
  globeRotation: { x: number; y: number; z: number };
  compassUp: {
    headingDegrees: number;
    label: string;
    vector: { x: number; y: number; z: number };
  };
}

export default function Globe({
  locations,
  currentLocationId,
  visitedLocationIds,
  onLocationClick,
  onDebugUpdate,
}: GlobeProps) {
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const controlsRef = useRef<OrbitControlsType>(null);
  const groupRef = useRef<THREE.Group>(null);
  const dragState = useRef({ isDragging: false, lastX: 0, lastY: 0 });
  const [showBorders, setShowBorders] = useState(false);

  // Derived target quaternion for smooth rotation — recomputed when location changes
  const targetQuaternion = useRef<THREE.Quaternion | null>(null);
  const isAnimating = useRef(false);
  const cameraDistance = useRef(6); // tracks live camera z-distance for drag scaling
  const cameraFov = useRef(75);      // tracks live camera FOV (degrees)
  const viewportHeight = useRef(600); // tracks canvas pixel height

  useEffect(() => {
    if (!currentLocationId || locations.length === 0) return;
    const currentLocation = locations.find((loc) => loc.id === currentLocationId);
    if (!currentLocation) return;
    targetQuaternion.current = calculateGlobeQuaternion(
      currentLocation.latitude,
      currentLocation.longitude,
      2
    );
    isAnimating.current = true;
  }, [currentLocationId, locations]);

  const DebugProbe = ({ onUpdate }: { onUpdate?: (debug: GlobeDebugInfo) => void }) => {
    const { camera } = useThree();
    const lastUpdateRef = useRef(0);
    const upVectorRef = useRef(new THREE.Vector3());
    const lastZoomRef = useRef<boolean | null>(null);

    useFrame(({ clock, camera, size }, delta) => {
      // Keep camera state in sync for surface-locked drag calculation
      cameraDistance.current = camera.position.length();
      cameraFov.current = (camera as THREE.PerspectiveCamera).fov ?? 75;
      viewportHeight.current = size.height;

      // Smooth rotation animation toward target quaternion
      if (isAnimating.current && targetQuaternion.current && groupRef.current) {
        groupRef.current.quaternion.slerp(targetQuaternion.current, Math.min(1, delta * 3));
        const angle = groupRef.current.quaternion.angleTo(targetQuaternion.current);
        if (angle < 0.001) {
          groupRef.current.quaternion.copy(targetQuaternion.current);
          isAnimating.current = false;
        }
      }

      const zoomedIn = camera.position.z <= 3;
      if (lastZoomRef.current !== zoomedIn) {
        lastZoomRef.current = zoomedIn;
        setShowBorders(zoomedIn);
      }

      if (!onUpdate || !groupRef.current) return;

      const now = clock.getElapsedTime();
      if (now - lastUpdateRef.current < 0.1) return;
      lastUpdateRef.current = now;

      upVectorRef.current.set(0, 1, 0).applyEuler(groupRef.current.rotation);
      const headingDegrees = getHeadingDegreesFromVector(
        upVectorRef.current.x,
        upVectorRef.current.z
      );

      onUpdate({
        cameraPosition: {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
        },
        globeRotation: {
          x: groupRef.current.rotation.x,
          y: groupRef.current.rotation.y,
          z: groupRef.current.rotation.z,
        },
        compassUp: {
          headingDegrees,
          label: getCompassLabel(headingDegrees),
          vector: {
            x: upVectorRef.current.x,
            y: upVectorRef.current.y,
            z: upVectorRef.current.z,
          },
        },
      });
    });

    return null;
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Cancel any in-progress rotation animation when the user grabs the globe
    isAnimating.current = false;
    dragState.current = {
      isDragging: true,
      lastX: event.clientX,
      lastY: event.clientY,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.isDragging || !groupRef.current) return;

    const deltaX = event.clientX - dragState.current.lastX;
    const deltaY = event.clientY - dragState.current.lastY;
    dragState.current.lastX = event.clientX;
    dragState.current.lastY = event.clientY;

    // Surface-locked drag: see calculateDragRadiansPerPixel in globe-utils.ts
    const radiansPerPixel = calculateDragRadiansPerPixel(
      cameraFov.current,
      viewportHeight.current,
      cameraDistance.current
    );
    groupRef.current.rotation.y += deltaX * radiansPerPixel;
    groupRef.current.rotation.x += deltaY * radiansPerPixel;

    const maxTilt = Math.PI / 2;
    groupRef.current.rotation.x = Math.max(
      -maxTilt,
      Math.min(maxTilt, groupRef.current.rotation.x)
    );
  };

  const handlePointerUp = () => {
    dragState.current.isDragging = false;
  };

  return (
    <div
      className="relative w-full h-full"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
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
            <ConnectionLines locations={locations} globeRadius={2} />
            {showBorders && <CountryBordersOverlay globeRadius={2} />}
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

          <DebugProbe onUpdate={onDebugUpdate} />

          {/* Controls for rotation and zoom */}
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            enableRotate={false}
            minDistance={2}
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
