import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNewGame, loadGame, saveGame } from '../save-load';
import { createClient } from '../supabase';

// Mock Supabase
vi.mock('../supabase', () => ({
  createClient: vi.fn(),
}));

describe('Menu System - Save/Load Functions', () => {
  const mockUser = { id: 'test-user-id' };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createNewGame', () => {
    it('should create new game with all required fields including difficulty and characterName', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'new-game-id' },
            error: null,
          }),
        }),
      });

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
        }),
      };

      (createClient as any).mockReturnValue(mockSupabase);

      const result = await createNewGame('1', 'hard', 'Test Player');

      expect(result.success).toBe(true);
      expect(result.gameStateId).toBe('new-game-id');
      
      // Verify insert was called with correct data
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: mockUser.id,
        current_location_id: '1',
        food: 60,
        water: 60,
        energy: 60,
        inventory: [],
        visited_location_ids: ['1'],
        is_active: true,
        difficulty: 'hard',
        character_name: 'Test Player',
      });
    });

    it('should handle missing characterName (optional field)', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'new-game-id' },
            error: null,
          }),
        }),
      });

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
        }),
      };

      (createClient as any).mockReturnValue(mockSupabase);

      const result = await createNewGame('1', 'normal');

      expect(result.success).toBe(true);
      
      // Verify character_name is undefined when not provided
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          character_name: undefined,
          difficulty: 'normal',
        })
      );
    });

    it('should use correct resource values for each difficulty', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'new-game-id' },
            error: null,
          }),
        }),
      });

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          insert: mockInsert,
        }),
      };

      (createClient as any).mockReturnValue(mockSupabase);

      // Test easy difficulty
      await createNewGame('1', 'easy');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          food: 100,
          water: 100,
          energy: 100,
          difficulty: 'easy',
        })
      );

      // Test normal difficulty
      await createNewGame('1', 'normal');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          food: 80,
          water: 80,
          energy: 80,
          difficulty: 'normal',
        })
      );

      // Test hard difficulty
      await createNewGame('1', 'hard');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          food: 60,
          water: 60,
          energy: 60,
          difficulty: 'hard',
        })
      );
    });

    it('should return error with descriptive message on database failure', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database constraint violation' },
              }),
            }),
          }),
        }),
      };

      (createClient as any).mockReturnValue(mockSupabase);

      const result = await createNewGame('1', 'normal', 'Test');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database constraint violation');
      expect(result.gameStateId).toBeUndefined();
    });

    it('should return error when user is not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Not authenticated' },
          }),
        },
      };

      (createClient as any).mockReturnValue(mockSupabase);

      const result = await createNewGame('1', 'normal');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
    });
  });

  describe('loadGame', () => {
    it('should load game state with difficulty and characterName fields', async () => {
      const mockGameData = {
        id: 'game-1',
        user_id: mockUser.id,
        current_location_id: '1',
        food: 75,
        water: 80,
        energy: 90,
        inventory: ['item1'],
        visited_location_ids: ['1', '2'],
        is_active: true,
        difficulty: 'hard',
        character_name: 'Test Player',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: mockGameData,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      (createClient as any).mockReturnValue(mockSupabase);

      const result = await loadGame();

      expect(result.success).toBe(true);
      expect(result.gameState).toBeDefined();
      expect(result.gameState?.difficulty).toBe('hard');
      expect(result.gameState?.characterName).toBe('Test Player');
      expect(result.gameState?.currentLocationId).toBe('1');
    });

    it('should handle game state without difficulty and characterName (backward compatibility)', async () => {
      const mockGameData = {
        id: 'game-1',
        user_id: mockUser.id,
        current_location_id: '1',
        food: 75,
        water: 80,
        energy: 90,
        inventory: [],
        visited_location_ids: ['1'],
        is_active: true,
        difficulty: null,
        character_name: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                      data: mockGameData,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      };

      (createClient as any).mockReturnValue(mockSupabase);

      const result = await loadGame();

      expect(result.success).toBe(true);
      expect(result.gameState?.difficulty).toBeNull();
      expect(result.gameState?.characterName).toBeNull();
    });
  });

  describe('saveGame', () => {
    it('should preserve difficulty and characterName when updating game state', async () => {
      const mockEq = vi.fn().mockResolvedValue({
        data: null,
        error: null,
      });

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      });

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn().mockReturnValue({
          update: mockUpdate,
        }),
      };

      (createClient as any).mockReturnValue(mockSupabase);

      const gameState = {
        id: 'existing-game-id',
        currentLocationId: '2',
        food: 50,
        water: 60,
        energy: 70,
        inventory: [],
        visitedLocationIds: ['1', '2'],
        isActive: true,
      };

      const result = await saveGame(gameState);

      expect(result.success).toBe(true);
      expect(result.gameStateId).toBe('existing-game-id');
      // Verify that update doesn't overwrite difficulty and characterName
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          current_location_id: '2',
          food: 50,
          water: 60,
          energy: 70,
        })
      );
      // Verify difficulty and characterName are NOT in the update
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.not.objectContaining({
          difficulty: expect.anything(),
          character_name: expect.anything(),
        })
      );
    });
  });
});
