import { profile, socials } from '../../data/resume';
import { useRemoteData } from '../../hooks/useRemoteData';
import { useLanguage } from '../../i18n/context';
import { formatDate } from '../../lib/dates';
import { fetchArticles } from '../../lib/remote';
import { ExternalLink } from '../ui/ExternalLink';
import { Section } from '../ui/Section';
import list from '../ui/EntryList.module.css';

const devUrl = socials.find((social) => social.network === 'devto')?.url ?? 'https://dev.to';

export function Writing() {
  const { t, locale } = useLanguage();
  const state = useRemoteData(`articles:${profile.devtoUser}`, (signal) =>
    fetchArticles(profile.devtoUser, signal),
  );
  const numbers = new Intl.NumberFormat(locale);

  return (
    <Section id="writing" title={t.writing.title} lede={t.writing.lede}>
      <div aria-live="polite" aria-busy={state.status === 'loading'}>
        {state.status === 'loading' ? (
          <>
            <p className="visually-hidden">{t.writing.loading}</p>
            <div className={list.list} aria-hidden="true">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className={list.skeleton} />
              ))}
            </div>
          </>
        ) : null}

        {state.status === 'error' ? (
          <p className={list.status} data-tone="error">
            {t.writing.error}
          </p>
        ) : null}

        {state.status === 'ready' && state.data.length === 0 ? (
          <p className={list.status}>{t.writing.empty}</p>
        ) : null}

        {state.status === 'ready' && state.data.length > 0 ? (
          <ul className={list.list}>
            {state.data.map((article) => (
              <li key={article.id} className={list.item}>
                {/* Articles are written in English; keep their direction even on the Arabic page. */}
                <h3 className={list.name} lang="en" dir="auto">
                  <ExternalLink href={article.url}>{article.title}</ExternalLink>
                </h3>
                {article.description ? (
                  <p className={list.description} lang="en" dir="auto">
                    {article.description}
                  </p>
                ) : null}
                <p className={list.meta}>
                  <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, locale)}</time>
                  <span>
                    {numbers.format(Math.max(article.readingMinutes, 1))} {t.writing.minRead}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <ExternalLink href={devUrl} className={list.more}>
        {t.writing.allOnDev}
      </ExternalLink>
    </Section>
  );
}
