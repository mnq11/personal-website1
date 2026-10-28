import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, TubeGeometry, Vector3, type Group, type Mesh } from 'three';
import { fontsReady, makeLabel, type Label } from '../kit/labels';
import { SceneFrame } from '../kit/SceneFrame';
import { css } from '../kit/theme';
import { useDragRotation } from '../kit/useDragRotation';
import { useFitCamera } from '../kit/useFitCamera';
import { useMotionFactor } from '../kit/useMotion';

export interface StoryStop {
  id: string;
  label: string;
  color: string;
}

interface StoryRoadProps {
  stops: StoryStop[];
  active: string | null;
  onHover: (id: string | null) => void;
}

/** The road winds upward in an S so every milestone is visible from the front. */
function roadPoint(t: number): Vector3 {
  return new Vector3(Math.sin(t * Math.PI * 2.2) * 1.5, (t - 0.5) * 6.4, Math.cos(t * Math.PI * 2.2) * 1.1);
}

function Road({ stops, active, onHover }: StoryRoadProps) {
  useFitCamera(11, 0.7);
  const motion = useMotionFactor();
  const { step } = useDragRotation({ autoSpeed: 0.1 * motion, maxPitch: 0.3 });
  const group = useRef<Group>(null);
  const traveller = useRef<Mesh>(null);
  const markers = useRef<Record<string, Mesh | null>>({});
  const [labels, setLabels] = useState<Record<string, Label>>({});

  const curve = useMemo(() => new CatmullRomCurve3(Array.from({ length: 40 }, (_, i) => roadPoint(i / 39))), []);
  const geometry = useMemo(() => new TubeGeometry(curve, 160, 0.035, 8, false), [curve]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const positions = useMemo(
    () => stops.map((_, i) => roadPoint(stops.length > 1 ? i / (stops.length - 1) : 0.5)),
    [stops],
  );

  useEffect(() => {
    let live = true;
    void fontsReady(stops.map((stop) => stop.label).join(' ')).then(() => {
      if (!live) return;
      setLabels(
        Object.fromEntries(stops.map((stop) => [stop.id, makeLabel(stop.label, { size: 52, weight: 600, color: css.snow })])),
      );
    });
    return () => {
      live = false;
    };
  }, [stops]);

  useFrame((state, delta) => {
    const s = step(Math.min(delta, 0.05));
    if (group.current) group.current.rotation.set(0.08 + s.pitch, s.yaw, 0);
    if (traveller.current) {
      // A spark runs along the road from the first milestone to the last, then starts again.
      const t = motion ? (state.clock.elapsedTime * 0.07) % 1 : 1;
      traveller.current.position.copy(curve.getPointAt(t));
    }
    stops.forEach((stop) => {
      const mesh = markers.current[stop.id];
      if (!mesh) return;
      const target = active === stop.id ? 1.9 : active === null ? 1 : 0.8;
      mesh.scale.setScalar(mesh.scale.x + (target - mesh.scale.x) * Math.min(1, delta * 8));
    });
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={css.mist} transparent opacity={0.4} />
      </mesh>
      <mesh ref={traveller}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color={css.snow} toneMapped={false} />
      </mesh>
      {stops.map((stop, i) => {
        const position = positions[i] ?? new Vector3();
        const label = labels[stop.id];
        return (
          <group key={stop.id} position={position}>
            <mesh
              ref={(mesh) => {
                markers.current[stop.id] = mesh;
              }}
              onPointerOver={(event) => {
                event.stopPropagation();
                onHover(stop.id);
              }}
              onPointerOut={() => onHover(null)}
            >
              <sphereGeometry args={[0.17, 20, 20]} />
              <meshBasicMaterial color={stop.color} toneMapped={false} />
            </mesh>
            {label ? (
              <sprite position={[0.9, 0.05, 0]} scale={[0.42 * label.aspect, 0.42, 1]}>
                <spriteMaterial map={label.texture} transparent depthWrite={false} opacity={active === null || active === stop.id ? 1 : 0.4} />
              </sprite>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

export default function StoryRoad(props: StoryRoadProps) {
  return (
    <SceneFrame fov={40} position={[0, 0, 11]}>
      <Road {...props} />
    </SceneFrame>
  );
}
