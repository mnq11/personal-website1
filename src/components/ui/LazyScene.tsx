import { Component, Suspense, useRef, type ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';
import { useLanguage } from '../../i18n/context';
import { supportsWebGL } from '../../lib/webgl';
import styles from './LazyScene.module.css';

const webglAvailable = typeof window !== 'undefined' && supportsWebGL();

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    console.warn('[scene] A section scene failed; showing its static fallback.', error);
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

interface LazySceneProps {
  /** The lazily imported scene. It renders its own <Canvas>, so Three.js stays out of the main bundle. */
  children: ReactNode;
  /** Shown without WebGL or if the scene fails. Keep it meaningful; it is the accessible version. */
  fallback?: ReactNode;
  /** Interaction hint under or over the scene. `null` shows none, e.g. for a purely decorative effect. */
  hint?: string | null;
  /** Where the interaction hint goes: under the scene (default) or over its bottom edge. */
  hintPlacement?: 'below' | 'overlay';
  className?: string | undefined;
}

/**
 * Frame for a section's 3D scene. The canvas only exists while the frame is near the viewport,
 * which keeps GPU memory low and avoids browser limits on simultaneous WebGL contexts.
 */
export function LazyScene({ children, fallback = null, hint, hintPlacement = 'below', className }: LazySceneProps) {
  const { t } = useLanguage();
  const frame = useRef<HTMLDivElement>(null);
  const near = useInView(frame);

  if (!webglAvailable) return <>{fallback}</>;

  const hintText =
    hint === null ? null : (
      <p className={styles.hint} data-placement={hintPlacement}>
        {hint ?? t.scene.drag}
      </p>
    );

  return (
    <SceneBoundary fallback={fallback}>
      <div ref={frame} className={`${styles.frame} ${className ?? ''}`} data-scene="">
        <div className={styles.stage} aria-hidden="true">
          {near ? <Suspense fallback={null}>{children}</Suspense> : null}
        </div>
        {hintPlacement === 'overlay' ? hintText : null}
      </div>
      {hintPlacement === 'below' ? hintText : null}
    </SceneBoundary>
  );
}
