# Copilot Instructions

## Agent Behaviour

- When modifying or adding behaviour, create or update tests in the closest relevant test file. Run the most relevant focused tests after changes and report results. If tests are not feasible, explain why and propose an alternative verification step. Ensure all tests pass before finalizing changes.
- **After every set of code changes, always run `npm run type-check ; npm run test -- --run` as a single chained command and report the results before declaring work complete.** Do not consider a task done until both pass. Do not run them separately or multiple times — one combined run at the end is sufficient.
- **When iterating on a fix, run only the affected test file first** (`npm run test -- --run src/path/to/file.test.ts`) for fast feedback, then do the single full `type-check ; test` run once at the end.
- Keep changes minimal and consistent with existing style. Avoid unrelated refactors. Prefer root-cause fixes over surface-level patches.
- **Never use `replace_string_in_file` to rewrite an entire file.** If a file needs a full rewrite, use `run_in_terminal` with PowerShell `Set-Content` to write the new content directly, avoiding the prepend/append bugs that arise from partial-match replacements. When using `replace_string_in_file`, always verify the replacement was applied correctly by checking for duplicate `describe` blocks, duplicate imports, or orphaned code with `grep_search` before running tests.

## Project Overview

A survival backpacking game built with **Next.js 16 (App Router)**, **React 19**, **Three.js / React Three Fiber**, **Zustand**, and **Supabase** (PostgreSQL + Auth). Players travel between European cities on an interactive 3D globe, managing food/water/energy resources.

## Architecture

### Key Data Flow

1. **Supabase** is the single source of truth for locations, items, game events, and game state persistence. Auth uses `@supabase/ssr` browser client (`src/lib/supabase.ts`); there is no middleware — auth is checked client-side in each page via `supabase.auth.getUser()`.
2. **`src/lib/database.ts`** — all Supabase read queries (locations, items, events). Always manually maps snake_case DB columns to camelCase TypeScript fields — do not rely on auto-mapping (e.g. `difficulty_multiplier` → `difficultyMultiplier`).
3. **`src/lib/save-load.ts`** — save/load game state to `game_states` table; upserts when `gameState.id` exists, inserts otherwise.
4. **`src/store/gameStore.ts`** — Zustand store; in-memory game state. `saveGame()` and `loadGameFromDB()` delegate to `src/lib/save-load.ts`. Two aliased action pairs exist for compatibility: `loadGame`/`loadGameState` and `setCurrentLocation`/`setCurrentLocationId`.
5. **`src/store/settingsStore.ts`** — Zustand store with `persist` middleware; settings saved to `localStorage` under key `game-settings`.
6. **`src/app/game/page.tsx`** — orchestrates the full game: auth check → `loadGameFromDB()` → fetch locations → render Globe + panels + modals.

### Auth Flow

- Login/register at `src/app/auth/login/` and `src/app/auth/register/`. On success, redirect to `/menu`.
- OAuth callback handled at `src/app/auth/callback/`.
- Currently **no Next.js middleware** — every protected page calls `supabase.auth.getUser()` on mount and redirects to `/auth/login` if unauthenticated. This causes a brief content flash before redirect.
- Supabase project uses default auth settings (email/password only).
- **Phase 12** will add `src/middleware.ts` using `createServerClient` from `@supabase/ssr` to fix the flash. Until then, do not add middleware without also switching the auth check to the server client.

### Globe / Three.js Pattern

- **Globe** is always dynamically imported (`next/dynamic` with `ssr: false`) to avoid SSR issues with Three.js.
- `src/lib/globe-utils.ts` — coordinate math (`latLonToVector3`, `getMarkerPosition`, `calculateGlobeQuaternion`). Globe radius is **2 units**.
- `src/lib/compass-utils.ts` — heading/compass calculations for the debug overlay (toggleable in `game/page.tsx`).
- `src/data/country-borders-level3.ts` and `src/data/natural-earth-admin0.json` — static GeoJSON used by `CountryBordersOverlay`; auto-shows only when camera `z <= 3` (zoomed in).
- `LocationMarker` scales dynamically based on camera distance using `useFrame`. Default start location falls back to Paris via `getDefaultLocation()` in `src/lib/location-utils.ts`.

### Component Structure

```
src/components/
  Globe/          # Three.js canvas + sub-meshes (GlobeSphere, LocationMarker, ConnectionLines, CountryBordersOverlay)
  Menu/           # InGameMenu, NewGameModal, LoadGameModal, SettingsModal
  EventModal/     # Random event display with choices
  TravelModal/    # Travel cost preview + confirm
  InventoryPanel/ # 25kg weight limit, use/drop items
  LocationInfo/   # Current city stats
  ResourcePanel/  # food/water/energy bars with warnings
```

### Types

All core types live in **`src/types/game.ts`**: `Location`, `Item`, `InventoryItem`, `GameState`, `GameEvent`, `EventChoice`. Resources (food/water/energy) are always clamped **0–100**.

## Developer Workflows

### Commands

```bash
npm run dev           # Start dev server
npm run test          # Run all tests (Vitest)
npm run test:unit     # Unit tests only — skips Supabase integration tests (SKIP_INTEGRATION_TESTS=true)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report (thresholds: 80% lines/statements, 75% branches/functions)
npm run type-check    # tsc --noEmit
npm run lint          # ESLint
npm run test:e2e      # Playwright E2E tests (requires running dev server)
```

### Environment Variables

Requires `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Testing Conventions

- **Vitest** + `@testing-library/react` + `jest-dom`. Setup in `src/test/setup.ts` (extends `expect` with jest-dom matchers, mocks `window.matchMedia`, runs `cleanup()` after each test).
- Path alias `@/` resolves to `src/` in both app code and tests (configured in `vitest.config.ts`).
- Test files co-located with source: `ComponentName.test.tsx` / `module.test.ts` next to the file under test.
- Store tests call `useGameStore.getState()` directly — no render needed. Always call `resetGame()` between state-mutating test cases.
- There are no real Supabase integration tests currently; `SKIP_INTEGRATION_TESTS=true` is a defensive guard for future use.
- E2E tests live in `tests/e2e/` and use Playwright. Currently cover login page load and unauthenticated redirect to `/auth/login`.

## Project-Specific Patterns

- **`'use client'` directive** required on any component using Three.js hooks (`useFrame`, `useThree`) or browser APIs.
- **Logic belongs in `src/lib/`, not in `.tsx` files.** Any non-React logic (calculations, transforms, formatters, predicates) must live in a `src/lib/*.ts` util file and be exported as a pure function — not inlined inside a component or hook. This keeps it immediately testable without rendering. Example: `calculateDragRadiansPerPixel` in `globe-utils.ts` rather than inside `Globe.tsx`. Only `useEffect`, `useFrame`, event handlers, and JSX belong in component files.
- **Travel cost formula**: `cost = ceil(baseCost * travelDays * (1 + (difficulty - 1) * 0.25))` — base food: 15, water: 20, energy: 25 per day. See `src/lib/travel-utils.ts`.
- **Random events**: 30% trigger probability during travel via `triggerRandomEvent(0.3)` in `src/lib/events.ts`. `GameEvent` in `src/lib/events.ts` uses snake_case fields (raw DB shape); `GameEvent` in `src/types/game.ts` uses camelCase — these are two different types.
- **`src/lib/utils.ts`** — contains the `cn()` helper (clsx + tailwind-merge) for conditional class names.
