import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatmullRomCurve3, TubeGeometry, Vector3, type Group, type Mesh, type MeshBasicMaterial } from 'three';
import { fontsReady, makeLabel, type Label } from '../kit/labels';
import { SceneFrame } from '../kit/SceneFrame';
import { css } from '../kit/theme';
import { useDragRotation } from '../kit/useDragRotation';
import { useFitCamera } from '../kit/useFitCamera';
import { useMotionFactor } from '../kit/useMotion';

export interface Strand {
  id: string;
  /** Fractional years, e.g. 2022.58 for August 2022. */
  from: number;
  to: number;
  color: string;
  /** Distance from the axis; strands that overlap in time sit on different radii. */
  lane: number;
}

interface CareerHelixProps {
  strands: Strand[];
  startYear: number;
  endYear: number;
  active: string | null;
  onHover: (id: string | null) => void;
}

const HEIGHT = 6.2;
const TURNS_PER_YEAR = 0.16;
/** Strands start a fifth of a turn apart and sit on their own radius, so they never tangle. */
const PHASE = (Math.PI * 2) / 5;
const laneRadius = (lane: number) => 0.75 + lane * 0.3;

function Helix({ strands, startYear, endYear, active, onHover }: CareerHelixProps) {
  useFitCamera(11.5, 0.62);
  const motion = useMotionFactor();
  const { step } = useDragRotation({ autoSpeed: 0.12 * motion, maxPitch: 0.3 });
  const group = useRef<Group>(null);
  const meshes = useRef<Record<string, Mesh | null>>({});
  const [years, setYears] = useState<{ year: number; label: Label }[]>([]);

  const yearToY = (year: number) => ((year - startYear) / (endYear - startYear) - 0.5) * HEIGHT;

  const geometries = useMemo(() => {
    const span = endYear - startYear;
    return strands.map((strand) => {
      const points: Vector3[] = [];
      const samples = Math.max(24, Math.round((strand.to - strand.from) * 40));
      for (let i = 0; i <= samples; i++) {
        const year = strand.from + ((strand.to - strand.from) * i) / samples;
        const angle = (year - startYear) * TURNS_PER_YEAR * Math.PI * 2 + strand.lane * PHASE;
        const radius = laneRadius(strand.lane);
        points.push(new Vector3(Math.cos(angle) * radius, ((year - startYear) / span - 0.5) * HEIGHT, Math.sin(angle) * radius));
      }
      return {
        strand,
        geometry: new TubeGeometry(new CatmullRomCurve3(points), samples * 2, strand.lane < 3 ? 0.06 : 0.04, 10, false),
      };
    });
  }, [strands, startYear, endYear]);
  useEffect(() => () => geometries.forEach(({ geometry }) => geometry.dispose()), [geometries]);

  useEffect(() => {
    let live = true;
    const marks: number[] = [];
    for (let year = startYear; year <= endYear; year += 2) marks.push(year);
    void fontsReady('0123456789').then(() => {
      if (live) setYears(marks.map((year) => ({ year, label: makeLabel(String(year), { size: 48, weight: 400, color: css.mist }) })));
    });
    return () => {
      live = false;
    };
  }, [startYear, endYear]);

  useFrame((_, delta) => {
    const s = step(Math.min(delta, 0.05));
    if (group.current) group.current.rotation.set(0.12 + s.pitch, s.yaw, 0);
    strands.forEach((strand) => {
      const mesh = meshes.current[strand.id];
      if (!mesh) return;
      const material = mesh.material as MeshBasicMaterial;
      const lit = active === null || active === strand.id;
      const targetOpacity = lit ? 1 : 0.16;
      material.opacity += (targetOpacity - material.opacity) * Math.min(1, delta * 6);
    });
  });

  return (
    <group ref={group}>
      {/* The time axis, with a year label every two years. */}
      <mesh>
        <cylinderGeometry args={[0.012, 0.012, HEIGHT + 0.6, 6]} />
        <meshBasicMaterial color={css.mist} transparent opacity={0.35} />
      </mesh>
      {years.map(({ year, label }) => (
        <sprite key={year} position={[0, yearToY(year), 0]} scale={[0.3 * label.aspect, 0.3, 1]}>
          <spriteMaterial map={label.texture} transparent depthWrite={false} opacity={0.85} />
        </sprite>
      ))}
      {geometries.map(({ strand, geometry }) => (
        <mesh
          key={strand.id}
          ref={(mesh) => {
            meshes.current[strand.id] = mesh;
          }}
          geometry={geometry}
          onPointerOver={(event) => {
            event.stopPropagation();
            onHover(strand.id);
          }}
          onPointerOut={() => onHover(null)}
        >
          <meshBasicMaterial color={strand.color} transparent opacity={1} toneMapped={false} />
        </mesh>
      ))}
      {strands.map((strand) => {
        const angle = (strand.to - startYear) * TURNS_PER_YEAR * Math.PI * 2 + strand.lane * PHASE;
        const radius = laneRadius(strand.lane);
        return (
          <mesh key={`${strand.id}-cap`} position={[Math.cos(angle) * radius, yearToY(strand.to), Math.sin(angle) * radius]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshBasicMaterial color={strand.color} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function CareerHelix(props: CareerHelixProps) {
  return (
    <SceneFrame fov={42} position={[0, 0, 11.5]}>
      <Helix {...props} />
    </SceneFrame>
  );
}
