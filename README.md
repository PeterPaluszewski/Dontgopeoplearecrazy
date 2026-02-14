# Backpacking Game

A survival-based backpacking game built as a web application using Next.js, Supabase, and Three.js. Travel across Europe, manage your resources, and survive random events as you explore 10 major cities.

## 🎮 Current Status

**Phase 8 Complete** - Fully functional travel system with random events!

### ✅ Completed Features

- **Phase 1-2**: Project setup with comprehensive tooling
  - Next.js 14 with TypeScript, Tailwind CSS
  - ESLint, Prettier, Husky pre-commit hooks
  - Vitest testing framework (125 tests passing)
- **Phase 3**: Database & Authentication
  - Supabase PostgreSQL with Row Level Security
  - 10 European cities with connections and difficulty ratings
  - 15+ items (food, water, equipment)
  - Random events system
- **Phase 4**: Authentication System
  - Login/register pages
  - Protected routes
  - OAuth callback handling
- **Phase 5**: 3D Globe Visualization
  - Interactive Earth with Blue Marble texture
  - 10 city location markers
  - OrbitControls for rotation/zoom
- **Phase 6-7**: Game UI
  - Resource management panel (food/water/energy with warnings)
  - Location information panel (difficulty, travel time, coordinates)
  - Inventory system (25kg weight limit, use/drop items)
- **Phase 8**: Travel System
  - Travel modal with cost preview
  - Resource cost calculation (difficulty-based)
  - Random events (30% chance during travel)
  - Event modal with resource effects

### 🚧 In Progress / Next Steps

- **Phase 9**: Save/Load System
  - Connect game state to Supabase
  - Auto-save on location change
  - Manual save/load with multiple slots
- **Future Enhancements**:
  - Crafting system
  - Quest/achievement system
  - Multiplayer features
  - Mobile optimization

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Supabase** - Authentication and PostgreSQL database
- **Three.js / React Three Fiber** - 3D globe visualization
- **Zustand** - State management
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Copy `.env.local.example` to `.env.local` and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

4. Set up the database schema:

Follow the instructions in [SETUP_GUIDE.md](./SETUP_GUIDE.md) to create tables and seed data in Supabase.

## Game Mechanics

### Travel Cost Formula

Resources consumed during travel are calculated as:

```
Cost = BaseCost × TravelDays × DifficultyMultiplier

BaseCost per day:
- Food: 15
- Water: 20
- Energy: 25

DifficultyMultiplier:
- Difficulty 1: 1.0×
- Difficulty 2: 1.25×
- Difficulty 3: 1.5×
- Difficulty 4: 1.75×
- Difficulty 5: 2.0×
```

Example: Traveling to Berlin (3 days, difficulty 2):

- Food: 15 × 3 × 1.25 = 57
- Water: 20 × 3 × 1.25 = 75
- Energy: 25 × 3 × 1.25 = 94

### Cities & Connections

The game features 10 European cities with realistic travel connections:

- **Paris** → Amsterdam, Berlin, Barcelona
- **Berlin** → Paris, Prague, Vienna, Amsterdam
- **Rome** → Vienna, Athens, Barcelona
- **Madrid** → Barcelona, Paris
- **Amsterdam** → Paris, Berlin
- **Vienna** → Berlin, Prague, Budapest, Rome
- **Prague** → Berlin, Vienna, Budapest
- **Barcelona** → Madrid, Paris, Rome
- **Athens** → Rome, Budapest
- **Budapest** → Vienna, Prague, Athens

## Project Structure

```
src/
├── app/
│   ├── auth/            # Authentication pages (login, register, callback)
│   ├── game/            # Main game page with 3D globe
│   └── page.tsx         # Landing page
├── components/
│   ├── Globe/           # Three.js 3D globe with location markers
│   ├── ResourcePanel/   # Food/water/energy bars with warnings
│   ├── LocationInfo/    # Selected city details with travel button
│   ├── InventoryPanel/  # Item management with weight tracking
│   ├── TravelModal/     # Travel confirmation with cost preview
│   └── EventModal/      # Random event display with effects
├── lib/
│   ├── database.ts      # Supabase queries for locations/items
│   ├── supabase.ts      # Supabase client configuration
│   ├── globe-utils.ts   # 3D math and distance calculations
│   ├── travel-utils.ts  # Travel cost and validation logic
│   └── events.ts        # Random event system
├── store/
│   └── gameStore.ts     # Zustand state (resources, inventory, travel)
└── types/
    └── game.ts          # TypeScript interfaces
```

## Features

### 🌍 Interactive 3D Globe

- Earth Blue Marble texture
- 10 European cities: Paris, Berlin, Rome, Madrid, Amsterdam, Vienna, Prague, Barcelona, Athens, Budapest
- City markers with NEW/VISITED/CURRENT states
- Click to select, drag to rotate, scroll to zoom

### 🎒 Resource Management

- Food, Water, Energy bars (0-100)
- Warning indicators at <30% (low) and <15% (critical)
- Resources consumed during travel based on distance and difficulty

### 📦 Inventory System

- Items have weight, type (food/water/equipment), and effects
- 25kg carrying capacity with overweight warnings
- Use consumables to restore resources
- Drop items to reduce weight

### 🚶 Travel Mechanics

- Calculate travel costs: base cost × days × difficulty (1.0-2.0x)
- Preview resource impact before traveling
- Validate sufficient resources and connectivity
- Mark locations as visited

### 🎲 Random Events

- 30% chance to trigger during travel
- Positive and negative effects
- Events from database (RANDOM, LOCATION_BASED, RESOURCE_BASED types)
- Apply resource changes automatically

### 💾 State Management

- Zustand store for game state
- Location tracking (current, visited)
- Inventory management (add, remove, use items)
- Resource updates with boundaries (0-100)

### 🧪 Testing

- 125 tests across 10 test files
- Vitest + Testing Library
- 100% coverage for game mechanics
- Pre-commit hooks ensure quality

## Development

### Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format with Prettier
- `npm run type-check` - TypeScript type checking
- `npm test` - Run Vitest tests
- `npm run test:ui` - Run tests with UI

### Quality Tools

- **ESLint**: Code linting with React/TypeScript rules
- **Prettier**: Code formatting (2-space indent, single quotes)
- **Husky**: Pre-commit hooks (lint + format + type-check + tests)
- **Vitest**: Unit testing with 125 tests passing
- **TypeScript**: Strict mode enabled

### Testing

Run all tests:

```bash
npm test
```

Run specific test file:

```bash
npx vitest src/components/TravelModal/TravelModal.test.tsx
```

### Testing

Run all tests:

```bash
npm test
```

Run specific test file:

```bash
npx vitest src/components/TravelModal/TravelModal.test.tsx
```

Watch mode:

```bash
npx vitest --watch
```

## Architecture Decisions

### Why Next.js 14?

- App Router for better routing and layouts
- Server-side rendering for faster initial load
- API routes for backend logic
- Great TypeScript support

### Why Supabase?

- PostgreSQL with Row Level Security
- Real-time subscriptions (future multiplayer)
- Built-in authentication
- Free tier suitable for development

### Why Three.js?

- Rich 3D capabilities for globe rendering
- React Three Fiber simplifies React integration
- Performance optimization with WebGL
- Great community and examples

### Why Zustand?

- Simpler than Redux with less boilerplate
- Great TypeScript support
- Easy testing with direct state access
- Small bundle size (1KB)

## Contributing

This is a learning project. Feel free to fork and experiment!

## Known Issues

- EventModal component needs to be created (referenced but not yet implemented)
- Save/load functionality not yet connected to Supabase
- No validation for connected locations when traveling (UI shows all locations)
- Mobile responsiveness needs improvement

## License

MIT
