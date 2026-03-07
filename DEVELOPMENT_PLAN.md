# Development Plan

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **3D Graphics**: Three.js with React Three Fiber
- **State Management**: Zustand
- **Testing**: Vitest + Testing Library + Playwright (E2E)
- **Deployment**: Vercel

## Current Status

**Production URL**: https://dontgopeoplearecrazy.vercel.app
**Tests**: 352 passing, 9 skipped
**Branch**: `world-setup` (active development)

### Completed

- **Phase 1–2**: Project setup — Next.js, TypeScript, Tailwind, ESLint/Prettier, Husky, Vitest
- **Phase 3**: Supabase schema — locations, items, game_events, game_states, RLS policies
- **Phase 4**: Authentication — login/register pages, Supabase Auth, OAuth callback, protected routes
- **Phase 5**: 3D Globe — Earth texture, OrbitControls, coordinate math, dynamic import (no SSR)
- **Phase 6–7**: Game UI — ResourcePanel, InventoryPanel, LocationInfo, TravelModal, EventModal
- **Phase 8**: Travel system — cost formula, random events (30%), resource validation
- **Phase 9**: Save/Load — auto-save, manual save, multiple slots, Supabase persistence
- **Phase 10**: Production deployment — Vercel + CI/CD + environment variables
- **Phase 11**: Globe UX + World Expansion + Route Planner (see detail below)

### Phase 11 Detail

#### Done

**Globe UX**

- `calculateGlobeQuaternion` — rotates globe to face current location on load
- `CountryBordersOverlay` — auto-shows at `camera.z <= 3` (zoomed in)
- `ConnectionLines` — three rendering layers: gray base, amber single-hop highlight, violet route arcs
- Connection display scoped to current location only (reduced visual noise)
- Selected-city focal point — base layer connections update when a city marker is clicked
- `LocationMarker` dynamic scale based on camera distance (`useFrame`)
- Compass/heading debug overlay (toggleable)
- E2E tests (Playwright) — login page load + unauthenticated redirect

**World Expansion**

- 101 world cities across all continents (was 10 European)
- `region` field added to locations; `location-utils.ts` helpers (`getLocationsByRegion`, `getDefaultLocation`, etc.)
- NewGameModal region picker — choose starting continent before starting a new game

**Route Planner**

- `route-utils.ts`: `areDirectlyConnected`, `getRouteTail`, `canAppendToRoute`, `appendToRoute`
- Ctrl+click to build multi-hop routes; auto-seeds selected city as first waypoint on first Ctrl+click
- Violet arcs drawn per leg; amber arc suppressed when route is active
- Waypoint markers rendered in violet; route panel shows full leg list
- Travel Here button gated on direct connection (no route) or being the active route's first waypoint
- "Travel to {city}" button in route panel travels leg by leg; route advances after each travel

#### Still To Do

- Animated globe camera pan to destination when travelling
- Travel progress indicator (days elapsed, resources draining in real time)
- Location/region-aware events (events filtered by city or region)
- Weather / season modifiers on travel cost
- Danger zone warnings before confirming travel

### In Progress / Planned

#### Phase 12: Auth Flow Improvements

- Add `src/middleware.ts` using `createServerClient` from `@supabase/ssr` to eliminate auth flash on protected pages
- Shared auth context / `useAuth` hook to avoid duplicating `getUser()` per page
- Full-screen loading skeleton during auth check
- Update E2E tests for no-flash behaviour

#### Phase 13: Travel Experience

- Animated globe camera pan to destination on travel
- Travel progress indicator (days elapsed, live resource drain)
- Location/region-aware events
- Weather / season modifiers on travel cost
- Danger zone warnings before confirming travel

#### Future Ideas

See `IDEAS.md` for the backlog.

## Architecture Notes

### Key Data Flow

1. **Supabase** is the source of truth — locations, items, events, game state persistence.
2. **`src/lib/database.ts`** — all read queries; manually maps snake_case → camelCase.
3. **`src/lib/save-load.ts`** — upserts/inserts to `game_states`.
4. **`src/store/gameStore.ts`** — Zustand in-memory state; `saveGame` / `loadGameFromDB` delegate to `save-load.ts`.
5. **`src/app/game/page.tsx`** — orchestrates: auth check → load game → fetch locations → render.

### Globe Rendering Pipeline

- `ConnectionLines` builds GPU `BufferGeometry` from `Segment[]` arrays (three layers: gray base, amber single-hop, violet route arcs).
- `LocationMarker` scales with camera distance via `useFrame`.
- Globe radius = **2 units**; `arcSegments = 32` per connection.

### Travel Cost Formula

```
cost = ceil(baseCost * travelDays * (1 + (difficulty - 1) * 0.25))
Base: food 15, water 20, energy 25 per day
```

### Route Planner

- `src/lib/route-utils.ts`: `areDirectlyConnected`, `getRouteTail`, `canAppendToRoute`, `appendToRoute`
- Route state lives in `game/page.tsx` as `routeLocationIds: string[]`
- Amber arc suppressed when route active; violet arcs drawn per leg
- Base connection layer focal = route tail → selected → current

## Development Commands

```bash
npm run dev           # Start dev server
npm run type-check    # tsc --noEmit
npm run test          # Run all tests
npm run test:unit     # Unit tests only (SKIP_INTEGRATION_TESTS=true)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage (thresholds: 80% lines/statements, 75% branches/functions)
npm run test:e2e      # Playwright E2E (requires running dev server)
npm run lint          # ESLint
```

## Testing Conventions

- Vitest + `@testing-library/react` + jest-dom; setup in `src/test/setup.ts`
- Test files co-located with source: `Component.test.tsx` / `module.test.ts`
- Store tests use `useGameStore.getState()` directly — no render needed; call `resetGame()` between cases
- After every set of changes: `npm run type-check ; npm run test -- --run`
- Run only the affected test file first for fast feedback, then the full combined run at the end
