/**
 * The flight: a field of drifting points that streams past as the visitor scrolls, tinted by the
 * chapter in view. Pure helpers so the maths can be tested without WebGL.
 */

/** One tint per world section, in the same order as WORLD_SECTIONS (RGB, 0 to 1). */
export const CHAPTER_TINTS: readonly (readonly [number, number, number])[] = [
  [0.36, 0.84, 0.75], // about: teal
  [1.0, 0.56, 0.64], // projects: rose
  [0.61, 0.55, 1.0], // skills: violet
  [0.95, 0.71, 0.27], // numbers: saffron
  [0.43, 0.66, 1.0], // experience: sky
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
export const journeyState = { place: 0, greet: 0, pointerX: 0, pointerY: 0 };

export type Period = 'dawn' | 'day' | 'dusk' | 'night';

/** Which part of the day an hour (0 to 24, fractions allowed) falls in. */
export function periodOfDay(hour: number): Period {
  const h = ((hour % 24) + 24) % 24;
  if (h >= 5 && h < 9) return 'dawn';
  if (h >= 9 && h < 17) return 'day';
  if (h >= 17 && h < 21) return 'dusk';
  return 'night';
}

const SECOND_COLOUR_STOPS: readonly (readonly [number, readonly [number, number, number]])[] = [
  [0, [0.5, 0.42, 1]], // deep night: violet
  [5, [0.55, 0.45, 1]],
  [7, [1, 0.72, 0.5]], // dawn: warm gold-rose
  [10, [0.4, 0.78, 1]], // day: clear sky blue
  [16, [0.4, 0.78, 1]],
  [18.5, [1, 0.55, 0.5]], // dusk: rose-orange
  [21, [0.55, 0.4, 1]],
  [24, [0.5, 0.42, 1]],
];

/** The aurora's second colour for the visitor's local time of day, blended smoothly between the stops. */
export function secondColourAt(hour: number): [number, number, number] {
  const h = ((hour % 24) + 24) % 24;
  for (let i = 0; i < SECOND_COLOUR_STOPS.length - 1; i++) {
    const [h0, c0] = SECOND_COLOUR_STOPS[i] ?? [0, [1, 1, 1]];
    const [h1, c1] = SECOND_COLOUR_STOPS[i + 1] ?? [24, c0];
    if (h >= h0 && h <= h1) {
      const t = (h - h0) / Math.max(h1 - h0, 1e-6);
      return [c0[0] + (c1[0] - c0[0]) * t, c0[1] + (c1[1] - c0[1]) * t, c0[2] + (c1[2] - c0[2]) * t];
    }
  }
  return [0.5, 0.42, 1];
}
