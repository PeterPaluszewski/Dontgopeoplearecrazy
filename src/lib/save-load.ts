import type { GameState } from '@/types/game';
import { createClient } from './supabase';

/**
 * Save game state to Supabase
 * Creates a new save or updates existing one
 */
export async function saveGame(
  gameState: Omit<GameState, 'userId' | 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<{ success: boolean; gameStateId?: string; error?: string }> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const saveData = {
      user_id: user.id,
      current_location_id: gameState.currentLocationId,
      food: gameState.food,
      water: gameState.water,
      energy: gameState.energy,
      inventory: gameState.inventory,
      visited_location_ids: gameState.visitedLocationIds,
      is_active: gameState.isActive ?? true,
    };

    // If ID exists, update existing save
    if (gameState.id) {
      const { error } = await supabase
        .from('game_states')
        .update(saveData)
        .eq('id', gameState.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating game state:', error);
        return { success: false, error: error.message };
      }

      return { success: true, gameStateId: gameState.id };
    }

    // Create new save
    const { data, error } = await supabase.from('game_states').insert([saveData]).select().single();

    if (error) {
      console.error('Error creating game state:', error);
      return { success: false, error: error.message };
    }

    return { success: true, gameStateId: data.id };
  } catch (err) {
    console.error('Unexpected error saving game:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Load game state from Supabase
 * Returns the most recent active game for the current user
 */
export async function loadGame(): Promise<{
  success: boolean;
  gameState?: GameState;
  error?: string;
}> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Get most recent active game state
    const { data, error } = await supabase
      .from('game_states')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No saved game found is not an error
      if (error.code === 'PGRST116') {
        return { success: true, gameState: undefined };
      }
      console.error('Error loading game state:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: true, gameState: undefined };
    }

    const gameState: GameState = {
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

    return { success: true, gameState };
  } catch (err) {
    console.error('Unexpected error loading game:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Load all game saves for the current user
 */
export async function loadAllSaves(): Promise<{
  success: boolean;
  saves?: GameState[];
  error?: string;
}> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { data, error } = await supabase
      .from('game_states')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading game saves:', error);
      return { success: false, error: error.message };
    }

    const saves: GameState[] = (data || []).map((save) => ({
      id: save.id,
      userId: save.user_id,
      currentLocationId: save.current_location_id,
      food: save.food,
      water: save.water,
      energy: save.energy,
      inventory: save.inventory || [],
      visitedLocationIds: save.visited_location_ids || [],
      isActive: save.is_active,
      createdAt: save.created_at,
      updatedAt: save.updated_at,
    }));

    return { success: true, saves };
  } catch (err) {
    console.error('Unexpected error loading saves:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Delete a game save
 */
export async function deleteSave(saveId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    const { error } = await supabase
      .from('game_states')
      .delete()
      .eq('id', saveId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting save:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error deleting save:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Create a new game state with default values
 */
export async function createNewGame(
  startingLocationId: string
): Promise<{ success: boolean; gameState?: GameState; error?: string }> {
  const newGameState: Omit<GameState, 'userId' | 'id' | 'createdAt' | 'updatedAt'> = {
    currentLocationId: startingLocationId,
    food: 100,
    water: 100,
    energy: 100,
    inventory: [],
    visitedLocationIds: [startingLocationId],
    isActive: true,
  };

  const result = await saveGame(newGameState);

  if (!result.success || !result.gameStateId) {
    return { success: false, error: result.error };
  }

  // Load the newly created game to get full state
  const supabase = createClient();
  const { data, error } = await supabase
    .from('game_states')
    .select('*')
    .eq('id', result.gameStateId)
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || 'Failed to load new game' };
  }

  const gameState: GameState = {
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

  return { success: true, gameState };
}
