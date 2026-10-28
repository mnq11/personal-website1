import { lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/context';
import { generatePoints, initKMeans, stepKMeans, type KMeansState } from '../../lib/kmeans';
import { LazyScene } from '../ui/LazyScene';
import { Section } from '../ui/Section';
import styles from './Lab.module.css';

const ClusterLab = lazy(() => import('../../scene/sections/ClusterLab'));

const K = 3;
const AUTO_STEP_MS = 800;

const fresh = (seed: number): KMeansState => initKMeans(generatePoints(seed, K), K, seed + 100);

export function Lab() {
  const { t } = useLanguage();
  const [run, setRun] = useState(() => ({ seed: 7, model: fresh(7) }));
  const state = run.model;
  const [auto, setAuto] = useState(false);

  const step = useCallback(() => setRun((current) => ({ ...current, model: stepKMeans(current.model) })), []);
  const shuffle = useCallback(() => {
    setAuto(false);
    setRun((current) => ({ seed: current.seed + 1, model: fresh(current.seed + 1) }));
  }, []);

  useEffect(() => {
    if (!auto || state.converged) return;
    const timer = window.setTimeout(step, AUTO_STEP_MS);
    return () => window.clearTimeout(timer);
  }, [auto, state, step]);

  const running = auto && !state.converged;
  const status = useMemo(() => {
    if (state.converged) return t.lab.converged(state.iteration - 1);
    return state.iteration === 0 ? t.lab.ready : t.lab.iteration(state.iteration);
  }, [state, t]);

  return (
    <Section id="lab" title={t.lab.title} lede={t.lab.lede}>
      <div className={styles.layout}>
        <div className={styles.controls}>
          <p className={styles.explain}>{t.lab.explain}</p>
          <p className={styles.status} role="status" aria-live="polite">
            {status}
          </p>
          <div className={styles.buttons}>
            <button type="button" className={styles.primary} onClick={() => setAuto((on) => !on)} disabled={state.converged}>
              {running ? t.lab.pause : t.lab.train}
            </button>
            <button type="button" className={styles.secondary} onClick={step} disabled={state.converged}>
              {t.lab.step}
            </button>
            <button type="button" className={styles.secondary} onClick={shuffle}>
              {t.lab.shuffle}
            </button>
          </div>
        </div>
        <LazyScene className={styles.scene} hint={t.lab.hint}>
          <ClusterLab points={state.points} centroids={state.centroids} assignments={state.assignments} assigned={state.iteration > 0} />
        </LazyScene>
      </div>
    </Section>
  );
}
