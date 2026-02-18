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

✅ **Completed Phases (1-10):**

- **Phase 1**: Next.js project with TypeScript, Tailwind CSS, comprehensive tooling (ESLint, Prettier, Husky)
- **Phase 2**: Vitest testing framework with 148 tests passing, pre-commit hooks
- **Phase 3**: Supabase database with 10 European cities, 15+ items, RLS policies, seed data
- **Phase 4**: Authentication system (login, register, protected routes, OAuth callback)
- **Phase 5**: 3D globe with Earth texture, 10 location markers, OrbitControls, click handling
- **Phase 6-7**: Game UI (ResourcePanel, LocationInfo, InventoryPanel with full functionality)
- **Phase 8**: Travel system with cost calculation, TravelModal, random events, EventModal
- **Phase 9**: Save/Load system with auto-save, manual save/load, multiple slots, 23 new tests
- **Phase 10**: Production deployment to Vercel with CI/CD

**Current Phase**: 🚧 Phase 11 In Progress (Travel Experience)
**Production URL**: https://dontgopeoplearecrazy.vercel.app

🎉 **Status:**

- Original 10 phases complete
- 148 tests passing
- Live in production
- Phase 11 travel experience improvements in progress

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

### Phase 9: Save/Load System ✅ COMPLETE

**Goal**: Persist game state to Supabase

**Status**: ✅ Complete (February 13, 2026)

**Completed Tasks:**

1. ✅ **Save System**
   - Created saveGame function in src/lib/save-load.ts
   - Saves to game_states table with user_id
   - Auto-save after successful travel
   - Manual save button with toast feedback
2. ✅ **Load System**
   - Auto-load most recent save on page load
   - Create new game if none exists
   - Multiple save slots per user
   - Delete save functionality
3. ✅ **Game State Schema**
   - Serializes resources, inventory, currentLocationId, visitedLocationIds
   - Stores created_at and updated_at timestamps
   - User-specific with RLS policies

4. ✅ **UI Integration**
   - SaveLoadPanel component with save/load buttons
   - Save timestamp display with relative time
   - Loading states during operations
   - Toast notifications for feedback

**Files Created:**

- `src/lib/save-load.ts` - saveGame, loadGame, loadAllSaves, deleteSave functions ✅
- `src/components/SaveLoadPanel/SaveLoadPanel.tsx` - UI controls with save slot management ✅

**Tests:** 23 tests (11 save-load.ts, 12 SaveLoadPanel.tsx) ✅

**Success Criteria Met:**

- ✅ Game saves to Supabase correctly
- ✅ Game loads previous state on return
- ✅ Auto-save triggers after travel
- ✅ Multiple save slots supported
- ✅ Error handling for offline mode

---

### Phase 10: Production Deployment ✅ COMPLETE

**Goal**: Deploy to production with CI/CD pipeline

**Status**: ✅ Complete (February 13, 2026)

**Completed Tasks:**

1. ✅ **Deployment Configuration**
   - Created vercel.json with build settings
   - Configured environment variables in Vercel
   - Set up Supabase redirect URLs for production
2. ✅ **Deployment Methods**
   - Vercel CLI deployment (manual)
   - GitHub integration (automatic)
   - Both methods working successfully
3. ✅ **Documentation**
   - Created DEPLOYMENT.md with complete guide
   - Troubleshooting section for common issues
   - Verification checklist
4. ✅ **Production Verification**
   - All 148 tests passing in CI
   - Authentication working in production
   - Save/load system operational
   - Zero console errors

**Files Created:**

- `vercel.json` - Deployment configuration ✅
- `DEPLOYMENT.md` - Comprehensive deployment guide ✅

**Production Details:**

- **URL**: https://dontgopeoplearecrazy.vercel.app
- **Build Time**: ~1-2 minutes
- **CI/CD**: Automatic deployments on push to main
- **Environment**: Vercel (Hobby tier)

**Success Criteria Met:**

- ✅ Site accessible at production URL
- ✅ Authentication works in production
- ✅ All game features functional
- ✅ CI/CD pipeline operational
- ✅ Environment variables configured
- ✅ Supabase production URLs set

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
**Actual Time**: ~30-35 hours (includes comprehensive testing and deployment)

- Phase 1 (Backend): ~2 hours ✅
- Phase 2 (Auth): ~3 hours ✅
- Phase 3 (Globe): ~4 hours ✅
- Phase 4 (UI Components): ~4 hours ✅
- Phase 5 (Globe Implementation): ~3 hours ✅
- Phase 6 (Game UI): ~3 hours ✅
- Phase 7 (Resource Logic): ~2 hours ✅
- Phase 8 (Travel System): ~4 hours ✅
- Phase 9 (Save/Load): ~3 hours ✅
- Phase 10 (Deploy): ~2 hours ✅
- Testing (Comprehensive): ~6 hours ✅

**Completed**: 10 of 10 phases  
**Timeline**: ~2 weeks part-time development  
**Test Coverage**: 148 tests across 12 test files

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
- ✅ Game saves and loads correctly (Phase 9)
- ✅ Deployed and accessible online (Phase 10)

**User Experience Goals:**

- ✅ < 5 second initial load time
- ✅ Intuitive UI requiring minimal learning
- ✅ Smooth 60fps globe interaction
- ✅ Mobile-friendly responsive design
- ✅ No game-breaking bugs

**Testing Achievement:**

- ✅ 148 tests passing across 12 test files
- ✅ All quality checks passing (lint, format, type-check)
- ✅ Pre-commit hooks preventing regressions
- ✅ 100% test coverage for critical features

---

### Phase 11: Travel Experience 🚧 IN PROGRESS

**Goal**: Make travel feel meaningful, immersive, and reactive — not just a resource drain.

**Key Problems to Solve:**
- Travel currently has no visual feedback or sense of journey
- Random events are sparse and disconnected from location/context
- No narrative weight to decisions (where you go, when you go)

**Planned Improvements:**
- [ ] Animated globe camera pan when travelling to destination
- [ ] Travel progress indicator (days elapsed, resources depleting in real time)
- [ ] Location-aware events (events filtered by city/region)
- [ ] Richer event outcomes (item rewards, stat bonuses, story fragments)
- [ ] Weather/season modifiers on travel costs
- [ ] Danger zone warnings before confirming travel

**In Progress (branch: `travel-experience`):**
- ✅ Globe rotation quaternion (`calculateGlobeQuaternion`) to face current location on load
- ✅ `CountryBordersOverlay` with auto-show at `camera.z <= 3` zoom level
- ✅ Debug compass overlay (toggleable in `game/page.tsx`)
- ✅ Connection lines between reachable cities (`ConnectionLines` component)
- ✅ `LocationMarker` dynamic scale based on camera distance
- ✅ E2E tests (Playwright) for login and unauthenticated redirect

**Estimated effort**: ~4–6 hours

---

### Phase 12: Auth Flow Improvements 📋 PLANNED

**Goal**: Eliminate the auth flash and make the authentication experience seamless and robust.

**Key Problems to Solve:**
- Protected pages (`/game`, `/menu`) briefly render unauthenticated before the client-side `supabase.auth.getUser()` redirect fires — visible as a flash of content
- No loading skeleton shown during auth check, so the UI jumps
- Auth state is checked independently in each page — no shared auth context

**Planned Improvements:**
- [ ] Add Next.js middleware (`src/middleware.ts`) using `@supabase/ssr` server client to redirect unauthenticated users before the page renders
- [ ] Create a shared `AuthProvider` / `useAuth` hook to avoid duplicating `supabase.auth.getUser()` in every page
- [ ] Add a full-screen loading skeleton/spinner during auth check so there is no content flash
- [ ] Ensure `supabase/ssr` cookie handling is correct for both middleware and client components
- [ ] Update E2E tests to cover the no-flash behaviour

**Technical Notes:**
- Middleware requires `createServerClient` from `@supabase/ssr` (not the browser client in `src/lib/supabase.ts`)
- Cookie reading/writing in middleware needs `request.cookies` and `response.cookies` — see [Supabase SSR docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- Keep the existing browser client (`createBrowserClient`) for client component Supabase calls — only the auth check in middleware switches to server client

**Estimated effort**: ~2–3 hours

---

## Notes

- Previous Unity prototype preserved in git history
- Chose web app over Unity for accessibility and cross-platform support
- Focus on core gameplay loop before adding extra features
- Keep codebase maintainable and well-documented
- Prioritize user experience over feature quantity

---

**Last Updated**: February 18, 2026  
**Current Phase**: 🚧 Phase 11 In Progress (Travel Experience)  
**Production URL**: https://dontgopeoplearecrazy.vercel.app  
**Status**: 10 of 10 original phases complete, 148 tests passing, live in production
