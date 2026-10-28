import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, BufferAttribute, BufferGeometry, ShaderMaterial } from 'three';
import { profile } from '../data/resume';
import type { Language } from '../i18n/types';
import { createRandom, sampleField, sampleSeeds, sampleText } from './sampling';
import { journeyState } from './journey';
import { placeFromScroll, WORLD_SECTIONS, worldAmount, worldVisibility } from './world';
import { fragmentShader, vertexShader } from './shaders';

const FONT_FAMILY = 'Readex Pro Variable';
/** Seconds each script stays on screen before morphing into the other. */
const HOLD_SECONDS = 4.2;
const MORPH_SECONDS = 2.4;
const ASSEMBLE_SECONDS = 2.8;
/** Height-to-width box for the two-line contact greeting. */
const GREETING_ASPECT = 0.62;
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
  greeting: Float32Array;
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
      document.fonts.load(`700 200px "${FONT_FAMILY}"`, profile.greeting.lines.join(' ')),
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
          greeting: sampleText({
            lines: profile.greeting.lines,
            fontFamily: FONT_FAMILY,
            direction: 'ltr',
            count,
            boxAspect: GREETING_ASPECT,
            random,
          }),
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
    burst: 0,
    burstX: 0,
    burstY: 0,
    greet: 0,
  });
  const contact = useRef<HTMLElement | null>(null);
  // Page-space centres of the sections that have a shape; measured, not read every frame.
  const sectionMids = useRef<number[]>([]);
  const place = useRef(0);

  const geometry = useMemo(() => {
    if (!cloud) return null;
    const built = new BufferGeometry();
    // `position` is required by three.js; the shader works from the three named home positions instead.
    built.setAttribute('position', new BufferAttribute(cloud.field, 3));
    built.setAttribute('aLatin', new BufferAttribute(cloud.latin, 3));
    built.setAttribute('aArabic', new BufferAttribute(cloud.arabic, 3));
    built.setAttribute('aField', new BufferAttribute(cloud.field, 3));
    built.setAttribute('aSeed', new BufferAttribute(cloud.seeds, 1));
    built.setAttribute('aGreeting', new BufferAttribute(cloud.greeting, 3));
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
          uGreet: { value: 0 },
          uGreetScale: { value: 1 },
          uGreetOffset: { value: [0, 0] },
          uBurst: { value: 0 },
          uBurstPoint: { value: [0, 0] },
          uWorld: { value: 0 },
          uPlace: { value: 0 },
          uWorldCenter: { value: [0, 0] },
          uWorldScale: { value: 1 },
          uSpin: { value: 0 },
          uWorldGain: { value: 1.5 },
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
    let frame = 0;
    const measure = () => {
      sectionMids.current = WORLD_SECTIONS.flatMap((id) => {
        const element = document.getElementById(id);
        if (!element) return [];
        const rect = element.getBoundingClientRect();
        return [rect.top + window.scrollY + rect.height / 2];
      });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    // Lazy scenes, fonts and the language all change section heights, so measure again when they do.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener('resize', schedule);
    void document.fonts.ready.then(schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      pointer.current.active = true;
    };
    const onLeave = () => {
      pointer.current.active = false;
    };
    // A click or tap on the hero (but not on its links and buttons) scatters the letters.
    const onDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest('#top') || target.closest('a, button')) return;
      if (window.scrollY > window.innerHeight * 0.4) return;
      timeline.current.burst = 1;
      timeline.current.burstX = (event.clientX / window.innerWidth) * 2 - 1;
      timeline.current.burstY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    return () => {
      window.removeEventListener('pointerdown', onDown);
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

    // Burst decays over about a second.
    s.burst = reducedMotion ? 0 : s.burst * Math.exp(-delta * 1.8);
    set('uBurst', s.burst);
    set('uBurstPoint', [(s.burstX * width) / 2, (s.burstY * height) / 2]);

    // Greeting: on wide screens the empty side of the contact section fills with "Hej · Hello · مرحباً".
    contact.current ??= document.getElementById('contact');
    let greetTarget = 0;
    if (contact.current && !compact) {
      const top = contact.current.getBoundingClientRect().top;
      greetTarget = top < window.innerHeight * 0.55 ? 1 : 0;
    }
    s.greet = reducedMotion ? greetTarget : approach(s.greet, greetTarget, delta / 1.6);
    const rtl = document.documentElement.dir === 'rtl';
    const greetScale = Math.min(width * 0.32, (height * 0.48) / GREETING_ASPECT);
    set('uGreet', s.greet);
    set('uGreetScale', greetScale);
    set('uGreetOffset', [width * (rtl ? -0.23 : 0.23), height * 0.04]);

    // The world: a companion shape in the empty margin beside the content, following the section in view.
    const rtlPage = document.documentElement.dir === 'rtl';
    const side = rtlPage ? 1 : -1;
    const target = placeFromScroll(sectionMids.current, window.scrollY + window.innerHeight * 0.5);
    place.current = reducedMotion ? target : place.current + (target - place.current) * Math.min(1, delta * 6);
    const worldScale = compact ? Math.min(width * 0.26, height * 0.15) : Math.min(width * 0.115, height * 0.26);
    journeyState.place = place.current;
    journeyState.greet = s.greet;
    set('uWorld', worldAmount(scrollProgress, s.greet) * worldVisibility(place.current));
    set('uPlace', place.current);
    set('uWorldScale', worldScale);
    set('uWorldCenter', compact ? [-side * width * 0.3, height * 0.3] : [side * width * 0.35, -height * 0.02]);
    set('uWorldGain', compact ? 0.75 : 1.5);
    set('uSpin', s.time * 0.16 + window.scrollY * (reducedMotion ? 0 : 0.0012));

    if (!readyFired.current) {
      readyFired.current = true;
      onReady?.();
    }
  });

  if (!geometry) return null;
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
