import { createClient } from './supabase';

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'RANDOM' | 'LOCATION_BASED' | 'RESOURCE_BASED';
  food_effect: number;
  water_effect: number;
  energy_effect: number;
  choices: unknown[];
  created_at: string;
}

/**
 * Get a random event from the database
 * @param eventType Optional filter by event type
 */
export async function getRandomEvent(eventType?: string): Promise<GameEvent | null> {
  const supabase = createClient();

  let query = supabase.from('game_events').select('*');

  if (eventType) {
    query = query.eq('event_type', eventType);
  }

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    console.error('Error fetching events:', error);
    return null;
  }

  // Return a random event
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

/**
 * Trigger a random event with a probability
 * @param probability Chance of event triggering (0-1)
 * @returns Event if triggered, null otherwise
 */
export async function triggerRandomEvent(probability: number = 0.3): Promise<GameEvent | null> {
  if (Math.random() > probability) {
    return null;
  }

  return getRandomEvent('RANDOM');
}
