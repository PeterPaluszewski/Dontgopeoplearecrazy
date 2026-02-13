'use client';

import { useLoader } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface GlobeSphereProps {
  onRotate?: (rotation: THREE.Euler) => void;
}

export default function GlobeSphere({ onRotate }: GlobeSphereProps) {
  const globeRef = useRef<THREE.Group>(null);

  // Load Earth texture
  const texture = useLoader(
    THREE.TextureLoader,
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
  );

  return (
    <group ref={globeRef}>
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial map={texture} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Grid lines for continents effect */}
      <lineSegments>
        <edgesGeometry args={[new THREE.SphereGeometry(2.01, 32, 32)]} />
        <lineBasicMaterial color="#334155" opacity={0.15} transparent />
      </lineSegments>
    </group>
  );
}
