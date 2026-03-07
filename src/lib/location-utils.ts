import type { Location } from '@/types/game';

export function findLocationById(
  locations: Location[],
  locationId: string | undefined
): Location | null {
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

/** Maps DB region slugs to human-readable display labels. */
export const REGION_DISPLAY_NAMES: Record<string, string> = {
  europe_mainland: 'Central & Western Europe',
  europe_east: 'Eastern Europe',
  british_isles: 'British Isles',
  scandinavia: 'Scandinavia',
  iberia: 'Iberian Peninsula',
  mediterranean: 'Mediterranean',
  north_america: 'North America',
  south_america: 'South America',
  east_asia: 'East Asia',
  south_asia: 'South Asia',
  southeast_asia: 'Southeast Asia',
  middle_east: 'Middle East',
  africa: 'Africa',
  oceania: 'Oceania',
  central_asia: 'Central Asia',
  japan: 'Japan',
};

/** Returns a human-readable label for a region slug. Falls back to capitalised slug. */
export function getRegionDisplayName(region: string): string {
  return (
    REGION_DISPLAY_NAMES[region] ??
    region
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );
}

/** Returns all unique region slugs present in the given locations, sorted by display name. */
export function getUniqueRegions(locations: Location[]): string[] {
  const seen = new Set<string>();
  for (const loc of locations) {
    if (loc.region) seen.add(loc.region);
  }
  return Array.from(seen).sort((a, b) =>
    getRegionDisplayName(a).localeCompare(getRegionDisplayName(b))
  );
}

/** Returns locations that belong to the given region, sorted alphabetically by name. */
export function getLocationsByRegion(locations: Location[], region: string): Location[] {
  return locations
    .filter((loc) => loc.region === region)
    .sort((a, b) => a.name.localeCompare(b.name));
}
