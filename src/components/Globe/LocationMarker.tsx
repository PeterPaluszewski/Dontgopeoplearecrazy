'use client';

import { getMarkerColor, getMarkerPosition } from '@/lib/globe-utils';
import type { Location } from '@/types/game';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface LocationMarkerProps {
  location: Location;
  isVisited: boolean;
  isCurrent: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}

export default function LocationMarker({
  location,
  isVisited,
  isCurrent,
  onClick,
  onHover,
}: LocationMarkerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame((state) => {
    // Pulse animation for current location
    if (isCurrent && pulseRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.2 + 1;
      pulseRef.current.scale.set(pulse, pulse, pulse);
    }

    // Constant apparent size: scale inversely with camera distance
    // so the marker subtends the same angle on screen regardless of zoom.
    if (groupRef.current) {
      const distance = camera.position.length();
      groupRef.current.scale.setScalar(distance / 6);
    }
  });

  const position = getMarkerPosition(location.latitude, location.longitude, 2);
  const color = getMarkerColor(isVisited, isCurrent);

  return (
    <group ref={groupRef} position={position}>
      {/* Main marker pin */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerEnter={() => onHover(true)}
        onPointerLeave={() => onHover(false)}
      >
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>

      {/* Pulsing ring for current location */}
      {isCurrent && (
        <mesh ref={pulseRef}>
          <ringGeometry args={[0.04, 0.05, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Pin stick */}
      <mesh position={[0, -0.025, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.05]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
