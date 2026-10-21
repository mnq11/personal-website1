import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';
import { FONT_FAMILY } from './theme';

export interface Label {
  texture: CanvasTexture;
  /** Width divided by height, so a sprite can be scaled without distortion. */
  aspect: number;
}

interface LabelOptions {
  size?: number;
  weight?: number;
  color?: string;
  /** Optional rounded pill drawn behind the text. */
  background?: string;
  border?: string;
  /** Small coloured dot drawn before the text, e.g. to mark a verified skill. */
  dot?: string;
  paddingX?: number;
  paddingY?: number;
}

const cache = new Map<string, Label>();

/**
 * Renders text into a texture using the page's web font, so Arabic is shaped by the browser and
 * every label matches the typography of the HTML around it. Textures are cached by text and style.
 */
export function makeLabel(text: string, options: LabelOptions = {}): Label {
  const {
    size = 64,
    weight = 500,
    color = '#e8eff3',
    background,
    border,
    dot,
    paddingX = background ? size * 0.55 : size * 0.15,
    paddingY = background ? size * 0.32 : size * 0.12,
  } = options;
  const key = JSON.stringify([text, size, weight, color, background, border, dot, paddingX, paddingY]);
  const hit = cache.get(key);
  if (hit) return hit;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const font = `${weight} ${size}px "${FONT_FAMILY}", system-ui, sans-serif`;
  const dotSpace = dot ? size * 0.55 : 0;
  let width = size * 4;
  if (context) {
    context.font = font;
    width = Math.ceil(context.measureText(text).width + paddingX * 2 + dotSpace);
  }
  const height = Math.ceil(size * 1.45 + paddingY * 2);
  canvas.width = width;
  canvas.height = height;

  if (context) {
    if (background) {
      const radius = height / 2;
      context.beginPath();
      context.roundRect(1, 1, width - 2, height - 2, radius);
      context.fillStyle = background;
      context.fill();
      if (border) {
        context.strokeStyle = border;
        context.lineWidth = 2;
        context.stroke();
      }
    }
    if (dot) {
      context.beginPath();
      context.arc(paddingX + size * 0.16, height / 2, size * 0.14, 0, Math.PI * 2);
      context.fillStyle = dot;
      context.fill();
    }
    context.font = font;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, (width + dotSpace) / 2, height / 2 + size * 0.04);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;
  const label = { texture, aspect: width / height };
  cache.set(key, label);
  return label;
}

/** Resolves once the web font can be used on a canvas, so labels never render in a fallback face. */
export function fontsReady(sample: string): Promise<void> {
  return Promise.all([
    document.fonts.load(`500 64px "${FONT_FAMILY}"`, sample),
    document.fonts.load(`700 64px "${FONT_FAMILY}"`, sample),
  ])
    .then(() => undefined)
    .catch(() => undefined);
}
