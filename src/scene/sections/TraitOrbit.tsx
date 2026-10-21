import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Vector3, type Group, type Sprite } from 'three';
import { fontsReady, makeLabel, type Label } from '../kit/labels';
import { SceneFrame } from '../kit/SceneFrame';
import { css } from '../kit/theme';
import { useDragRotation } from '../kit/useDragRotation';
import { useFitCamera } from '../kit/useFitCamera';
import { useMotionFactor } from '../kit/useMotion';

interface TraitOrbitProps {
  traits: string[];
}

const TILT = 0.68;
const RADIUS = 2.5;
const world = new Vector3();

/** Traits circling the portrait on a tilted ring; the ones behind it fade and shrink. */
function Orbit({ traits }: TraitOrbitProps) {
  useFitCamera(11, 1.0);
  const motion = useMotionFactor();
  const { step } = useDragRotation({ autoSpeed: 0.18 * motion, maxPitch: 0.25 });
  const group = useRef<Group>(null);
  const sprites = useRef<(Sprite | null)[]>([]);
  const [labels, setLabels] = useState<Label[] | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    let live = true;
    void fontsReady(traits.join(' ')).then(() => {
      if (live) setLabels(traits.map((trait) => makeLabel(trait, { size: 54, weight: 500, color: css.snow })));
    });
    return () => {
      live = false;
    };
  }, [traits]);

  // A faint dotted ring gives the orbit a visible path.
  const ring = useMemo(() => {
    const points: number[] = [];
    for (let i = 0; i < 180; i++) {
      const a = (i / 180) * Math.PI * 2;
      points.push(Math.cos(a) * RADIUS, 0, Math.sin(a) * RADIUS);
    }
    return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(points, 3));
  }, []);
  useEffect(() => () => ring.dispose(), [ring]);

  useFrame((_, delta) => {
    const s = step(Math.min(delta, 0.05));
    if (!group.current) return;
    group.current.rotation.set(TILT + s.pitch, s.yaw, 0.08);
    group.current.updateMatrixWorld();
    sprites.current.forEach((sprite, i) => {
      if (!sprite || !labels) return;
      const label = labels[i];
      if (!label) return;
      // Depth in view space: in front of the portrait (positive z) is bright and large.
      const z = sprite.getWorldPosition(world).z;
      const front = (z + RADIUS) / (RADIUS * 2);
      const emphasis = hovered === i ? 1.25 : 1;
      const height = (0.26 + front * 0.16) * emphasis;
      sprite.scale.set(height * label.aspect, height, 1);
      sprite.material.opacity = 0.18 + front * 0.82;
      sprite.renderOrder = Math.round(front * 100);
    });
  });

  if (!labels) return null;

  return (
    <group ref={group}>
      <points geometry={ring}>
        <pointsMaterial size={0.035} color={css.teal} transparent opacity={0.55} blending={AdditiveBlending} depthWrite={false} />
      </points>
      {labels.map((label, i) => {
        const angle = (i / labels.length) * Math.PI * 2;
        return (
          <sprite
            key={traits[i] ?? i}
            ref={(sprite) => {
              sprites.current[i] = sprite;
            }}
            // Alternate labels sit slightly above and below the ring so neighbours never collide.
            position={[Math.cos(angle) * RADIUS, i % 2 === 0 ? 0.22 : -0.22, Math.sin(angle) * RADIUS]}
            onPointerOver={() => setHovered(i)}
            onPointerOut={() => setHovered((current) => (current === i ? null : current))}
          >
            <spriteMaterial
              map={label.texture}
              transparent
              depthWrite={false}
              color={hovered === i ? css.saffron : css.snow}
            />
          </sprite>
        );
      })}
    </group>
  );
}

export default function TraitOrbit({ traits }: TraitOrbitProps) {
  return (
    <SceneFrame fov={38} position={[0, 0, 11]}>
      <Orbit traits={traits} />
    </SceneFrame>
  );
}
