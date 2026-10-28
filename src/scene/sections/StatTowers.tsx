import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CylinderGeometry, MeshStandardMaterial, Color, type Group, type Mesh, type Sprite } from 'three';
import { fontsReady, makeLabel, type Label } from '../kit/labels';
import { SceneFrame } from '../kit/SceneFrame';
import { css } from '../kit/theme';
import { useDragRotation } from '../kit/useDragRotation';
import { useFitCamera } from '../kit/useFitCamera';
import { useMotionFactor } from '../kit/useMotion';

export interface TowerData {
  id: string;
  label: string;
  /** Number as shown to the reader, already formatted for the locale. */
  value: string;
  /** 0 to 1: how tall the tower stands relative to the others. */
  height: number;
  accent: string;
}

interface StatTowersProps {
  towers: TowerData[];
  /** Id of a tower to light up, e.g. after "how many projects?". */
  highlight?: string | null;
}

const SPACING = 1.4;
const MAX_HEIGHT = 3.4;
const MIN_HEIGHT = 0.7;

interface TowerLabels {
  name: Label;
  value: Label;
}

function Towers({ towers, highlight = null }: StatTowersProps) {
  useFitCamera(10.8, 1.9);
  const motion = useMotionFactor();
  const { step } = useDragRotation({ autoSpeed: 0.07 * motion, maxPitch: 0.2 });
  const group = useRef<Group>(null);
  const bodies = useRef<(Mesh | null)[]>([]);
  const caps = useRef<(Sprite | null)[]>([]);
  const born = useRef(0);
  const [labels, setLabels] = useState<TowerLabels[] | null>(null);
  const [pointer, setPointer] = useState<number | null>(null);
  const pointedAt = highlight === null ? -1 : towers.findIndex((tower) => tower.id === highlight);
  const hovered = pointer ?? (pointedAt >= 0 ? pointedAt : null);

  useEffect(() => {
    let live = true;
    void fontsReady(towers.map((tower) => tower.label + tower.value).join(' ')).then(() => {
      if (!live) return;
      setLabels(
        towers.map((tower) => ({
          name: makeLabel(tower.label, { size: 48, weight: 500, color: css.mist }),
          value: makeLabel(tower.value, { size: 84, weight: 650, color: css.snow }),
        })),
      );
    });
    return () => {
      live = false;
    };
  }, [towers]);

  const geometry = useMemo(() => new CylinderGeometry(0.44, 0.5, 1, 6, 1), []);
  const materials = useMemo(
    () =>
      towers.map(
        (tower) =>
          new MeshStandardMaterial({
            color: new Color(tower.accent),
            emissive: new Color(tower.accent),
            emissiveIntensity: 0.18,
            roughness: 0.38,
            metalness: 0.25,
          }),
      ),
    [towers],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      materials.forEach((material) => material.dispose());
    },
    [geometry, materials],
  );

  const heights = towers.map((tower) => MIN_HEIGHT + tower.height * (MAX_HEIGHT - MIN_HEIGHT));
  const offset = ((towers.length - 1) * SPACING) / 2;

  useFrame(({ clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const s = step(delta, false);
    // Drag turns the skyline; at rest it settles into a three-quarter view with a slow sway.
    if (!s.dragging && Math.abs(s.velocity) < 0.05) s.yaw *= Math.pow(0.5, delta);
    const sway = Math.sin(clock.elapsedTime * 0.4) * 0.14 * motion;
    if (group.current) group.current.rotation.set(0.38 + s.pitch, -0.42 + s.yaw + sway, 0);

    born.current += delta;
    towers.forEach((_, i) => {
      const mesh = bodies.current[i];
      const cap = caps.current[i];
      const full = heights[i] ?? 1;
      // Each tower rises in turn, with a little overshoot, then follows the pointer's hover.
      const t = motion === 0 ? 1 : Math.min(1, Math.max(0, (born.current - i * 0.09) / 0.9));
      const eased = 1 - Math.pow(1 - t, 3) + Math.sin(t * Math.PI) * 0.06;
      const lift = hovered === i ? 1.12 : 1;
      const target = full * eased * lift;
      if (mesh) {
        mesh.scale.y += (target - mesh.scale.y) * Math.min(1, delta * 10);
        mesh.position.y = mesh.scale.y / 2;
        const material = mesh.material as MeshStandardMaterial;
        material.emissiveIntensity += ((hovered === i ? 0.75 : 0.18) - material.emissiveIntensity) * Math.min(1, delta * 10);
      }
      if (cap && mesh) {
        cap.position.y = mesh.scale.y + 0.42;
        cap.material.opacity = Math.min(1, t * 1.4);
      }
    });
  });

  if (!labels) return null;

  return (
    <group ref={group} position={[0, -1.7, 0]}>
      {towers.map((tower, i) => {
        const label = labels[i];
        const material = materials[i];
        if (!label || !material) return null;
        const x = i * SPACING - offset;
        return (
          <group key={tower.id} position={[x, 0, 0]}>
            <mesh
              ref={(mesh) => {
                bodies.current[i] = mesh;
              }}
              geometry={geometry}
              material={material}
              scale={[1, 0.001, 1]}
              rotation={[0, Math.PI / 6, 0]}
              onPointerOver={(event) => {
                event.stopPropagation();
                setPointer(i);
              }}
              onPointerOut={() => setPointer((current) => (current === i ? null : current))}
            />
            <sprite
              ref={(sprite) => {
                caps.current[i] = sprite;
              }}
              scale={[0.62 * label.value.aspect, 0.62, 1]}
            >
              <spriteMaterial map={label.value.texture} transparent depthWrite={false} opacity={0} />
            </sprite>
            {/* Names alternate between two rows so neighbours never run into each other. */}
            <sprite position={[0, i % 2 === 0 ? -0.4 : -0.82, 0.7]} scale={[0.34 * label.name.aspect, 0.34, 1]}>
              <spriteMaterial map={label.name.texture} transparent depthWrite={false} color={hovered === i ? css.saffron : css.mist} />
            </sprite>
          </group>
        );
      })}
      {/* A faint floor ring anchors the skyline. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[offset + 1.2, offset + 1.24, 96]} />
        <meshBasicMaterial color={css.teal} transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

export default function StatTowers(props: StatTowersProps) {
  return (
    <SceneFrame fov={36} position={[0, 0, 10.8]}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 6, 5]} intensity={2.4} />
      <directionalLight position={[-5, 2, -2]} intensity={0.8} color="#9c8cff" />
      <Towers {...props} />
    </SceneFrame>
  );
}
