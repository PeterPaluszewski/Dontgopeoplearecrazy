/**
 * apply-connection-rules.ts
 *
 * Fetches all locations from Supabase, runs the connection rules engine
 * (generateConnections), then upserts the full set of connections into:
 *   - location_connections          (one row per city pair)
 *   - connection_transport_types    (one row per city pair × transport slug)
 *
 * Existing rows are preserved or updated; orphaned rows (pairs that no
 * longer satisfy any rule) are deleted so the DB stays in sync.
 *
 * Usage:
 *   npx tsx scripts/apply-connection-rules.ts
 *   npx tsx scripts/apply-connection-rules.ts --dry-run
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (preferred — bypasses RLS)
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  (fallback)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { generateConnections, TRANSPORT_RULES, type CityInput } from '../src/lib/connection-rules';

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

const isDryRun = process.argv.includes('--dry-run');

const envPath = join(__dirname, '..', '.env.local');
const envVars: Record<string, string> = Object.fromEntries(
  readFileSync(envPath, 'utf-8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => {
      const idx = l.indexOf('=');
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  envVars.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌  Missing Supabase credentials in .env.local');
  process.exit(1);
}

if (!envVars.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '⚠️  Using anon key — you may hit RLS errors. Add SUPABASE_SERVICE_ROLE_KEY to .env.local for seeding.\n'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

if (isDryRun) {
  console.log('🔍  DRY RUN — no writes will be performed\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // ------------------------------------------------------------------
  // 1. Load all locations
  // ------------------------------------------------------------------
  console.log('📍  Fetching locations…');
  const { data: locations, error: locErr } = await supabase
    .from('locations')
    .select('id, name, latitude, longitude, is_coastal, region');

  if (locErr || !locations) {
    console.error('❌  Failed to fetch locations:', locErr);
    process.exit(1);
  }
  console.log(`    ${locations.length} locations loaded\n`);

  const cities: CityInput[] = locations.map((l) => ({
    id: l.id as string,
    name: l.name as string,
    latitude: l.latitude as number,
    longitude: l.longitude as number,
    isCoastal: l.is_coastal as boolean,
    region: (l.region as string) ?? 'unknown',
  }));

  // ------------------------------------------------------------------
  // 2. Load transport type slug → id map
  // ------------------------------------------------------------------
  const { data: transportTypes, error: ttErr } = await supabase
    .from('transport_types')
    .select('id, slug');

  if (ttErr || !transportTypes) {
    console.error('❌  Failed to fetch transport_types:', ttErr);
    process.exit(1);
  }

  const slugToId: Record<string, string> = Object.fromEntries(
    transportTypes.map((t) => [t.slug as string, t.id as string])
  );

  // Warn about any rules whose slug isn't in the DB yet
  for (const rule of TRANSPORT_RULES) {
    if (!slugToId[rule.slug]) {
      console.warn(`⚠️  transport_types row missing for slug "${rule.slug}" — skipping`);
    }
  }

  // ------------------------------------------------------------------
  // 3. Run the rules engine
  // ------------------------------------------------------------------
  console.log('⚙️   Running connection rules engine…');
  const generated = generateConnections(cities);

  // Group by (fromId, toId) so we can upsert connections first, then slugs
  const pairMap = new Map<
    string,
    { fromId: string; toId: string; distanceKm: number; slugs: string[] }
  >();
  for (const conn of generated) {
    const key = `${conn.fromId}|${conn.toId}`;
    if (!pairMap.has(key)) {
      pairMap.set(key, {
        fromId: conn.fromId,
        toId: conn.toId,
        distanceKm: conn.distanceKm,
        slugs: [],
      });
    }
    pairMap.get(key)!.slugs.push(conn.transportSlug);
  }

  const pairs = Array.from(pairMap.values());
  console.log(`    ${generated.length} transport connections across ${pairs.length} city pairs\n`);

  // Summary table
  const bySlug: Record<string, number> = {};
  for (const c of generated) bySlug[c.transportSlug] = (bySlug[c.transportSlug] ?? 0) + 1;
  console.log('    Breakdown by transport type:');
  for (const [slug, count] of Object.entries(bySlug).sort()) {
    console.log(`      ${slug.padEnd(16)} ${count} connections`);
  }
  console.log();

  if (isDryRun) {
    console.log('🔍  Dry run complete — no DB writes performed.');
    return;
  }

  // ------------------------------------------------------------------
  // 4. Upsert location_connections
  //    We upsert in batches to stay within Supabase payload limits.
  // ------------------------------------------------------------------
  console.log('💾  Upserting location_connections…');

  const connectionRows = pairs.map((p) => ({
    from_id: p.fromId,
    to_id: p.toId,
    distance_km: Math.round(p.distanceKm),
    is_bidirectional: true,
  }));

  // Map (fromId|toId) → connection row id, built from upsert responses
  const connIdMap = new Map<string, string>();

  const BATCH = 200;
  for (let i = 0; i < connectionRows.length; i += BATCH) {
    const batch = connectionRows.slice(i, i + BATCH);
    const { data: upserted, error } = await supabase
      .from('location_connections')
      .upsert(batch, { onConflict: 'from_id,to_id' })
      .select('id, from_id, to_id');
    if (error) {
      console.error(`❌  Error upserting connections batch ${i / BATCH + 1}:`, error);
      process.exit(1);
    }
    for (const row of upserted ?? []) {
      connIdMap.set(`${row.from_id}|${row.to_id}`, row.id as string);
    }
  }
  console.log(`    ✅  ${connectionRows.length} connection rows upserted\n`);

  // ------------------------------------------------------------------
  // 5. Fetch any remaining IDs not returned by upsert (shouldn't happen,
  //    but guard against Supabase not returning all rows in .select())
  // ------------------------------------------------------------------
  if (connIdMap.size < connectionRows.length) {
    const { data: dbConns, error: dbConnErr } = await supabase
      .from('location_connections')
      .select('id, from_id, to_id');
    if (dbConnErr || !dbConns) {
      console.error('❌  Failed to reload connection ids:', dbConnErr);
      process.exit(1);
    }
    for (const row of dbConns) {
      connIdMap.set(`${row.from_id}|${row.to_id}`, row.id as string);
    }
  }

  // ------------------------------------------------------------------
  // 6. Upsert connection_transport_types
  // ------------------------------------------------------------------
  console.log('💾  Upserting connection_transport_types…');

  const cttRows: { connection_id: string; transport_type_id: string; is_forward: boolean }[] = [];

  for (const pair of pairs) {
    const connId = connIdMap.get(`${pair.fromId}|${pair.toId}`);
    if (!connId) {
      console.warn(
        `⚠️  No connection row found for ${pair.fromId} | ${pair.toId} — skipping transport types`
      );
      continue;
    }
    for (const slug of pair.slugs) {
      const ttId = slugToId[slug];
      if (!ttId) continue; // already warned above
      // All connections are bidirectional; we insert is_forward=TRUE only.
      // The game queries by connection id regardless of direction.
      cttRows.push({ connection_id: connId, transport_type_id: ttId, is_forward: true });
    }
  }

  for (let i = 0; i < cttRows.length; i += BATCH) {
    const batch = cttRows.slice(i, i + BATCH);
    const { error } = await supabase
      .from('connection_transport_types')
      .upsert(batch, { onConflict: 'connection_id,transport_type_id,is_forward' });
    if (error) {
      console.error(`❌  Error upserting transport types batch ${i / BATCH + 1}:`, error);
      process.exit(1);
    }
  }
  console.log(`    ✅  ${cttRows.length} transport-type rows upserted\n`);

  // ------------------------------------------------------------------
  // 7. Delete orphaned connections (pairs no longer in ruleset)
  // ------------------------------------------------------------------
  console.log('🧹  Removing orphaned connections…');

  const validPairKeys = new Set(pairs.map((p) => `${p.fromId}|${p.toId}`));
  // connIdMap contains every pair currently in DB (built from upsert + fallback fetch)
  const orphanIds: string[] = [];
  for (const [key, id] of connIdMap.entries()) {
    if (!validPairKeys.has(key)) orphanIds.push(id);
  }

  if (orphanIds.length === 0) {
    console.log('    ✅  No orphaned connections\n');
  } else {
    // connection_transport_types rows cascade-delete via FK, so just delete the parent
    const { error } = await supabase.from('location_connections').delete().in('id', orphanIds);
    if (error) {
      console.error('❌  Error deleting orphaned connections:', error);
      process.exit(1);
    }
    console.log(`    ✅  Deleted ${orphanIds.length} orphaned connection(s)\n`);
  }

  // ------------------------------------------------------------------
  // 8. Final summary
  // ------------------------------------------------------------------
  const { count } = await supabase
    .from('location_connections')
    .select('*', { count: 'exact', head: true });

  console.log(`✨  Done! DB now has ${count} location connections.`);
}

main().catch((err) => {
  console.error('❌  Unexpected error:', err);
  process.exit(1);
});
