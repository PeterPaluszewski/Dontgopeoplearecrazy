import * as THREE from 'three';

/**
 * Convert latitude and longitude to 3D Cartesian coordinates
 * @param lat Latitude in degrees (-90 to 90)
 * @param lon Longitude in degrees (-180 to 180)
 * @param radius Radius of the sphere
 * @returns THREE.Vector3 position
 */
export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Create a marker position slightly above the globe surface
 * @param lat Latitude in degrees
 * @param lon Longitude in degrees
 * @param globeRadius Radius of the globe
 * @param height Height above surface
 */
export function getMarkerPosition(
  lat: number,
  lon: number,
  globeRadius: number,
  height: number = 0.01
): THREE.Vector3 {
  return latLonToVector3(lat, lon, globeRadius + height);
}

/**
 * Calculate the distance between two locations on Earth
 * Uses the Haversine formula
 * @param loc1 First location (must have latitude and longitude)
 * @param loc2 Second location (must have latitude and longitude)
 * @returns Distance in kilometers
 */
export function calculateDistance(
  loc1: { latitude: number; longitude: number },
  loc2: { latitude: number; longitude: number }
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
  const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.latitude * Math.PI) / 180) *
      Math.cos((loc2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get the color for a location marker based on its status
 */
export function getMarkerColor(isVisited: boolean, isCurrent: boolean): string {
  if (isCurrent) return '#10b981'; // Green for current location
  if (isVisited) return '#3b82f6'; // Blue for visited
  return '#6b7280'; // Gray for unvisited
}

/**
 * Calculate globe rotation to bring a location to face the camera
 * @param lat Latitude in degrees (-90 to 90)
 * @param lon Longitude in degrees (-180 to 180)
 * @param globeRadius Radius of the globe
 * @returns Object with rotationX and rotationY in radians
 */
export function calculateGlobeRotation(
  lat: number,
  lon: number,
  globeRadius: number
): { rotationX: number; rotationY: number } {
  // Get the 3D position of the location
  const targetPos = latLonToVector3(lat, lon, globeRadius);
  
  // Calculate rotation to bring this point to face the camera (at [0, 0, positive Z])
  // Y rotation: rotate around vertical axis to align longitude
  const rotationY = -Math.atan2(targetPos.x, targetPos.z);
  
  // X rotation: rotate around horizontal axis to align latitude
  // We need to tilt the globe so the point faces forward
  // After Y rotation, the point is in the YZ plane, so we use atan2(y, z)
  // Positive angle means point is above equator, needs negative rotation to tilt down
  const xzDistance = Math.sqrt(targetPos.x ** 2 + targetPos.z ** 2);
  const rotationX = Math.atan2(targetPos.y, xzDistance); // Changed sign: removed the negative
  
  return { rotationX, rotationY };
}
