import type {
  GameEvent,
  GameState,
  Item,
  Location,
  LocationConnection,
  TransportType,
} from '@/types/game';
import { createClient } from './supabase';

// ============================================
// LOCATIONS
// ============================================

/**
 * Fetch all location_connections rows and return a map of
 * locationId -> connectedLocationIds[], treating connections as bidirectional.
 */
async function getConnectionMap(
  supabase: ReturnType<typeof createClient>
): Promise<Map<string, string[]>> {
  const { data, error } = await supabase
    .from('location_connections')
    .select('from_id, to_id, is_bidirectional');

  if (error) {
    console.error('Error fetching location connections:', error);
    throw error;
  }

  const map = new Map<string, string[]>();
  const add = (key: string, value: string) => {
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(value);
  };

  for (const row of data || []) {
    add(row.from_id, row.to_id);
    if (row.is_bidirectional) {
      add(row.to_id, row.from_id);
    }
  }

  return map;
}

export async function getAllLocations(): Promise<Location[]> {
  const supabase = createClient();
  const [locResult, connectionMap] = await Promise.all([
    supabase.from('locations').select('*').order('name'),
    getConnectionMap(supabase),
  ]);

  if (locResult.error) {
    console.error('Error fetching locations:', locResult.error);
    throw locResult.error;
  }

  return (locResult.data || []).map((loc) => ({
    id: loc.id,
    name: loc.name,
    description: loc.description || '',
    latitude: loc.latitude,
    longitude: loc.longitude,
    difficultyMultiplier: loc.difficulty_multiplier,
    isCoastal: loc.is_coastal ?? false,
    region: loc.region ?? 'unknown',
    connectedLocationIds: connectionMap.get(loc.id) ?? [],
  }));
}

export async function getLocationById(id: string): Promise<Location | null> {
  const supabase = createClient();
  const [locResult, connFrom, connTo] = await Promise.all([
    supabase.from('locations').select('*').eq('id', id).single(),
    supabase.from('location_connections').select('to_id').eq('from_id', id),
    supabase
      .from('location_connections')
      .select('from_id')
      .eq('to_id', id)
      .eq('is_bidirectional', true),
  ]);

  if (locResult.error) {
    console.error('Error fetching location:', locResult.error);
    return null;
  }

  if (!locResult.data) return null;

  const connectedIds = [
    ...(connFrom.data || []).map((r) => r.to_id),
    ...(connTo.data || []).map((r) => r.from_id),
  ];
  // Deduplicate (a connection could appear on both sides)
  const connectedLocationIds = [...new Set(connectedIds)];

  const data = locResult.data;
  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    latitude: data.latitude,
    longitude: data.longitude,
    difficultyMultiplier: data.difficulty_multiplier,
    isCoastal: data.is_coastal ?? false,
    region: data.region ?? 'unknown',
    connectedLocationIds,
  };
}

// ============================================
// LOCATION CONNECTIONS
// ============================================

export async function getConnectionsForLocation(locationId: string): Promise<LocationConnection[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('location_connections')
    .select('*')
    .or(`from_id.eq.${locationId},to_id.eq.${locationId}`);

  if (error) {
    console.error('Error fetching connections:', error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    fromId: row.from_id,
    toId: row.to_id,
    distanceKm: row.distance_km ?? null,
    difficultyModifier: row.difficulty_modifier ?? 1.0,
    isBidirectional: row.is_bidirectional ?? true,
  }));
}

export async function getTransportTypes(): Promise<TransportType[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('transport_types').select('*').order('speed_kmh');

  if (error) {
    console.error('Error fetching transport types:', error);
    throw error;
  }

  return (data || []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    speedKmh: row.speed_kmh,
    baseCostMultiplier: row.base_cost_multiplier,
    requiresItemSlug: row.requires_item_slug ?? null,
    requiresCoastal: row.requires_coastal ?? false,
  }));
}

// ============================================
// ITEMS
// ============================================

export async function getAllItems(): Promise<Item[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('items').select('*').order('item_type').order('name');

  if (error) {
    console.error('Error fetching items:', error);
    throw error;
  }

  return (data || []).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    weight: item.weight,
    foodValue: item.food_value,
    waterValue: item.water_value,
    energyValue: item.energy_value,
    itemType: item.item_type,
  }));
}

export async function getItemById(id: string): Promise<Item | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('items').select('*').eq('id', id).single();

  if (error) {
    console.error('Error fetching item:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    description: data.description || '',
    weight: data.weight,
    foodValue: data.food_value,
    waterValue: data.water_value,
    energyValue: data.energy_value,
    itemType: data.item_type,
  };
}

// ============================================
// GAME STATES
// ============================================

export async function getUserGameStates(userId: string): Promise<GameState[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('game_states')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching game states:', error);
    throw error;
  }

  return (data || []).map((state) => ({
    id: state.id,
    userId: state.user_id,
    currentLocationId: state.current_location_id,
    food: state.food,
    water: state.water,
    energy: state.energy,
    inventory: state.inventory || [],
    visitedLocationIds: state.visited_location_ids || [],
    isActive: state.is_active,
    createdAt: state.created_at,
    updatedAt: state.updated_at,
  }));
}

export async function getActiveGameState(userId: string): Promise<GameState | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('game_states')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No active game found
      return null;
    }
    console.error('Error fetching active game state:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    currentLocationId: data.current_location_id,
    food: data.food,
    water: data.water,
    energy: data.energy,
    inventory: data.inventory || [],
    visitedLocationIds: data.visited_location_ids || [],
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function createGameState(
  userId: string,
  startingLocationId: string
): Promise<GameState> {
  const supabase = createClient();

  // Deactivate any existing active games
  await supabase
    .from('game_states')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true);

  // Create new game
  const { data, error } = await supabase
    .from('game_states')
    .insert({
      user_id: userId,
      current_location_id: startingLocationId,
      food: 100,
      water: 100,
      energy: 100,
      inventory: [],
      visited_location_ids: [startingLocationId],
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating game state:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    currentLocationId: data.current_location_id,
    food: data.food,
    water: data.water,
    energy: data.energy,
    inventory: data.inventory || [],
    visitedLocationIds: data.visited_location_ids || [],
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export async function updateGameState(
  gameId: string,
  updates: Partial<Omit<GameState, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const supabase = createClient();

  const dbUpdates: Record<string, unknown> = {};
  if (updates.currentLocationId !== undefined)
    dbUpdates.current_location_id = updates.currentLocationId;
  if (updates.food !== undefined) dbUpdates.food = updates.food;
  if (updates.water !== undefined) dbUpdates.water = updates.water;
  if (updates.energy !== undefined) dbUpdates.energy = updates.energy;
  if (updates.inventory !== undefined) dbUpdates.inventory = updates.inventory;
  if (updates.visitedLocationIds !== undefined)
    dbUpdates.visited_location_ids = updates.visitedLocationIds;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

  const { error } = await supabase.from('game_states').update(dbUpdates).eq('id', gameId);

  if (error) {
    console.error('Error updating game state:', error);
    throw error;
  }
}

export async function deleteGameState(gameId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('game_states').delete().eq('id', gameId);

  if (error) {
    console.error('Error deleting game state:', error);
    throw error;
  }
}

// ============================================
// GAME EVENTS
// ============================================

export async function getRandomEvent(): Promise<GameEvent | null> {
  const supabase = createClient();

  // Get all random events
  const { data, error } = await supabase.from('game_events').select('*').eq('event_type', 'RANDOM');

  if (error) {
    console.error('Error fetching events:', error);
    return null;
  }

  if (!data || data.length === 0) return null;

  // Pick a random event
  const randomIndex = Math.floor(Math.random() * data.length);
  const event = data[randomIndex];

  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    eventType: event.event_type,
    foodEffect: event.food_effect,
    waterEffect: event.water_effect,
    energyEffect: event.energy_effect,
    choices: event.choices || [],
  };
}

export async function getEventById(id: string): Promise<GameEvent | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('game_events').select('*').eq('id', id).single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    eventType: data.event_type,
    foodEffect: data.food_effect,
    waterEffect: data.water_effect,
    energyEffect: data.energy_effect,
    choices: data.choices || [],
  };
}
