import { Color } from 'three';

/** Scene palette, mirroring the CSS tokens in global.css. */
export const palette = {
  night: new Color('#081521'),
  snow: new Color('#e8eff3'),
  mist: new Color('#93a8b8'),
  saffron: new Color('#f2b544'),
  teal: new Color('#5cd6bf'),
  violet: new Color('#9c8cff'),
  sky: new Color('#6ea8ff'),
  rose: new Color('#ff8fa3'),
} as const;

export const css = {
  snow: '#e8eff3',
  mist: '#93a8b8',
  saffron: '#f2b544',
  teal: '#5cd6bf',
  violet: '#9c8cff',
  sky: '#6ea8ff',
  rose: '#ff8fa3',
} as const;

export const FONT_FAMILY = 'Readex Pro Variable';

/** Shared Canvas settings for section scenes. */
export const canvasProps = {
  dpr: [1, 1.75] as [number, number],
  gl: { antialias: true, alpha: true, powerPreference: 'high-performance' as const },
};
