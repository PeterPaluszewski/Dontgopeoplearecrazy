# Backpacking Game

A survival-based backpacking game built with Next.js, Supabase, and Three.js. Travel between 101 world cities on an interactive 3D globe, managing food, water, and energy resources while surviving random events.

## Live Demo

**Deployed:** https://dontgopeoplearecrazy.vercel.app

## Features

- **Interactive 3D Globe** - drag to rotate, scroll to zoom, click markers to select cities
- **101 World Cities** - spanning all continents with realistic travel connections
- **Route Planner** - Ctrl+click connected cities to plan multi-hop routes, then travel leg by leg
- **Resource Management** - food, water, and energy bars with warnings at low/critical levels
- **Inventory System** - 25 kg weight limit, use consumables to restore resources
- **Travel System** - cost preview modal, difficulty-based resource cost, validation
- **Random Events** - 30% chance during travel with resource effects and choices
- **Save / Load** - auto-save after travel, manual save/load, multiple slots per user
- **Authentication** - email/password login and registration via Supabase Auth

## Tech Stack

- **Next.js 16** - App Router, TypeScript, React 19
- **Tailwind CSS** - utility-first styling
- **Supabase** - PostgreSQL + Row Level Security + Auth
- **Three.js / React Three Fiber** - 3D globe rendering
- **Zustand** - lightweight state management
- **Vitest + Testing Library** - 352+ tests

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Setup

Apply the migrations in `supabase/migrations/` to your Supabase project via the SQL Editor, in filename order.

## Game Mechanics

### Travel Cost Formula

```
Cost = ceil(BaseCost x TravelDays x (1 + (difficulty - 1) x 0.25))

Base cost per day:  Food 15 | Water 20 | Energy 25
Difficulty 1 -> 1.0x  |  Difficulty 2 -> 1.25x  |  Difficulty 3 -> 1.5x ...
```

### Route Planner

1. Click a directly connected city to select it
2. Ctrl+click a second-level connected city to start a route
3. Keep Ctrl+clicking to extend the route
4. Use **Travel to {city}** in the route panel to travel leg by leg

## Project Structure

```
src/
  app/
    auth/             # Login, register, OAuth callback
    game/             # Main game page
    menu/             # Main menu (new game, load, settings)
  components/
    Globe/            # 3D globe, markers, connection lines, country borders
    Menu/             # InGameMenu, NewGameModal, LoadGameModal, SettingsModal
    ResourcePanel/    # Food/water/energy bars
    LocationInfo/     # Selected city details + Travel Here button
    InventoryPanel/   # Item management with weight tracking
    TravelModal/      # Travel confirmation with cost preview
    EventModal/       # Random event display with choices
  lib/
    database.ts       # Supabase read queries
    save-load.ts      # Save/load game state
    globe-utils.ts    # 3D coordinate math, marker colours
    travel-utils.ts   # Cost calculation and validation
    route-utils.ts    # Route planning (append, validate, tail)
    location-utils.ts # Region helpers, default location
    compass-utils.ts  # Heading calculations for debug overlay
    events.ts         # Random event triggering
  store/
    gameStore.ts      # Zustand: resources, inventory, travel, save/load
    settingsStore.ts  # Zustand persist: audio, graphics, gameplay settings
  types/
    game.ts           # Core TypeScript interfaces
```

## Development Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run type-check    # tsc --noEmit
npm run lint          # ESLint
npm run test          # Run all tests (Vitest)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run test:e2e      # Playwright E2E tests (requires running dev server)
```

## License

MIT
