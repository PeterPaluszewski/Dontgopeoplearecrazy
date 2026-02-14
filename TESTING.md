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

Tests run automatically on:

- Pre-commit hook (via Husky + lint-staged)
- Pull requests
- Before production builds

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
