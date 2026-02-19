'use client';

import { latLonToVector3 } from '@/lib/globe-utils';
import type { Location } from '@/types/game';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

interface ConnectionLinesProps {
  locations: Location[];
  globeRadius: number;
  highlightedFromId?: string;
  highlightedToId?: string;
}

type Segment = {
  start: THREE.Vector3;
  end: THREE.Vector3;
};

export function buildConnectionSegments(
  locations: Location[],
  globeRadius: number,
  lineHeight: number,
  arcSegments: number
): Segment[] {
  const seenPairs = new Set<string>();
  const locationMap = new Map(locations.map((loc) => [loc.id, loc]));
  const results: Segment[] = [];

  locations.forEach((location) => {
    location.connectedLocationIds.forEach((connectedId) => {
      const connectedLocation = locationMap.get(connectedId);
      if (!connectedLocation) return;

      const pairKey = [location.id, connectedId].sort().join(':');
      if (seenPairs.has(pairKey)) return;
      seenPairs.add(pairKey);

      const start = latLonToVector3(location.latitude, location.longitude, globeRadius);
      const end = latLonToVector3(
        connectedLocation.latitude,
        connectedLocation.longitude,
        globeRadius
      );

      const startDir = start.clone().normalize();
      const endDir = end.clone().normalize();
      const rotationAxis = new THREE.Vector3().crossVectors(startDir, endDir);
      const axisLength = rotationAxis.length();
      const dot = THREE.MathUtils.clamp(startDir.dot(endDir), -1, 1);
      const angle = Math.acos(dot);
      if (axisLength > 0) {
        rotationAxis.normalize();
      }

      let previousPoint: THREE.Vector3 | null = null;
      for (let step = 0; step <= arcSegments; step += 1) {
        const t = step / arcSegments;
        const direction = startDir
          .clone()
          .applyAxisAngle(axisLength > 0 ? rotationAxis : new THREE.Vector3(0, 1, 0), angle * t)
          .normalize();
        const radius = globeRadius + lineHeight;
        const point = direction.multiplyScalar(radius);

        if (previousPoint) {
          results.push({ start: previousPoint, end: point });
        }
        previousPoint = point;
      }
    });
  });

  return results;
}

/**
 * Build the arc segments for a single highlighted connection between two locations.
 * Returns empty array if either ID is missing, the locations don't exist in the
 * list, or they are not directly connected.
 */
export function buildHighlightedSegments(
  locations: Location[],
  globeRadius: number,
  lineHeight: number,
  arcSegments: number,
  highlightedFromId: string | undefined,
  highlightedToId: string | undefined
): Segment[] {
  if (!highlightedFromId || !highlightedToId) return [];
  const from = locations.find((l) => l.id === highlightedFromId);
  const to = locations.find((l) => l.id === highlightedToId);
  if (!from || !to) return [];
  // Accept connections listed on either side — DB data may not be bidirectional
  const connected =
    from.connectedLocationIds.includes(highlightedToId) ||
    to.connectedLocationIds.includes(highlightedFromId);
  if (!connected) return [];
  return buildConnectionSegments(
    [
      { ...from, connectedLocationIds: [highlightedToId] },
      { ...to, connectedLocationIds: [] },
    ],
    globeRadius,
    lineHeight + 0.005,
    arcSegments
  );
}

export default function ConnectionLines({
  locations,
  globeRadius,
  highlightedFromId,
  highlightedToId,
}: ConnectionLinesProps) {
  const lineHeight = 0.02;
  const arcSegments = 32;

  const segments = useMemo<Segment[]>(() => {
    return buildConnectionSegments(locations, globeRadius, lineHeight, arcSegments);
  }, [locations, globeRadius, lineHeight]);

  const highlightedSegments = useMemo<Segment[]>(() => {
    return buildHighlightedSegments(
      locations,
      globeRadius,
      lineHeight,
      arcSegments,
      highlightedFromId,
      highlightedToId
    );
  }, [locations, globeRadius, lineHeight, highlightedFromId, highlightedToId]);

  const geometry = useMemo(() => {
    const points: number[] = [];
    segments.forEach((segment) => {
      points.push(
        segment.start.x,
        segment.start.y,
        segment.start.z,
        segment.end.x,
        segment.end.y,
        segment.end.z
      );
    });

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return bufferGeometry;
  }, [segments]);

  const highlightedGeometry = useMemo(() => {
    const points: number[] = [];
    highlightedSegments.forEach((segment) => {
      points.push(
        segment.start.x,
        segment.start.y,
        segment.start.z,
        segment.end.x,
        segment.end.y,
        segment.end.z
      );
    });
    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return bufferGeometry;
  }, [highlightedSegments]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => highlightedGeometry.dispose(), [highlightedGeometry]);

  if (segments.length === 0) {
    return null;
  }

  return (
    <>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color="#94a3b8" transparent opacity={0.7} />
      </lineSegments>
      {highlightedSegments.length > 0 && (
        <lineSegments geometry={highlightedGeometry}>
          <lineBasicMaterial color="#f59e0b" transparent opacity={1} linewidth={2} />
        </lineSegments>
      )}
    </>
  );
}
