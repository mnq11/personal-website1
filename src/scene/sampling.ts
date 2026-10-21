/**
 * Turns text and shapes into point clouds for the particle scene.
 * All outputs are flat Float32Arrays of xyz triples so they can go straight into BufferAttributes.
 */

export type Random = () => number;

/** Small, fast, seedable PRNG (mulberry32) so the layout is identical on every visit. */
export function createRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface TextSampleOptions {
  lines: readonly string[];
  fontFamily: string;
  fontWeight?: number;
  direction: 'ltr' | 'rtl';
  count: number;
  /**
   * Height-to-width ratio of the box the text is fitted into. The longest side that hits the box
   * defines the scale, so every script ends up the same visual size regardless of its proportions.
   */
  boxAspect: number;
  random: Random;
}

/** Collects the coordinates of every filled pixel of `pixels` (RGBA) on a `step` grid. */
export function collectFilledPixels(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  step: number,
  threshold = 128,
): number[] {
  const points: number[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if ((pixels[(y * width + x) * 4 + 3] ?? 0) > threshold) points.push(x, y);
    }
  }
  return points;
}

/**
 * Picks exactly `count` points from the filled pixels and normalises them into a box
 * `1` wide and `boxAspect` tall, centred on the origin with +y up.
 */
export function normalisePoints(
  filled: readonly number[],
  count: number,
  boxAspect: number,
  random: Random,
  jitter = 0.6,
): Float32Array {
  const available = filled.length / 2;
  const out = new Float32Array(count * 3);
  if (available === 0) return out;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < filled.length; i += 2) {
    const x = filled[i] ?? 0;
    const y = filled[i + 1] ?? 0;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  const scale = Math.min(1 / width, boxAspect / height);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  // Partial Fisher–Yates over pixel indices gives an even, non-repeating spread when there are enough.
  const order = Array.from({ length: available }, (_, i) => i);
  for (let i = 0; i < count; i++) {
    let index: number;
    if (i < available) {
      const j = i + Math.floor(random() * (available - i));
      const swap = order[i] ?? 0;
      order[i] = order[j] ?? 0;
      order[j] = swap;
      index = order[i] ?? 0;
    } else {
      index = Math.floor(random() * available);
    }
    const px = (filled[index * 2] ?? 0) + (random() - 0.5) * jitter * 2;
    const py = (filled[index * 2 + 1] ?? 0) + (random() - 0.5) * jitter * 2;
    out[i * 3] = (px - cx) * scale;
    out[i * 3 + 1] = -(py - cy) * scale;
    out[i * 3 + 2] = (random() - 0.5) * 0.02;
  }
  return out;
}

/** Rasterises text in the browser and samples it into `count` points. */
export function sampleText(options: TextSampleOptions): Float32Array {
  const { lines, fontFamily, fontWeight = 700, direction, count, boxAspect, random } = options;
  const fontSize = 200;
  const lineHeight = fontSize * 1.18;
  const font = `${fontWeight} ${fontSize}px "${fontFamily}", system-ui, sans-serif`;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return new Float32Array(count * 3);

  context.font = font;
  const textWidth = Math.max(...lines.map((line) => context.measureText(line).width));
  canvas.width = Math.ceil(textWidth + fontSize);
  canvas.height = Math.ceil(lineHeight * lines.length + fontSize);

  // Resizing the canvas resets its state, so the font is set again before drawing.
  context.font = font;
  context.fillStyle = '#fff';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.direction = direction;
  lines.forEach((line, i) => {
    const offset = (i - (lines.length - 1) / 2) * lineHeight;
    context.fillText(line, canvas.width / 2, canvas.height / 2 + offset);
  });

  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const filled = collectFilledPixels(data, canvas.width, canvas.height, 2);
  return normalisePoints(filled, count, boxAspect, random);
}

/**
 * The "open sky" the name dissolves into: a loose aurora band across the screen plus scattered stars.
 * Coordinates are in [-1, 1] for x and y and [-1, 0] for z; the shader scales them to the viewport.
 */
export function sampleField(count: number, random: Random): Float32Array {
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const x = random() * 2 - 1;
    let y: number;
    if (random() < 0.62) {
      // Box–Muller gaussian around a gently curving band.
      const gaussian = Math.sqrt(-2 * Math.log(random() + 1e-6)) * Math.cos(2 * Math.PI * random());
      y = Math.sin(x * 2.4 + 0.6) * 0.32 + 0.12 + gaussian * 0.16;
    } else {
      y = random() * 2 - 1;
    }
    out[i * 3] = x;
    out[i * 3 + 1] = Math.max(-1, Math.min(1, y));
    out[i * 3 + 2] = -Math.pow(random(), 1.4);
  }
  return out;
}

export function sampleSeeds(count: number, random: Random): Float32Array {
  const out = new Float32Array(count);
  for (let i = 0; i < count; i++) out[i] = random();
  return out;
}
