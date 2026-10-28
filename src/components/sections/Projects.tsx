import { lazy, useMemo, useState, type KeyboardEvent } from 'react';
import { profile, projects, socials, type ProjectKind } from '../../data/resume';
import { useFocus } from '../../focus/context';
import { useRemoteData } from '../../hooks/useRemoteData';
import { useLanguage } from '../../i18n/context';
import { formatDate } from '../../lib/dates';
import { fetchProjects } from '../../lib/remote';
import type { PanelData } from '../../scene/sections/ProjectRing';
import { ExternalLink } from '../ui/ExternalLink';
import { Icon } from '../ui/Icon';
import { LazyScene } from '../ui/LazyScene';
import { Section } from '../ui/Section';
import buttons from '../ui/Button.module.css';
import list from '../ui/EntryList.module.css';
import styles from './Projects.module.css';

const ProjectRing = lazy(() => import('../../scene/sections/ProjectRing'));

const githubUrl = socials.find((social) => social.network === 'github')?.url ?? 'https://github.com';

const KIND_COLORS: Record<ProjectKind, string> = {
  web: '#5cd6bf',
  mobile: '#6ea8ff',
  desktop: '#9c8cff',
  research: '#f2b544',
};

function useYears() {
  const { locale } = useLanguage();
  return (start?: string, end?: string) => {
    if (!start) return '';
    const year = (value: string) =>
      new Intl.NumberFormat(locale, { useGrouping: false }).format(Number(value.slice(0, 4)));
    if (!end) return `${year(start)} –`;
    return start.slice(0, 4) === end.slice(0, 4) ? year(start) : `${year(start)} – ${year(end)}`;
  };
}

function LiveRepositories() {
  const { t, locale } = useLanguage();
  const state = useRemoteData(`projects:${profile.githubUser}`, (signal) => fetchProjects(profile.githubUser, signal));
  const numbers = new Intl.NumberFormat(locale);
  const copy = t.projects.live;

  return (
    <div className={styles.live}>
      <h3 className={styles.subheading}>{copy.title}</h3>
      <div aria-live="polite" aria-busy={state.status === 'loading'}>
        {state.status === 'loading' ? (
          <>
            <p className="visually-hidden">{copy.loading}</p>
            <div className={list.list} aria-hidden="true">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className={list.skeleton} />
              ))}
            </div>
          </>
        ) : null}
        {state.status === 'error' ? (
          <p className={list.status} data-tone="error">
            {copy.error}
          </p>
        ) : null}
        {state.status === 'ready' && state.data.length === 0 ? <p className={list.status}>{copy.empty}</p> : null}
        {state.status === 'ready' && state.data.length > 0 ? (
          <ul className={list.list}>
            {state.data.map((project) => (
              <li key={project.name} className={list.item}>
                <h4 className={`${list.name} ltr`}>
                  <ExternalLink href={project.homepage ?? project.url}>{project.name}</ExternalLink>
                </h4>
                <p className={list.description} dir="auto">
                  {project.description ?? copy.noDescription}
                </p>
                <p className={list.meta}>
                  {project.language ? <span className="ltr">{project.language}</span> : null}
                  {project.stars > 0 ? (
                    <span className={list.metaItem}>
                      <Icon name="star" size={14} />
                      {numbers.format(project.stars)}
                      <span className="visually-hidden">{copy.stars}</span>
                    </span>
                  ) : null}
                  <span>
                    {copy.updated} <time dateTime={project.pushedAt}>{formatDate(project.pushedAt, locale)}</time>
                  </span>
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <ExternalLink href={githubUrl} className={list.more}>
        {copy.allOnGitHub}
      </ExternalLink>
    </div>
  );
}

export function Projects() {
  const { t, language, direction } = useLanguage();
  const years = useYears();
  const [active, setActive] = useState(0);
  const { focus } = useFocus();
  const [seen, setSeen] = useState(0);
  // When an answer points at a project, jump to it once per question. React allows this render-time
  // adjustment, and it avoids an effect that would set state after the fact.
  if (focus?.projectId && focus.stamp !== seen) {
    setSeen(focus.stamp);
    const index = projects.findIndex((item) => item.id === focus.projectId);
    if (index >= 0) setActive(index);
  }
  const project = projects[active] ?? projects[0];

  const panels = useMemo<PanelData[]>(
    () =>
      projects.map((item) => ({
        id: item.id,
        name: item.name,
        kind: t.projects.kinds[item.kind],
        years: years(item.start, item.end),
        stack: item.stack,
        accent: KIND_COLORS[item.kind],
        direction,
      })),
    // `years` depends only on the locale, which changes with `t`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, direction],
  );

  const go = (offset: number) => setActive((index) => (index + offset + projects.length) % projects.length);
  // Arrow keys follow reading direction, so "next" is to the left in Arabic.
  const onKeyDown = (event: KeyboardEvent) => {
    const forward = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const back = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (event.key === forward) go(1);
    if (event.key === back) go(-1);
  };

  if (!project) return null;

  return (
    <Section id="projects" title={t.projects.title} lede={t.projects.lede}>
      <LazyScene className={styles.ring} hint={t.projects.hint}>
        <ProjectRing panels={panels} active={active} onSelect={setActive} />
      </LazyScene>

      <div className={styles.showcase} onKeyDown={onKeyDown}>
        <article className={styles.detail} aria-live="polite" style={{ ['--accent' as string]: KIND_COLORS[project.kind] }}>
          <p className={styles.kicker}>
            <span className={styles.kind}>{t.projects.kinds[project.kind]}</span>
            {project.start ? <span className={styles.years}>{years(project.start, project.end)}</span> : null}
          </p>
          <h3 className={styles.name}>{project.name}</h3>
          <p className={styles.summary}>{project.summary[language]}</p>
          <ul className={styles.features}>
            {project.features.map((feature) => (
              <li key={feature.en}>{feature[language]}</li>
            ))}
          </ul>
          <p className={styles.stackLabel}>{t.projects.builtWith}</p>
          <ul className={styles.stack}>
            {project.stack.map((item) => (
              <li key={item} className="ltr">
                {item}
              </li>
            ))}
          </ul>
          {project.url ? (
            <ExternalLink href={project.url} className={buttons.primary}>
              {t.projects.visit}
            </ExternalLink>
          ) : null}
        </article>

        <div className={styles.navigator}>
          <div className={styles.stepper}>
            <button type="button" className={buttons.quiet} onClick={() => go(-1)} aria-label={t.projects.previous}>
              <span aria-hidden="true">{direction === 'rtl' ? '→' : '←'}</span>
            </button>
            <span className={styles.position}>{t.projects.position(active + 1, projects.length)}</span>
            <button type="button" className={buttons.quiet} onClick={() => go(1)} aria-label={t.projects.next}>
              <span aria-hidden="true">{direction === 'rtl' ? '←' : '→'}</span>
            </button>
          </div>
          <p className={styles.listLabel}>{t.projects.listLabel}</p>
          <ul className={styles.index}>
            {projects.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.indexItem}
                  aria-current={i === active ? 'true' : undefined}
                  onClick={() => setActive(i)}
                >
                  <span className={styles.dot} style={{ background: KIND_COLORS[item.kind] }} />
                  <span className={styles.indexName}>{item.name}</span>
                  <span className={styles.indexYear}>{item.start ? years(item.start, item.end) : ''}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <LiveRepositories />
    </Section>
  );
}
