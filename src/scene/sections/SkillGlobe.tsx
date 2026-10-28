import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  Vector3,
  type Group,
  type Sprite,
} from 'three';
import type { Skill, SkillDomain } from '../../data/resume';
import { fontsReady, makeLabel, type Label } from '../kit/labels';
import { SceneFrame } from '../kit/SceneFrame';
import { createRandom } from '../sampling';
import { css } from '../kit/theme';
import { useDragRotation } from '../kit/useDragRotation';
import { useFitCamera } from '../kit/useFitCamera';
import { useMotionFactor } from '../kit/useMotion';

interface SkillGlobeProps {
  skills: Skill[];
  focus: SkillDomain | null;
  /** A skill to bring to the front and light up, e.g. after a question. */
  highlight?: string | null;
}

const RADIUS = 3.1;
const world = new Vector3();

const tierStyle = {
  core: { color: css.snow, height: 0.42, weight: 600 },
  proficient: { color: css.teal, height: 0.34, weight: 500 },
  familiar: { color: css.mist, height: 0.28, weight: 400 },
} as const;

/** Evenly spreads n points over a sphere (Fibonacci lattice). */
function fibonacciSphere(n: number, radius: number): Vector3[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: n }, (_, i) => {
    const y = 1 - (i / Math.max(n - 1, 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    return new Vector3(Math.cos(theta) * r * radius, y * radius, Math.sin(theta) * r * radius);
  });
}

function Globe({ skills, focus, highlight = null }: SkillGlobeProps) {
  useFitCamera(9.8, 1.15);
  const motion = useMotionFactor();
  const { step } = useDragRotation({ autoSpeed: 0.16 * motion });
  const group = useRef<Group>(null);
  const sprites = useRef<(Sprite | null)[]>([]);
  const [labels, setLabels] = useState<Label[] | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  // Interleave domains so each field is spread around the whole globe.
  const ordered = useMemo(() => {
    const random = createRandom(7);
    const shuffled = [...skills];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j] as Skill, shuffled[i] as Skill];
    }
    return shuffled;
  }, [skills]);
  const positions = useMemo(() => fibonacciSphere(ordered.length, RADIUS), [ordered.length]);
  const pointedAt = highlight === null ? -1 : ordered.findIndex((skill) => skill.name === highlight);

  useEffect(() => {
    let live = true;
    void fontsReady(ordered.map((s) => s.name).join(' ')).then(() => {
      if (!live) return;
      setLabels(
        ordered.map((skill) =>
          makeLabel(skill.name, {
            size: 56,
            weight: tierStyle[skill.tier].weight,
            color: '#ffffff',
            ...(skill.verified ? { dot: css.saffron } : {}),
          }),
        ),
      );
    });
    return () => {
      live = false;
    };
  }, [ordered]);

  const shell = useMemo(() => new IcosahedronGeometry(RADIUS * 0.93, 2), []);
  const dust = useMemo(() => {
    const random = createRandom(3);
    const points: number[] = [];
    for (let i = 0; i < 600; i++) {
      const v = new Vector3(random() - 0.5, random() - 0.5, random() - 0.5).normalize();
      v.multiplyScalar(RADIUS * (0.25 + random() * 0.6));
      points.push(v.x, v.y, v.z);
    }
    return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(points, 3));
  }, []);
  useEffect(
    () => () => {
      shell.dispose();
      dust.dispose();
    },
    [shell, dust],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = step(dt, pointedAt < 0);
    const spot = pointedAt >= 0 ? positions[pointedAt] : undefined;
    if (spot && !s.dragging) {
      // Turn the globe so the skill that was asked about faces the visitor (shortest way round).
      const wanted = -Math.atan2(spot.x, spot.z);
      const gap = Math.atan2(Math.sin(wanted - s.yaw), Math.cos(wanted - s.yaw));
      s.velocity = 0;
      s.yaw += gap * Math.min(1, dt * 3.2);
    }
    if (!group.current || !labels) return;
    group.current.rotation.set(0.25 + s.pitch, s.yaw, 0);
    group.current.updateMatrixWorld();

    ordered.forEach((skill, i) => {
      const sprite = sprites.current[i];
      const label = labels[i];
      if (!sprite || !label) return;
      const front = (sprite.getWorldPosition(world).z + RADIUS) / (RADIUS * 2);
      const style = tierStyle[skill.tier];
      const inFocus = focus === null || focus === skill.domain;
      const asked = pointedAt === i;
      const target = (style.height + (hovered === i ? 0.12 : 0)) * (inFocus && focus ? 1.15 : 1) * (asked ? 1.7 : 1);
      const current = sprite.scale.y || target;
      const height = current + (target - current) * Math.min(1, delta * 8);
      sprite.scale.set(height * label.aspect, height, 1);
      const opacity = asked ? 1 : (0.15 + front * 0.85) * (inFocus ? 1 : 0.12) * (pointedAt >= 0 ? 0.5 : 1);
      sprite.material.opacity += (opacity - sprite.material.opacity) * Math.min(1, delta * 6);
      sprite.renderOrder = asked ? 200 : Math.round(front * 100);
    });
  });

  return (
    <group ref={group}>
      <lineSegments>
        <wireframeGeometry args={[shell]} />
        <lineBasicMaterial color={css.violet} transparent opacity={0.07} depthWrite={false} />
      </lineSegments>
      <points geometry={dust}>
        <pointsMaterial size={0.03} color={css.teal} transparent opacity={0.6} blending={AdditiveBlending} depthWrite={false} />
      </points>
      {labels
        ? ordered.map((skill, i) => {
            const label = labels[i];
            const position = positions[i];
            if (!label || !position) return null;
            return (
              <sprite
                key={skill.name}
                ref={(sprite) => {
                  sprites.current[i] = sprite;
                }}
                position={position}
                onPointerOver={() => setHovered(i)}
                onPointerOut={() => setHovered((current) => (current === i ? null : current))}
              >
                <spriteMaterial
                  map={label.texture}
                  transparent
                  opacity={0}
                  depthWrite={false}
                  color={hovered === i || pointedAt === i ? css.saffron : tierStyle[skill.tier].color}
                />
              </sprite>
            );
          })
        : null}
    </group>
  );
}

export default function SkillGlobe(props: SkillGlobeProps) {
  return (
    <SceneFrame fov={40} position={[0, 0, 9.8]}>
      <Globe {...props} />
    </SceneFrame>
  );
}
