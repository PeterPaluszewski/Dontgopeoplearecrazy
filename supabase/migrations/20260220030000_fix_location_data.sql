-- ============================================================
-- Fix location data: deduplicate rows, assign regions, fix is_coastal
-- ============================================================

-- STEP 1: Deduplicate locations
-- UUIDs don't support MIN(), so we use ctid (physical row) to pick one survivor per name.
-- Keep the row with the smallest ctid for each name; delete all others.

-- First remove FK references from location_connections that point to duplicate rows.
DELETE FROM location_connections
WHERE from_id IN (
  SELECT id FROM locations
  WHERE ctid NOT IN (
    SELECT MIN(ctid) FROM locations GROUP BY name
  )
)
OR to_id IN (
  SELECT id FROM locations
  WHERE ctid NOT IN (
    SELECT MIN(ctid) FROM locations GROUP BY name
  )
);

DELETE FROM locations
WHERE ctid NOT IN (
  SELECT MIN(ctid) FROM locations GROUP BY name
);

-- ============================================================
-- STEP 2: Assign regions
-- ============================================================

-- Europe (mainland)
UPDATE locations SET region = 'europe_mainland' WHERE name IN (
  'Paris', 'Barcelona', 'Berlin', 'Rome', 'Amsterdam', 'Prague', 'Vienna',
  'Budapest', 'Lisbon', 'Madrid', 'Milan', 'Munich', 'Hamburg', 'Warsaw',
  'Brussels', 'Bucharest', 'Sofia', 'Athens', 'Moscow', 'Saint Petersburg',
  'Istanbul', 'Ankara'
);

-- British Isles
UPDATE locations SET region = 'british_isles' WHERE name IN ('London', 'Dublin');

-- North Africa
UPDATE locations SET region = 'north_africa' WHERE name IN (
  'Cairo', 'Alexandria', 'Casablanca', 'Algiers', 'Tunis', 'Khartoum'
);

-- Sub-Saharan Africa
UPDATE locations SET region = 'sub_saharan_africa' WHERE name IN (
  'Lagos', 'Kinshasa', 'Johannesburg', 'Nairobi', 'Dar es Salaam', 'Addis Ababa'
);

-- North America (USA, Canada, Mexico, Caribbean)
UPDATE locations SET region = 'north_america' WHERE name IN (
  'New York', 'Los Angeles', 'Chicago', 'Toronto', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Montreal',
  'Mexico City', 'Guadalajara', 'Monterrey', 'Havana', 'Santo Domingo'
);

-- Central America (nothing in seed list, reserved for future)

-- South America
UPDATE locations SET region = 'south_america' WHERE name IN (
  'São Paulo', 'Rio de Janeiro', 'Buenos Aires', 'Lima', 'Bogotá',
  'Santiago', 'Brasília', 'Caracas', 'Salvador', 'Fortaleza'
);

-- Asia mainland
UPDATE locations SET region = 'asia_mainland' WHERE name IN (
  'Delhi', 'Shanghai', 'Mumbai', 'Beijing', 'Dhaka', 'Karachi',
  'Chongqing', 'Bangkok', 'Kolkata', 'Tianjin', 'Guangzhou', 'Shenzhen',
  'Seoul', 'Chennai', 'Lahore', 'Bangalore', 'Ho Chi Minh City', 'Hyderabad',
  'Tehran', 'Chengdu', 'Wuhan', 'Ahmedabad', 'Hangzhou', 'Hong Kong',
  'Xi''an', 'Surat', 'Nanjing', 'Riyadh', 'Baghdad', 'Pune',
  'Yangon', 'Shenyang', 'Suzhou'
);

-- Japan (island nation — separate region so overland between Japan and mainland is blocked)
UPDATE locations SET region = 'japan' WHERE name IN ('Tokyo', 'Osaka');

-- Indonesia (island nation)
UPDATE locations SET region = 'indonesia' WHERE name IN ('Jakarta');

-- Philippines (island nation)
UPDATE locations SET region = 'philippines' WHERE name IN ('Manila');

-- Singapore (island city-state)
UPDATE locations SET region = 'singapore' WHERE name IN ('Singapore');

-- Australia
UPDATE locations SET region = 'australia' WHERE name IN (
  'Sydney', 'Melbourne', 'Brisbane', 'Perth'
);

-- New Zealand
UPDATE locations SET region = 'new_zealand' WHERE name IN ('Auckland');

-- ============================================================
-- STEP 3: Fix is_coastal
-- ============================================================

-- Set all to FALSE first (many inland cities were incorrectly TRUE or unknown)
UPDATE locations SET is_coastal = FALSE;

-- Europe coastal
UPDATE locations SET is_coastal = TRUE WHERE name IN (
  'Barcelona',    -- Mediterranean coast
  'Lisbon',       -- Atlantic coast
  'Amsterdam',    -- North Sea / coastal canals
  'Hamburg',      -- North Sea port
  'Athens',       -- Aegean Sea
  'Istanbul',     -- Bosphorus / Marmara Sea
  'Marseille',    -- Mediterranean (not in seed but future-safe)
  'Rome'          -- near Tyrrhenian Sea coast (coastal city broadly)
);

-- British Isles coastal
UPDATE locations SET is_coastal = TRUE WHERE name IN (
  'London'        -- Thames estuary, major port
);

-- North Africa coastal
UPDATE locations SET is_coastal = TRUE WHERE name IN (
  'Alexandria',   -- Mediterranean
  'Casablanca',   -- Atlantic
  'Algiers',      -- Mediterranean
  'Tunis',        -- Mediterranean
  'Cairo'         -- Nile Delta / near Suez (not strictly coastal but very close)
);

-- Sub-Saharan Africa coastal
UPDATE locations SET is_coastal = TRUE WHERE name IN (
  'Lagos',        -- Atlantic coast
  'Dar es Salaam', -- Indian Ocean
  'Kinshasa'      -- Congo River (not ocean, keep FALSE — revert)
);
UPDATE locations SET is_coastal = FALSE WHERE name = 'Kinshasa';

-- Asia coastal / port cities
UPDATE locations SET is_coastal = TRUE WHERE name IN (
  'Shanghai',     -- Yangtze River mouth / East China Sea
  'Mumbai',       -- Arabian Sea
  'Karachi',      -- Arabian Sea
  'Bangkok',      -- Gulf of Thailand
  'Manila',       -- Manila Bay (South China Sea) — also marked by philippines region
  'Tianjin',      -- Bohai Sea
  'Guangzhou',    -- Pearl River Delta / South China Sea
  'Shenzhen',     -- South China Sea
  'Jakarta',      -- Java Sea
  'Chennai',      -- Bay of Bengal
  'Ho Chi Minh City', -- near South China Sea
  'Hong Kong',    -- South China Sea
  'Singapore',    -- Strait of Malacca
  'Yangon',       -- Irrawaddy Delta / Andaman Sea
  'Kolkata',      -- Bay of Bengal
  'Dhaka',        -- near Bay of Bengal (river delta)
  'Riyadh'        -- inland, keep FALSE
);
UPDATE locations SET is_coastal = FALSE WHERE name = 'Riyadh';
UPDATE locations SET is_coastal = FALSE WHERE name = 'Dhaka';  -- inland delta city

-- Japan coastal
UPDATE locations SET is_coastal = TRUE WHERE name IN (
  'Tokyo',        -- Tokyo Bay / Pacific
  'Osaka'         -- Osaka Bay
);

-- South America coastal
UPDATE locations SET is_coastal = TRUE WHERE name IN (
  'Rio de Janeiro',  -- Atlantic
  'Lima',            -- Pacific
  'Caracas',         -- Caribbean (port La Guaira nearby, keep TRUE)
  'Salvador',        -- Atlantic coast of Brazil
  'Fortaleza',       -- Atlantic coast of Brazil
  'Buenos Aires'     -- Río de la Plata (estuary, major port)
);

-- North America coastal
UPDATE locations SET is_coastal = TRUE WHERE name IN (
  'New York',     -- Atlantic
  'Los Angeles',  -- Pacific
  'Houston',      -- Gulf of Mexico
  'San Diego',    -- Pacific
  'Havana',       -- Caribbean
  'Santo Domingo', -- Caribbean
  'Monterrey'     -- inland, revert
);
UPDATE locations SET is_coastal = FALSE WHERE name = 'Monterrey';

-- Oceania coastal (all major cities are coastal)
UPDATE locations SET is_coastal = TRUE WHERE name IN (
  'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Auckland'
);

-- Confirm Ankara is inland (it was patched earlier but double-check)
UPDATE locations SET is_coastal = FALSE WHERE name = 'Ankara';
