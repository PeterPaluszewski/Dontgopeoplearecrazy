# Database Migrations - Top 100 Cities

## Overview

These migration files add the top 100 biggest cities in the world to the locations table, replacing the original 10 European cities.

## Files

1. **20260215_add_top_100_cities.sql** - Inserts 100 major cities across all continents
2. **20260215_add_city_connections.sql** - Establishes connections between nearby cities

## City Distribution

- **Asia**: 40 cities (Tokyo, Delhi, Shanghai, Mumbai, Beijing, etc.)
- **Europe**: 20 cities (London, Paris, Moscow, Berlin, Madrid, etc.)
- **North America**: 15 cities (Mexico City, New York, Los Angeles, etc.)
- **South America**: 10 cities (São Paulo, Lima, Bogotá, Rio, Buenos Aires, etc.)
- **Africa**: 10 cities (Cairo, Lagos, Kinshasa, Johannesburg, etc.)
- **Oceania**: 5 cities (Sydney, Melbourne, Brisbane, Perth, Auckland)

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `20260215_add_top_100_cities.sql`
4. Copy the contents and paste into SQL Editor
5. Click **Run** to execute
6. Repeat for `20260215_add_city_connections.sql`

### Option 2: Supabase CLI

```bash
# Make sure you're in the project root
cd c:\Users\peter\code\Dontgopeoplearecrazy

# Apply the migrations
supabase db push

# Or apply individually
supabase db execute -f supabase/migrations/20260215_add_top_100_cities.sql
supabase db execute -f supabase/migrations/20260215_add_city_connections.sql
```

## Connection Logic

Each city is connected to its 5 nearest cities based on geographic proximity using a simplified distance calculation. This creates a realistic travel network where:

- Adjacent cities are connected (e.g., Paris ↔ London)
- Regional hubs have more connections
- Intercontinental travel requires strategic planning

## Travel Difficulty Levels

Cities are assigned difficulty multipliers based on:

- **2.0-2.2**: Major global cities (Tokyo, Singapore, NYC, London, Paris, Sydney)
- **1.8-1.9**: Large developed cities (Seoul, Berlin, Melbourne, LA, Milan)
- **1.5-1.7**: Mid-tier cities (Cairo, Santiago, Warsaw, Houston)
- **1.2-1.4**: Challenging cities (Kinshasa, Baghdad, Yangon, Caracas)

## Verification

After running migrations, verify with:

```sql
-- Check total city count
SELECT COUNT(*) FROM locations;
-- Should return 100

-- Check average connections per city
SELECT AVG(ARRAY_LENGTH(connected_location_ids, 1)) FROM locations;
-- Should be around 5

-- View cities by continent (rough grouping by longitude)
SELECT 
    CASE 
        WHEN longitude BETWEEN -180 AND -30 THEN 'Americas'
        WHEN longitude BETWEEN -30 AND 60 THEN 'Europe/Africa'
        ELSE 'Asia/Oceania'
    END as region,
    COUNT(*) as city_count
FROM locations
GROUP BY region;
```

## Data Sources

City data based on:
- Population rankings from UN World Urbanization Prospects
- Coordinates from OpenStreetMap / Google Maps
- Descriptions crafted for gameplay interest

## Next Steps

After applying migrations:

1. **Test in game** - Load game and verify globe shows all 100 cities
2. **Check connections** - Ensure travel options appear for each city
3. **Balance testing** - Verify difficulty multipliers feel appropriate
4. **Performance** - Confirm 100 markers don't slow down globe rendering

## Troubleshooting

**Issue**: Cities appear but no connections
- **Fix**: Run `20260215_add_city_connections.sql` again

**Issue**: Duplicate cities
- **Fix**: Run `DELETE FROM locations; SELECT setval('locations_id_seq', 1, false);` then re-run migrations

**Issue**: Old 10 cities still appear
- **Fix**: Comment out the DELETE in the first migration if you want to keep them, or run it to replace them

## Development Plan Update

Update `DEVELOPMENT_PLAN.md` to reflect:
- ✅ 100 cities across all continents (was 10 European cities)
- ✅ Dynamic connection system based on proximity
- ✅ Balanced difficulty ratings for global travel
