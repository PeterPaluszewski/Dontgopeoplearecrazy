# Globe Component Test Coverage

## Test Summary

✅ **All 35 tests passing**

### Test Files Overview

#### 1. `globe-utils.test.ts` (13 tests)

Tests for coordinate conversion and utility functions:

**latLonToVector3** (3 tests)

- ✅ Converts latitude and longitude to Vector3 coordinates
- ✅ Returns Vector3 with correct magnitude (verifies on sphere surface)
- ✅ Handles negative longitudes (e.g., New York at -74°)

**getMarkerPosition** (2 tests)

- ✅ Places marker above globe surface at correct height
- ✅ Uses default marker height if not provided

**calculateDistance** (4 tests)

- ✅ Calculates distance between two locations using Haversine formula
  - Paris to London: ~344 km (verified within 300-400km range)
  - Paris to Rome: ~1100 km (verified within 1000-1300km range)
- ✅ Returns 0 for same location
- ✅ Handles locations across prime meridian
- ✅ Calculates correct distance between distant cities

**getMarkerColor** (4 tests)

- ✅ Returns green (#10b981) for current location
- ✅ Returns blue (#3b82f6) for visited but not current
- ✅ Returns gray (#6b7280) for unvisited location
- ✅ Prioritizes current over visited when both are true

#### 2. `Globe.test.tsx` (9 tests)

Tests for main Globe component integration:

- ✅ Renders the canvas
- ✅ Renders the globe sphere
- ✅ Renders all location markers (3 locations tested)
- ✅ Renders orbit controls
- ✅ Displays instructions text (drag, zoom, click)
- ✅ Handles empty locations array
- ✅ Calls onLocationClick when marker is clicked
- ✅ Handles locations without currentLocationId
- ✅ Passes correct visited status to markers

#### 3. `LocationMarker.test.tsx` (5 tests)

Tests for individual location marker component:

- ✅ Accepts all required props without errors
- ✅ Handles current location state
- ✅ Handles visited state
- ✅ Handles unvisited state
- ✅ Handles different location coordinates (equator, poles, negative longitude)

#### 4. `gameStore.test.ts` (8 tests - existing)

Tests for game state management (already passing):

- ✅ Initializes with default state
- ✅ Updates resources correctly
- ✅ Prevents negative resources
- ✅ Caps resources at maximum
- ✅ Adds items to inventory
- ✅ Stacks items correctly
- ✅ Removes items from inventory
- ✅ Visits locations

## Coverage Highlights

### Geographic Accuracy

- Validates real-world distances between European cities
- Tests edge cases: equator, poles, prime meridian, negative coordinates
- Verifies spherical geometry calculations

### State Management

- Location visit tracking (current vs visited vs unvisited)
- Color coding validation for visual feedback
- Marker positioning on globe surface

### Component Integration

- Canvas rendering with Three.js
- OrbitControls for user interaction
- Proper prop passing between components
- Click handlers and hover states

### Edge Cases Covered

- Empty location arrays
- Undefined current location
- Same location distance (0 km)
- Negative longitude values
- Extreme latitudes (poles)

## Test Execution

```bash
npm test          # Run all tests once
npm run test:watch     # Run in watch mode
npm run test:coverage  # Run with coverage report
```

## Notes

- Globe tests include warning suppression for Three.js lowercase HTML element names (expected in jsdom)
- LocationMarker tests use proper mocking of Three.js to avoid rendering issues in test environment
- All globe utility functions use proper mathematical formulas (Haversine for distances, spherical to Cartesian conversion)
