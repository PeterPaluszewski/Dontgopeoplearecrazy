-- Migration: Add region column to locations
-- 
-- Each location gets a region slug that identifies its overland landmass.
-- Two cities sharing the same region can be connected by land-based transport
-- (on_foot, bicycle, hitchhike, car, rickshaw, tuk_tuk).
-- Different regions always require a water crossing.
--
-- Suggested region slugs (extend as new cities are added):
--   europe_mainland  — Continental Europe
--   british_isles    — UK, Ireland
--   north_africa     — Morocco → Egypt (overland connected)
--   sub_saharan_africa
--   north_america    — USA, Canada, Mexico
--   central_america
--   south_america
--   asia_mainland    — Russia/China/India/SE Asia (all overland-connected)
--   japan
--   indonesia
--   philippines
--   australia
--   new_zealand

ALTER TABLE locations
  ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT 'unknown';

CREATE INDEX IF NOT EXISTS idx_locations_region ON locations(region);

-- Seed regions for the current 10 European cities
-- London is on a separate island from Continental Europe
UPDATE locations SET region = 'british_isles'   WHERE name = 'London';
UPDATE locations SET region = 'europe_mainland' WHERE name IN (
  'Paris', 'Barcelona', 'Berlin', 'Rome',
  'Amsterdam', 'Prague', 'Vienna', 'Budapest', 'Lisbon'
);
