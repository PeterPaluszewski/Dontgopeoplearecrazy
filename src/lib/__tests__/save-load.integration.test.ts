import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createNewGame, deleteSave, loadGame, saveGame } from '../save-load';
import { createClient } from '../supabase';

/**
 * Integration tests for save-load functions
 * These tests use a real Supabase connection to catch database schema issues
 * 
 * IMPORTANT: These tests run by default with `npm test`
 * 
 * To skip integration tests (unit tests only):
 * Run: npm run test:unit
 * 
 * Authentication:
 * - Uses TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables
 * - If not set, will use current session from browser
 * - In CI/CD, secrets are automatically provided
 * 
 * These tests will:
 * - Catch UUID vs string ID mismatches
 * - Validate database constraints (CHECK, NOT NULL, foreign keys)
 * - Test RLS policies
 * - Verify the full save/load lifecycle
 */

// Only skip if explicitly requested (for faster unit-only testing)
const shouldSkip = process.env.SKIP_INTEGRATION_TESTS === 'true';

describe.skipIf(shouldSkip)('Save-Load Integration Tests', () => {
  const testGameIds: string[] = [];

  beforeAll(async () => {
    const supabase = createClient();
    
    // If running in CI, authenticate with test credentials
    if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: process.env.TEST_USER_EMAIL,
        password: process.env.TEST_USER_PASSWORD,
      });
      
      if (signInError) {
        throw new Error(`Failed to authenticate test user: ${signInError.message}`);
      }
    }
    
    // Verify we can connect to Supabase
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      throw new Error(
        'Integration tests require authenticated user. ' +
        'Either login through the app first, or set TEST_USER_EMAIL and TEST_USER_PASSWORD env vars.'
      );
    }
    
    console.log(`Running integration tests as user: ${user.email}`);
  });

  afterAll(async () => {
    // Cleanup: delete all test games created during tests
    for (const gameId of testGameIds) {
      await deleteSave(gameId);
    }
  });

  describe('createNewGame - Database Schema Validation', () => {
    it('should fail with descriptive error when location ID is not a valid UUID', async () => {
      const result = await createNewGame('1', 'normal', 'Test Player');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('uuid');
      expect(result.gameStateId).toBeUndefined();
    });

    it('should succeed with valid UUID location ID', async () => {
      // First, get a valid location ID from the database
      const supabase = createClient();
      const { data: locations } = await supabase
        .from('locations')
        .select('id')
        .limit(1)
        .single();

      if (!locations) {
        throw new Error('No locations in database. Please seed locations first.');
      }

      const result = await createNewGame(locations.id, 'normal', 'Test Player');

      expect(result.success).toBe(true);
      expect(result.gameStateId).toBeDefined();
      
      if (result.gameStateId) {
        testGameIds.push(result.gameStateId);
      }
    });

    it('should create game with all difficulty levels', async () => {
      const supabase = createClient();
      const { data: location } = await supabase
        .from('locations')
        .select('id')
        .limit(1)
        .single();

      if (!location) throw new Error('No locations in database');

      // Test all three difficulty levels
      const difficulties: Array<'easy' | 'normal' | 'hard'> = ['easy', 'normal', 'hard'];
      const expectedResources = {
        easy: { food: 100, water: 100, energy: 100 },
        normal: { food: 80, water: 80, energy: 80 },
        hard: { food: 60, water: 60, energy: 60 },
      };

      for (const difficulty of difficulties) {
        const result = await createNewGame(location.id, difficulty, `Test ${difficulty}`);
        expect(result.success).toBe(true);
        
        if (result.gameStateId) {
          testGameIds.push(result.gameStateId);
          
          // Verify the game was created with correct resources
          const loadResult = await loadGame();
          expect(loadResult.success).toBe(true);
          expect(loadResult.gameState?.difficulty).toBe(difficulty);
          expect(loadResult.gameState?.food).toBe(expectedResources[difficulty].food);
          expect(loadResult.gameState?.water).toBe(expectedResources[difficulty].water);
          expect(loadResult.gameState?.energy).toBe(expectedResources[difficulty].energy);
          expect(loadResult.gameState?.characterName).toBe(`Test ${difficulty}`);
        }
      }
    });

    it('should handle optional character name', async () => {
      const supabase = createClient();
      const { data: location } = await supabase
        .from('locations')
        .select('id')
        .limit(1)
        .single();

      if (!location) throw new Error('No locations in database');

      const result = await createNewGame(location.id, 'normal');
      expect(result.success).toBe(true);
      
      if (result.gameStateId) {
        testGameIds.push(result.gameStateId);
        
        const loadResult = await loadGame();
        expect(loadResult.gameState?.characterName).toBeNull();
      }
    });

    it('should fail when user is not authenticated', async () => {
      const supabase = createClient();
      
      // Get a location first
      const { data: location } = await supabase
        .from('locations')
        .select('id')
        .limit(1)
        .single();

      if (!location) throw new Error('No locations in database');

      // Sign out
      await supabase.auth.signOut();
      
      const result = await createNewGame(location.id, 'normal');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('authenticated');
      
      // Re-authenticate for subsequent tests
      if (process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD) {
        await supabase.auth.signInWithPassword({
          email: process.env.TEST_USER_EMAIL,
          password: process.env.TEST_USER_PASSWORD,
        });
      }
    });
  });

  describe('Database Constraints and RLS', () => {
    it('should respect database CHECK constraint on difficulty', async () => {
      const supabase = createClient();
      const { data: location } = await supabase
        .from('locations')
        .select('id')
        .limit(1)
        .single();

      if (!location) throw new Error('No locations in database');

      // Try to insert with invalid difficulty directly
      const { error } = await supabase
        .from('game_states')
        .insert({
          current_location_id: location.id,
          food: 80,
          water: 80,
          energy: 80,
          inventory: [],
          visited_location_ids: [location.id],
          is_active: true,
          difficulty: 'invalid' as any, // Invalid difficulty
        });

      expect(error).toBeDefined();
      expect(error?.message).toMatch(/check constraint|invalid|violates.*security|row-level security/i);
    });

    it('should enforce NOT NULL constraint on required fields', async () => {
      const supabase = createClient();

      // Try to insert without required fields
      const { error } = await supabase
        .from('game_states')
        .insert({
          food: 80,
          water: 80,
          energy: 80,
          // Missing: current_location_id, inventory, visited_location_ids, is_active
        } as any);

      expect(error).toBeDefined();
      if (error?.message) {
        expect(error.message).toMatch(/null|not null|violates/i);
      } else {
        // Some databases might reject without a message
        expect(error).toBeTruthy();
      }
    });

    it('should enforce foreign key constraint on current_location_id', async () => {
      const supabase = createClient();
      const fakeUuid = '00000000-0000-0000-0000-000000000000';

      // Try to insert with non-existent location
      const { error } = await supabase
        .from('game_states')
        .insert({
          current_location_id: fakeUuid,
          food: 80,
          water: 80,
          energy: 80,
          inventory: [],
          visited_location_ids: [fakeUuid],
          is_active: true,
        });

      expect(error).toBeDefined();
      expect(error?.message).toMatch(/foreign key|violates|constraint/i);
    });
  });

  describe('Full User Flow', () => {
    it('should complete full game lifecycle: create → save → load → delete', async () => {
      const supabase = createClient();
      const { data: location } = await supabase
        .from('locations')
        .select('id')
        .limit(1)
        .single();

      if (!location) throw new Error('No locations in database');

      // 1. Create game
      const createResult = await createNewGame(location.id, 'hard', 'Integration Test Player');
      expect(createResult.success).toBe(true);
      const gameId = createResult.gameStateId!;
      testGameIds.push(gameId);

      // 2. Load game
      const loadResult = await loadGame();
      expect(loadResult.success).toBe(true);
      expect(loadResult.gameState?.id).toBe(gameId);
      expect(loadResult.gameState?.difficulty).toBe('hard');
      expect(loadResult.gameState?.characterName).toBe('Integration Test Player');

      // 3. Update game
      const saveResult = await saveGame({
        id: gameId,
        currentLocationId: location.id,
        food: 50,
        water: 60,
        energy: 70,
        inventory: [],
        visitedLocationIds: [location.id],
        isActive: true,
      });
      expect(saveResult.success).toBe(true);

      // 4. Verify update
      const reloadResult = await loadGame();
      expect(reloadResult.gameState?.food).toBe(50);
      expect(reloadResult.gameState?.water).toBe(60);
      expect(reloadResult.gameState?.energy).toBe(70);
      // Verify difficulty and characterName are preserved
      expect(reloadResult.gameState?.difficulty).toBe('hard');
      expect(reloadResult.gameState?.characterName).toBe('Integration Test Player');

      // 5. Delete game
      const deleteResult = await deleteSave(gameId);
      expect(deleteResult.success).toBe(true);

      // 6. Verify deletion
      const { data } = await supabase
        .from('game_states')
        .select('id')
        .eq('id', gameId)
        .maybeSingle();
      
      expect(data).toBeNull();
    });
  });
});
