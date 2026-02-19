-- Migration: Regenerate connections starting with walking (on_foot)
-- Walking criteria: distance <= 500 km, speed = 5 km/h
-- Cross-water routes excluded (London-Paris, Amsterdam-London)
--
-- Walking pairs:
--   Budapest  <-> Vienna    214 km
--   Prague    <-> Vienna    251 km
--   Berlin    <-> Prague    281 km
--   Amsterdam <-> Paris     430 km
--   Budapest  <-> Prague    442 km

-- 1. Wipe existing connection data
DELETE FROM connection_transport_types;
DELETE FROM location_connections;

-- 2. Insert location_connections (bidirectional, one row per pair)
WITH loc AS (
  SELECT id, name FROM locations
  WHERE name IN ('Budapest','Vienna','Prague','Berlin','Amsterdam','Paris')
)
INSERT INTO location_connections (id, from_id, to_id, distance_km, is_bidirectional)
SELECT
  gen_random_uuid(),
  a.id,
  b.id,
  dist.km,
  TRUE
FROM (VALUES
  ('Budapest',  'Vienna',    214),
  ('Prague',    'Vienna',    251),
  ('Berlin',    'Prague',    281),
  ('Amsterdam', 'Paris',     430),
  ('Budapest',  'Prague',    442)
) AS dist(city_a, city_b, km)
JOIN loc a ON a.name = dist.city_a
JOIN loc b ON b.name = dist.city_b;

-- 3. Insert connection_transport_types for on_foot on every new connection
INSERT INTO connection_transport_types (id, connection_id, transport_type_id, is_forward, cost_multiplier_override)
SELECT
  gen_random_uuid(),
  lc.id,
  tt.id,
  TRUE,
  NULL
FROM location_connections lc
CROSS JOIN (SELECT id FROM transport_types WHERE slug = 'on_foot') tt;
