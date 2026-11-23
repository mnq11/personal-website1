import { useEffect } from 'react';
import { certificates, courses, degrees, profile, projects, roles, skills, socials } from '../data/resume';
import { useLanguage } from '../i18n/context';
import type { Localized } from '../i18n/types';
import { formatMonth } from '../lib/dates';
import { Icon } from '../components/ui/Icon';
import styles from './CvPage.module.css';

const LABELS = {
  role: { en: 'Software Developer', ar: 'مطوّر برمجيات' },
  education: { en: 'Education', ar: 'التعليم' },
  courses: { en: 'Courses', ar: 'المقررات' },
  skills: { en: 'Skills', ar: 'المهارات' },
  projects: { en: 'Projects', ar: 'المشاريع' },
  experience: { en: 'Work experience', ar: 'الخبرة العملية' },
  achievements: { en: 'Notable achievements', ar: 'أبرز الإنجازات' },
  languages: { en: 'Languages', ar: 'اللغات' },
  certificates: { en: 'Certificates', ar: 'الشهادات' },
  soft: { en: 'Soft skills', ar: 'المهارات الشخصية' },
  interests: { en: 'Interests', ar: 'الاهتمامات' },
  present: { en: 'Present', ar: 'الحاضر' },
  achievementsTasks: { en: 'Achievements / tasks', ar: 'الإنجازات / المهام' },
  back: { en: 'Back to the site', ar: 'العودة إلى الموقع' },
  print: { en: 'Save as PDF', ar: 'حفظ كملف PDF' },
  other: { en: 'العربية', ar: 'English' },
  thesis: { en: 'Thesis', ar: 'الرسالة' },
  visit: { en: 'Visit', ar: 'زيارة' },
} satisfies Record<string, Localized>;

/** The résumé as a page: same content as the rest of the site, laid out like the printed CV. */
export function CvPage() {
  const { language, locale, toggleLanguage } = useLanguage();
  const l = (value: Localized) => value[language];
  const web = socials.find((social) => social.network === 'web');
  const linkedin = socials.find((social) => social.network === 'linkedin');
  const github = socials.find((social) => social.network === 'github');
  const present = l(LABELS.present);
  const range = (start: string, end?: string) =>
    `${formatMonth(start, locale)} – ${end ? formatMonth(end, locale) : present}`;
  const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

  useEffect(() => {
    document.title = `${l(profile.name)} · CV`;
  });

  return (
    <div className={styles.page}>
      <nav className={styles.toolbar} aria-label="CV">
        <a href="/">{l(LABELS.back)}</a>
        <span>
          <button type="button" onClick={toggleLanguage}>
            {l(LABELS.other)}
          </button>
          <button type="button" onClick={() => window.print()}>
            {l(LABELS.print)}
          </button>
        </span>
      </nav>

      <article className={styles.sheet}>
        <header className={styles.head}>
          <div className={styles.headText}>
            <h1>{l(profile.name)}</h1>
            <p className={styles.role}>{l(LABELS.role)}</p>
            <p className={styles.summary}>{l(profile.intro)}</p>
            <p className={styles.summary}>{l(profile.background)}</p>
          </div>
          <picture className={styles.portrait}>
            <source
              type="image/webp"
              srcSet={`/${profile.portrait.small} 360w, /${profile.portrait.large} 720w`}
              sizes="190px"
            />
            <img src={`/${profile.portrait.fallback}`} alt={l(profile.name)} width="190" height="190" />
          </picture>
        </header>

        <ul className={styles.contact}>
          <li>
            <Icon name="mail" size={18} />
            <span className="ltr">{profile.email}</span>
          </li>
          <li>{l(profile.location)}</li>
          {linkedin ? (
            <li>
              <Icon name="linkedin" size={18} />
              <a href={linkedin.url} className="ltr">
                {bare(linkedin.url)}
              </a>
            </li>
          ) : null}
          {web ? (
            <li>
              <Icon name="web" size={18} />
              <a href={web.url} className="ltr">
                {bare(web.url)}
              </a>
            </li>
          ) : null}
          {github ? (
            <li>
              <Icon name="github" size={18} />
              <a href={github.url} className="ltr">
                {bare(github.url)}
              </a>
            </li>
          ) : null}
        </ul>

        <div className={styles.columns}>
          <div>
            <section className={styles.block}>
              <h2>{l(LABELS.education)}</h2>
              {degrees.map((degree) => {
                const cycle = degree.id === 'bachelor' ? 1 : 2;
                return (
                  <div key={degree.id} className={styles.entry}>
                    <h3>{l(degree.title)}</h3>
                    <p className={styles.org}>{l(degree.institution)}</p>
                    <p className={styles.when}>{range(degree.start, degree.end)}</p>
                    <p className={styles.caption}>{l(degree.programme)}</p>
                    <p className={styles.caption}>
                      {l(LABELS.thesis)}: {degree.thesis.title[language]}
                    </p>
                    <p className={styles.caption}>{l(LABELS.courses)}</p>
                    <ul className={styles.courses}>
                      {courses
                        .filter((course) => course.cycle === cycle)
                        .map((course) => (
                          <li key={course.code}>{l(course.name)}</li>
                        ))}
                    </ul>
                  </div>
                );
              })}
            </section>

            <section className={styles.block}>
              <h2>{l(LABELS.experience)}</h2>
              {roles.map((role) => (
                <div key={role.id} className={styles.entry}>
                  <h3>{l(role.title)}</h3>
                  <p className={styles.org}>{l(role.organisation)}</p>
                  <p className={styles.when}>{range(role.start, role.end)}</p>
                  <p className={styles.caption}>{l(role.summary)}</p>
                  {role.highlights.length > 0 ? (
                    <>
                      <p className={styles.caption}>{l(LABELS.achievementsTasks)}</p>
                      <ul className={styles.bullets}>
                        {role.highlights.map((item) => (
                          <li key={item.en}>{l(item)}</li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              ))}
            </section>
          </div>

          <div>
            <section className={styles.block}>
              <h2>{l(LABELS.skills)}</h2>
              <ul className={styles.pills}>
                {skills.map((skill) => (
                  <li key={skill.name} className="ltr">
                    {skill.name}
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.block}>
              <h2>{l(LABELS.projects)}</h2>
              {projects.map((project) => (
                <div key={project.id} className={styles.entry}>
                  <h3 className={styles.plain}>
                    {project.name}
                    {project.start ? <span className={styles.when}> ({range(project.start, project.end)})</span> : null}
                  </h3>
                  <ul className={styles.bullets}>
                    <li>{l(project.summary)}</li>
                    {project.features.map((feature) => (
                      <li key={feature.en}>{l(feature)}</li>
                    ))}
                    {project.url ? (
                      <li>
                        <a href={project.url} className="ltr">
                          {bare(project.url)}
                        </a>
                      </li>
                    ) : null}
                  </ul>
                </div>
              ))}
            </section>

            <section className={styles.block}>
              <h2>{l(LABELS.languages)}</h2>
              <ul className={styles.langs}>
                {profile.languages.map((language_) => (
                  <li key={language_.name.en}>
                    <span>{l(language_.name)}</span>
                    <span className={styles.when}>{l(language_.level)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className={styles.block}>
              <h2>{l(LABELS.certificates)}</h2>
              {certificates.map((certificate) => (
                <div key={certificate.id} className={styles.entry}>
                  <h3 className={styles.plain}>
                    {l(certificate.name)}{' '}
                    <span className={styles.when}>
                      ({certificate.issuer}, {certificate.year})
                    </span>
                  </h3>
                  <p className={styles.caption}>{l(certificate.summary)}</p>
                </div>
              ))}
            </section>

            <section className={styles.block}>
              <h2>{l(LABELS.soft)}</h2>
              <ul className={styles.pills}>
                {profile.traits.map((trait) => (
                  <li key={trait.en}>{l(trait)}</li>
                ))}
              </ul>
            </section>

            <section className={styles.block}>
              <h2>{l(LABELS.interests)}</h2>
              <ul className={styles.pills}>
                {profile.interests.map((interest) => (
                  <li key={interest.en}>{l(interest)}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </article>
    </div>
  );
}
