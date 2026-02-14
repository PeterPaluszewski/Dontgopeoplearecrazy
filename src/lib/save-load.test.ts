import { createNewGame, deleteSave, loadAllSaves, loadGame, saveGame } from '@/lib/save-load';
import { createClient } from '@/lib/supabase';
import type { GameState } from '@/types/game';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  createClient: vi.fn(),
}));

describe('save-load', () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' };
  const mockGameState: Omit<GameState, 'id' | 'createdAt' | 'updatedAt'> = {
    userId: 'user-123',
    currentLocationId: 'paris',
    food: 80,
    water: 90,
    energy: 70,
    inventory: [
      {
        item: {
          id: 'item-1',
          name: 'Water Bottle',
          description: 'A water bottle',
          weight: 0.5,
          foodValue: 0,
          waterValue: 20,
          energyValue: 0,
          itemType: 'CONSUMABLE',
        },
        quantity: 2,
      },
    ],
    visitedLocationIds: ['paris', 'london'],
    isActive: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveGame', () => {
    it('should create a new save when no ID provided', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'save-123', ...mockGameState },
                error: null,
              }),
            }),
          }),
        }),
      };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await saveGame(mockGameState);

      expect(result.success).toBe(true);
      expect(result.gameStateId).toBe('save-123');
      expect(mockSupabase.from).toHaveBeenCalledWith('game_states');
    });

    it('should update existing save when ID provided', async () => {
      const mockEq = vi.fn().mockReturnThis();
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: mockEq.mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        }),
      };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await saveGame({ ...mockGameState, id: 'existing-save' });

      expect(result.success).toBe(true);
      expect(result.gameStateId).toBe('existing-save');
    });

    it('should return error when user not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') }),
        },
      };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await saveGame(mockGameState);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
    });

    it('should handle database errors', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
              }),
            }),
          }),
        }),
      };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await saveGame(mockGameState);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('loadGame', () => {
    it('should load the most recent active game', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: 'save-123',
                user_id: 'user-123',
                current_location_id: 'paris',
                food: 80,
                water: 90,
                energy: 70,
                inventory: [],
                visited_location_ids: ['paris'],
                is_active: true,
                created_at: '2024-01-01',
                updated_at: '2024-01-02',
              },
              error: null,
            }),
          }),
        }),
      };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await loadGame();

      expect(result.success).toBe(true);
      expect(result.gameState).toBeDefined();
      expect(result.gameState?.currentLocationId).toBe('paris');
    });

    it('should return undefined when no save found', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }, // No rows returned
            }),
          }),
        }),
      };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await loadGame();

      expect(result.success).toBe(true);
      expect(result.gameState).toBeUndefined();
    });

    it('should return error when user not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') }),
        },
      };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await loadGame();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not authenticated');
    });
  });

  describe('loadAllSaves', () => {
    it('should load all saves for the current user', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'save-1',
                  user_id: 'user-123',
                  current_location_id: 'paris',
                  food: 80,
                  water: 90,
                  energy: 70,
                  inventory: [],
                  visited_location_ids: ['paris'],
                  is_active: true,
                  created_at: '2024-01-01',
                  updated_at: '2024-01-02',
                },
              ],
              error: null,
            }),
          }),
        }),
      };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await loadAllSaves();

      expect(result.success).toBe(true);
      expect(result.saves).toHaveLength(1);
      expect(result.saves?.[0].id).toBe('save-1');
    });
  });

  describe('deleteSave', () => {
    it('should delete a save', async () => {
      const mockEq = vi.fn().mockReturnThis();
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: mockEq.mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        }),
      };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await deleteSave('save-123');

      expect(result.success).toBe(true);
    });

    it('should return error when deletion fails', async () => {
      const mockEq = vi.fn().mockReturnThis();
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            eq: mockEq.mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
            }),
          }),
        }),
      };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await deleteSave('save-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Delete failed');
    });
  });

  describe('createNewGame', () => {
    it('should create a new game with default values', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
        },
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'new-save' },
                error: null,
              }),
            }),
          }),
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'new-save',
                  user_id: 'user-123',
                  current_location_id: 'paris',
                  food: 100,
                  water: 100,
                  energy: 100,
                  inventory: [],
                  visited_location_ids: ['paris'],
                  is_active: true,
                  created_at: '2024-01-01',
                  updated_at: '2024-01-01',
                },
                error: null,
              }),
            }),
          }),
        }),
      };

      (createClient as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockSupabase);

      const result = await createNewGame('paris');

      expect(result.success).toBe(true);
      expect(result.gameState).toBeDefined();
      expect(result.gameState?.food).toBe(100);
      expect(result.gameState?.currentLocationId).toBe('paris');
    });
  });
});
