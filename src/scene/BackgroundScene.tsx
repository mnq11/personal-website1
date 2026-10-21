import { Component, Suspense, lazy, type ReactNode } from 'react';
import type { Language } from '../i18n/types';

// Three.js only downloads once the page has rendered, so text is readable immediately.
const SceneCanvas = lazy(() => import('./SceneCanvas'));

export type SceneStatus = 'loading' | 'ready' | 'off';

interface BackgroundSceneProps {
  language: Language;
  enabled: boolean;
  onStatus: (status: SceneStatus) => void;
}

class SceneErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: unknown) {
    console.warn('[scene] WebGL scene failed, falling back to plain layout.', error);
    this.props.onError();
  }

  override render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function BackgroundScene({ language, enabled, onStatus }: BackgroundSceneProps) {
  if (!enabled) return null;
  return (
    <SceneErrorBoundary onError={() => onStatus('off')}>
      <Suspense fallback={null}>
        <SceneCanvas language={language} onReady={() => onStatus('ready')} />
      </Suspense>
    </SceneErrorBoundary>
  );
}
