import { Icon } from '../../components/ui/Icon';
import { profile } from '../../data/resume';
import { CV_LABELS, type CvModel } from '../../lib/cv';
import styles from './Designed.module.css';

const ICONS = { email: 'mail', linkedin: 'linkedin', web: 'web', github: 'github' } as const;

/** The designed layout: dark header with portrait, teal headings, two columns, skill pills. */
export function Designed({ cv }: { cv: CvModel }) {
  const l = (value: Record<'en' | 'ar', string>) => value[cv.language];
  return (
    <article className={styles.sheet}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <h1>{cv.name}</h1>
          <p className={styles.role}>{cv.role}</p>
          <p className={styles.summary}>{cv.intro[0]}</p>
          <p className={styles.summary}>{cv.intro[1]}</p>
        </div>
        <picture className={styles.portrait}>
          <source
            type="image/webp"
            srcSet={`/${profile.portrait.small} 360w, /${profile.portrait.large} 720w`}
            sizes="190px"
          />
          <img src={`/${profile.portrait.fallback}`} alt={cv.name} width="190" height="190" />
        </picture>
      </header>

      <ul className={styles.contact}>
        {cv.contact.map((item) => (
          <li key={item.kind}>
            {item.kind !== 'location' ? <Icon name={ICONS[item.kind]} size={18} /> : null}
            {item.href ? (
              <a href={item.href} className="ltr">
                {item.label}
              </a>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ul>

      <div className={styles.columns}>
        <div>
          <section className={styles.block}>
            <h2>{l(CV_LABELS.profile)}</h2>
            {cv.intro.slice(2).map((paragraph) => (
              <p key={paragraph} className={styles.para}>
                {paragraph}
              </p>
            ))}
          </section>

          <section className={styles.block}>
            <h2>{l(CV_LABELS.education)}</h2>
            {cv.degrees.map((degree) => (
              <div key={degree.title} className={styles.entry}>
                <h3>{degree.title}</h3>
                <p className={styles.org}>{degree.org}</p>
                <p className={styles.when}>{degree.when}</p>
                {degree.lines.map((line) => (
                  <p key={line} className={styles.caption}>
                    {line}
                  </p>
                ))}
                <p className={styles.caption}>{l(CV_LABELS.courses)}</p>
                <ul className={styles.courses}>
                  {degree.courses.map((course) => (
                    <li key={course}>{course}</li>
                  ))}
                </ul>
              </div>
            ))}
            <h3 className={styles.sub}>{l(CV_LABELS.earlierStudies)}</h3>
            {cv.diplomas.map((diploma) => (
              <div key={diploma.title} className={styles.entry}>
                <h3 className={styles.plain}>{diploma.title}</h3>
                <p className={styles.org}>{diploma.org}</p>
                <p className={styles.when}>{diploma.when}</p>
                <p className={styles.caption}>{diploma.lines[0]}</p>
              </div>
            ))}
          </section>

          <section className={styles.block}>
            <h2>{l(CV_LABELS.experience)}</h2>
            {cv.roles.map((role) => (
              <div key={role.title + role.when} className={styles.entry}>
                <h3>{role.title}</h3>
                <p className={styles.org}>{role.org}</p>
                <p className={styles.when}>{role.when}</p>
                <p className={styles.caption}>{role.lines[0]}</p>
                {role.bullets.length > 0 ? (
                  <ul className={styles.bullets}>
                    {role.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </section>
        </div>

        <div>
          <section className={styles.block}>
            <h2>{l(CV_LABELS.skills)}</h2>
            <ul className={styles.pills}>
              {cv.skills.map((skill) => (
                <li key={skill} className="ltr">
                  {skill}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.block}>
            <h2>{l(CV_LABELS.projects)}</h2>
            {cv.projects.map((project) => (
              <div key={project.title} className={styles.entry}>
                <h3 className={styles.plain}>
                  {project.title}
                  {project.when ? <span className={styles.when}> ({project.when})</span> : null}
                </h3>
                <ul className={styles.bullets}>
                  <li>{project.lines[0]}</li>
                  {project.bullets.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                  <li className="ltr">
                    {l(CV_LABELS.stack)}: {project.stack.join(', ')}
                  </li>
                  {project.url ? (
                    <li>
                      <a href={project.url} className="ltr">
                        {project.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
            ))}
          </section>

          <section className={styles.block}>
            <h2>{l(CV_LABELS.languages)}</h2>
            <ul className={styles.langs}>
              {cv.languages.map((item) => (
                <li key={item.name}>
                  <span>{item.name}</span>
                  <span className={styles.when}>{item.level}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.block}>
            <h2>{l(CV_LABELS.certificates)}</h2>
            {cv.certificates.map((certificate) => (
              <div key={certificate.title} className={styles.entry}>
                <h3 className={styles.plain}>
                  {certificate.title}{' '}
                  <span className={styles.when}>
                    ({certificate.org}, {certificate.when})
                  </span>
                </h3>
                <p className={styles.caption}>{certificate.lines[0]}</p>
              </div>
            ))}
          </section>

          <section className={styles.block}>
            <h2>{l(CV_LABELS.soft)}</h2>
            <ul className={styles.pills}>
              {cv.traits.map((trait) => (
                <li key={trait}>{trait}</li>
              ))}
            </ul>
          </section>

          <section className={styles.block}>
            <h2>{l(CV_LABELS.interests)}</h2>
            <ul className={styles.pills}>
              {cv.interests.map((interest) => (
                <li key={interest}>{interest}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </article>
  );
}
