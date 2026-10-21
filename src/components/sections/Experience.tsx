import { education, roles } from '../../data/resume';
import { useLanguage } from '../../i18n/context';
import { currentMonth, formatDuration, formatMonth, monthsBetween } from '../../lib/dates';
import { ExternalLink } from '../ui/ExternalLink';
import { Section } from '../ui/Section';
import styles from './Experience.module.css';

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

  return (
    <Section id="experience" title={t.experience.title}>
      <ol className={styles.timeline}>
        {roles.map((role) => (
          <li key={role.id} className={styles.entry}>
            <DateRange start={role.start} end={role.end} />
            <div className={styles.detail}>
              <h3 className={styles.title}>{role.title[language]}</h3>
              <p className={styles.organisation}>
                <ExternalLink href={role.url}>{role.organisation[language]}</ExternalLink>
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

      <h3 className={styles.subheading}>{t.experience.education}</h3>
      <ol className={styles.timeline}>
        {education.map((item) => (
          <li key={item.institution.en} className={styles.entry}>
            <DateRange start={item.start} end={item.end} />
            <div className={styles.detail}>
              <h4 className={styles.title}>{item.degree[language]}</h4>
              <p className={styles.organisation}>{item.institution[language]}</p>
              <p className={styles.coursesLabel}>{t.experience.courses}</p>
              <ul className={styles.courses}>
                {item.courses.map((course) => (
                  <li key={course.en}>{course[language]}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
