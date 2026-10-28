/**
 * The flight: a field of drifting points that streams past as the visitor scrolls, tinted by the
 * chapter in view. Pure helpers so the maths can be tested without WebGL.
 */

/** One tint per world section, in the same order as WORLD_SECTIONS (RGB, 0 to 1). */
export const CHAPTER_TINTS: readonly (readonly [number, number, number])[] = [
  [0.36, 0.84, 0.75], // about: teal
  [0.95, 0.71, 0.27], // numbers: saffron
  [0.61, 0.55, 1.0], // skills: violet
  [0.43, 0.66, 1.0], // experience: sky
  [1.0, 0.56, 0.64], // projects: rose
  [0.36, 0.84, 0.75], // education: teal
  [0.95, 0.71, 0.27], // writing: saffron
];

/** Blends between neighbouring chapter tints for a fractional section index. */
export function chapterTint(place: number): [number, number, number] {
  const last = CHAPTER_TINTS.length - 1;
  const clamped = Math.min(Math.max(place, 0), last);
  const from = Math.floor(clamped);
  const to = Math.min(from + 1, last);
  const mix = clamped - from;
  const a = CHAPTER_TINTS[from] ?? [1, 1, 1];
  const b = CHAPTER_TINTS[to] ?? a;
  return [a[0] + (b[0] - a[0]) * mix, a[1] + (b[1] - a[1]) * mix, a[2] + (b[2] - a[2]) * mix];
}

/** How far the camera has flown for a scroll offset (pixels) and elapsed time (seconds). */
export function travelDistance(scrollY: number, time: number): number {
  return scrollY * 0.011 + time * 0.35;
}

/** The field fades in once the hero name has scattered and eases back at the greeting. */
export function fieldAmount(scrollProgress: number, greet: number): number {
  const t = Math.min(Math.max((scrollProgress - 0.12) / 0.4, 0), 1);
  return t * t * (3 - 2 * t) * (1 - greet * 0.7);
}

/** Banking angle in radians: a slow sway so the flight never feels like a straight rail. */
export function bankAngle(scrollY: number): number {
  return Math.sin(scrollY * 0.0009) * 0.14;
}

/** Shared between the name layer (which knows the section in view) and the flight field. */
export const journeyState = { place: 0, greet: 0 };
