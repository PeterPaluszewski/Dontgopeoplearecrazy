# Backpacking Game - Setup Guide

This guide will help you set up the full development environment for the backpacking game.

## 1. Supabase Setup

### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: backpacking-game (or your preferred name)
   - **Database Password**: Save this securely
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development

### Get API Credentials

1. Go to Project Settings → API
2. Copy these values to your `.env.local` file:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Database Schema

Run this SQL in the Supabase SQL Editor (Database → SQL Editor):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Locations table
CREATE TABLE locations (
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
CREATE TABLE items (
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
CREATE TABLE game_states (
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
CREATE TABLE game_events (
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

-- Enable Row Level Security
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events ENABLE ROW LEVEL SECURITY;

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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for game_states updated_at
CREATE TRIGGER update_game_states_updated_at
  BEFORE UPDATE ON game_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Seed Initial Data (Optional)

Add some starting locations and items:

```sql
-- Insert starting locations
INSERT INTO locations (name, description, latitude, longitude, difficulty_multiplier, travel_days) VALUES
  ('Paris', 'The City of Light, a perfect starting point for your backpacking adventure.', 48.8566, 2.3522, 1.0, 0),
  ('Barcelona', 'Mediterranean paradise with stunning architecture.', 41.3851, 2.1734, 1.2, 2),
  ('Berlin', 'Historic city with vibrant culture and nightlife.', 52.5200, 13.4050, 1.1, 3),
  ('Rome', 'Ancient ruins meet modern Italian charm.', 41.9028, 12.4964, 1.3, 2),
  ('Amsterdam', 'Canals, bicycles, and historic charm.', 52.3676, 4.9041, 1.0, 1);

-- Connect locations (example: Paris connects to Barcelona, Berlin, Amsterdam)
UPDATE locations SET connected_location_ids = ARRAY[
  (SELECT id FROM locations WHERE name = 'Barcelona'),
  (SELECT id FROM locations WHERE name = 'Berlin'),
  (SELECT id FROM locations WHERE name = 'Amsterdam')
] WHERE name = 'Paris';

-- Insert basic items
INSERT INTO items (name, description, weight, food_value, item_type) VALUES
  ('Granola Bar', 'Quick energy boost', 0.1, 10, 'FOOD'),
  ('Trail Mix', 'Nutritious snack', 0.2, 15, 'FOOD'),
  ('Sandwich', 'Filling meal', 0.3, 25, 'FOOD');

INSERT INTO items (name, description, weight, water_value, item_type) VALUES
  ('Water Bottle', 'Stay hydrated', 0.5, 20, 'WATER'),
  ('Sports Drink', 'Electrolytes included', 0.5, 15, 'WATER');

INSERT INTO items (name, description, weight, energy_value, item_type) VALUES
  ('Sleeping Bag', 'Rest comfortably', 2.0, 30, 'EQUIPMENT'),
  ('Energy Drink', 'Instant energy', 0.3, 25, 'CONSUMABLE');
```

## 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit `.env.local` to git. It's already in `.gitignore`.

## 3. Authentication Setup

Supabase Auth is already configured. To enable email authentication:

1. Go to Authentication → Settings in Supabase
2. Enable Email provider
3. Configure email templates if desired
4. For development, you can disable email confirmation

## 4. Running the Application

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Next Development Steps

1. **Create Auth Pages**: Login and registration forms in `src/app/auth/`
2. **Build Globe Component**: Interactive 3D globe in `src/components/Globe/`
3. **Create Game UI**: Resource bars, inventory panel in `src/components/UI/`
4. **Implement Game Logic**: Travel mechanics, random events, resource consumption
5. **Add Save/Load**: Connect Zustand store to Supabase for cloud saves

## 6. Deployment

When ready to deploy:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel project settings
4. Configure Supabase Auth redirect URLs:
   - Add your Vercel URL to "Site URL" in Supabase Auth settings
   - Add `https://your-app.vercel.app/auth/callback` to "Redirect URLs"

## Troubleshooting

### Supabase Connection Issues

- Verify environment variables are set correctly
- Check Supabase project is not paused (free tier pauses after inactivity)
- Ensure API keys are copied correctly

### Three.js Errors

- Three.js only works in browser, not during SSR
- Use dynamic imports with `ssr: false` for globe component

### Database Errors

- Run database schema SQL before trying to query
- Check RLS policies if getting permission errors
- Verify foreign key relationships are correct

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)
