import { describe, expect, it } from 'vitest';
import data from './natural-earth-admin0.json';

describe('natural-earth-admin0.json', () => {
  it('loads as a feature collection', () => {
    const typedData = data as { type?: string; features?: unknown[] };
    expect(typedData.type).toBe('FeatureCollection');
    expect(Array.isArray(typedData.features)).toBe(true);
  });
});
