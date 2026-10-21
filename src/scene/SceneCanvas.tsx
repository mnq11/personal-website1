import { Canvas } from '@react-three/fiber';
import { useMediaQuery, usePrefersReducedMotion } from '../hooks/useMediaQuery';
import type { Language } from '../i18n/types';
import { ParticleName } from './ParticleName';
import styles from './SceneCanvas.module.css';

interface SceneCanvasProps {
  language: Language;
  onReady?: () => void;
}

/** Full-viewport WebGL layer that sits behind every section. Loaded lazily. */
export default function SceneCanvas({ language, onReady }: SceneCanvasProps) {
  const reducedMotion = usePrefersReducedMotion();
  const compact = useMediaQuery('(max-width: 640px)');

  return (
    // The name is already in the page as a real <h1>; the canvas is decoration for sighted visitors.
    <div className={styles.layer} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 35, near: 0.1, far: 40 }}
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      >
        <ParticleName
          language={language}
          reducedMotion={reducedMotion}
          compact={compact}
          {...(onReady ? { onReady } : {})}
        />
      </Canvas>
    </div>
  );
}
