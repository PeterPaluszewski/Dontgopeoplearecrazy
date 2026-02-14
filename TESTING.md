# Testing Guide

## Overview

This project uses **Vitest** for unit and integration testing, with **Testing Library** for component testing.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (interactive)
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- gameStore.test.ts
```

## Writing Tests

### Unit Tests

Test individual functions and modules:

```typescript
import { describe, it, expect } from 'vitest';

describe('MyFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Component Tests

Test React components with Testing Library:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

### Store Tests

Test Zustand stores:

```typescript
import { describe, it, expect } from 'vitest';
import { useGameStore } from '@/store/gameStore';

describe('GameStore', () => {
  it('should update state correctly', () => {
    const { updateResources } = useGameStore.getState();
    updateResources(10, 20, 30);

    const state = useGameStore.getState();
    expect(state.food).toBe(110);
  });
});
```

## Test Organization

```
src/
├── components/
│   └── MyComponent/
│       ├── MyComponent.tsx
│       └── MyComponent.test.tsx
├── store/
│   ├── gameStore.ts
│   └── gameStore.test.ts
└── test/
    └── setup.ts
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what the component does, not how it does it
2. **Use descriptive test names**: `it('should disable button when loading', ...)`
3. **Arrange-Act-Assert pattern**: Set up, perform action, verify result
4. **Test edge cases**: Empty states, errors, boundary conditions
5. **Keep tests isolated**: Each test should be independent
6. **Mock external dependencies**: Use `vi.mock()` for API calls, etc.

## Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## Mocking

### Mock API calls

```typescript
import { vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  createClient: () => ({
    from: () => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  }),
}));
```

### Mock components

```typescript
vi.mock('@/components/Globe/Globe', () => ({
  default: () => <div>Mocked Globe</div>,
}));
```

## CI/CD Integration

### Automated Test Runs

Tests run automatically on:
- Pre-commit hook (via Husky + lint-staged)
- Pull requests
- Pushes to main branch
- Before production builds

### Integration Tests in CI/CD

Integration tests can run before deployment! See [Integration Test Setup](.github/INTEGRATION_TESTS_SETUP.md) for configuration.

**Workflow:**
1. Push code → Triggers GitHub Action
2. Run unit tests (fast, always runs)
3. Run integration tests (if credentials configured)
4. Deploy to production (only if tests pass)

**Setup Required:**
```bash
# Set GitHub secrets (one-time setup)
gh secret set SUPABASE_URL --body "https://your-project.supabase.co"
gh secret set SUPABASE_ANON_KEY --body "your-anon-key"
gh secret set TEST_USER_EMAIL --body "test@example.com"
gh secret set TEST_USER_PASSWORD --body "secure-password"
```

**Benefits:**
- ✅ Catch database schema issues before production
- ✅ Validate migrations work correctly
- ✅ Test RLS policies
- ✅ Prevent UUID bugs and constraint violations
- ✅ Automatic rollback if tests fail

## Integration Tests

### Overview

Integration tests use real database connections and are located in `src/**/__tests__/*.integration.test.ts`.

**Key Benefits:**
- Catch database schema mismatches (UUID vs string)
- Validate constraints (CHECK, NOT NULL, foreign keys)
- Test RLS policies
- Verify migration correctness

### Running Integration Tests

```bash
# Integration tests are SKIPPED by default
npm test  # Skips integration tests

# Run integration tests manually (requires login)
SKIP_INTEGRATION_TESTS=false npm test -- src/lib/__tests__/save-load.integration.test.ts
```

**Prerequisites:**
1. Run `npm run dev` and login through the UI
2. Ensure database migrations are applied
3. Have valid Supabase credentials in `.env.local`

### Case Study: The UUID Bug

**Problem:** NewGameModal used hardcoded string IDs (`'1'`, `'2'`) but database expects UUIDs.

**Unit tests missed it** because mocks don't validate data types.

**Integration test caught it:**
```typescript
it('should fail with descriptive error when location ID is not a valid UUID', async () => {
  const result = await createNewGame('1', 'normal', 'Test Player');
  expect(result.error).toContain('uuid'); // ✅ Fails immediately
});
```

### When to Write Integration Tests

✅ **Write integration tests for:**
- Database operations (createNewGame, saveGame, deleteSave)
- Authentication flows
- File uploads
- Payment processing
- Any operation with external dependencies

❌ **Don't need integration tests for:**
- Pure functions
- UI components with mocked data
- Client-side state management

### Best Practices

1. **Clean up after tests:**
```typescript
afterAll(async () => {
  for (const gameId of testGameIds) {
    await deleteSave(gameId);
  }
});
```

2. **Test constraints:**
```typescript
it('should enforce foreign key constraint', async () => {
  const fakeUuid = '00000000-0000-0000-0000-000000000000';
  const { error } = await supabase.from('game_states').insert({
    current_location_id: fakeUuid,
    // ...
  });
  expect(error?.message).toMatch(/foreign key/i);
});
```

3. **Use realistic test data:**
```typescript
const { data: location } = await supabase
  .from('locations')
  .select('id')
  .limit(1)
  .single();
```

## Troubleshooting

### Tests not found

- Check file naming: `*.test.ts` or `*.test.tsx`
- Ensure file is in `src/` directory

### Import errors

- Verify path aliases in `vitest.config.ts`
- Check TypeScript configuration

### Three.js errors

- Mock Three.js components in tests
- Use dynamic imports for 3D components
