/**
 * Game time utilities.
 *
 * The game clock is expressed in fractional "game days" elapsed since the
 * journey started (Day 1 at 06:00).  A value of 0 represents the very start
 * of Day 1 (06:00).  Travel advances the clock by the number of travel days
 * consumed on that leg.
 *
 * All functions are pure — no side effects, no imports from the store.
 */

export interface GameTime {
  /** 1-based day number (Day 1 on start). */
  day: number;
  /** Hour of day (0-23). */
  hour: number;
  /** Minute of hour (0-59). */
  minute: number;
}

/**
 * Convert accumulated fractional travel days into a GameTime value.
 *
 * The in-game day starts at 06:00, so day 0 elapsed = Day 1, 06:00.
 * Each whole day advances the clock by 24 hours.
 * Fractional days map linearly to hours and minutes within the day,
 * still offset so that a fresh journey starts at 06:00.
 *
 * @param totalTravelDays - Fractional total days elapsed since game start (>= 0)
 */
export function gameTimeFromTravelDays(totalTravelDays: number): GameTime {
  const elapsed = Math.max(0, totalTravelDays);

  const day = Math.floor(elapsed) + 1; // 1-based

  // Fractional part of the current day → hours + minutes, offset from 06:00
  const fractionOfDay = elapsed - Math.floor(elapsed);
  const totalMinutesInDay = fractionOfDay * 24 * 60;
  const startOffsetMinutes = 6 * 60; // 06:00 start
  const totalMinutes = Math.floor(totalMinutesInDay + startOffsetMinutes) % (24 * 60);

  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  return { day, hour, minute };
}

/**
 * Format a GameTime as a human-readable string.
 * Example: "Day 3  •  14:30"
 */
export function formatGameTime(time: GameTime): string {
  const hh = String(time.hour).padStart(2, '0');
  const mm = String(time.minute).padStart(2, '0');
  return `Day ${time.day}  \u2022  ${hh}:${mm}`;
}

/**
 * Convenience: format fractional travel days directly.
 */
export function formatTravelDays(totalTravelDays: number): string {
  return formatGameTime(gameTimeFromTravelDays(totalTravelDays));
}
