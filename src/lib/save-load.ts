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
      money: gameState.money ?? 200,
      inventory: gameState.inventory,
      visited_location_ids: gameState.visitedLocationIds,
      is_active: gameState.isActive ?? true,
      total_travel_days: gameState.totalTravelDays ?? 0,
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
      money: data.money ?? 200,
      inventory: data.inventory || [],
      visitedLocationIds: data.visited_location_ids || [],
      isActive: data.is_active,
      difficulty: data.difficulty,
      characterName: data.character_name,
      totalTravelDays: data.total_travel_days ?? 0,
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

    const saves: GameState[] = data.map((save) => ({
      id: save.id,
      userId: save.user_id,
      currentLocationId: save.current_location_id,
      food: save.food,
      water: save.water,
      energy: save.energy,
      money: save.money ?? 200,
      inventory: save.inventory || [],
      visitedLocationIds: save.visited_location_ids || [],
      isActive: save.is_active,
      difficulty: save.difficulty,
      characterName: save.character_name,
      totalTravelDays: save.total_travel_days ?? 0,
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
 * Create a new game state with specified starting parameters
 */
export async function createNewGame(
  startingLocationId: string,
  difficulty: 'easy' | 'normal' | 'hard' = 'normal',
  characterName?: string
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

    // Difficulty modifiers
    const difficultySettings = {
      easy: { food: 100, water: 100, energy: 100 },
      normal: { food: 80, water: 80, energy: 80 },
      hard: { food: 60, water: 60, energy: 60 },
    };

    const startingResources = difficultySettings[difficulty];

    // Create new game state
    const { data, error } = await supabase
      .from('game_states')
      .insert({
        user_id: user.id,
        current_location_id: startingLocationId,
        food: startingResources.food,
        water: startingResources.water,
        energy: startingResources.energy,
        inventory: [],
        visited_location_ids: [startingLocationId],
        is_active: true,
        difficulty,
        character_name: characterName,
      })
      .select()
      .single();

    if (error) {
      const errorMsg = error.message || error.hint || 'Unknown database error';
      console.error('Error creating new game - Full error:', JSON.stringify(error, null, 2));
      console.error('Error creating new game - Message:', errorMsg);
      console.error('Error creating new game - Details:', error.details);
      console.error('Error creating new game - Code:', error.code);
      return { success: false, error: errorMsg };
    }

    if (!data) {
      console.error('Error creating new game: No data returned from insert');
      return { success: false, error: 'Failed to create game state - no data returned' };
    }

    return { success: true, gameStateId: data.id };
  } catch (error) {
    console.error('Error creating new game - Caught exception:', error);
    console.error('Error creating new game - Type:', typeof error);
    console.error('Error creating new game - Constructor:', error?.constructor?.name);

    const errorMsg = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMsg || 'Unknown error occurred' };
  }
}
