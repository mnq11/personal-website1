import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

/**
 * Pulls the camera back on narrow canvases so content sized for `targetAspect` (width / height)
 * still fits horizontally, e.g. a globe on a phone.
 */
export function useFitCamera(distance: number, targetAspect = 1) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    camera.position.z = distance / Math.min(1, aspect / targetAspect);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, distance, targetAspect]);
}
