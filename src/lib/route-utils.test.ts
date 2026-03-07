import type { Location } from '@/types/game';
import { describe, expect, it } from 'vitest';
import { appendToRoute, areDirectlyConnected, canAppendToRoute, getRouteTail } from './route-utils';

const base: Location = {
  id: '',
  name: '',
  description: '',
  latitude: 0,
  longitude: 0,
  difficultyMultiplier: 1,
  isCoastal: false,
  region: 'europe_mainland',
  connectedLocationIds: [],
  connections: [],
};

// A → B → D (linear chain)
// A → C (branch)
// B → C also connected
const locA: Location = { ...base, id: 'a', name: 'A', connectedLocationIds: ['b', 'c'] };
const locB: Location = { ...base, id: 'b', name: 'B', connectedLocationIds: ['a', 'c', 'd'] };
const locC: Location = { ...base, id: 'c', name: 'C', connectedLocationIds: ['a', 'b'] };
const locD: Location = { ...base, id: 'd', name: 'D', connectedLocationIds: ['b'] };
// E is isolated
const locE: Location = { ...base, id: 'e', name: 'E', connectedLocationIds: [] };

const locations = [locA, locB, locC, locD, locE];

describe('areDirectlyConnected', () => {
  it('returns true when anchor lists candidate', () => {
    expect(areDirectlyConnected(locations, 'a', 'b')).toBe(true);
  });

  it('returns true when candidate lists anchor (one-sided)', () => {
    // D lists B; make a version where B does NOT list D
    const locBNarrow: Location = { ...locB, connectedLocationIds: ['a'] };
    expect(areDirectlyConnected([locA, locBNarrow, locD], 'b', 'd')).toBe(true);
  });

  it('returns false when neither side lists the other', () => {
    expect(areDirectlyConnected(locations, 'a', 'e')).toBe(false);
  });

  it('returns false when anchor === candidate', () => {
    expect(areDirectlyConnected(locations, 'a', 'a')).toBe(false);
  });

  it('returns false when a location does not exist', () => {
    expect(areDirectlyConnected(locations, 'a', 'missing')).toBe(false);
    expect(areDirectlyConnected(locations, 'missing', 'a')).toBe(false);
  });
});

describe('getRouteTail', () => {
  it('returns currentLocationId when route is empty', () => {
    expect(getRouteTail([], 'a')).toBe('a');
  });

  it('returns the last route item when route has entries', () => {
    expect(getRouteTail(['b', 'c'], 'a')).toBe('c');
  });

  it('returns the only item when route has one entry', () => {
    expect(getRouteTail(['b'], 'a')).toBe('b');
  });
});

describe('canAppendToRoute', () => {
  it('allows appending a directly connected neighbour to an empty route', () => {
    expect(canAppendToRoute(locations, [], 'a', 'b')).toBe(true);
  });

  it('allows appending a city connected to the tail of the route', () => {
    // route is [b]; D is connected to B
    expect(canAppendToRoute(locations, ['b'], 'a', 'd')).toBe(true);
  });

  it('rejects appending the currentLocationId', () => {
    expect(canAppendToRoute(locations, [], 'a', 'a')).toBe(false);
  });

  it('rejects appending a city already in the route (no loops)', () => {
    expect(canAppendToRoute(locations, ['b'], 'a', 'b')).toBe(false);
  });

  it('rejects appending a city that is not connected to the route tail', () => {
    // Route tail is D; E is not connected to D
    expect(canAppendToRoute(locations, ['b', 'd'], 'a', 'e')).toBe(false);
  });

  it('rejects appending a city connected to current but not to the route tail', () => {
    // C is connected to A but route tail is D, which is not connected to C
    expect(canAppendToRoute(locations, ['b', 'd'], 'a', 'c')).toBe(false);
  });
});

describe('appendToRoute', () => {
  it('returns a new array with the candidate appended when valid', () => {
    const result = appendToRoute(locations, [], 'a', 'b');
    expect(result).toEqual(['b']);
  });

  it('extends an existing route', () => {
    const result = appendToRoute(locations, ['b'], 'a', 'd');
    expect(result).toEqual(['b', 'd']);
  });

  it('returns the original array reference unchanged when append is invalid', () => {
    const original = ['b'];
    const result = appendToRoute(locations, original, 'a', 'e');
    expect(result).toBe(original); // same reference
  });

  it('does not mutate the original route array', () => {
    const original = ['b'];
    appendToRoute(locations, original, 'a', 'c');
    expect(original).toEqual(['b']); // unchanged
  });
});
