import { describe, expect, it } from 'vitest';
import { generatePoints, initKMeans, stepKMeans } from './kmeans';

describe('k-means', () => {
  it('generates the same cloud for the same seed', () => {
    expect(generatePoints(5)).toEqual(generatePoints(5));
    expect(generatePoints(5)).not.toEqual(generatePoints(6));
    expect(generatePoints(5, 3, 20)).toHaveLength(60);
  });

  it('converges and keeps every point assigned to a valid cluster', () => {
    const points = generatePoints(11);
    let state = initKMeans(points, 3, 3);
    for (let i = 0; i < 50 && !state.converged; i++) state = stepKMeans(state);
    expect(state.converged).toBe(true);
    expect(state.iteration).toBeLessThan(50);
    expect(state.assignments).toHaveLength(points.length);
    expect(state.assignments.every((cluster) => cluster >= 0 && cluster < 3)).toBe(true);
  });

  it('does not change once converged', () => {
    let state = initKMeans(generatePoints(2), 3, 1);
    for (let i = 0; i < 50 && !state.converged; i++) state = stepKMeans(state);
    expect(stepKMeans(state)).toBe(state);
  });

  it('never moves a centroid onto nothing when a cluster ends up empty', () => {
    const state = stepKMeans(initKMeans([[0, 0, 0], [0, 0, 0], [0, 0, 0]], 2, 1));
    for (const centroid of state.centroids) expect(centroid.every(Number.isFinite)).toBe(true);
  });
});
