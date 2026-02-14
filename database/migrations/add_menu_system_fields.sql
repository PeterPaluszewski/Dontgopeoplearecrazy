-- Add difficulty and character_name to game_states table
ALTER TABLE game_states 
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'normal' CHECK (difficulty IN ('easy', 'normal', 'hard')),
ADD COLUMN IF NOT EXISTS character_name TEXT;

-- Create user_settings table for storing user preferences
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  audio_music INT DEFAULT 70 CHECK (audio_music >= 0 AND audio_music <= 100),
  audio_sfx INT DEFAULT 80 CHECK (audio_sfx >= 0 AND audio_sfx <= 100),
  audio_muted BOOLEAN DEFAULT false,
  graphics_quality TEXT DEFAULT 'medium' CHECK (graphics_quality IN ('low', 'medium', 'high')),
  particle_effects BOOLEAN DEFAULT true,
  shadows BOOLEAN DEFAULT true,
  auto_save_frequency TEXT DEFAULT 'every_travel' CHECK (auto_save_frequency IN ('every_travel', 'every_5min', 'manual')),
  tutorial_hints BOOLEAN DEFAULT true,
  danger_warnings BOOLEAN DEFAULT true,
  text_size TEXT DEFAULT 'medium' CHECK (text_size IN ('small', 'medium', 'large')),
  high_contrast BOOLEAN DEFAULT false,
  colorblind_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own settings
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);

-- Add updated_at trigger for user_settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at 
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE user_settings IS 'Stores user preferences for audio, graphics, gameplay, and accessibility settings';
