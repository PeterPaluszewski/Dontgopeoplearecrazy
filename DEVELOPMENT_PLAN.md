# Backpacking Game - Development Plan

## Project Overview

A web-based survival backpacking game featuring:

- Interactive 3D globe with location markers
- Resource management (food, water, energy)
- Inventory system with items
- Location-based travel mechanics
- User authentication and cloud saves
- Random events during travel

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **3D Graphics**: Three.js with React Three Fiber
- **State Management**: Zustand
- **Deployment**: Vercel

## Current Status

✅ **Completed Phases (1-8):**

- **Phase 1**: Next.js project with TypeScript, Tailwind CSS, comprehensive tooling (ESLint, Prettier, Husky)
- **Phase 2**: Vitest testing framework with 125 tests passing, pre-commit hooks
- **Phase 3**: Supabase database with 10 European cities, 15+ items, RLS policies, seed data
- **Phase 4**: Authentication system (login, register, protected routes, OAuth callback)
- **Phase 5**: 3D globe with Earth texture, 10 location markers, OrbitControls, click handling
- **Phase 6-7**: Game UI (ResourcePanel, LocationInfo, InventoryPanel with full functionality)
- **Phase 8**: Travel system with cost calculation, TravelModal, random events, EventModal

**Current Phase**: ✅ Phase 8 Complete (Travel System)

⏳ **In Progress:**

- Nothing currently - ready for Phase 9

🚧 **Next Phase (Phase 9):**

- Save/Load system with Supabase game_states integration
- Auto-save on location change
- Manual save/load buttons
- Multiple save slot support

## Development Phases

### Phase 1: Backend Setup ✅ COMPLETE

**Goal**: Set up Supabase and database schema

**Status**: ✅ Complete (Initial setup)

**Completed:**

- ✅ Created Supabase account and project
- ✅ Ran database schema SQL (locations, items, game_states, game_events)
- ✅ Set up Row Level Security policies
- ✅ Seeded 10 European cities with connections and difficulty ratings
- ✅ Seeded 15+ items (food, water, equipment with effects)
- ✅ Configured environment variables (.env.local)
- ✅ Verified Supabase connection from Next.js

**Deliverables:**

- Database tables with proper schema ✅
- RLS policies active and tested ✅
- 10 cities seeded (Paris, Berlin, Rome, Madrid, Amsterdam, Vienna, Prague, Barcelona, Athens, Budapest) ✅
- Connection verified ✅

---

### Phase 2: Authentication System ✅ COMPLETE

**Goal**: Implement user registration, login, and session management

**Status**: ✅ Complete

**Completed:**

- ✅ Created auth pages (`/auth/login`, `/auth/register`, `/auth/callback`)
- ✅ Built authentication forms with Supabase Auth
- ✅ Protected routes redirect to login
- ✅ Session management with cookies
- ✅ Styled auth pages with Tailwind

**Files created:**

- `src/app/auth/login/page.tsx` ✅
- `src/app/auth/register/page.tsx` ✅
- `src/app/auth/callback/route.ts` ✅

**Success criteria met:**

- Users can register with email/password ✅
- Users can login and logout ✅
- Sessions persist across page refreshes ✅
- Protected routes redirect unauthenticated users ✅

---

### Phase 3: 3D Globe Component ✅ COMPLETE

**Goal**: Create interactive 3D globe with clickable location markers

**Status**: ✅ Complete

**Completed:**

- ✅ React Three Fiber canvas with proper lighting
- ✅ Earth sphere with Blue Marble texture from unpkg CDN
- ✅ 10 location markers positioned at city coordinates
- ✅ OrbitControls for rotation and zoom (auto-rotate removed for better UX)
- ✅ Lat/lon to 3D position conversion
- ✅ Clickable location markers
- ✅ Color-coded markers (green=current, blue=visited, gray=unvisited)
- ✅ Markers rotate with globe (grouped rendering)
- ✅ Dynamic import to prevent SSR issues

**Files created:**

- `src/components/Globe/Globe.tsx` ✅
- `src/components/Globe/GlobeSphere.tsx` ✅
- `src/components/Globe/LocationMarker.tsx` ✅
- `src/lib/globe-utils.ts` ✅

**Success criteria met:**

- Globe renders with realistic Earth texture ✅
- Location markers at correct positions ✅
- Globe rotates with mouse drag ✅
- Clicking markers triggers location selection ✅
- Smooth 60fps performance ✅
- Works without SSR issues ✅

**Tests**: 9 Globe tests + 5 LocationMarker tests + 13 globe-utils tests = 27 tests ✅

---

### Phase 4-7: Game UI Components ✅ COMPLETE

**Goal**: Build all game interface elements

**Tasks:**

1. **Resource Bars**
   - Food, water, energy bars with percentages
   - Color coding (green > yellow > red)
   - Animated transitions
2. **Inventory Panel**
   - Grid layout for items
   - Item cards with icon, name, quantity
   - Use item button
   - Weight/capacity display
3. **Location Info Panel**
   - Current location name and description
   - Connected locations list
   - Travel button for each destination
   - Travel time and difficulty indicator
4. **Game Over Modal**
   - Triggered when any resource hits 0
   - Display survival stats
   - Restart button
5. **Event Modal**
   - Display random events during travel
   - Show event description and effects
   - Multiple choice options
   - Consequence display

6. **Main Game Layout**
   - Left sidebar: Resources + Inventory
   - Center: 3D Globe
   - Right sidebar: Location info
   - Top bar: User menu, save button

**Files to create:**

- `src/components/UI/ResourceBar.tsx`
- `src/components/UI/ResourcePanel.tsx`
- `src/components/UI/InventoryPanel.tsx`
- `src/components/UI/InventoryItem.tsx`
- `src/components/UI/LocationPanel.tsx`
- `src/components/UI/TravelButton.tsx`
- `src/components/UI/GameOverModal.tsx`
- `src/components/UI/EventModal.tsx`
- `src/components/UI/GameLayout.tsx`
- `src/components/UI/Button.tsx` (reusable button component)
- `src/components/UI/Card.tsx` (reusable card component)

**Success criteria:**

- All UI components render correctly
- Responsive layout works on mobile and desktop
- Visual feedback for user interactions
- Accessible (keyboard navigation, ARIA labels)
- Consistent styling with Tailwind

---

### Phase 5: Globe Component Implementation ✅ COMPLETE

**Goal**: Create interactive 3D globe with location markers

**Completed Tasks:**

1. ✅ Three.js integration with Next.js (dynamic import)
2. ✅ Earth texture from NASA Blue Marble
3. ✅ 10 European city markers with coordinate positioning
4. ✅ OrbitControls for rotation and zoom
5. ✅ LocationMarker component with click handling
6. ✅ Proper coordinate-to-3D conversion with sphere geometry

**Files Created:**

- `src/components/Globe/Globe.tsx` - Main globe component with Three.js rendering
- `src/components/Globe/LocationMarker.tsx` - Individual city markers
- `src/lib/globe-utils.ts` - Coordinate conversion utilities

**Tests:** 14 tests (9 for Globe, 5 for LocationMarker) ✅

**Success Criteria Met:**

- ✅ Globe renders with Earth texture
- ✅ 10 cities displayed at correct coordinates
- ✅ Markers rotate with globe
- ✅ Click detection for location selection
- ✅ Smooth interaction with orbit controls

---

### Phase 6: Game UI Components ✅ COMPLETE

**Goal**: Build resource management and inventory interfaces

**Completed Tasks:**

1. ✅ **ResourcePanel** with 3 resource bars (food, water, energy)
   - Color-coded warnings (yellow <30%, red <10%)
   - Percentage display with current/max values
2. ✅ **InventoryPanel** with item management
   - Add/use/remove items
   - Weight tracking with capacity limits
   - Quantity display and item effects
3. ✅ **LocationInfo** panel
   - Current location name and description
   - Connected cities list with distances
   - Travel button integration

**Files Created:**

- `src/components/ResourcePanel/ResourcePanel.tsx`
- `src/components/InventoryPanel/InventoryPanel.tsx`
- `src/components/LocationInfo/LocationInfo.tsx`

**Tests:** 36 tests (10 ResourcePanel, 14 InventoryPanel, 12 LocationInfo) ✅

**Success Criteria Met:**

- ✅ All UI components render correctly
- ✅ Responsive layout works on all devices
- ✅ Visual feedback for user interactions
- ✅ Consistent Tailwind styling
- ✅ Comprehensive test coverage

---

### Phase 7: Resource & Inventory Logic ✅ COMPLETE

**Goal**: Implement resource depletion and inventory management

**Completed Tasks:**

1. ✅ **Zustand Store** (src/store/gameStore.ts)
   - Global state for resources, inventory, location
   - updateResources action with min/max capping
   - addItem, removeItem, useItem actions
   - Weight capacity validation
2. ✅ **Inventory System**
   - Item stacking with quantity
   - Effect application (restore resources)
   - Weight management (max 20kg)
3. ✅ **Resource Management**
   - Food, water, energy tracking (0-100)
   - Resource restoration from items
   - Capped at maximum values

**Tests:** 8 tests for gameStore ✅

**Success Criteria Met:**

- ✅ Inventory operations work correctly
- ✅ Resources update properly
- ✅ Weight limits enforced
- ✅ State management stable

---

### Phase 8: Travel System & Random Events ✅ COMPLETE

**Goal**: Implement travel mechanics with cost calculation and random events

**Completed Tasks:**

1. ✅ **Travel Cost Calculation**
   - Formula: base × days × difficulty
   - Food: 15/day, Water: 20/day, Energy: 25/day
   - Difficulty multipliers: Easy 1.0x, Medium 1.5x, Hard 2.0x
2. ✅ **TravelModal Component**
   - Resource cost preview with breakdown
   - Warning colors for insufficient resources
   - Disabled button when can't afford
   - Backdrop dismissal
3. ✅ **Random Event System**
   - 30% chance after travel (src/lib/events.ts)
   - Query game_events table in Supabase
   - Event types: RANDOM, LOCATION_BASED, RESOURCE_BASED
4. ✅ **EventModal Component**
   - Display event title and description
   - Show resource effects (+/-)
   - Green/red button colors for event types
   - Auto-apply effects on Continue
5. ✅ **Travel Validation**
   - Check resource affordability
   - Verify location connections
   - Update visitedLocationIds tracking

**Files Created:**

- `src/lib/travel-utils.ts` - Cost calculation and validation
- `src/components/TravelModal/TravelModal.tsx` - Travel confirmation UI
- `src/components/EventModal/EventModal.tsx` - Event display UI
- `src/lib/events.ts` - Random event triggering

**Files Modified:**

- `src/store/gameStore.ts` - Added travelToLocation function
- `src/app/game/page.tsx` - Integrated modals and travel flow

**Tests:** 54 tests (19 travel-utils, 17 TravelModal, 18 EventModal) ✅

**Success Criteria Met:**

- ✅ Travel cost calculated accurately
- ✅ Resource validation before travel
- ✅ Random events trigger 30% of time
- ✅ Event effects applied correctly
- ✅ UI shows clear feedback
- ✅ All edge cases covered in tests

---

### Phase 9: Save/Load System (NOT STARTED)

**Goal**: Persist game state to Supabase

**Planned Tasks:**

1. **Save System**
   - Create saveGame function in src/lib/database.ts
   - Save to game_states table with user_id
   - Auto-save on location change
   - Manual save button in UI
2. **Load System**
   - Load existing game on page load
   - Create new game if none exists
   - Support multiple save slots per user
3. **Game State Schema**
   - Serialize resources, inventory, currentLocationId, visitedLocationIds
   - Store timestamp for last save

4. **UI Integration**
   - Add Save/Load buttons to game page
   - Show save timestamp and slot info
   - Loading state while fetching

**Files to Create:**

- `src/lib/save-load.ts` - Save/load functions
- `src/components/SaveLoadPanel/SaveLoadPanel.tsx` - UI controls

**Success Criteria:**

- Game saves to Supabase correctly
- Game loads previous state on return
- Auto-save triggers on location change
- Multiple save slots supported
- Offline mode handled gracefully

---

## Future Enhancements (Post-MVP)

### Phase 10: Additional Features

- **More Locations**: Expand to 20-30 cities worldwide
- **Achievement System**: Badges for milestones
- **Leaderboards**: Compare survival stats with friends
- **Weather System**: Dynamic weather affects travel
- **Day/Night Cycle**: Time-based gameplay
- **Multiplayer**: Co-op travel with friends
- **Shop System**: Buy items at locations
- **Quests**: Location-specific missions
- **Character Customization**: Avatars and gear
- **Social Features**: Share trips, invite friends

### Phase 11: Advanced Features

- **Real-time Updates**: WebSocket for live events
- **Mobile App**: React Native version
- **Offline Mode**: Service worker for offline play
- **Advanced Graphics**: Better Earth visualization
- **Story Mode**: Narrative-driven gameplay
- **Mod Support**: Community content

---

## Development Guidelines

### Code Standards

- TypeScript strict mode enabled
- ESLint and Prettier for formatting
- Meaningful component and variable names
- Comprehensive comments for complex logic
- Proper error handling with try/catch
- Loading and error states for all async operations

### Git Workflow

- Use descriptive commit messages
- Create feature branches for major work
- Keep commits focused and atomic
- Regular commits to avoid losing work

### Testing Strategy

- Manual testing during development
- Test all user flows end-to-end
- Verify mobile responsiveness
- Check performance with Chrome DevTools

### Performance Targets

- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- 60fps during globe interaction
- Bundle size < 500KB (initial load)

---

## Time Estimate

**Original Estimate**: 20-25 hours
**Actual Time**: ~25-30 hours (includes comprehensive testing)

- Phase 1 (Backend): ~2 hours ✅
- Phase 2 (Auth): ~3 hours ✅
- Phase 3 (Globe): ~4 hours ✅
- Phase 4 (UI Components): ~4 hours ✅
- Phase 5 (Globe Implementation): ~3 hours ✅
- Phase 6 (Game UI): ~3 hours ✅
- Phase 7 (Resource Logic): ~2 hours ✅
- Phase 8 (Travel System): ~4 hours ✅
- Testing (Comprehensive): ~5 hours ✅
- Phase 9 (Save/Load): 2-3 hours (pending)
- Phase 10 (Deploy): 1-2 hours (pending)

**Completed**: 8 of 10 phases  
**Timeline**: ~2 weeks part-time development  
**Test Coverage**: 125 tests across 10 test files

---

## Risk Mitigation

**Potential Issues:**

1. **Three.js SSR Issues**: Use dynamic imports with `ssr: false`
2. **Supabase Free Tier Limits**: Monitor usage, upgrade if needed
3. **Performance on Mobile**: Reduce globe complexity, optimize textures
4. **Complex Game State**: Keep Zustand store simple, use selectors
5. **Auth Edge Cases**: Thorough testing of all auth flows

**Contingency Plans:**

- Simplify 3D graphics if performance issues
- Use 2D map fallback if Three.js too complex
- Implement progressive enhancement
- Add feature flags for gradual rollout

---

## Success Metrics

**MVP Success Criteria:**

- ✅ Users can register and login
- ✅ Globe displays with location markers
- ✅ Players can travel between locations
- ✅ Resources deplete and can be restored
- ⏳ Game saves and loads correctly (Phase 9)
- ⏳ Deployed and accessible online (Phase 10)

**User Experience Goals:**

- ✅ < 5 second initial load time
- ✅ Intuitive UI requiring minimal learning
- ✅ Smooth 60fps globe interaction
- ✅ Mobile-friendly responsive design
- ✅ No game-breaking bugs

**Testing Achievement:**

- 125 tests passing across 10 test files
- All quality checks passing (lint, format, type-check)
- Pre-commit hooks preventing regressions

---

## Notes

- Previous Unity prototype preserved in git history
- Chose web app over Unity for accessibility and cross-platform support
- Focus on core gameplay loop before adding extra features
- Keep codebase maintainable and well-documented
- Prioritize user experience over feature quantity

---

**Last Updated**: January 2025  
**Current Phase**: ✅ Phase 8 Complete (Travel System & Random Events)  
**Next Phase**: Phase 9 (Save/Load System)  
**Status**: 8 of 10 phases complete, 125 tests passing
