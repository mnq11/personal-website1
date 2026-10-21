import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Vector3,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
  type Sprite,
} from 'three';
import { fontsReady, makeLabel, type Label } from '../kit/labels';
import { SceneFrame } from '../kit/SceneFrame';
import { css } from '../kit/theme';
import { useDragRotation } from '../kit/useDragRotation';
import { useFitCamera } from '../kit/useFitCamera';
import { useMotionFactor } from '../kit/useMotion';

export interface OrbitLink {
  id: string;
  label: string;
  url: string;
  accent: string;
}

interface SocialOrbitsProps {
  centre: string;
  links: OrbitLink[];
  /** Called when the centre is clicked, e.g. to open a new email. */
  onCentre: () => void;
}

const RADIUS = 2.35;
const world = new Vector3();

function Orbits({ centre, links, onCentre }: SocialOrbitsProps) {
  useFitCamera(7.8, 1.5);
  const motion = useMotionFactor();
  const { state, step } = useDragRotation({ autoSpeed: 0.28 * motion, maxPitch: 0.3 });
  const group = useRef<Group>(null);
  const core = useRef<Mesh>(null);
  const nodes = useRef<(Mesh | null)[]>([]);
  const names = useRef<(Sprite | null)[]>([]);
  const [labels, setLabels] = useState<{ centre: Label; links: Label[] } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void fontsReady([centre, ...links.map((link) => link.label)].join(' ')).then(() => {
      if (!live) return;
      setLabels({
        centre: makeLabel(centre, { size: 56, weight: 600, color: css.snow, background: 'rgba(8,21,33,0.92)', border: css.saffron }),
        links: links.map((link) => makeLabel(link.label, { size: 52, weight: 500, color: css.snow })),
      });
    });
    return () => {
      live = false;
    };
  }, [centre, links]);

  const ring = useMemo(() => {
    const points: number[] = [];
    for (let i = 0; i < 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      points.push(Math.cos(a) * RADIUS, 0, Math.sin(a) * RADIUS);
    }
    return new BufferGeometry().setAttribute('position', new Float32BufferAttribute(points, 3));
  }, []);
  useEffect(() => () => ring.dispose(), [ring]);

  useFrame(({ clock }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const s = step(delta);
    if (group.current) group.current.rotation.set(0.36 + s.pitch, s.yaw, 0);
    if (core.current) {
      core.current.rotation.y += delta * 0.5 * motion;
      core.current.rotation.x += delta * 0.3 * motion;
      const pulse = 1 + Math.sin(clock.elapsedTime * 2) * 0.04 * motion;
      core.current.scale.setScalar(pulse * (hovered === 'centre' ? 1.18 : 1));
    }
    group.current?.updateMatrixWorld();
    links.forEach((link, i) => {
      const node = nodes.current[i];
      const name = names.current[i];
      if (!node || !name || !labels) return;
      const label = labels.links[i];
      if (!label) return;
      const front = (node.getWorldPosition(world).z + RADIUS) / (RADIUS * 2);
      const on = hovered === link.id;
      const size = (on ? 0.5 : 0.33) * (0.8 + front * 0.25);
      node.scale.setScalar(size);
      const material = node.material as MeshStandardMaterial;
      material.emissiveIntensity += ((on ? 1.1 : 0.35) - material.emissiveIntensity) * Math.min(1, delta * 10);
      const height = (0.36 + front * 0.14) * (on ? 1.2 : 1);
      name.scale.set(height * label.aspect, height, 1);
      name.material.opacity = 0.3 + front * 0.7;
    });
  });

  if (!labels) return null;

  return (
    <group ref={group}>
      <points geometry={ring}>
        <pointsMaterial size={0.04} color={css.teal} transparent opacity={0.6} blending={AdditiveBlending} depthWrite={false} />
      </points>
      <mesh
        ref={core}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered('centre');
        }}
        onPointerOut={() => setHovered((current) => (current === 'centre' ? null : current))}
        onClick={(event) => {
          event.stopPropagation();
          if (state.current.travel < 6) onCentre();
        }}
      >
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial
          color={css.saffron}
          emissive={css.saffron}
          emissiveIntensity={0.55}
          roughness={0.3}
          metalness={0.3}
          wireframe
        />
      </mesh>
      <sprite renderOrder={50} scale={[0.3 * labels.centre.aspect, 0.3, 1]} position={[0, 0, 0]}>
        <spriteMaterial map={labels.centre.texture} transparent depthTest={false} />
      </sprite>
      {links.map((link, i) => {
        const angle = (i / links.length) * Math.PI * 2 + 0.4;
        const label = labels.links[i];
        if (!label) return null;
        return (
          <group key={link.id} position={[Math.cos(angle) * RADIUS, 0, Math.sin(angle) * RADIUS]}>
            <mesh
              ref={(mesh) => {
                nodes.current[i] = mesh;
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                setHovered(link.id);
              }}
              onPointerOut={() => setHovered((current) => (current === link.id ? null : current))}
              onClick={(event) => {
                event.stopPropagation();
                // A drag that ends on a planet is not a click.
                if (state.current.travel < 6) window.open(link.url, '_blank', 'noopener,noreferrer');
              }}
            >
              <sphereGeometry args={[1, 24, 24]} />
              <meshStandardMaterial color={new Color(link.accent)} emissive={new Color(link.accent)} emissiveIntensity={0.35} roughness={0.35} />
            </mesh>
            <sprite
              ref={(sprite) => {
                names.current[i] = sprite;
              }}
              position={[0, -0.62, 0]}
            >
              <spriteMaterial map={label.texture} transparent depthWrite={false} />
            </sprite>
          </group>
        );
      })}
    </group>
  );
}

export default function SocialOrbits(props: SocialOrbitsProps) {
  return (
    <SceneFrame fov={38} position={[0, 0, 7.8]}>
      <ambientLight intensity={0.9} />
      <pointLight position={[3, 4, 5]} intensity={40} />
      <Orbits {...props} />
    </SceneFrame>
  );
}
