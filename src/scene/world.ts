/**
 * The "world" companion: the same particles that spell the name take the shape of each section
 * (ring, columns, globe, helix, card ring, slabs, wave) as the visitor scrolls, then become the greeting.
 * These helpers are pure so the scroll maths can be tested without WebGL.
 */

/** Sections that have a shape, in page order. The shader's shape ids follow this order. */
export const WORLD_SECTIONS = ['about', 'numbers', 'skills', 'experience', 'projects', 'education', 'writing'] as const;

export type WorldSection = (typeof WORLD_SECTIONS)[number];

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

/**
 * Turns a scroll position into a fractional shape index. `mids` are the page-space centres of the
 * sections, in order, and `y` is the page-space line being looked at (the middle of the viewport).
 * Between two sections the shapes morph; while a section is in view its shape holds still.
 */
export function placeFromScroll(mids: readonly number[], y: number): number {
  const last = mids.length - 1;
  if (last < 0) return 0;
  const first = mids[0] ?? 0;
  const end = mids[last] ?? first;
  if (y <= first) return 0;
  if (y >= end) return last;
  for (let i = 0; i < last; i++) {
    const from = mids[i] ?? 0;
    const to = mids[i + 1] ?? from;
    if (y >= from && y < to) return i + smoothstep(0.3, 0.7, (y - from) / Math.max(to - from, 1));
  }
  return last;
}

/** How much of the world is visible: hidden over the hero name, gone again once the greeting arrives. */
export function worldAmount(scrollProgress: number, greet: number): number {
  return smoothstep(0.3, 0.95, scrollProgress) * (1 - greet);
}
