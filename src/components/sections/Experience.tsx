import { lazy, useMemo, useState } from 'react';
import { degrees, roles } from '../../data/resume';
import { useLanguage } from '../../i18n/context';
import { currentMonth, formatDuration, formatMonth, monthsBetween, yearFraction } from '../../lib/dates';
import type { Strand } from '../../scene/sections/CareerHelix';
import { ExternalLink } from '../ui/ExternalLink';
import { LazyScene } from '../ui/LazyScene';
import { Section } from '../ui/Section';
import styles from './Experience.module.css';

const CareerHelix = lazy(() => import('../../scene/sections/CareerHelix'));

/** One colour per thread, shared by the 3D strands and the swatches in the list. */
const STRAND_COLORS: Record<string, string> = {
  'hlkat-wsl': '#f2b544',
  freelance: '#5cd6bf',
  'support-worker': '#9c8cff',
  bachelor: '#6ea8ff',
  'master-level': '#ff8fa3',
};

function DateRange({ start, end }: { start: string; end?: string | undefined }) {
  const { t, locale } = useLanguage();
  const last = end ?? currentMonth();
  const sameMonth = start === last;
  return (
    <p className={styles.when}>
      <span className={styles.range}>
        <time dateTime={start}>{formatMonth(start, locale)}</time>
        {sameMonth ? null : (
          <>
            {' – '}
            {end ? <time dateTime={end}>{formatMonth(end, locale)}</time> : t.experience.present}
          </>
        )}
      </span>
      <span className={styles.duration}>{formatDuration(monthsBetween(start, last), t.duration)}</span>
    </p>
  );
}

export function Experience() {
  const { t, language } = useLanguage();
  const [active, setActive] = useState<string | null>(null);

  const strands = useMemo<Strand[]>(() => {
    const now = yearFraction(currentMonth());
    const threads = [
      ...roles.map((role) => ({ id: role.id, start: role.start, end: role.end })),
      ...degrees.map((degree) => ({ id: degree.id, start: degree.start, end: degree.end })),
    ];
    return threads.map((thread, lane) => ({
      id: thread.id,
      from: yearFraction(thread.start),
      to: thread.end ? yearFraction(thread.end) + 1 / 12 : now,
      color: STRAND_COLORS[thread.id] ?? '#e8eff3',
      lane,
    }));
  }, []);

  const startYear = 2015;
  const endYear = Math.ceil(yearFraction(currentMonth()));

  const legend = [
    ...roles.map((role) => ({ id: role.id, label: role.title[language] })),
    ...degrees.map((degree) => ({ id: degree.id, label: degree.title[language] })),
  ];

  const linkProps = (id: string) => ({
    onMouseEnter: () => setActive(id),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(id),
    onBlur: () => setActive(null),
  });

  return (
    <Section id="experience" title={t.experience.title} lede={t.experience.lede}>
      <div className={styles.layout}>
        <div className={styles.helixColumn}>
          <LazyScene className={styles.helix} hint={t.experience.hint}>
            <CareerHelix strands={strands} startYear={startYear} endYear={endYear} active={active} onHover={setActive} />
          </LazyScene>
          <ul className={styles.legend}>
            {legend.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.legendItem}
                  aria-pressed={active === item.id}
                  data-active={active === item.id}
                  {...linkProps(item.id)}
                  onClick={() => setActive((current) => (current === item.id ? null : item.id))}
                >
                  <span className={styles.swatch} style={{ background: STRAND_COLORS[item.id] }} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <ol className={styles.timeline}>
          {roles.map((role) => (
            <li
              key={role.id}
              className={styles.entry}
              data-active={active === role.id}
              data-dim={active !== null && active !== role.id}
              {...linkProps(role.id)}
            >
              <span className={styles.marker} style={{ background: STRAND_COLORS[role.id] }} aria-hidden="true" />
              <DateRange start={role.start} end={role.end} />
              <div className={styles.detail}>
                <h3 className={styles.title}>{role.title[language]}</h3>
                <p className={styles.organisation}>
                  {role.url ? (
                    <ExternalLink href={role.url}>{role.organisation[language]}</ExternalLink>
                  ) : (
                    role.organisation[language]
                  )}
                </p>
                <p className={styles.summary}>{role.summary[language]}</p>
                {role.highlights.length > 0 ? (
                  <ul className={styles.highlights}>
                    {role.highlights.map((highlight) => (
                      <li key={highlight.en}>{highlight[language]}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
