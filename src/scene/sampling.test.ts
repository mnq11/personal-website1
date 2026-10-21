import { describe, expect, it } from 'vitest';
import { collectFilledPixels, createRandom, normalisePoints, sampleField } from './sampling';

describe('createRandom', () => {
  it('is deterministic for a seed and stays in [0, 1)', () => {
    const a = createRandom(42);
    const b = createRandom(42);
    for (let i = 0; i < 100; i++) {
      const value = a();
      expect(value).toBe(b());
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('collectFilledPixels', () => {
  it('returns coordinates of opaque pixels only', () => {
    // 2×2 image: only the bottom-right pixel is opaque.
    const pixels = new Uint8ClampedArray([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255]);
    expect(collectFilledPixels(pixels, 2, 2, 1)).toEqual([1, 1]);
  });
});

describe('normalisePoints', () => {
  const filled = [0, 0, 100, 0, 0, 20, 100, 20, 50, 10];

  it('returns exactly the requested number of points, reusing pixels when needed', () => {
    const points = normalisePoints(filled, 50, 0.3, createRandom(1), 0);
    expect(points).toHaveLength(150);
  });

  it('fits the cloud inside a box one unit wide and boxAspect tall, centred on the origin', () => {
    const points = normalisePoints(filled, 200, 0.3, createRandom(2), 0);
    for (let i = 0; i < points.length; i += 3) {
      expect(Math.abs(points[i] ?? 0)).toBeLessThanOrEqual(0.5 + 1e-6);
      expect(Math.abs(points[i + 1] ?? 0)).toBeLessThanOrEqual(0.15 + 1e-6);
    }
  });

  it('returns zeros for an empty image instead of throwing', () => {
    expect(Array.from(normalisePoints([], 3, 0.3, createRandom(3)))).toEqual(new Array(9).fill(0));
  });
});

describe('sampleField', () => {
  it('keeps every point inside the unit field', () => {
    const field = sampleField(500, createRandom(4));
    for (let i = 0; i < field.length; i += 3) {
      expect(Math.abs(field[i] ?? 0)).toBeLessThanOrEqual(1);
      expect(Math.abs(field[i + 1] ?? 0)).toBeLessThanOrEqual(1);
      expect(field[i + 2]).toBeLessThanOrEqual(0);
      expect(field[i + 2]).toBeGreaterThanOrEqual(-1);
    }
  });
});
