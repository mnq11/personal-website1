import { lazy, useMemo, useState } from 'react';
import { certificates, courses, degrees } from '../../data/resume';
import { useLanguage } from '../../i18n/context';
import { formatMonth } from '../../lib/dates';
import type { BookData } from '../../scene/sections/BookStack';
import { LazyScene } from '../ui/LazyScene';
import { Section } from '../ui/Section';
import styles from './Education.module.css';

const BookStack = lazy(() => import('../../scene/sections/BookStack'));

export function Education() {
  const { t, language, direction, locale } = useLanguage();
  const [active, setActive] = useState<string | null>(null);

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  const distinctions = courses.filter((course) => course.distinction).length;
  const numbers = new Intl.NumberFormat(locale);
  const yearFormat = new Intl.NumberFormat(locale, { useGrouping: false });
  const summary = t.education.summary(courses.length, totalCredits, distinctions);

  const books = useMemo<BookData[]>(
    () =>
      courses.map((course) => ({
        code: course.code,
        title: course.name[language],
        credits: course.credits,
        cycle: course.cycle,
        distinction: course.distinction,
        direction,
      })),
    [language, direction],
  );

  const current = courses.find((course) => course.code === active);
  const hover = (code: string) => ({
    onMouseEnter: () => setActive(code),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(code),
    onBlur: () => setActive(null),
  });

  return (
    <Section id="education" title={t.education.title} lede={t.education.lede}>
      <div className={styles.layout}>
        <div className={styles.stackColumn}>
          <LazyScene className={styles.books} hint={t.education.hint}>
            <BookStack books={books} active={active} onHover={setActive} />
          </LazyScene>
          {/* Reads out the book under the pointer, or the totals when nothing is selected. */}
          <div className={styles.readout} aria-live="polite">
            {current ? (
              <>
                <p className={styles.readoutTitle}>{current.name[language]}</p>
                <p className={styles.readoutMeta}>
                  <span className="ltr">{current.code}</span>
                  <span>{t.education.credits(current.credits)}</span>
                  <span>{formatMonth(current.completed, locale)}</span>
                  <span>{current.cycle === 1 ? t.education.bachelorLevel : t.education.masterLevel}</span>
                  {current.distinction ? <span className={styles.distinction}>{t.education.distinction}</span> : null}
                </p>
              </>
            ) : (
              <p className={styles.readoutTitle}>{summary}</p>
            )}
          </div>
        </div>

        <div className={styles.details}>
          <ol className={styles.degrees}>
            {degrees.map((degree) => (
              <li key={degree.id} className={styles.degree}>
                <p className={styles.when}>
                  <time dateTime={degree.start}>{formatMonth(degree.start, locale)}</time> –{' '}
                  <time dateTime={degree.end}>{formatMonth(degree.end, locale)}</time>
                  <span>{t.education.credits(degree.credits)}</span>
                </p>
                <h3 className={styles.degreeTitle}>{degree.title[language]}</h3>
                <p className={styles.institution}>
                  {degree.institution[language]} · {degree.programme[language]}
                </p>
                <div className={styles.thesis}>
                  <p className={styles.thesisLabel}>
                    {t.education.thesis}
                    {degree.thesis.distinction ? (
                      <span className={styles.distinction}>{t.education.distinction}</span>
                    ) : null}
                  </p>
                  <p className={styles.thesisTitle}>{degree.thesis.title[language]}</p>
                </div>
              </li>
            ))}
          </ol>

          <details className={styles.courses}>
            <summary>
              {t.education.coursesTitle}
              <span className={styles.summaryMeta}>{summary}</span>
            </summary>
            {([1, 2] as const).map((cycle) => (
              <div key={cycle} className={styles.cycle}>
                <p className={styles.cycleLabel}>
                  {cycle === 1 ? t.education.bachelorLevel : t.education.masterLevel}
                </p>
                <ul>
                  {courses
                    .filter((course) => course.cycle === cycle)
                    .map((course) => (
                      <li key={course.code}>
                        <button
                          type="button"
                          className={styles.course}
                          data-active={active === course.code}
                          {...hover(course.code)}
                        >
                          <span>{course.name[language]}</span>
                          <span className={styles.courseMeta}>
                            {course.distinction ? (
                              <span className={styles.star} aria-label={t.education.distinction}>
                                ★
                              </span>
                            ) : null}
                            {numbers.format(course.credits)}
                          </span>
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </details>

          <h3 className={styles.subheading}>{t.education.certificates}</h3>
          <ul className={styles.certificates}>
            {certificates.map((certificate) => (
              <li key={certificate.id} className={styles.certificate}>
                <p className={styles.certificateMeta}>
                  <span className="ltr">{certificate.issuer}</span>
                  <span>{yearFormat.format(certificate.year)}</span>
                </p>
                <p className={styles.certificateName}>{certificate.name[language]}</p>
                <p className={styles.certificateSummary}>{certificate.summary[language]}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
