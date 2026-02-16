import { describe, expect, it } from 'vitest';
import { getCompassLabel, getHeadingDegreesFromVector } from './compass-utils';

describe('compass-utils', () => {
  it('calculates heading degrees from vector', () => {
    expect(getHeadingDegreesFromVector(0, 1)).toBeCloseTo(0, 5); // North
    expect(getHeadingDegreesFromVector(1, 0)).toBeCloseTo(90, 5); // East
    expect(getHeadingDegreesFromVector(0, -1)).toBeCloseTo(180, 5); // South
    expect(getHeadingDegreesFromVector(-1, 0)).toBeCloseTo(270, 5); // West
  });

  it('returns compass labels for headings', () => {
    expect(getCompassLabel(0)).toBe('N');
    expect(getCompassLabel(44)).toBe('NE');
    expect(getCompassLabel(90)).toBe('E');
    expect(getCompassLabel(135)).toBe('SE');
    expect(getCompassLabel(180)).toBe('S');
    expect(getCompassLabel(225)).toBe('SW');
    expect(getCompassLabel(270)).toBe('W');
    expect(getCompassLabel(315)).toBe('NW');
  });
});