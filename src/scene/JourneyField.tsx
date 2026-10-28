import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial } from 'three';
import { bankAngle, chapterTint, fieldAmount, journeyState, travelDistance } from './journey';
import { createRandom } from './sampling';

/** Depth of the corridor the points flow through, in front of the camera at z = 10. */
const DEPTH = 24;

const vertexShader = /* glsl */ `
  uniform float uTravel;
  uniform float uBank;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uTime;
  attribute float aSeed;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    p.z = mod(p.z + uTravel, ${DEPTH.toFixed(1)}) - ${DEPTH.toFixed(1)};
    float c = cos(uBank);
    float s = sin(uBank);
    p.xy = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (9.0 / max(depth, 1.0));
    float near = smoothstep(11.0, 14.0, depth);
    float far = 1.0 - smoothstep(26.0, 34.0, depth);
    float twinkle = 0.65 + 0.35 * sin(uTime * 1.3 + aSeed * 40.0);
    vAlpha = near * far * twinkle;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uTint;
  uniform float uAmount;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float glow = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(mix(uTint, vec3(1.0), 0.35), glow * glow * vAlpha * uAmount);
  }
`;

interface JourneyFieldProps {
  reducedMotion: boolean;
  compact: boolean;
}

/** Points flowing toward the camera as the page scrolls; the colour follows the chapter in view. */
export function JourneyField({ reducedMotion, compact }: JourneyFieldProps) {
  const count = compact ? 500 : 1300;
  const viewport = useThree((state) => state.viewport);

  const geometry = useMemo(() => {
    const random = createRandom(77);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (random() * 2 - 1) * 9;
      positions[i * 3 + 1] = (random() * 2 - 1) * 6;
      positions[i * 3 + 2] = random() * DEPTH;
      seeds[i] = random();
    }
    const built = new BufferGeometry();
    built.setAttribute('position', new BufferAttribute(positions, 3));
    built.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    return built;
  }, [count]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTravel: { value: 0 },
          uBank: { value: 0 },
          uSize: { value: 3.6 },
          uPixelRatio: { value: 1 },
          uTime: { value: 0 },
          uTint: { value: [1, 1, 1] },
          uAmount: { value: 0 },
        },
      }),
    [],
  );

  useFrame((state) => {
    const u = material.uniforms as Record<string, { value: unknown }>;
    const set = (name: string, value: unknown) => {
      const uniform = u[name];
      if (uniform) uniform.value = value;
    };
    const time = reducedMotion ? 0 : state.clock.elapsedTime;
    const scrollY = window.scrollY;
    const progress = scrollY / Math.max(window.innerHeight, 1);
    // Reduced motion keeps the colour and a still field; nothing flows.
    set('uTravel', reducedMotion ? 0 : travelDistance(scrollY, time));
    set('uBank', reducedMotion ? 0 : bankAngle(scrollY));
    set('uTime', time);
    set('uPixelRatio', state.gl.getPixelRatio());
    set('uTint', chapterTint(journeyState.place));
    set('uAmount', fieldAmount(progress, journeyState.greet) * (viewport.width > 0 ? 0.8 : 0));
  });

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={-1} />;
}
