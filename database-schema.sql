-- ============================================
-- Backpacking Game - Database Schema
-- ============================================
-- Run this script in Supabase SQL Editor
-- Database → SQL Editor → New Query → Paste & Run

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  difficulty_multiplier REAL DEFAULT 1.0,
  travel_days INTEGER DEFAULT 1,
  connected_location_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  weight REAL DEFAULT 0,
  food_value REAL DEFAULT 0,
  water_value REAL DEFAULT 0,
  energy_value REAL DEFAULT 0,
  item_type TEXT CHECK (item_type IN ('FOOD', 'WATER', 'EQUIPMENT', 'CONSUMABLE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game states table
CREATE TABLE IF NOT EXISTS game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_location_id UUID REFERENCES locations(id),
  food REAL DEFAULT 100,
  water REAL DEFAULT 100,
  energy REAL DEFAULT 100,
  inventory JSONB DEFAULT '[]',
  visited_location_ids UUID[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game events table
CREATE TABLE IF NOT EXISTS game_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('RANDOM', 'LOCATION_BASED', 'RESOURCE_BASED')),
  food_effect REAL DEFAULT 0,
  water_effect REAL DEFAULT 0,
  energy_effect REAL DEFAULT 0,
  choices JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Locations are viewable by everyone" ON locations;
DROP POLICY IF EXISTS "Items are viewable by everyone" ON items;
DROP POLICY IF EXISTS "Users can view their own game states" ON game_states;
DROP POLICY IF EXISTS "Users can insert their own game states" ON game_states;
DROP POLICY IF EXISTS "Users can update their own game states" ON game_states;
DROP POLICY IF EXISTS "Users can delete their own game states" ON game_states;
DROP POLICY IF EXISTS "Events are viewable by everyone" ON game_events;

-- Policies for locations (public read)
CREATE POLICY "Locations are viewable by everyone"
  ON locations FOR SELECT
  USING (true);

-- Policies for items (public read)
CREATE POLICY "Items are viewable by everyone"
  ON items FOR SELECT
  USING (true);

-- Policies for game_states (user-specific)
CREATE POLICY "Users can view their own game states"
  ON game_states FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own game states"
  ON game_states FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game states"
  ON game_states FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game states"
  ON game_states FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for game_events (public read)
CREATE POLICY "Events are viewable by everyone"
  ON game_events FOR SELECT
  USING (true);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS update_game_states_updated_at ON game_states;

-- Trigger for game_states updated_at
CREATE TRIGGER update_game_states_updated_at
  BEFORE UPDATE ON game_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA - Initial Locations
-- ============================================

INSERT INTO locations (name, description, latitude, longitude, difficulty_multiplier, travel_days) VALUES
  ('Paris', 'The City of Light, a perfect starting point for your backpacking adventure. Explore the Eiffel Tower, Louvre, and charming cafés.', 48.8566, 2.3522, 1.0, 0),
  ('Barcelona', 'Mediterranean paradise with stunning architecture by Gaudí. Beaches, tapas, and vibrant nightlife await.', 41.3851, 2.1734, 1.2, 2),
  ('Berlin', 'Historic city with vibrant culture and nightlife. Museums, street art, and diverse neighborhoods.', 52.5200, 13.4050, 1.1, 3),
  ('Rome', 'Ancient ruins meet modern Italian charm. The Colosseum, Vatican, and authentic pasta everywhere.', 41.9028, 12.4964, 1.3, 2),
  ('Amsterdam', 'Canals, bicycles, and historic charm. Museums, tulips, and friendly locals.', 52.3676, 4.9041, 1.0, 1),
  ('Prague', 'Fairy-tale city with Gothic architecture and affordable prices. Castle, bridges, and beer gardens.', 50.0755, 14.4378, 1.1, 2),
  ('Vienna', 'Imperial grandeur and classical music. Palaces, coffee houses, and rich cultural heritage.', 48.2082, 16.3738, 1.2, 2),
  ('Budapest', 'Thermal baths and stunning views along the Danube. Ruin bars and hearty Hungarian cuisine.', 47.4979, 19.0402, 1.1, 3),
  ('London', 'Historic capital with world-class museums and diverse culture. Expensive but worth the visit.', 51.5074, -0.1278, 1.5, 1),
  ('Lisbon', 'Coastal charm with colorful tiles and steep hills. Pastéis de nata and fado music.', 38.7223, -9.1393, 1.1, 3)
ON CONFLICT DO NOTHING;

-- Connect locations to create a travel network
UPDATE locations SET connected_location_ids = ARRAY[
  (SELECT id FROM locations WHERE name = 'Barcelona'),
  (SELECT id FROM locations WHERE name = 'Berlin'),
  (SELECT id FROM locations WHERE name = 'Amsterdam'),
  (SELECT id FROM locations WHERE name = 'London')
] WHERE name = 'Paris';

UPDATE locations SET connected_location_ids = ARRAY[
  (SELECT id FROM locations WHERE name = 'Paris'),
  (SELECT id FROM locations WHERE name = 'Rome'),
  (SELECT id FROM locations WHERE name = 'Lisbon')
] WHERE name = 'Barcelona';

UPDATE locations SET connected_location_ids = ARRAY[
  (SELECT id FROM locations WHERE name = 'Paris'),
  (SELECT id FROM locations WHERE name = 'Amsterdam'),
  (SELECT id FROM locations WHERE name = 'Prague'),
  (SELECT id FROM locations WHERE name = 'Vienna')
] WHERE name = 'Berlin';

UPDATE locations SET connected_location_ids = ARRAY[
  (SELECT id FROM locations WHERE name = 'Barcelona'),
  (SELECT id FROM locations WHERE name = 'Vienna'),
  (SELECT id FROM locations WHERE name = 'Budapest')
] WHERE name = 'Rome';

UPDATE locations SET connected_location_ids = ARRAY[
  (SELECT id FROM locations WHERE name = 'Paris'),
  (SELECT id FROM locations WHERE name = 'Berlin'),
  (SELECT id FROM locations WHERE name = 'London')
] WHERE name = 'Amsterdam';

UPDATE locations SET connected_location_ids = ARRAY[
  (SELECT id FROM locations WHERE name = 'Berlin'),
  (SELECT id FROM locations WHERE name = 'Vienna'),
  (SELECT id FROM locations WHERE name = 'Budapest')
] WHERE name = 'Prague';

UPDATE locations SET connected_location_ids = ARRAY[
  (SELECT id FROM locations WHERE name = 'Berlin'),
  (SELECT id FROM locations WHERE name = 'Prague'),
  (SELECT id FROM locations WHERE name = 'Budapest'),
  (SELECT id FROM locations WHERE name = 'Rome')
] WHERE name = 'Vienna';

UPDATE locations SET connected_location_ids = ARRAY[
  (SELECT id FROM locations WHERE name = 'Vienna'),
  (SELECT id FROM locations WHERE name = 'Prague'),
  (SELECT id FROM locations WHERE name = 'Rome')
] WHERE name = 'Budapest';

UPDATE locations SET connected_location_ids = ARRAY[
  (SELECT id FROM locations WHERE name = 'Paris'),
  (SELECT id FROM locations WHERE name = 'Amsterdam')
] WHERE name = 'London';

UPDATE locations SET connected_location_ids = ARRAY[
  (SELECT id FROM locations WHERE name = 'Barcelona')
] WHERE name = 'Lisbon';

-- ============================================
-- SEED DATA - Initial Items
-- ============================================

-- Food items
INSERT INTO items (name, description, weight, food_value, item_type) VALUES
  ('Granola Bar', 'Quick energy boost on the go', 0.1, 10, 'FOOD'),
  ('Trail Mix', 'Nutritious blend of nuts and dried fruits', 0.2, 15, 'FOOD'),
  ('Sandwich', 'Filling meal to keep you going', 0.3, 25, 'FOOD'),
  ('Energy Bar', 'Concentrated nutrition for long journeys', 0.1, 12, 'FOOD'),
  ('Dried Fruit', 'Sweet and energizing snack', 0.15, 8, 'FOOD'),
  ('Jerky', 'Protein-packed travel snack', 0.2, 18, 'FOOD')
ON CONFLICT DO NOTHING;

-- Water items
INSERT INTO items (name, description, weight, water_value, item_type) VALUES
  ('Water Bottle', 'Essential hydration for your journey', 0.5, 20, 'WATER'),
  ('Sports Drink', 'Electrolytes to keep you refreshed', 0.5, 15, 'WATER'),
  ('Coconut Water', 'Natural hydration with electrolytes', 0.4, 18, 'WATER')
ON CONFLICT DO NOTHING;

-- Equipment (restores energy)
INSERT INTO items (name, description, weight, energy_value, item_type) VALUES
  ('Sleeping Bag', 'Get a good night''s rest anywhere', 2.0, 30, 'EQUIPMENT'),
  ('Travel Pillow', 'Comfort for better sleep', 0.5, 15, 'EQUIPMENT'),
  ('Hammock', 'Relax and recharge in nature', 1.0, 25, 'EQUIPMENT')
ON CONFLICT DO NOTHING;

-- Consumables (mixed benefits)
INSERT INTO items (name, description, weight, energy_value, item_type) VALUES
  ('Energy Drink', 'Instant boost when you need it most', 0.3, 25, 'CONSUMABLE'),
  ('Coffee', 'Wake up and stay alert', 0.2, 20, 'CONSUMABLE'),
  ('First Aid Kit', 'Stay healthy on the road', 0.5, 15, 'CONSUMABLE')
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA - Random Events
-- ============================================

INSERT INTO game_events (title, description, event_type, food_effect, water_effect, energy_effect, choices) VALUES
  (
    'Friendly Local',
    'A friendly local offers to share their lunch with you!',
    'RANDOM',
    15,
    0,
    5,
    '[]'
  ),
  (
    'Wrong Turn',
    'You took a wrong turn and had to backtrack, using extra energy.',
    'RANDOM',
    -5,
    -5,
    -15,
    '[]'
  ),
  (
    'Free Food Festival',
    'You stumble upon a free food festival! Enjoy the local cuisine.',
    'RANDOM',
    20,
    10,
    10,
    '[]'
  ),
  (
    'Hot Weather',
    'The weather is unusually hot today. You''re using more water than expected.',
    'RANDOM',
    0,
    -15,
    -5,
    '[]'
  ),
  (
    'Nice Hostel',
    'You found a great hostel with comfortable beds and free breakfast!',
    'RANDOM',
    10,
    5,
    25,
    '[]'
  ),
  (
    'Pickpocket Attempt',
    'Someone tried to pickpocket you! Luckily you noticed in time, but it was stressful.',
    'RANDOM',
    0,
    0,
    -10,
    '[]'
  ),
  (
    'Helpful Traveler',
    'Another backpacker shares some supplies with you.',
    'RANDOM',
    10,
    10,
    0,
    '[]'
  ),
  (
    'Delayed Train',
    'Your train is delayed for hours. You''re tired and hungry waiting.',
    'RANDOM',
    -10,
    -5,
    -15,
    '[]'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify your setup worked:

-- Check locations
SELECT name, latitude, longitude, travel_days FROM locations ORDER BY name;

-- Check items
SELECT name, item_type, food_value, water_value, energy_value FROM items ORDER BY item_type, name;

-- Check events
SELECT title, event_type FROM game_events ORDER BY title;

-- Check RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('locations', 'items', 'game_states', 'game_events');

-- Success message
SELECT '✅ Database setup complete! Your backpacking game is ready.' AS status;
