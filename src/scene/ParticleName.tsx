import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial } from 'three';
import { profile } from '../data/resume';
import type { Language } from '../i18n/types';
import { createRandom, sampleField, sampleSeeds, sampleText } from './sampling';
import { fragmentShader, vertexShader } from './shaders';

const FONT_FAMILY = 'Readex Pro Variable';
/** Seconds each script stays on screen before morphing into the other. */
const HOLD_SECONDS = 4.2;
const MORPH_SECONDS = 2.4;
const ASSEMBLE_SECONDS = 2.8;
/** Mirrors --max-width (78rem) and --gutter in global.css so the name lines up with the content. */
const CONTENT_MAX_PX = 78 * 16;
const gutterPx = (viewportWidth: number) => Math.min(Math.max(16, 8 + viewportWidth * 0.03), 48);

interface ParticleNameProps {
  language: Language;
  reducedMotion: boolean;
  compact: boolean;
  onReady?: () => void;
}

interface Cloud {
  latin: Float32Array;
  arabic: Float32Array;
  field: Float32Array;
  seeds: Float32Array;
}

function approach(current: number, target: number, step: number): number {
  return current < target ? Math.min(current + step, target) : Math.max(current - step, target);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(Math.max((x - edge0) / (edge1 - edge0), 0), 1);
  return t * t * (3 - 2 * t);
}

/** Samples both spellings of the name once the web font is ready, so the canvas draws the real glyphs. */
function useCloud(count: number, compact: boolean): Cloud | null {
  const [cloud, setCloud] = useState<Cloud | null>(null);

  useEffect(() => {
    let cancelled = false;
    const latinText = compact ? profile.nameLines.en : [profile.name.en];
    const arabicText = compact ? profile.nameLines.ar : [profile.name.ar];
    const boxAspect = compact ? 0.78 : 0.24;

    Promise.all([
      document.fonts.load(`700 200px "${FONT_FAMILY}"`, latinText.join(' ')),
      document.fonts.load(`700 200px "${FONT_FAMILY}"`, arabicText.join(' ')),
    ])
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        const random = createRandom(1104);
        setCloud({
          latin: sampleText({ lines: latinText, fontFamily: FONT_FAMILY, direction: 'ltr', count, boxAspect, random }),
          arabic: sampleText({ lines: arabicText, fontFamily: FONT_FAMILY, direction: 'rtl', count, boxAspect, random }),
          field: sampleField(count, random),
          seeds: sampleSeeds(count, random),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [count, compact]);

  return cloud;
}

export function ParticleName({ language, reducedMotion, compact, onReady }: ParticleNameProps) {
  const count = compact ? 7000 : 16000;
  const cloud = useCloud(count, compact);
  const viewport = useThree((state) => state.viewport);
  const pointer = useRef({ x: 0, y: 0, active: false });
  const readyFired = useRef(false);
  const timeline = useRef({
    time: 0,
    assemble: reducedMotion ? 1 : 0,
    morph: language === 'ar' ? 1 : 0,
    morphTarget: language === 'ar' ? 1 : 0,
    holdUntil: ASSEMBLE_SECONDS + HOLD_SECONDS,
    pointerStrength: 0,
  });

  const geometry = useMemo(() => {
    if (!cloud) return null;
    const built = new BufferGeometry();
    // `position` is required by three.js; the shader works from the three named home positions instead.
    built.setAttribute('position', new BufferAttribute(cloud.field, 3));
    built.setAttribute('aLatin', new BufferAttribute(cloud.latin, 3));
    built.setAttribute('aArabic', new BufferAttribute(cloud.arabic, 3));
    built.setAttribute('aField', new BufferAttribute(cloud.field, 3));
    built.setAttribute('aSeed', new BufferAttribute(cloud.seeds, 1));
    return built;
  }, [cloud]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uMotion: { value: 1 },
          uAssemble: { value: 0 },
          uMorph: { value: 0 },
          uScatter: { value: 0 },
          uScale: { value: 1 },
          uTextOffset: { value: [0, 0] },
          uField: { value: [1, 1, 4] },
          uPointer: { value: [999, 999] },
          uPointerStrength: { value: 0 },
          uPointerRadius: { value: 1 },
          uSize: { value: 2.6 },
          uPixelRatio: { value: 1 },
          uDim: { value: 1 },
        },
      }),
    [],
  );

  useEffect(() => () => geometry?.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  // Switching language brings that script forward and restarts the hold before the next morph.
  useEffect(() => {
    const state = timeline.current;
    state.morphTarget = language === 'ar' ? 1 : 0;
    state.holdUntil = Math.max(state.holdUntil, state.time + MORPH_SECONDS + HOLD_SECONDS * 1.5);
  }, [language]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      pointer.current.active = true;
    };
    const onLeave = () => {
      pointer.current.active = false;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, []);

  useFrame((state, rawDelta) => {
    if (!geometry) return;
    const delta = Math.min(rawDelta, 1 / 20);
    const s = timeline.current;
    const u = material.uniforms as Record<string, { value: unknown }>;
    const set = (name: string, value: unknown) => {
      const uniform = u[name];
      if (uniform) uniform.value = value;
    };

    s.time += reducedMotion ? 0 : delta;
    s.assemble = reducedMotion ? 1 : approach(s.assemble, 1, delta / ASSEMBLE_SECONDS);

    if (reducedMotion) {
      s.morph = s.morphTarget;
    } else {
      s.morph = approach(s.morph, s.morphTarget, delta / MORPH_SECONDS);
      if (s.morph === s.morphTarget && s.time > s.holdUntil) {
        s.morphTarget = 1 - s.morphTarget;
        s.holdUntil = s.time + MORPH_SECONDS + HOLD_SECONDS;
      }
    }

    // Layout: the name spans the same column as the page content and sits above the hero copy.
    const { width, height } = viewport;
    const cssWidth = state.size.width;
    const contentPx = Math.min(cssWidth, CONTENT_MAX_PX) - 2 * gutterPx(cssWidth);
    const availableWidth = (contentPx / cssWidth) * width;
    const availableHeight = height * (compact ? 0.42 : 0.4);
    const boxAspect = compact ? 0.78 : 0.24;
    const scale = Math.min(availableWidth, availableHeight / boxAspect);
    const offsetY = height * (compact ? 0.125 : 0.075);

    const scrollProgress = window.scrollY / Math.max(window.innerHeight, 1);
    const scatter = smoothstep(0.04, 0.8, scrollProgress);

    const pointerTarget = pointer.current.active && !reducedMotion && scatter < 0.5 ? 1 : 0;
    s.pointerStrength = approach(s.pointerStrength, pointerTarget, delta * 2.5);

    set('uTime', s.time);
    set('uMotion', reducedMotion ? 0 : 1);
    set('uAssemble', s.assemble);
    set('uMorph', s.morph);
    set('uScatter', scatter);
    set('uScale', scale);
    set('uTextOffset', [0, offsetY]);
    set('uField', [width * 0.62, height * 0.6, 5]);
    set('uPointer', [(pointer.current.x * width) / 2, (pointer.current.y * height) / 2]);
    set('uPointerStrength', s.pointerStrength);
    set('uPointerRadius', scale * 0.09);
    set('uSize', compact ? 2.5 : 2.6);
    set('uPixelRatio', state.gl.getPixelRatio());
    set('uDim', 1 - scatter * 0.35);

    if (!readyFired.current) {
      readyFired.current = true;
      onReady?.();
    }
  });

  if (!geometry) return null;
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
