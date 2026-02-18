import type { Location } from '@/types/game';

export function findLocationById(locations: Location[], locationId: string | undefined): Location | null {
  if (!locationId) return null;
  return locations.find((loc) => loc.id === locationId) || null;
}

export function getDefaultLocation(
  locations: Location[],
  preferredName: string = 'Paris'
): Location | null {
  if (locations.length === 0) return null;
  return locations.find((loc) => loc.name === preferredName) || locations[0] || null;
}