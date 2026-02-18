-- Update connections between cities based on geographic proximity
-- This connects each city to 3-5 nearest cities for travel

-- Helper: Update connections for each city
-- This needs to be run after the initial insert to get the UUIDs

DO $$
DECLARE
    city_record RECORD;
    nearby_cities uuid[];
BEGIN
    -- For each city, find 3-5 nearest cities and create bidirectional connections
    FOR city_record IN SELECT id, name, latitude, longitude FROM locations
    LOOP
        -- Find 5 nearest cities using Haversine distance approximation
        SELECT ARRAY_AGG(l2.id) INTO nearby_cities
        FROM locations l2
        WHERE l2.id != city_record.id
        ORDER BY (
            -- Simplified distance calculation (not exact Haversine but close enough)
            SQRT(
                POW(l2.latitude - city_record.latitude, 2) + 
                POW(l2.longitude - city_record.longitude, 2)
            )
        ) ASC
        LIMIT 5;

        -- Update the city's connections
        UPDATE locations
        SET connected_location_ids = nearby_cities
        WHERE id = city_record.id;
    END LOOP;
END $$;

-- Display connection summary
SELECT 
    name,
    latitude,
    longitude,
    ARRAY_LENGTH(connected_location_ids, 1) as num_connections
FROM locations
ORDER BY name;
