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

✅ **Completed:**

- Next.js project initialization with TypeScript and Tailwind
- Project structure created (components, lib, store, types)
- Dependencies installed (Supabase, Three.js, Zustand, UI utilities)
- Type definitions for game entities (Location, Item, GameState, GameEvent)
- Zustand store for game state management
- Supabase client configuration
- Setup guide with complete database schema
- Environment variable template
- Initial git commit on `start-over` branch

⏳ **In Progress:**

- Nothing currently

❌ **Not Started:**

- Supabase project setup and database initialization
- Environment variables configuration
- Authentication system
- 3D globe component
- Game UI components
- Game logic implementation
- Deployment

## Development Phases

### Phase 1: Backend Setup (1-2 hours)

**Goal**: Set up Supabase and database schema

**Tasks:**

1. Create Supabase account and project
2. Run database schema SQL (locations, items, game_states, game_events)
3. Set up Row Level Security policies
4. Seed initial location data (Paris, Barcelona, Berlin, Rome, Amsterdam)
5. Seed initial item data (food, water, equipment)
6. Configure environment variables (.env.local)
7. Test Supabase connection from Next.js

**Files to create/modify:**

- `.env.local` (create from template)
- `src/lib/supabase.ts` (verify configuration)

**Success criteria:**

- Database tables created with proper schema
- RLS policies active and tested
- Sample data loaded
- Connection verified from Next.js app

---

### Phase 2: Authentication System (2-3 hours)

**Goal**: Implement user registration, login, and session management

**Tasks:**

1. Create auth layout and pages
   - `/auth/login` - Login form
   - `/auth/register` - Registration form
   - `/auth/callback` - OAuth callback handler
2. Build authentication forms with Supabase Auth
3. Implement protected route middleware
4. Create auth context/hooks for session management
5. Add logout functionality
6. Style auth pages with Tailwind

**Files to create:**

- `src/app/auth/login/page.tsx`
- `src/app/auth/register/page.tsx`
- `src/app/auth/callback/route.ts`
- `src/components/Auth/LoginForm.tsx`
- `src/components/Auth/RegisterForm.tsx`
- `src/middleware.ts` (route protection)
- `src/hooks/useAuth.ts` (authentication hook)

**Success criteria:**

- Users can register with email/password
- Users can login and logout
- Sessions persist across page refreshes
- Protected routes redirect unauthenticated users
- Auth state available throughout app

---

### Phase 3: 3D Globe Component (3-4 hours)

**Goal**: Create interactive 3D globe with clickable location markers

**Tasks:**

1. Set up React Three Fiber canvas with proper lighting
2. Create sphere geometry for Earth with texture
3. Add location markers as 3D pins on globe surface
4. Implement globe rotation (auto-rotate + mouse drag)
5. Convert lat/lon coordinates to 3D positions
6. Make location markers clickable with raycasting
7. Add hover effects for location markers
8. Optimize performance (LOD, instancing if needed)
9. Add loading state while textures load

**Files to create:**

- `src/components/Globe/Globe.tsx` (main component)
- `src/components/Globe/LocationMarker.tsx` (individual markers)
- `src/components/Globe/GlobeControls.tsx` (rotation controls)
- `src/lib/globe-utils.ts` (lat/lon conversion helpers)
- `public/textures/earth.jpg` (Earth texture - find free asset)

**Success criteria:**

- Globe renders with realistic Earth texture
- Location markers appear at correct positions
- Globe can be rotated with mouse drag
- Clicking markers triggers location selection
- Smooth performance (60fps)
- Works without SSR issues

---

### Phase 4: Game UI Components (3-4 hours)

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

### Phase 5: Game Logic Implementation (4-5 hours)

**Goal**: Implement core game mechanics and data flow

**Tasks:**

1. **Location System**
   - Fetch locations from Supabase
   - Display on globe with markers
   - Handle location selection
   - Track visited locations
2. **Travel System**
   - Calculate travel time and resource costs
   - Implement travel countdown/animation
   - Resource depletion during travel
   - Update current location after travel
   - Trigger random events (30% chance)
3. **Inventory System**
   - Fetch items from Supabase
   - Add items to inventory
   - Use items (restore resources)
   - Remove items when quantity reaches 0
   - Check weight capacity
4. **Resource Management**
   - Automatic resource depletion over time
   - Resource restoration from items
   - Game over when resource hits 0
   - Resource caps (max 100)
5. **Event System**
   - Fetch random events from database
   - Display event modal during travel
   - Apply event effects to resources
   - Handle player choices
   - Log events to game history
6. **Save/Load System**
   - Auto-save game state to Supabase every 30 seconds
   - Manual save button
   - Load game on app start
   - Support multiple save slots per user
   - Handle offline mode gracefully

**Files to create:**

- `src/lib/game/locations.ts` (location fetching/logic)
- `src/lib/game/travel.ts` (travel calculations)
- `src/lib/game/inventory.ts` (inventory management)
- `src/lib/game/resources.ts` (resource logic)
- `src/lib/game/events.ts` (event handling)
- `src/lib/game/save.ts` (save/load functions)
- `src/hooks/useLocations.ts`
- `src/hooks/useTravel.ts`
- `src/hooks/useGameLoop.ts` (main game loop)

**Success criteria:**

- Players can travel between connected locations
- Resources deplete realistically during travel
- Items can be used to restore resources
- Random events occur and affect gameplay
- Game saves automatically and can be loaded
- Game over triggers when resources depleted

---

### Phase 6: Main Game Page (2-3 hours)

**Goal**: Integrate all components into playable game

**Tasks:**

1. Create main game page at root (`/`)
2. Implement game initialization flow
   - Check for authenticated user
   - Load existing game or create new one
   - Initialize Zustand store with game state
3. Set up game loop (resource depletion, auto-save)
4. Wire up all UI components with real data
5. Implement keyboard shortcuts (ESC for menu, etc.)
6. Add loading states and error boundaries
7. Create new game / continue game flow

**Files to modify:**

- `src/app/page.tsx` (main game page)
- `src/app/layout.tsx` (add auth provider)

**Files to create:**

- `src/app/game/page.tsx` (main game interface)
- `src/app/game/new/page.tsx` (new game setup)
- `src/components/GameInitializer.tsx`
- `src/components/ErrorBoundary.tsx`

**Success criteria:**

- Game loads and displays correctly
- All components work together
- Game state persists across sessions
- Smooth gameplay experience
- No console errors

---

### Phase 7: Polish & Optimization (2-3 hours)

**Goal**: Improve UX, performance, and visual appeal

**Tasks:**

1. **Visual Polish**
   - Add animations (framer-motion)
   - Improve globe visuals (clouds, atmosphere)
   - Add sound effects (optional)
   - Better icons and graphics
   - Loading screens with progress
2. **Performance**
   - Optimize Three.js rendering
   - Implement React.memo for expensive components
   - Add proper loading states
   - Lazy load components
   - Optimize images
3. **UX Improvements**
   - Add tooltips and help text
   - Tutorial/onboarding for new players
   - Better error messages
   - Confirm dialogs for destructive actions
   - Keyboard shortcuts guide
4. **Mobile Optimization**
   - Touch controls for globe
   - Responsive layout refinement
   - Mobile-friendly UI sizing
   - PWA support (optional)

**Files to create/modify:**

- `src/components/UI/Tooltip.tsx`
- `src/components/UI/Tutorial.tsx`
- `src/components/UI/LoadingScreen.tsx`
- Various component optimizations

**Success criteria:**

- Smooth animations throughout
- Fast loading times
- Works well on mobile
- Intuitive user experience
- Professional appearance

---

### Phase 8: Testing & Bug Fixes (2-3 hours)

**Goal**: Ensure stability and fix issues

**Tasks:**

1. Manual testing of all features
2. Test edge cases (negative resources, invalid travel, etc.)
3. Test authentication flows
4. Test save/load system thoroughly
5. Cross-browser testing (Chrome, Firefox, Safari)
6. Mobile device testing
7. Fix discovered bugs
8. Add error logging (Sentry or similar)

**Success criteria:**

- No critical bugs
- Game handles errors gracefully
- Works across browsers and devices
- Stable gameplay experience

---

### Phase 9: Deployment (1-2 hours)

**Goal**: Deploy to production on Vercel

**Tasks:**

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Configure environment variables in Vercel
4. Set up Supabase redirect URLs for production
5. Configure custom domain (optional)
6. Set up analytics (Vercel Analytics)
7. Test production deployment
8. Create production database backup strategy

**Files to create:**

- `vercel.json` (deployment config)
- `.github/workflows/ci.yml` (optional CI/CD)

**Success criteria:**

- Game deployed and accessible online
- Production database configured correctly
- Auth works in production
- Fast load times globally
- No deployment errors

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

**Total Development Time**: 20-25 hours

- Phase 1 (Backend): 1-2 hours
- Phase 2 (Auth): 2-3 hours
- Phase 3 (Globe): 3-4 hours
- Phase 4 (UI): 3-4 hours
- Phase 5 (Logic): 4-5 hours
- Phase 6 (Integration): 2-3 hours
- Phase 7 (Polish): 2-3 hours
- Phase 8 (Testing): 2-3 hours
- Phase 9 (Deploy): 1-2 hours

**Timeline**: 1-2 weeks working part-time, or 3-4 days full-time

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

- Users can register and login
- Globe displays with location markers
- Players can travel between locations
- Resources deplete and can be restored
- Game saves and loads correctly
- Deployed and accessible online

**User Experience Goals:**

- < 5 second initial load time
- Intuitive UI requiring no tutorial
- Smooth 60fps globe interaction
- Mobile-friendly responsive design
- No game-breaking bugs

---

## Notes

- Previous Unity prototype preserved in git history
- Chose web app over Unity for accessibility and cross-platform support
- Focus on core gameplay loop before adding extra features
- Keep codebase maintainable and well-documented
- Prioritize user experience over feature quantity

---

**Last Updated**: February 13, 2026  
**Current Phase**: Phase 1 (Backend Setup)  
**Next Action**: Set up Supabase project and configure environment variables
