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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  difficulty_multiplier REAL DEFAULT 1.0,
  is_coastal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location connections table
CREATE TABLE IF NOT EXISTS location_connections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id       UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  to_id         UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  distance_km    REAL,
  difficulty_modifier REAL DEFAULT 1.0,
  is_bidirectional BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (from_id, to_id)
);

-- Transport types table
CREATE TABLE IF NOT EXISTS transport_types (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                 TEXT NOT NULL UNIQUE,
  name                 TEXT NOT NULL,
  speed_kmh            REAL NOT NULL,
  base_cost_multiplier REAL NOT NULL DEFAULT 1.0,
  requires_item_slug   TEXT,
  requires_coastal     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connection transport types junction table
CREATE TABLE IF NOT EXISTS connection_transport_types (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id            UUID NOT NULL REFERENCES location_connections(id) ON DELETE CASCADE,
  transport_type_id        UUID NOT NULL REFERENCES transport_types(id) ON DELETE CASCADE,
  is_forward               BOOLEAN NOT NULL DEFAULT TRUE,
  cost_multiplier_override REAL,
  created_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (connection_id, transport_type_id, is_forward)
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
ALTER TABLE location_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_transport_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Locations are viewable by everyone" ON locations;
DROP POLICY IF EXISTS "Location connections are viewable by everyone" ON location_connections;
DROP POLICY IF EXISTS "Transport types are viewable by everyone" ON transport_types;
DROP POLICY IF EXISTS "Connection transport types are viewable by everyone" ON connection_transport_types;
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

-- Policies for location_connections (public read)
CREATE POLICY "Location connections are viewable by everyone"
  ON location_connections FOR SELECT
  USING (true);

-- Policies for transport_types (public read)
CREATE POLICY "Transport types are viewable by everyone"
  ON transport_types FOR SELECT
  USING (true);

-- Policies for connection_transport_types (public read)
CREATE POLICY "Connection transport types are viewable by everyone"
  ON connection_transport_types FOR SELECT
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

INSERT INTO locations (name, description, latitude, longitude, difficulty_multiplier, is_coastal) VALUES
  ('Paris', 'The City of Light, a perfect starting point for your backpacking adventure. Explore the Eiffel Tower, Louvre, and charming cafés.', 48.8566, 2.3522, 1.0, FALSE),
  ('Barcelona', 'Mediterranean paradise with stunning architecture by Gaudí. Beaches, tapas, and vibrant nightlife await.', 41.3851, 2.1734, 1.2, TRUE),
  ('Berlin', 'Historic city with vibrant culture and nightlife. Museums, street art, and diverse neighborhoods.', 52.5200, 13.4050, 1.1, FALSE),
  ('Rome', 'Ancient ruins meet modern Italian charm. The Colosseum, Vatican, and authentic pasta everywhere.', 41.9028, 12.4964, 1.3, FALSE),
  ('Amsterdam', 'Canals, bicycles, and historic charm. Museums, tulips, and friendly locals.', 52.3676, 4.9041, 1.0, FALSE),
  ('Prague', 'Fairy-tale city with Gothic architecture and affordable prices. Castle, bridges, and beer gardens.', 50.0755, 14.4378, 1.1, FALSE),
  ('Vienna', 'Imperial grandeur and classical music. Palaces, coffee houses, and rich cultural heritage.', 48.2082, 16.3738, 1.2, FALSE),
  ('Budapest', 'Thermal baths and stunning views along the Danube. Ruin bars and hearty Hungarian cuisine.', 47.4979, 19.0402, 1.1, FALSE),
  ('London', 'Historic capital with world-class museums and diverse culture. Expensive but worth the visit.', 51.5074, -0.1278, 1.5, FALSE),
  ('Lisbon', 'Coastal charm with colorful tiles and steep hills. Pastéis de nata and fado music.', 38.7223, -9.1393, 1.1, TRUE)
ON CONFLICT DO NOTHING;

-- Seed transport types
INSERT INTO transport_types (slug, name, speed_kmh, base_cost_multiplier, requires_item_slug, requires_coastal) VALUES
  ('on_foot',      'On Foot',      5,   1.2,  NULL,       FALSE),
  ('bicycle',      'Bicycle',      15,  1.0,  'bicycle',  FALSE),
  ('rickshaw',     'Rickshaw',     12,  1.1,  NULL,       FALSE),
  ('tuk_tuk',      'Tuk-Tuk',      30,  1.0,  NULL,       FALSE),
  ('car',          'Car',          90,  0.8,  'car',      FALSE),
  ('hitchhike',    'Hitchhike',    80,  0.7,  NULL,       FALSE),
  ('sailboat',     'Sailboat',     20,  1.3,  'sailboat', TRUE),
  ('freight_ship', 'Freight Ship', 30,  1.1,  NULL,       TRUE),
  ('cruise_ship',  'Cruise Ship',  40,  0.6,  NULL,       TRUE),
  ('plane',        'Plane',        800, 0.4,  NULL,       FALSE)
ON CONFLICT (slug) DO NOTHING;

-- Connect locations via the location_connections table
-- is_bidirectional = TRUE (default) so each row covers both directions.
INSERT INTO location_connections (from_id, to_id) VALUES
  -- Paris connections
  ((SELECT id FROM locations WHERE name = 'Paris'),     (SELECT id FROM locations WHERE name = 'London')),
  ((SELECT id FROM locations WHERE name = 'Paris'),     (SELECT id FROM locations WHERE name = 'Amsterdam')),
  ((SELECT id FROM locations WHERE name = 'Paris'),     (SELECT id FROM locations WHERE name = 'Berlin')),
  ((SELECT id FROM locations WHERE name = 'Paris'),     (SELECT id FROM locations WHERE name = 'Barcelona')),
  -- Barcelona connections (Paris already covered above)
  ((SELECT id FROM locations WHERE name = 'Barcelona'), (SELECT id FROM locations WHERE name = 'Rome')),
  ((SELECT id FROM locations WHERE name = 'Barcelona'), (SELECT id FROM locations WHERE name = 'Lisbon')),
  -- Berlin connections (Paris, Amsterdam already covered)
  ((SELECT id FROM locations WHERE name = 'Berlin'),    (SELECT id FROM locations WHERE name = 'Amsterdam')),
  ((SELECT id FROM locations WHERE name = 'Berlin'),    (SELECT id FROM locations WHERE name = 'Prague')),
  ((SELECT id FROM locations WHERE name = 'Berlin'),    (SELECT id FROM locations WHERE name = 'Vienna')),
  -- Rome connections (Barcelona already covered)
  ((SELECT id FROM locations WHERE name = 'Rome'),      (SELECT id FROM locations WHERE name = 'Vienna')),
  ((SELECT id FROM locations WHERE name = 'Rome'),      (SELECT id FROM locations WHERE name = 'Budapest')),
  -- Amsterdam connections (Paris, Berlin already covered)
  ((SELECT id FROM locations WHERE name = 'Amsterdam'), (SELECT id FROM locations WHERE name = 'London')),
  -- Prague connections (Berlin already covered)
  ((SELECT id FROM locations WHERE name = 'Prague'),    (SELECT id FROM locations WHERE name = 'Vienna')),
  ((SELECT id FROM locations WHERE name = 'Prague'),    (SELECT id FROM locations WHERE name = 'Budapest')),
  -- Vienna connections (Berlin, Rome, Prague already covered)
  ((SELECT id FROM locations WHERE name = 'Vienna'),    (SELECT id FROM locations WHERE name = 'Budapest')),
  -- London connections (Paris, Amsterdam already covered)
  -- Lisbon connections (Barcelona already covered)
  -- Budapest connections (all already covered)
  -- (no new edges needed)
  ((SELECT id FROM locations WHERE name = 'Lisbon'),    (SELECT id FROM locations WHERE name = 'Paris'))
ON CONFLICT (from_id, to_id) DO NOTHING;

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
SELECT name, latitude, longitude, is_coastal FROM locations ORDER BY name;

-- Check transport types
SELECT slug, name, speed_kmh, requires_item_slug, requires_coastal FROM transport_types ORDER BY speed_kmh;

-- Check items
SELECT name, item_type, food_value, water_value, energy_value FROM items ORDER BY item_type, name;

-- Check events
SELECT title, event_type FROM game_events ORDER BY title;

-- Check RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('locations', 'items', 'game_states', 'game_events');

-- Success message
SELECT '✅ Database setup complete! Your backpacking game is ready.' AS status;
