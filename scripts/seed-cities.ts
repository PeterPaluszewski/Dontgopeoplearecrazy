/**
 * Seed script to add top 100 cities to the database
 * Run with: npx tsx scripts/seed-cities.ts
 * 
 * Make sure to set these environment variables:
 * NEXT_PUBLIC_SUPABASE_URL
 * NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
const envPath = join(__dirname, '..', '.env.local');
const envFile = readFileSync(envPath, 'utf-8');
const envVars: Record<string, string> = {};

envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Prefer service role key to bypass RLS, fall back to anon key
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and either:');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY (recommended for seeding)');
  console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.warn('⚠️  Using anon key - you may encounter RLS policy errors');
  console.warn('   For seeding, get your service_role key from:');
  console.warn('   Supabase Dashboard > Settings > API > service_role key');
  console.warn('   Then add to .env.local: SUPABASE_SERVICE_ROLE_KEY=your_key\n');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const cities = [
  // Asia (40 cities)
  { name: 'Tokyo', description: 'Japan\'s bustling capital, a blend of traditional and ultra-modern', latitude: 35.6762, longitude: 139.6503, difficulty_multiplier: 2.0 },
  { name: 'Delhi', description: 'India\'s capital territory with rich Mughal heritage', latitude: 28.6139, longitude: 77.2090, difficulty_multiplier: 1.8 },
  { name: 'Shanghai', description: 'China\'s global financial hub and largest city', latitude: 31.2304, longitude: 121.4737, difficulty_multiplier: 1.9 },
  { name: 'Mumbai', description: 'India\'s financial capital and Bollywood center', latitude: 19.0760, longitude: 72.8777, difficulty_multiplier: 1.7 },
  { name: 'Beijing', description: 'China\'s capital with ancient and modern landmarks', latitude: 39.9042, longitude: 116.4074, difficulty_multiplier: 1.8 },
  { name: 'Dhaka', description: 'Bangladesh\'s vibrant capital on the Ganges Delta', latitude: 23.8103, longitude: 90.4125, difficulty_multiplier: 1.6 },
  { name: 'Osaka', description: 'Japan\'s kitchen, known for street food and nightlife', latitude: 34.6937, longitude: 135.5023, difficulty_multiplier: 1.9 },
  { name: 'Karachi', description: 'Pakistan\'s largest city and economic hub', latitude: 24.8607, longitude: 67.0011, difficulty_multiplier: 1.5 },
  { name: 'Chongqing', description: 'China\'s mountain city with spicy cuisine', latitude: 29.4316, longitude: 106.9123, difficulty_multiplier: 1.7 },
  { name: 'Istanbul', description: 'Turkey\'s cultural bridge between Europe and Asia', latitude: 41.0082, longitude: 28.9784, difficulty_multiplier: 1.6 },
  { name: 'Bangkok', description: 'Thailand\'s vibrant capital with temples and markets', latitude: 13.7563, longitude: 100.5018, difficulty_multiplier: 1.5 },
  { name: 'Kolkata', description: 'India\'s cultural capital and City of Joy', latitude: 22.5726, longitude: 88.3639, difficulty_multiplier: 1.6 },
  { name: 'Manila', description: 'Philippines\' capital with Spanish colonial history', latitude: 14.5995, longitude: 120.9842, difficulty_multiplier: 1.5 },
  { name: 'Tianjin', description: 'China\'s port city near Beijing', latitude: 39.3434, longitude: 117.3616, difficulty_multiplier: 1.7 },
  { name: 'Guangzhou', description: 'China\'s southern trading hub', latitude: 23.1291, longitude: 113.2644, difficulty_multiplier: 1.7 },
  { name: 'Shenzhen', description: 'China\'s tech innovation capital', latitude: 22.5431, longitude: 114.0579, difficulty_multiplier: 1.8 },
  { name: 'Seoul', description: 'South Korea\'s dynamic capital with K-pop culture', latitude: 37.5665, longitude: 126.9780, difficulty_multiplier: 1.9 },
  { name: 'Jakarta', description: 'Indonesia\'s sprawling capital city', latitude: 6.2088, longitude: 106.8456, difficulty_multiplier: 1.5 },
  { name: 'Chennai', description: 'India\'s gateway to South India', latitude: 13.0827, longitude: 80.2707, difficulty_multiplier: 1.6 },
  { name: 'Lahore', description: 'Pakistan\'s cultural heart with Mughal architecture', latitude: 31.5497, longitude: 74.3436, difficulty_multiplier: 1.5 },
  { name: 'Bangalore', description: 'India\'s Silicon Valley and garden city', latitude: 12.9716, longitude: 77.5946, difficulty_multiplier: 1.7 },
  { name: 'Ho Chi Minh City', description: 'Vietnam\'s economic powerhouse, formerly Saigon', latitude: 10.8231, longitude: 106.6297, difficulty_multiplier: 1.4 },
  { name: 'Hyderabad', description: 'India\'s city of pearls and IT hub', latitude: 17.3850, longitude: 78.4867, difficulty_multiplier: 1.6 },
  { name: 'Tehran', description: 'Iran\'s capital at the foot of Alborz mountains', latitude: 35.6892, longitude: 51.3890, difficulty_multiplier: 1.5 },
  { name: 'Chengdu', description: 'China\'s panda capital with spicy Sichuan food', latitude: 30.5728, longitude: 104.0668, difficulty_multiplier: 1.6 },
  { name: 'Wuhan', description: 'China\'s thoroughfare city on Yangtze River', latitude: 30.5928, longitude: 114.3055, difficulty_multiplier: 1.7 },
  { name: 'Ahmedabad', description: 'India\'s first UNESCO World Heritage City', latitude: 23.0225, longitude: 72.5714, difficulty_multiplier: 1.5 },
  { name: 'Hangzhou', description: 'China\'s paradise city with West Lake', latitude: 30.2741, longitude: 120.1551, difficulty_multiplier: 1.7 },
  { name: 'Hong Kong', description: 'Special Administrative Region with stunning skyline', latitude: 22.3193, longitude: 114.1694, difficulty_multiplier: 2.0 },
  { name: 'Xi\'an', description: 'China\'s ancient capital, home of Terracotta Army', latitude: 34.3416, longitude: 108.9398, difficulty_multiplier: 1.6 },
  { name: 'Surat', description: 'India\'s diamond and textile hub', latitude: 21.1702, longitude: 72.8311, difficulty_multiplier: 1.5 },
  { name: 'Nanjing', description: 'China\'s southern capital with rich history', latitude: 32.0603, longitude: 118.7969, difficulty_multiplier: 1.7 },
  { name: 'Riyadh', description: 'Saudi Arabia\'s modern capital in the desert', latitude: 24.7136, longitude: 46.6753, difficulty_multiplier: 1.6 },
  { name: 'Baghdad', description: 'Iraq\'s ancient capital on the Tigris', latitude: 33.3152, longitude: 44.3661, difficulty_multiplier: 1.3 },
  { name: 'Pune', description: 'India\'s Oxford of the East', latitude: 18.5204, longitude: 73.8567, difficulty_multiplier: 1.6 },
  { name: 'Singapore', description: 'Modern city-state and financial center', latitude: 1.3521, longitude: 103.8198, difficulty_multiplier: 2.2 },
  { name: 'Yangon', description: 'Myanmar\'s former capital with golden pagodas', latitude: 16.8661, longitude: 96.1951, difficulty_multiplier: 1.3 },
  { name: 'Shenyang', description: 'China\'s northeastern industrial city', latitude: 41.8057, longitude: 123.4315, difficulty_multiplier: 1.6 },
  { name: 'Suzhou', description: 'China\'s Venice with classical gardens', latitude: 31.2989, longitude: 120.5853, difficulty_multiplier: 1.7 },
  { name: 'Ankara', description: 'Turkey\'s capital in Anatolia', latitude: 39.9334, longitude: 32.8597, difficulty_multiplier: 1.5 },

  // Africa (10 cities)
  { name: 'Cairo', description: 'Egypt\'s capital with ancient pyramids nearby', latitude: 30.0444, longitude: 31.2357, difficulty_multiplier: 1.4 },
  { name: 'Lagos', description: 'Nigeria\'s bustling economic capital', latitude: 6.5244, longitude: 3.3792, difficulty_multiplier: 1.3 },
  { name: 'Kinshasa', description: 'Democratic Republic of Congo\'s capital', latitude: 4.4419, longitude: 15.2663, difficulty_multiplier: 1.2 },
  { name: 'Johannesburg', description: 'South Africa\'s economic powerhouse', latitude: -26.2041, longitude: 28.0473, difficulty_multiplier: 1.6 },
  { name: 'Khartoum', description: 'Sudan\'s capital at the Nile confluence', latitude: 15.5007, longitude: 32.5599, difficulty_multiplier: 1.2 },
  { name: 'Alexandria', description: 'Egypt\'s Mediterranean port city', latitude: 31.2001, longitude: 29.9187, difficulty_multiplier: 1.4 },
  { name: 'Nairobi', description: 'Kenya\'s capital and safari gateway', latitude: -1.2864, longitude: 36.8172, difficulty_multiplier: 1.4 },
  { name: 'Dar es Salaam', description: 'Tanzania\'s largest city and port', latitude: -6.7924, longitude: 39.2083, difficulty_multiplier: 1.3 },
  { name: 'Casablanca', description: 'Morocco\'s economic capital on Atlantic', latitude: 33.5731, longitude: -7.5898, difficulty_multiplier: 1.5 },
  { name: 'Addis Ababa', description: 'Ethiopia\'s high-altitude capital', latitude: 9.0320, longitude: 38.7469, difficulty_multiplier: 1.3 },

  // South America (10 cities)
  { name: 'São Paulo', description: 'Brazil\'s massive financial center', latitude: -23.5505, longitude: -46.6333, difficulty_multiplier: 1.5 },
  { name: 'Lima', description: 'Peru\'s capital with colonial architecture', latitude: -12.0464, longitude: -77.0428, difficulty_multiplier: 1.4 },
  { name: 'Bogotá', description: 'Colombia\'s high-altitude capital', latitude: 4.7110, longitude: -74.0721, difficulty_multiplier: 1.4 },
  { name: 'Rio de Janeiro', description: 'Brazil\'s beach city with Christ the Redeemer', latitude: -22.9068, longitude: -43.1729, difficulty_multiplier: 1.6 },
  { name: 'Santiago', description: 'Chile\'s capital with Andes backdrop', latitude: -33.4489, longitude: -70.6693, difficulty_multiplier: 1.5 },
  { name: 'Buenos Aires', description: 'Argentina\'s Paris of South America', latitude: -34.6037, longitude: -58.3816, difficulty_multiplier: 1.6 },
  { name: 'Brasília', description: 'Brazil\'s modernist planned capital', latitude: -15.8267, longitude: -47.9218, difficulty_multiplier: 1.5 },
  { name: 'Caracas', description: 'Venezuela\'s mountain-ringed capital', latitude: 10.4806, longitude: -66.9036, difficulty_multiplier: 1.2 },
  { name: 'Salvador', description: 'Brazil\'s Afro-Brazilian cultural capital', latitude: -12.9714, longitude: -38.5014, difficulty_multiplier: 1.4 },
  { name: 'Fortaleza', description: 'Brazil\'s northeastern beach city', latitude: -3.7172, longitude: -38.5433, difficulty_multiplier: 1.3 },

  // North America (15 cities)
  { name: 'Mexico City', description: 'Mexico\'s massive capital with Aztec ruins', latitude: 19.4326, longitude: -99.1332, difficulty_multiplier: 1.5 },
  { name: 'New York', description: 'USA\'s global metropolis and financial hub', latitude: 40.7128, longitude: -74.0060, difficulty_multiplier: 2.0 },
  { name: 'Los Angeles', description: 'USA\'s entertainment capital', latitude: 34.0522, longitude: -118.2437, difficulty_multiplier: 1.8 },
  { name: 'Chicago', description: 'USA\'s Windy City on Lake Michigan', latitude: 41.8781, longitude: -87.6298, difficulty_multiplier: 1.7 },
  { name: 'Toronto', description: 'Canada\'s multicultural metropolis', latitude: 43.6532, longitude: -79.3832, difficulty_multiplier: 1.8 },
  { name: 'Houston', description: 'USA\'s space city and energy capital', latitude: 29.7604, longitude: -95.3698, difficulty_multiplier: 1.6 },
  { name: 'Havana', description: 'Cuba\'s colorful capital with vintage cars', latitude: 23.1136, longitude: -82.3666, difficulty_multiplier: 1.3 },
  { name: 'Guadalajara', description: 'Mexico\'s cultural heartland', latitude: 20.6597, longitude: -103.3496, difficulty_multiplier: 1.4 },
  { name: 'Phoenix', description: 'USA\'s desert metropolis', latitude: 33.4484, longitude: -112.0740, difficulty_multiplier: 1.6 },
  { name: 'Philadelphia', description: 'USA\'s birthplace of independence', latitude: 39.9526, longitude: -75.1652, difficulty_multiplier: 1.7 },
  { name: 'Santo Domingo', description: 'Dominican Republic\'s oldest European city in Americas', latitude: 18.4861, longitude: -69.9312, difficulty_multiplier: 1.3 },
  { name: 'Monterrey', description: 'Mexico\'s industrial capital', latitude: 25.6866, longitude: -100.3161, difficulty_multiplier: 1.4 },
  { name: 'San Antonio', description: 'USA\'s Texan city with Spanish missions', latitude: 29.4241, longitude: -98.4936, difficulty_multiplier: 1.5 },
  { name: 'San Diego', description: 'USA\'s sunny coastal city', latitude: 32.7157, longitude: -117.1611, difficulty_multiplier: 1.7 },
  { name: 'Dallas', description: 'USA\'s Texan business hub', latitude: 32.7767, longitude: -96.7970, difficulty_multiplier: 1.6 },

  // Europe (20 cities)
  { name: 'London', description: 'UK\'s historic capital on the Thames', latitude: 51.5074, longitude: -0.1278, difficulty_multiplier: 2.0 },
  { name: 'Paris', description: 'France\'s City of Light and romance', latitude: 48.8566, longitude: 2.3522, difficulty_multiplier: 2.0 },
  { name: 'Moscow', description: 'Russia\'s capital with Red Square', latitude: 55.7558, longitude: 37.6173, difficulty_multiplier: 1.7 },
  { name: 'Berlin', description: 'Germany\'s reunified capital', latitude: 52.5200, longitude: 13.4050, difficulty_multiplier: 1.8 },
  { name: 'Madrid', description: 'Spain\'s vibrant capital', latitude: 40.4168, longitude: -3.7038, difficulty_multiplier: 1.7 },
  { name: 'Rome', description: 'Italy\'s Eternal City', latitude: 41.9028, longitude: 12.4964, difficulty_multiplier: 1.8 },
  { name: 'Barcelona', description: 'Spain\'s Catalan coastal gem', latitude: 41.3874, longitude: 2.1686, difficulty_multiplier: 1.8 },
  { name: 'Saint Petersburg', description: 'Russia\'s cultural capital with canals', latitude: 59.9343, longitude: 30.3351, difficulty_multiplier: 1.7 },
  { name: 'Vienna', description: 'Austria\'s imperial capital of music', latitude: 48.2082, longitude: 16.3738, difficulty_multiplier: 1.8 },
  { name: 'Milan', description: 'Italy\'s fashion and finance capital', latitude: 45.4642, longitude: 9.1900, difficulty_multiplier: 1.8 },
  { name: 'Bucharest', description: 'Romania\'s "Little Paris" of the East', latitude: 44.4268, longitude: 26.1025, difficulty_multiplier: 1.5 },
  { name: 'Athens', description: 'Greece\'s ancient capital with Acropolis', latitude: 37.9838, longitude: 23.7275, difficulty_multiplier: 1.6 },
  { name: 'Hamburg', description: 'Germany\'s port city with canals', latitude: 53.5511, longitude: 9.9937, difficulty_multiplier: 1.7 },
  { name: 'Warsaw', description: 'Poland\'s rebuilt capital', latitude: 52.2297, longitude: 21.0122, difficulty_multiplier: 1.6 },
  { name: 'Budapest', description: 'Hungary\'s Pearl of the Danube', latitude: 47.4979, longitude: 19.0402, difficulty_multiplier: 1.6 },
  { name: 'Munich', description: 'Germany\'s Bavarian capital', latitude: 48.1351, longitude: 11.5820, difficulty_multiplier: 1.8 },
  { name: 'Prague', description: 'Czech Republic\'s fairytale capital', latitude: 50.0755, longitude: 14.4378, difficulty_multiplier: 1.7 },
  { name: 'Sofia', description: 'Bulgaria\'s ancient capital', latitude: 42.6977, longitude: 23.3219, difficulty_multiplier: 1.4 },
  { name: 'Brussels', description: 'Belgium\'s European capital', latitude: 50.8503, longitude: 4.3517, difficulty_multiplier: 1.8 },
  { name: 'Amsterdam', description: 'Netherlands\' canal-ringed capital', latitude: 52.3676, longitude: 4.9041, difficulty_multiplier: 1.9 },

  // Oceania (5 cities)
  { name: 'Sydney', description: 'Australia\'s harbor city with Opera House', latitude: -33.8688, longitude: 151.2093, difficulty_multiplier: 2.0 },
  { name: 'Melbourne', description: 'Australia\'s cultural capital', latitude: -37.8136, longitude: 144.9631, difficulty_multiplier: 1.9 },
  { name: 'Brisbane', description: 'Australia\'s sunny river city', latitude: -27.4698, longitude: 153.0251, difficulty_multiplier: 1.8 },
  { name: 'Perth', description: 'Australia\'s isolated western capital', latitude: -31.9505, longitude: 115.8605, difficulty_multiplier: 1.8 },
  { name: 'Auckland', description: 'New Zealand\'s City of Sails', latitude: -36.8485, longitude: 174.7633, difficulty_multiplier: 1.9 },
];

// Calculate distance between two points (simplified)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2));
}

async function main() {
  console.log('🌍 Starting city seeding process...\n');

  // Step 1: Insert all cities
  console.log('📍 Inserting 100 cities...');
  const { data: insertedCities, error: insertError } = await supabase
    .from('locations')
    .insert(cities.map(city => ({
      ...city,
      travel_days: 0,
      connected_location_ids: []
    })))
    .select();

  if (insertError) {
    console.error('❌ Error inserting cities:', insertError);
    process.exit(1);
  }

  console.log(`✅ Inserted ${insertedCities?.length || 0} cities\n`);

  // Step 2: Calculate and update connections
  console.log('🔗 Calculating nearest neighbor connections...');
  
  if (!insertedCities) {
    console.error('❌ No cities to connect');
    process.exit(1);
  }

  let connectionsUpdated = 0;

  for (const city of insertedCities) {
    // Find 5 nearest cities
    const distances = insertedCities
      .filter(c => c.id !== city.id)
      .map(c => ({
        id: c.id,
        distance: calculateDistance(city.latitude, city.longitude, c.latitude, c.longitude)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    const nearbyIds = distances.map(d => d.id);

    // Update connections
    const { error: updateError } = await supabase
      .from('locations')
      .update({ connected_location_ids: nearbyIds })
      .eq('id', city.id);

    if (updateError) {
      console.error(`❌ Error updating connections for ${city.name}:`, updateError);
    } else {
      connectionsUpdated++;
    }
  }

  console.log(`✅ Updated connections for ${connectionsUpdated} cities\n`);

  // Step 3: Verify
  const { data: verifyData, error: verifyError } = await supabase
    .from('locations')
    .select('id, name, connected_location_ids');

  if (verifyError) {
    console.error('❌ Error verifying cities:', verifyError);
    process.exit(1);
  }

  const avgConnections = verifyData
    ? verifyData.reduce((sum, city) => sum + (city.connected_location_ids?.length || 0), 0) / verifyData.length
    : 0;

  console.log('📊 Final Statistics:');
  console.log(`   Total cities: ${verifyData?.length || 0}`);
  console.log(`   Average connections per city: ${avgConnections.toFixed(1)}`);
  console.log('\n✨ City seeding complete!');
}

main().catch(console.error);
