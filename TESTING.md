# Testing Guide

## Running Tests

```bash
npm run test             # Run all tests once
npm run test:unit        # Unit tests only (SKIP_INTEGRATION_TESTS=true)
npm run test:watch       # Interactive watch mode
npm run test:coverage    # Coverage report (thresholds: 80% lines/statements, 75% branches/functions)
npm run test:ui          # Vitest UI (browser-based)
npm run test:e2e         # Playwright E2E (requires running dev server: npm run dev)
```

Run a single test file for fast feedback:

```bash
npm run test -- --run src/lib/route-utils.test.ts
```

## Writing Tests

### Unit Tests (pure functions in `src/lib/`)

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-module';

describe('myFunction', () => {
  it('should return expected result', () => {
    expect(myFunction(input)).toBe(expected);
  });
});
```

### Component Tests

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import MyComponent from './MyComponent';

it('should handle click', () => {
  const onClick = vi.fn();
  render(<MyComponent onClick={onClick} />);
  fireEvent.click(screen.getByRole('button'));
  expect(onClick).toHaveBeenCalled();
});
```

### Store Tests

Call `useGameStore.getState()` directly — no render needed. Always call `resetGame()` between cases.

```typescript
import { useGameStore } from '@/store/gameStore';

describe('GameStore', () => {
  beforeEach(() => useGameStore.getState().resetGame());

  it('should update resources', () => {
    useGameStore.getState().updateResources({ food: -10 });
    expect(useGameStore.getState().food).toBe(90);
  });
});
```

## Test Organization

Test files live next to the source file they test:

```
src/
  lib/
    route-utils.ts
    route-utils.test.ts
  components/
    Globe/
      Globe.tsx
      Globe.test.tsx
```

Integration tests live in `src/lib/__tests__/*.integration.test.ts` and are skipped by default (`SKIP_INTEGRATION_TESTS=true`).

E2E tests live in `tests/e2e/` and use Playwright.

## Mocking

```typescript
// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  createClient: () => ({ from: () => ({ select: vi.fn() }) }),
}));

// Mock a component (e.g. Globe — SSR-unsafe)
vi.mock('@/components/Globe/Globe', () => ({
  default: () => <div>Mocked Globe</div>,
}));

// Mock a Zustand store
vi.mock('@/store/gameStore', () => ({
  useGameStore: vi.fn(() => ({ food: 100, water: 100, energy: 100 })),
}));
```

## Coverage

Configured in `vitest.config.ts`. Thresholds:

| Metric     | Threshold |
| ---------- | --------- |
| Lines      | 80%       |
| Statements | 80%       |
| Branches   | 75%       |
| Functions  | 75%       |

## Integration Tests

Located in `src/lib/__tests__/`. Skipped by default. To run:

```bash
SKIP_INTEGRATION_TESTS=false npm run test -- --run src/lib/__tests__/save-load.integration.test.ts
```

Requires: valid Supabase credentials in `.env.local` and an authenticated session (log in via `npm run dev` first).

## CI

Pre-commit hook (Husky + lint-staged) runs lint + type-check + unit tests before every commit.
