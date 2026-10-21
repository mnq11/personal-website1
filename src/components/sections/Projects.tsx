import { profile, socials } from '../../data/resume';
import { useRemoteData } from '../../hooks/useRemoteData';
import { useLanguage } from '../../i18n/context';
import { formatDate } from '../../lib/dates';
import { fetchProjects } from '../../lib/remote';
import { ExternalLink } from '../ui/ExternalLink';
import { Icon } from '../ui/Icon';
import { Section } from '../ui/Section';
import list from '../ui/EntryList.module.css';

const githubUrl = socials.find((social) => social.network === 'github')?.url ?? 'https://github.com';

export function Projects() {
  const { t, locale } = useLanguage();
  const state = useRemoteData(`projects:${profile.githubUser}`, (signal) =>
    fetchProjects(profile.githubUser, signal),
  );
  const numbers = new Intl.NumberFormat(locale);

  return (
    <Section id="projects" title={t.projects.title} lede={t.projects.lede}>
      <div aria-live="polite" aria-busy={state.status === 'loading'}>
        {state.status === 'loading' ? (
          <>
            <p className="visually-hidden">{t.projects.loading}</p>
            <div className={list.list} aria-hidden="true">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className={list.skeleton} />
              ))}
            </div>
          </>
        ) : null}

        {state.status === 'error' ? (
          <p className={list.status} data-tone="error">
            {t.projects.error}
          </p>
        ) : null}

        {state.status === 'ready' && state.data.length === 0 ? (
          <p className={list.status}>{t.projects.empty}</p>
        ) : null}

        {state.status === 'ready' && state.data.length > 0 ? (
          <ul className={list.list}>
            {state.data.map((project) => (
              <li key={project.name} className={list.item}>
                <h3 className={`${list.name} ltr`}>
                  <ExternalLink href={project.homepage ?? project.url}>{project.name}</ExternalLink>
                </h3>
                <p className={list.description} dir="auto">
                  {project.description ?? t.projects.noDescription}
                </p>
                <p className={list.meta}>
                  {project.language ? <span className="ltr">{project.language}</span> : null}
                  {project.stars > 0 ? (
                    <span className={list.metaItem}>
                      <Icon name="star" size={14} />
                      {numbers.format(project.stars)}
                      <span className="visually-hidden">{t.projects.stars}</span>
                    </span>
                  ) : null}
                  <span>
                    {t.projects.updated}{' '}
                    <time dateTime={project.pushedAt}>{formatDate(project.pushedAt, locale)}</time>
                  </span>
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <ExternalLink href={githubUrl} className={list.more}>
        {t.projects.allOnGitHub}
      </ExternalLink>
    </Section>
  );
}
