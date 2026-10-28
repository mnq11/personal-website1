import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, ShaderMaterial } from 'three';
import { SceneFrame } from '../kit/SceneFrame';
import { useMotionFactor } from '../kit/useMotion';

interface PortraitDustProps {
  /** Absolute URL of the portrait image. */
  src: string;
  /** True while the visitor is pointing at the portrait: the photo gives way to its particles. */
  active: boolean;
  /** Changes on every click or tap; each change scatters the particles. */
  burstKey: number;
}

const COLUMNS = 96;
const ROWS = 120;
/** Scene size of the particle portrait; the figure is 4:5, like the photo's crop. */
const WIDTH = 1.6;
const HEIGHT = 2;

interface Dust {
  positions: Float32Array;
  colours: Float32Array;
  alphas: Float32Array;
  seeds: Float32Array;
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uShow;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uMotion;
  uniform float uBurst;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  attribute vec3 aColour;
  attribute float aAlpha;
  attribute float aSeed;
  varying vec3 vColour;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    // A faint shimmer so the portrait feels alive rather than printed.
    p.xy += vec2(sin(uTime * 1.4 + aSeed * 30.0), cos(uTime * 1.1 + aSeed * 20.0)) * 0.005 * uMotion;

    // The pointer pushes nearby particles aside; they return when it leaves.
    vec2 away = p.xy - uPointer;
    float push = exp(-dot(away, away) * 42.0) * uPointerStrength;
    p.xy += normalize(away + vec2(0.0001)) * push * 0.18;
    p.z += push * (aSeed - 0.5) * 0.8;

    // A click throws the particles out in all directions; uBurst decays back to zero.
    vec2 dir = vec2(cos(aSeed * 43.98), sin(aSeed * 69.12));
    p.xy += dir * uBurst * (0.35 + fract(aSeed * 13.0)) * 0.9;
    p.z += uBurst * (fract(aSeed * 7.0) - 0.5) * 1.2;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (4.0 / -mv.z);
    vColour = aColour;
    vAlpha = aAlpha * uShow;
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColour;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(vColour, vAlpha * smoothstep(0.5, 0.2, d));
  }
`;

/** Reads the photo into a grid of coloured points. Points outside the arch-shaped frame are left out. */
function sample(image: HTMLImageElement, random: () => number): Dust | null {
  const canvas = document.createElement('canvas');
  canvas.width = COLUMNS;
  canvas.height = ROWS;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  // The page shows a 4:5 crop of the square photo, centred horizontally.
  const cropWidth = image.naturalWidth * 0.8;
  context.drawImage(
    image,
    (image.naturalWidth - cropWidth) / 2,
    0,
    cropWidth,
    image.naturalHeight,
    0,
    0,
    COLUMNS,
    ROWS,
  );
  const { data } = context.getImageData(0, 0, COLUMNS, ROWS);

  const positions: number[] = [];
  const colours: number[] = [];
  const alphas: number[] = [];
  const seeds: number[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let column = 0; column < COLUMNS; column++) {
      const u = (column + 0.5) / COLUMNS;
      const v = (row + 0.5) / ROWS;
      // The frame's top is a half circle whose radius is half its width.
      const fromTop = v * (HEIGHT / WIDTH) * 2;
      const x = (u - 0.5) * 2;
      if (fromTop < 1 && Math.abs(x) > Math.sqrt(Math.max(1 - (1 - fromTop) ** 2, 0))) continue;
      const i = (row * COLUMNS + column) * 4;
      // Fade toward the edges, so the portrait dissolves into the dark instead of ending in a box.
      const edge = Math.hypot(x / 0.95, (v - 0.42) / 0.62);
      const alpha = 1 - Math.min(Math.max((edge - 0.65) / 0.4, 0), 1);
      if (alpha <= 0.02) continue;
      positions.push((u - 0.5) * WIDTH + (random() - 0.5) * 0.008, (0.5 - v) * HEIGHT + (random() - 0.5) * 0.008, 0);
      colours.push((data[i] ?? 0) / 255, (data[i + 1] ?? 0) / 255, (data[i + 2] ?? 0) / 255);
      alphas.push(alpha);
      seeds.push(random());
    }
  }
  return {
    positions: new Float32Array(positions),
    colours: new Float32Array(colours),
    alphas: new Float32Array(alphas),
    seeds: new Float32Array(seeds),
  };
}

function Dust({ src, active, burstKey }: PortraitDustProps) {
  const motion = useMotionFactor();
  const [dust, setDust] = useState<Dust | null>(null);
  const state = useRef({ show: 0, burst: 0, strength: 0, key: burstKey });

  useEffect(() => {
    let live = true;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      if (!live) return;
      // A fixed seed keeps the tiny jitter identical on every visit.
      let seed = 42;
      const random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      };
      setDust(sample(image, random));
    };
    image.src = src;
    return () => {
      live = false;
    };
  }, [src]);

  const geometry = useMemo(() => {
    if (!dust) return null;
    const built = new BufferGeometry();
    built.setAttribute('position', new BufferAttribute(dust.positions, 3));
    built.setAttribute('aColour', new BufferAttribute(dust.colours, 3));
    built.setAttribute('aAlpha', new BufferAttribute(dust.alphas, 1));
    built.setAttribute('aSeed', new BufferAttribute(dust.seeds, 1));
    return built;
  }, [dust]);
  useEffect(() => () => geometry?.dispose(), [geometry]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uShow: { value: 0 },
          uPixelRatio: { value: 1 },
          uSize: { value: 2.3 },
          uMotion: { value: 1 },
          uBurst: { value: 0 },
          uPointer: { value: [9, 9] },
          uPointerStrength: { value: 0 },
        },
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  const viewport = useThree((s) => s.viewport);

  useFrame((frame, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const s = state.current;
    const u = material.uniforms as Record<string, { value: unknown }>;
    const set = (name: string, value: unknown) => {
      const uniform = u[name];
      if (uniform) uniform.value = value;
    };
    s.show += ((active ? 1 : 0) - s.show) * Math.min(1, delta * 6);
    if (burstKey !== s.key) {
      s.key = burstKey;
      s.burst = motion ? 1 : 0;
    }
    s.burst *= Math.exp(-delta * 2.2);
    // The pointer only pushes while it is over the portrait.
    s.strength += ((active && motion ? 1 : 0) - s.strength) * Math.min(1, delta * 8);
    set('uTime', frame.clock.elapsedTime);
    set('uShow', s.show);
    set('uPixelRatio', frame.gl.getPixelRatio());
    set('uMotion', motion);
    set('uBurst', s.burst);
    set('uPointer', [(frame.pointer.x * viewport.width) / 2, (frame.pointer.y * viewport.height) / 2]);
    set('uPointerStrength', s.strength);
  });

  if (!geometry) return null;
  return <points geometry={geometry} material={material} frustumCulled={false} visible={true} />;
}

export default function PortraitDust(props: PortraitDustProps) {
  return (
    <SceneFrame fov={30} position={[0, 0, 4]}>
      <Dust {...props} />
    </SceneFrame>
  );
}
