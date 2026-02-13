'use client';

import { useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

interface GlobeSphereProps {
  onRotate?: (rotation: THREE.Euler) => void;
}

export default function GlobeSphere({ onRotate }: GlobeSphereProps) {
  const globeRef = useRef<THREE.Mesh>(null);

  // Auto-rotate the globe slowly
  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
      onRotate?.(globeRef.current.rotation);
    }
  });

  return (
    <mesh ref={globeRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        color="#1e293b"
        roughness={1}
        metalness={0.1}
        emissive="#0f172a"
        emissiveIntensity={0.2}
      />
      {/* Grid lines for continents effect */}
      <lineSegments>
        <edgesGeometry args={[new THREE.SphereGeometry(2.01, 32, 32)]} />
        <lineBasicMaterial color="#334155" opacity={0.3} transparent />
      </lineSegments>
    </mesh>
  );
}
