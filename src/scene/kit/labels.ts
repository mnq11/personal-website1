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
    paddingX = background ? size * 0.55 : size * 0.15,
    paddingY = background ? size * 0.32 : size * 0.12,
  } = options;
  const key = JSON.stringify([text, size, weight, color, background, border, paddingX, paddingY]);
  const hit = cache.get(key);
  if (hit) return hit;

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const font = `${weight} ${size}px "${FONT_FAMILY}", system-ui, sans-serif`;
  let width = size * 4;
  if (context) {
    context.font = font;
    width = Math.ceil(context.measureText(text).width + paddingX * 2);
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
    context.font = font;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, width / 2, height / 2 + size * 0.04);
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
