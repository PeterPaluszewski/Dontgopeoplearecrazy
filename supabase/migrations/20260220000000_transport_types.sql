-- ============================================================
-- Migration: Transport Types
-- ============================================================
-- Introduces a transport_types table and a connection_transport_types
-- junction table so each location connection can advertise which
-- modes of transport are available, in which direction.
--
-- Also adds is_coastal to locations and drops the now-superseded
-- transport_type TEXT column from location_connections.
-- ============================================================


-- ============================================================
-- 1. ADD is_coastal TO locations
-- ============================================================

ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS is_coastal BOOLEAN NOT NULL DEFAULT FALSE;


-- ============================================================
-- 2. CREATE transport_types TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS transport_types (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                   TEXT NOT NULL UNIQUE,   -- machine-readable key used in code
  name                   TEXT NOT NULL,          -- display name shown to player
  speed_kmh              REAL NOT NULL,          -- used to derive travel_days = ceil(distance_km / speed_kmh / 24)
  base_cost_multiplier   REAL NOT NULL DEFAULT 1.0, -- scales food/water/energy cost
  requires_item_slug     TEXT,                   -- nullable; item slug player must have in inventory
  requires_coastal       BOOLEAN NOT NULL DEFAULT FALSE, -- if TRUE both endpoints must be coastal
  created_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- 3. CREATE connection_transport_types JUNCTION TABLE
-- ============================================================
-- Each row says "this transport type is available on this connection
-- in this direction".  is_forward = TRUE means from_id → to_id.

CREATE TABLE IF NOT EXISTS connection_transport_types (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id            UUID NOT NULL REFERENCES location_connections(id) ON DELETE CASCADE,
  transport_type_id        UUID NOT NULL REFERENCES transport_types(id) ON DELETE CASCADE,
  is_forward               BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE = from→to, FALSE = to→from
  cost_multiplier_override REAL,                          -- nullable per-connection override
  created_at               TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (connection_id, transport_type_id, is_forward)
);


-- ============================================================
-- 4. DROP transport_type TEXT COLUMN FROM location_connections
-- ============================================================

ALTER TABLE location_connections
  DROP COLUMN IF EXISTS transport_type;


-- ============================================================
-- 5. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_ctt_connection_id     ON connection_transport_types(connection_id);
CREATE INDEX IF NOT EXISTS idx_ctt_transport_type_id ON connection_transport_types(transport_type_id);
CREATE INDEX IF NOT EXISTS idx_transport_types_slug  ON transport_types(slug);


-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE transport_types           ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_transport_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Transport types are viewable by everyone"            ON transport_types;
DROP POLICY IF EXISTS "Connection transport types are viewable by everyone" ON connection_transport_types;

CREATE POLICY "Transport types are viewable by everyone"
  ON transport_types FOR SELECT USING (true);

CREATE POLICY "Connection transport types are viewable by everyone"
  ON connection_transport_types FOR SELECT USING (true);


-- ============================================================
-- 7. SEED transport_types
-- ============================================================
-- speed_kmh values are approximate averages for gameplay balance.

INSERT INTO transport_types (slug, name, speed_kmh, base_cost_multiplier, requires_item_slug, requires_coastal) VALUES
  ('on_foot',       'On Foot',       5,    1.2,  NULL,       FALSE),
  ('bicycle',       'Bicycle',       15,   1.0,  'bicycle',  FALSE),
  ('rickshaw',      'Rickshaw',      12,   1.1,  NULL,       FALSE),
  ('tuk_tuk',       'Tuk-Tuk',       30,   1.0,  NULL,       FALSE),
  ('car',           'Car',           90,   0.8,  'car',      FALSE),
  ('hitchhike',     'Hitchhike',     80,   0.7,  NULL,       FALSE),
  ('sailboat',      'Sailboat',      20,   1.3,  'sailboat', TRUE),
  ('freight_ship',  'Freight Ship',  30,   1.1,  NULL,       TRUE),
  ('cruise_ship',   'Cruise Ship',   40,   0.6,  NULL,       TRUE),
  ('plane',         'Plane',         800,  0.4,  NULL,       FALSE)
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 8. VERIFY
-- ============================================================

SELECT slug, name, speed_kmh, requires_item_slug, requires_coastal
FROM transport_types
ORDER BY speed_kmh;
