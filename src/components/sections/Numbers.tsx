import { lazy, useMemo } from 'react';
import { useLanguage } from '../../i18n/context';
import { buildStats } from '../../lib/stats';
import { supportsWebGL } from '../../lib/webgl';
import { css } from '../../scene/kit/theme';
import type { TowerData } from '../../scene/sections/StatTowers';
import { LazyScene } from '../ui/LazyScene';
import { Section } from '../ui/Section';
import styles from './Numbers.module.css';

const StatTowers = lazy(() => import('../../scene/sections/StatTowers'));

const ACCENTS = [css.saffron, css.teal, css.violet, css.sky, css.rose, css.saffron, css.teal];

export function Numbers() {
  const { t, locale } = useLanguage();
  const stats = useMemo(() => buildStats(), []);
  const format = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const webgl = supportsWebGL();

  const towers = useMemo<TowerData[]>(() => {
    const top = Math.log(1 + Math.max(...stats.map((stat) => stat.value)));
    return stats.map((stat, i) => ({
      id: stat.id,
      label: t.numbers.labels[stat.id],
      value: format.format(stat.value),
      height: Math.log(1 + stat.value) / top,
      accent: ACCENTS[i % ACCENTS.length] ?? css.saffron,
    }));
  }, [stats, t, format]);

  const list = (
    <dl className={webgl ? 'visually-hidden' : styles.grid}>
      {stats.map((stat) => (
        <div key={stat.id} className={styles.stat}>
          <dd className={styles.value}>{format.format(stat.value)}</dd>
          <dt className={styles.label}>{t.numbers.labels[stat.id]}</dt>
        </div>
      ))}
    </dl>
  );

  return (
    <Section id="numbers" title={t.numbers.title} lede={t.numbers.lede}>
      <LazyScene className={styles.towers} hint={t.numbers.hint} fallback={list}>
        <StatTowers towers={towers} />
      </LazyScene>
      {webgl ? list : null}
    </Section>
  );
}
