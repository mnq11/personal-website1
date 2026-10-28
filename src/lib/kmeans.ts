import { createRandom, type Random } from '../scene/sampling';

export type Vec3 = [number, number, number];

export interface KMeansState {
  points: Vec3[];
  centroids: Vec3[];
  /** Cluster index of each point after the latest step. */
  assignments: number[];
  iteration: number;
  converged: boolean;
}

const distance2 = (a: Vec3, b: Vec3) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

/** Roughly normal noise from three uniform draws; plenty for a demo cloud. */
function noise(random: Random, spread: number): number {
  return ((random() + random() + random()) / 3 - 0.5) * 2 * spread;
}

/** `k` blobs of points around well-separated centres, in a cube of about ±2. */
export function generatePoints(seed: number, k = 3, perBlob = 70): Vec3[] {
  const random = createRandom(seed);
  const centres: Vec3[] = [];
  while (centres.length < k) {
    const candidate: Vec3 = [(random() * 2 - 1) * 1.7, (random() * 2 - 1) * 1.3, (random() * 2 - 1) * 1.7];
    if (centres.every((centre) => distance2(centre, candidate) > 2.4)) centres.push(candidate);
  }
  return centres.flatMap((centre) =>
    Array.from({ length: perBlob }, (): Vec3 => [
      centre[0] + noise(random, 0.7),
      centre[1] + noise(random, 0.7),
      centre[2] + noise(random, 0.7),
    ]),
  );
}

/**
 * Starts with all `k` centroids huddled together: one random point and its nearest neighbours. It is a
 * poor first guess on purpose, so the early rounds are dramatic and the climb to a good answer is visible.
 */
export function initKMeans(points: Vec3[], k: number, seed: number): KMeansState {
  const random = createRandom(seed);
  const anchor = points[Math.floor(random() * points.length)] ?? ([0, 0, 0] as Vec3);
  const nearest = [...points].sort((a, b) => distance2(a, anchor) - distance2(b, anchor)).slice(0, k);
  const centroids = nearest.map((point): Vec3 => [...point] as Vec3);
  return { points, centroids, assignments: points.map(() => 0), iteration: 0, converged: false };
}

/** One round of k-means: assign each point to its nearest centroid, then move centroids to the mean. */
export function stepKMeans(state: KMeansState): KMeansState {
  if (state.converged) return state;
  const assignments = state.points.map((point) => {
    let best = 0;
    let bestDistance = Infinity;
    state.centroids.forEach((centroid, index) => {
      const d = distance2(point, centroid);
      if (d < bestDistance) {
        bestDistance = d;
        best = index;
      }
    });
    return best;
  });

  const sums = state.centroids.map(() => ({ x: 0, y: 0, z: 0, n: 0 }));
  assignments.forEach((cluster, i) => {
    const sum = sums[cluster];
    const point = state.points[i];
    if (!sum || !point) return;
    sum.x += point[0];
    sum.y += point[1];
    sum.z += point[2];
    sum.n += 1;
  });
  const centroids = state.centroids.map((old, index): Vec3 => {
    const sum = sums[index];
    return sum && sum.n > 0 ? [sum.x / sum.n, sum.y / sum.n, sum.z / sum.n] : old;
  });

  const moved = centroids.some((centroid, i) => distance2(centroid, state.centroids[i] ?? centroid) > 1e-8);
  const changed = assignments.some((cluster, i) => cluster !== state.assignments[i]);
  // The first step always counts: assignments start as all zeros and have not been computed yet.
  const converged = state.iteration > 0 && !moved && !changed;
  return { points: state.points, centroids, assignments, iteration: state.iteration + 1, converged };
}
