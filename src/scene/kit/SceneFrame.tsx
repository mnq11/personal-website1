import { Canvas } from '@react-three/fiber';
import type { ReactNode } from 'react';
import { canvasProps } from './theme';

interface SceneFrameProps {
  children: ReactNode;
  fov?: number;
  position?: [number, number, number];
}

/** Transparent canvas that fills its LazyScene frame. */
export function SceneFrame({ children, fov = 40, position = [0, 0, 8] }: SceneFrameProps) {
  return (
    <Canvas {...canvasProps} camera={{ position, fov, near: 0.1, far: 60 }}>
      {children}
    </Canvas>
  );
}
