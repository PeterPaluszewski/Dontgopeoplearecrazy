-- Migration: Add menu system fields to game_states
-- Date: February 14, 2026
-- Description: Adds difficulty and character_name fields to support new game configuration

-- Add difficulty column to game_states
ALTER TABLE game_states 
ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('easy', 'normal', 'hard'));

-- Add character_name column to game_states
ALTER TABLE game_states 
ADD COLUMN IF NOT EXISTS character_name TEXT;

-- Create user_settings table for persistent settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Audio settings
  audio_music INTEGER DEFAULT 70 CHECK (audio_music >= 0 AND audio_music <= 100),
  audio_sfx INTEGER DEFAULT 80 CHECK (audio_sfx >= 0 AND audio_sfx <= 100),
  audio_muted BOOLEAN DEFAULT false,
  
  -- Graphics settings
  graphics_quality TEXT DEFAULT 'medium' CHECK (graphics_quality IN ('low', 'medium', 'high')),
  particle_effects BOOLEAN DEFAULT true,
  shadows BOOLEAN DEFAULT true,
  
  -- Gameplay settings
  auto_save_frequency TEXT DEFAULT 'every_travel' CHECK (auto_save_frequency IN ('every_travel', 'every_5min', 'manual')),
  tutorial_hints BOOLEAN DEFAULT true,
  danger_warnings BOOLEAN DEFAULT true,
  
  -- Accessibility settings
  text_size TEXT DEFAULT 'medium' CHECK (text_size IN ('small', 'medium', 'large')),
  high_contrast BOOLEAN DEFAULT false,
  colorblind_mode BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Add RLS policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own settings
CREATE POLICY "Users can view own settings"
  ON user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own settings
CREATE POLICY "Users can insert own settings"
  ON user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own settings
CREATE POLICY "Users can update own settings"
  ON user_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own settings
CREATE POLICY "Users can delete own settings"
  ON user_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE user_settings IS 'Stores user-specific game settings and preferences';
COMMENT ON COLUMN game_states.difficulty IS 'Game difficulty level: easy, normal, or hard';
COMMENT ON COLUMN game_states.character_name IS 'Optional player-chosen character name';
