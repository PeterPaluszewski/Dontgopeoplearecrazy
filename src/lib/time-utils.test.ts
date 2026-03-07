import { describe, expect, it } from 'vitest';
import { formatGameTime, formatTravelDays, gameTimeFromTravelDays } from './time-utils';

describe('gameTimeFromTravelDays', () => {
  it('returns Day 1, 06:00 at the very start (0 days elapsed)', () => {
    expect(gameTimeFromTravelDays(0)).toEqual({ day: 1, hour: 6, minute: 0 });
  });

  it('advances to Day 2 after 1 full travel day', () => {
    expect(gameTimeFromTravelDays(1)).toEqual({ day: 2, hour: 6, minute: 0 });
  });

  it('advances to Day 3 after 2 full travel days', () => {
    expect(gameTimeFromTravelDays(2)).toEqual({ day: 3, hour: 6, minute: 0 });
  });

  it('handles fractional days — 0.5 days is 12 hours after 06:00 → 18:00', () => {
    expect(gameTimeFromTravelDays(0.5)).toEqual({ day: 1, hour: 18, minute: 0 });
  });

  it('handles fractional days that wrap past midnight', () => {
    // 0.75 days = 18 hours after 06:00 → 00:00 next slot (within same day index)
    // 06:00 + 0.75*24h = 06:00 + 18h = 00:00 (wraps, same day bucket)
    const result = gameTimeFromTravelDays(0.75);
    expect(result.day).toBe(1);
    expect(result.hour).toBe(0);
    expect(result.minute).toBe(0);
  });

  it('correctly shows minutes from a fractional day', () => {
    // 0.25 days = 6 hours after 06:00 → 12:00
    expect(gameTimeFromTravelDays(0.25)).toEqual({ day: 1, hour: 12, minute: 0 });
  });

  it('clamps negative values to 0', () => {
    expect(gameTimeFromTravelDays(-5)).toEqual({ day: 1, hour: 6, minute: 0 });
  });

  it('handles large day counts', () => {
    const result = gameTimeFromTravelDays(99);
    expect(result.day).toBe(100);
    expect(result.hour).toBe(6);
    expect(result.minute).toBe(0);
  });
});

describe('formatGameTime', () => {
  it('formats correctly with zero-padded hours and minutes', () => {
    expect(formatGameTime({ day: 1, hour: 6, minute: 0 })).toBe('Day 1  \u2022  06:00');
  });

  it('formats double-digit hours and minutes', () => {
    expect(formatGameTime({ day: 12, hour: 14, minute: 30 })).toBe('Day 12  \u2022  14:30');
  });

  it('formats midnight correctly', () => {
    expect(formatGameTime({ day: 5, hour: 0, minute: 0 })).toBe('Day 5  \u2022  00:00');
  });
});

describe('formatTravelDays', () => {
  it('formats 0 days as Day 1 at 06:00', () => {
    expect(formatTravelDays(0)).toBe('Day 1  \u2022  06:00');
  });

  it('formats 3 days as Day 4 at 06:00', () => {
    expect(formatTravelDays(3)).toBe('Day 4  \u2022  06:00');
  });
});
