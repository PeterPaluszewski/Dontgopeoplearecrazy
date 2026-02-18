import { describe, expect, it, vi } from 'vitest';
import { buildBorderSegments } from './CountryBordersOverlay';

vi.mock('@/data/natural-earth-admin0.json', () => ({
  default: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [10, 0],
              [10, 10],
            ],
          ],
        },
      },
    ],
  },
}));

describe('buildBorderSegments', () => {
  it('builds segments from border paths', () => {
    const segments = buildBorderSegments(2);
    expect(segments).toHaveLength(2);
  });
});