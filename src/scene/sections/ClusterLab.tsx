import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Object3D, type Group, type InstancedMesh, type Mesh } from 'three';
import type { Vec3 } from '../../lib/kmeans';
import { SceneFrame } from '../kit/SceneFrame';
import { css } from '../kit/theme';
import { useDragRotation } from '../kit/useDragRotation';
import { useFitCamera } from '../kit/useFitCamera';
import { useMotionFactor } from '../kit/useMotion';

export interface ClusterLabProps {
  points: Vec3[];
  centroids: Vec3[];
  assignments: number[];
  /** False until the first step: the points are still unlabelled and drawn in grey. */
  assigned: boolean;
}

const CLUSTER_COLORS = [css.saffron, css.teal, css.violet, css.rose, css.sky];
const UNASSIGNED = css.mist;
const dummy = new Object3D();

function Cloud({ points, centroids, assignments, assigned }: ClusterLabProps) {
  useFitCamera(6.6, 1.2);
  const motion = useMotionFactor();
  const { step } = useDragRotation({ autoSpeed: 0.1 * motion, maxPitch: 0.35 });
  const group = useRef<Group>(null);
  const instances = useRef<InstancedMesh>(null);
  const centroidMeshes = useRef<(Mesh | null)[]>([]);

  const color = useMemo(() => new Color(), []);

  useEffect(() => {
    const mesh = instances.current;
    if (!mesh) return;
    points.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [points]);

  useEffect(() => {
    const mesh = instances.current;
    if (!mesh) return;
    points.forEach((_, i) => {
      const cluster = assignments[i] ?? 0;
      mesh.setColorAt(i, color.set(assigned ? (CLUSTER_COLORS[cluster % CLUSTER_COLORS.length] ?? UNASSIGNED) : UNASSIGNED));
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [points, assignments, assigned, color]);

  useFrame((_, delta) => {
    const s = step(Math.min(delta, 0.05));
    if (group.current) group.current.rotation.set(0.15 + s.pitch, s.yaw, 0);
    // Centroids glide to their new positions, so each step of the algorithm can be followed by eye.
    centroids.forEach(([x, y, z], i) => {
      const mesh = centroidMeshes.current[i];
      if (!mesh) return;
      const k = Math.min(1, delta * 5);
      mesh.position.set(mesh.position.x + (x - mesh.position.x) * k, mesh.position.y + (y - mesh.position.y) * k, mesh.position.z + (z - mesh.position.z) * k);
    });
  });

  return (
    <group ref={group}>
      <instancedMesh key={points.length} ref={instances} args={[undefined, undefined, points.length]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {centroids.map((centroid, i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            centroidMeshes.current[i] = mesh;
          }}
          position={centroid}
          renderOrder={2}
        >
          <octahedronGeometry args={[0.34, 0]} />
          <meshBasicMaterial color={CLUSTER_COLORS[i % CLUSTER_COLORS.length] ?? UNASSIGNED} toneMapped={false} depthTest={false} />
          <mesh scale={1.3} renderOrder={3}>
            <octahedronGeometry args={[0.34, 0]} />
            <meshBasicMaterial color={css.snow} wireframe depthTest={false} toneMapped={false} />
          </mesh>
        </mesh>
      ))}
    </group>
  );
}

export default function ClusterLab(props: ClusterLabProps) {
  return (
    <SceneFrame fov={40} position={[0, 0, 6.6]}>
      <Cloud {...props} />
    </SceneFrame>
  );
}
