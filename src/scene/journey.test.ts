import { describe, expect, it } from 'vitest';
import { bankAngle, CHAPTER_TINTS, chapterTint, fieldAmount, travelDistance } from './journey';
import { WORLD_SECTIONS } from './world';

const tint = (i: number): [number, number, number] => [...(CHAPTER_TINTS[i] ?? [0, 0, 0])] as [number, number, number];

describe('journey', () => {
  it('has one tint per world section', () => {
    expect(CHAPTER_TINTS).toHaveLength(WORLD_SECTIONS.length);
  });

  it('returns the exact tint on whole indices and blends between them', () => {
    expect(chapterTint(2)).toEqual(tint(2));
    const [r] = chapterTint(0.5);
    expect(r).toBeCloseTo((tint(0)[0] + tint(1)[0]) / 2);
  });

  it('clamps out-of-range places', () => {
    expect(chapterTint(-3)).toEqual(tint(0));
    expect(chapterTint(99)).toEqual(tint(CHAPTER_TINTS.length - 1));
  });

  it('flies further as the page scrolls and time passes', () => {
    expect(travelDistance(1000, 0)).toBeGreaterThan(travelDistance(0, 0));
    expect(travelDistance(0, 10)).toBeGreaterThan(travelDistance(0, 0));
  });

  it('keeps the field hidden over the hero and soft at the greeting', () => {
    expect(fieldAmount(0, 0)).toBe(0);
    expect(fieldAmount(1, 0)).toBe(1);
    expect(fieldAmount(1, 1)).toBeCloseTo(0.3);
  });

  it('banks gently', () => {
    for (const y of [0, 500, 2000, 9000]) expect(Math.abs(bankAngle(y))).toBeLessThanOrEqual(0.14);
  });
});
