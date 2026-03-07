import type { Location } from '@/types/game';

/**
 * Returns true if `candidateId` is directly connected to `anchorId`
 * (connection may be listed on either side in the DB).
 */
export function areDirectlyConnected(
  locations: Location[],
  anchorId: string,
  candidateId: string
): boolean {
  if (anchorId === candidateId) return false;
  const anchor = locations.find((l) => l.id === anchorId);
  const candidate = locations.find((l) => l.id === candidateId);
  if (!anchor || !candidate) return false;
  return (
    anchor.connectedLocationIds.includes(candidateId) ||
    candidate.connectedLocationIds.includes(anchorId)
  );
}

/**
 * Returns the ID of the current "tail" of the route — the last waypoint if the
 * route has entries, otherwise the currentLocationId.
 */
export function getRouteTail(routeLocationIds: string[], currentLocationId: string): string {
  return routeLocationIds.length > 0
    ? routeLocationIds[routeLocationIds.length - 1]
    : currentLocationId;
}

/**
 * Determines whether `candidateId` can be appended to the planned route.
 * Rules:
 * - Must not already be in the route (no loops)
 * - Must not be the currentLocationId (can't re-add the start)
 * - Must be directly connected to the tail of the route (or to currentLocationId if the
 *   route is empty)
 */
export function canAppendToRoute(
  locations: Location[],
  routeLocationIds: string[],
  currentLocationId: string,
  candidateId: string
): boolean {
  if (candidateId === currentLocationId) return false;
  if (routeLocationIds.includes(candidateId)) return false;
  const tail = getRouteTail(routeLocationIds, currentLocationId);
  return areDirectlyConnected(locations, tail, candidateId);
}

/**
 * Appends `candidateId` to the route if it is valid to do so, otherwise
 * returns the existing route unchanged.
 */
export function appendToRoute(
  locations: Location[],
  routeLocationIds: string[],
  currentLocationId: string,
  candidateId: string
): string[] {
  if (!canAppendToRoute(locations, routeLocationIds, currentLocationId, candidateId)) {
    return routeLocationIds;
  }
  return [...routeLocationIds, candidateId];
}
