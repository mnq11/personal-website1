import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, ShaderMaterial } from 'three';
import { chapterTint, journeyState, secondColourAt } from './journey';

const vertexShader = /* glsl */ `
  void main() {
    // One oversized triangle that covers the screen, so the backdrop ignores the camera.
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uScroll;
  uniform vec3 uTint;
  uniform vec3 uTintB;
  uniform vec2 uPointer;
  uniform float uAmount;
  uniform float uQuality;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      if (float(i) >= uQuality) break;
      v += a * noise(p);
      p = p * 2.02 + vec2(17.0, 9.0);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
    float t = uTime * 0.045;

    // Domain-warped noise: slow folds of light, drifting with time and with the page scroll.
    vec2 q = vec2(fbm(p * 1.5 + vec2(t, -t * 0.7) + uScroll * 0.12), fbm(p * 1.5 + vec2(5.2, 1.3) - t));
    float n = fbm(p * 1.3 + 2.0 * q + vec2(0.0, uScroll * 0.06));

    float folds = smoothstep(0.5, 0.88, n);
    float curve = 0.62 + 0.17 * sin(uv.x * 3.0 + uTime * 0.05 + uScroll * 0.5) + (n - 0.5) * 0.45;
    float ribbon = exp(-pow((uv.y - curve) * 3.4, 2.0));
    float glow = folds * 0.55 + ribbon * 0.5;

    vec3 colour = mix(uTint, uTintB, smoothstep(0.15, 0.85, n + uv.x * 0.35));

    // A soft pool of light follows the pointer.
    float d = distance(uv * vec2(aspect, 1.0), uPointer * vec2(aspect, 1.0));
    float spot = exp(-d * d * 9.0);

    float vignette = smoothstep(1.25, 0.15, length(p));
    float alpha = (glow * 0.5 + spot * 0.16) * vignette * uAmount;
    // A little dither hides banding in the dark gradients.
    alpha += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
    gl_FragColor = vec4(colour, max(alpha, 0.0));
  }
`;

interface AuroraBackdropProps {
  reducedMotion: boolean;
  /** Fewer noise octaves on small or weak devices. */
  quality: number;
}

const smooth = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
};

/** A full-screen aurora behind everything: slow folds of light that take the colour of the chapter in view. */
export function AuroraBackdrop({ reducedMotion, quality }: AuroraBackdropProps) {
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);

  const geometry = useMemo(() => {
    const built = new BufferGeometry();
    built.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    return built;
  }, []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uResolution: { value: [1, 1] },
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uTint: { value: [0.36, 0.84, 0.75] },
          uTintB: { value: [0.5, 0.45, 1] },
          uPointer: { value: [0.5, 0.5] },
          uAmount: { value: 0.6 },
          uQuality: { value: quality },
        },
      }),
    [quality],
  );

  // The second hue follows the visitor's local time: gold at dawn, blue by day, rose at dusk, violet at night.
  const cool = useMemo(() => {
    const now = new Date();
    return secondColourAt(now.getHours() + now.getMinutes() / 60);
  }, []);

  const current = useMemo(
    () => ({
      tint: [0.36, 0.84, 0.75] as [number, number, number],
      x: 0.5,
      y: 0.5,
    }),
    [],
  );

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const u = material.uniforms as Record<string, { value: unknown }>;
    const set = (name: string, value: unknown) => {
      const uniform = u[name];
      if (uniform) uniform.value = value;
    };
    const target = chapterTint(journeyState.place);
    const k = reducedMotion ? 1 : Math.min(1, delta * 2.5);
    for (let i = 0; i < 3; i++)
      current.tint[i] = (current.tint[i] ?? 0) + ((target[i] ?? 0) - (current.tint[i] ?? 0)) * k;
    // The second colour is the chapter colour pulled toward cool blue-violet, so the folds always have two hues.
    const second = current.tint.map((c, i) => c * 0.4 + (cool[i] ?? 1) * 0.6);
    current.x += (journeyState.pointerX * 0.5 + 0.5 - current.x) * Math.min(1, delta * 4);
    current.y += (journeyState.pointerY * 0.5 + 0.5 - current.y) * Math.min(1, delta * 4);

    const progress = window.scrollY / Math.max(window.innerHeight, 1);
    set('uResolution', [size.width * dpr, size.height * dpr]);
    set('uTime', reducedMotion ? 0 : state.clock.elapsedTime);
    set('uScroll', reducedMotion ? 0 : progress);
    set('uTint', [...current.tint]);
    set('uTintB', second);
    set('uPointer', reducedMotion ? [0.5, 0.5] : [current.x, current.y]);
    set('uAmount', 0.7 + 0.3 * smooth(0.1, 0.9, progress));
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={-10} />;
}
