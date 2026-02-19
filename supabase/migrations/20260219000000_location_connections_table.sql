-- ============================================
-- Migration 004: Location Connections Table
-- ============================================
-- Moves connections out of the connected_location_ids UUID[] column on
-- locations and into a dedicated location_connections table.
-- This allows connections to carry their own properties (transport_type,
-- difficulty_modifier, distance_km, etc.) and be queried efficiently.
--
-- Run in Supabase SQL Editor.

-- ============================================
-- 1. CREATE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS location_connections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id       UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  to_id         UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  -- Future-proof columns for connection properties
  transport_type TEXT DEFAULT 'any',   -- e.g. 'train', 'bus', 'flight', 'any'
  distance_km    REAL,                 -- approximate overland distance
  difficulty_modifier REAL DEFAULT 1.0, -- multiplier on top of location difficulty
  is_bidirectional BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent duplicate directed pairs
  UNIQUE (from_id, to_id)
);

-- ============================================
-- 2. MIGRATE DATA FROM connected_location_ids
-- ============================================
-- Expand the UUID[] array column into rows.
-- We use UNNEST so every entry in the array becomes a row.
-- We only insert the (from → to) direction; the reverse may already exist
-- from the other location's array, so ON CONFLICT DO NOTHING deduplicates.

INSERT INTO location_connections (from_id, to_id)
SELECT l.id AS from_id, UNNEST(l.connected_location_ids) AS to_id
FROM   locations l
WHERE  l.connected_location_ids IS NOT NULL
  AND  array_length(l.connected_location_ids, 1) > 0
ON CONFLICT (from_id, to_id) DO NOTHING;

-- ============================================
-- 3. DROP OLD COLUMN
-- ============================================

ALTER TABLE locations DROP COLUMN IF EXISTS connected_location_ids;

-- ============================================
-- 4. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_location_connections_from ON location_connections(from_id);
CREATE INDEX IF NOT EXISTS idx_location_connections_to   ON location_connections(to_id);

-- ============================================
-- 5. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE location_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Location connections are viewable by everyone" ON location_connections;

CREATE POLICY "Location connections are viewable by everyone"
  ON location_connections FOR SELECT
  USING (true);

-- ============================================
-- 6. VERIFY
-- ============================================

SELECT
  f.name AS from_location,
  t.name AS to_location,
  lc.transport_type,
  lc.is_bidirectional
FROM location_connections lc
JOIN locations f ON f.id = lc.from_id
JOIN locations t ON t.id = lc.to_id
ORDER BY f.name, t.name;
