import { describe, expect, it } from 'vitest';
import { placeFromScroll, WORLD_SECTIONS, worldAmount } from './world';

const mids = [1000, 2000, 3500, 4000];

describe('placeFromScroll', () => {
  it('holds the first and last shape outside the sections', () => {
    expect(placeFromScroll(mids, 0)).toBe(0);
    expect(placeFromScroll(mids, 1000)).toBe(0);
    expect(placeFromScroll(mids, 9000)).toBe(3);
    expect(placeFromScroll([], 500)).toBe(0);
  });

  it('holds a shape near its section and morphs in between', () => {
    expect(placeFromScroll(mids, 1200)).toBe(0);
    expect(placeFromScroll(mids, 1800)).toBe(1);
    const middle = placeFromScroll(mids, 1500);
    expect(middle).toBeCloseTo(0.5, 5);
  });

  it('never goes backwards while scrolling down', () => {
    let previous = -1;
    for (let y = 0; y <= 4500; y += 25) {
      const place = placeFromScroll(mids, y);
      expect(place).toBeGreaterThanOrEqual(previous);
      previous = place;
    }
  });

  it('is continuous across section centres, so particles never jump', () => {
    for (const centre of mids.slice(1, -1)) {
      expect(Math.abs(placeFromScroll(mids, centre + 0.01) - placeFromScroll(mids, centre - 0.01))).toBeLessThan(0.01);
    }
  });
});

describe('worldAmount', () => {
  it('is hidden over the hero, shown through the page and gone at the greeting', () => {
    expect(worldAmount(0, 0)).toBe(0);
    expect(worldAmount(2, 0)).toBe(1);
    expect(worldAmount(2, 1)).toBe(0);
  });

  it('has one shape per section the shader knows about', () => {
    expect(WORLD_SECTIONS).toHaveLength(7);
  });
});
