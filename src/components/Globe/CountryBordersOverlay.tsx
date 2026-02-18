'use client';

import countryBorders from '@/data/natural-earth-admin0.json';
import { latLonToVector3 } from '@/lib/globe-utils';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

type Segment = {
  start: THREE.Vector3;
  end: THREE.Vector3;
};

type GeoJsonGeometry =
  | { type: 'Polygon'; coordinates: number[][][] }
  | { type: 'MultiPolygon'; coordinates: number[][][][] };

type GeoJsonFeature = {
  type: 'Feature';
  geometry: GeoJsonGeometry;
};

type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: GeoJsonFeature[];
};

const borderData = countryBorders as GeoJsonFeatureCollection;

export function buildBorderSegments(globeRadius: number, height: number = 0.005): Segment[] {
  const results: Segment[] = [];

  const pushRingSegments = (ring: number[][]) => {
    for (let i = 1; i < ring.length; i += 1) {
      const [lonA, latA] = ring[i - 1];
      const [lonB, latB] = ring[i];
      const start = latLonToVector3(latA, lonA, globeRadius + height);
      const end = latLonToVector3(latB, lonB, globeRadius + height);
      results.push({ start, end });
    }
  };

  borderData.features.forEach((feature) => {
    if (feature.geometry.type === 'Polygon') {
      feature.geometry.coordinates.forEach((ring) => pushRingSegments(ring));
      return;
    }

    feature.geometry.coordinates.forEach((polygon) => {
      polygon.forEach((ring) => pushRingSegments(ring));
    });
  });

  return results;
}

export default function CountryBordersOverlay({ globeRadius }: { globeRadius: number }) {
  const segments = useMemo(() => buildBorderSegments(globeRadius), [globeRadius]);

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

  useEffect(() => () => geometry.dispose(), [geometry]);

  if (segments.length === 0) {
    return null;
  }

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#e2e8f0" transparent opacity={0.5} />
    </lineSegments>
  );
}