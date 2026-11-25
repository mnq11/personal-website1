import { Icon } from '../../components/ui/Icon';
import { profile } from '../../data/resume';
import { CV_LABELS, type CvModel } from '../../lib/cv';
import styles from './Designed.module.css';

const ICONS = { email: 'mail', linkedin: 'linkedin', web: 'web', github: 'github' } as const;

/**
 * The designed layout: a dark hero with the portrait, contact chips, headline numbers, then two flowing
 * columns. The columns flow (rather than being fixed left and right) so the printed pages fill evenly.
 */
export function Designed({ cv }: { cv: CvModel }) {
  const l = (value: Record<'en' | 'ar', string>) => value[cv.language];
  return (
    <article className={styles.sheet}>
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.role}>{cv.role}</p>
          <h1>{cv.name}</h1>
          <p className={styles.lede}>{cv.intro[0]}</p>
          <p className={styles.lede}>{cv.intro[1]}</p>
        </div>
        <picture className={styles.portrait}>
          <source
            type="image/webp"
            srcSet={`/${profile.portrait.small} 360w, /${profile.portrait.large} 720w`}
            sizes="200px"
          />
          <img src={`/${profile.portrait.fallback}`} alt={cv.name} width="200" height="200" />
        </picture>
      </header>

      <ul className={styles.contact}>
        {cv.contact.map((item) => (
          <li key={item.kind}>
            {item.kind !== 'location' ? <Icon name={ICONS[item.kind]} size={16} /> : null}
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

      <ul className={styles.numbers}>
        {cv.highlights.map((item) => (
          <li key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

      <div className={styles.columns}>
        <section className={styles.block}>
          <h2>{l(CV_LABELS.profile)}</h2>
          {cv.intro.slice(2).map((paragraph) => (
            <p key={paragraph} className={styles.para}>
              {paragraph}
            </p>
          ))}
        </section>

        <section className={styles.block}>
          <h2>{l(CV_LABELS.skills)}</h2>
          {cv.skillGroups.map((group) => (
            <div key={group.label} className={styles.group}>
              <h3>{group.label}</h3>
              <ul className={styles.pills}>
                {group.items.map((item) => (
                  <li key={item.name} className={`ltr ${item.core ? styles.core : ''}`}>
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className={styles.legend}>{l(CV_LABELS.legend)}</p>
        </section>

        <section className={styles.block}>
          <h2>{l(CV_LABELS.built)}</h2>
          {cv.areas.map((area) => (
            <div key={area.title} className={styles.group}>
              <h3>{area.title}</h3>
              <p className={styles.small}>{area.lede}</p>
              <ul className={styles.pills}>
                {area.tech.map((item) => (
                  <li key={item} className="ltr">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className={styles.block}>
          <h2>{l(CV_LABELS.experience)}</h2>
          {cv.roles.map((role) => (
            <div key={role.title + role.when} className={styles.entry}>
              <h3>{role.title}</h3>
              <p className={styles.org}>
                {role.org} <span className={styles.when}>{role.when}</span>
              </p>
              <p className={styles.text}>{role.lines[0]}</p>
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

        <section className={styles.block}>
          <h2>{l(CV_LABELS.education)}</h2>
          {cv.degrees.map((degree) => (
            <div key={degree.title} className={styles.entry}>
              <h3>{degree.title}</h3>
              <p className={styles.org}>
                {degree.org} <span className={styles.when}>{degree.when}</span>
              </p>
              {degree.lines.map((line) => (
                <p key={line} className={styles.text}>
                  {line}
                </p>
              ))}
              <p className={styles.small}>
                <strong>{l(CV_LABELS.courses)}:</strong> {degree.courses.join(' · ')}
              </p>
            </div>
          ))}
          {cv.diplomas.map((diploma) => (
            <div key={diploma.title} className={styles.entry}>
              <h3>{diploma.title}</h3>
              <p className={styles.org}>
                {diploma.org} <span className={styles.when}>{diploma.when}</span>
              </p>
              <p className={styles.text}>{diploma.lines[0]}</p>
            </div>
          ))}
        </section>

        <section className={styles.block}>
          <h2>{l(CV_LABELS.projects)}</h2>
          {cv.projects.map((project) => (
            <div key={project.title} className={styles.entry}>
              <h3>
                {project.title}
                {project.when ? <span className={styles.when}> {project.when}</span> : null}
              </h3>
              <p className={styles.text}>{project.lines[0]}</p>
              <ul className={styles.bullets}>
                {project.bullets.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <p className={`${styles.small} ltr`}>
                {project.stack.join(' · ')}
                {project.url ? (
                  <>
                    {' · '}
                    <a href={project.url}>{project.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</a>
                  </>
                ) : null}
              </p>
            </div>
          ))}
        </section>

        <section className={styles.block}>
          <h2>{l(CV_LABELS.certificates)}</h2>
          {cv.certificates.map((certificate) => (
            <div key={certificate.title} className={styles.entry}>
              <h3>{certificate.title}</h3>
              <p className={styles.org}>
                {certificate.org} <span className={styles.when}>{certificate.when}</span>
              </p>
              <p className={styles.text}>{certificate.lines[0]}</p>
            </div>
          ))}
        </section>

        <section className={styles.block}>
          <h2>{l(CV_LABELS.languages)}</h2>
          <ul className={styles.langs}>
            {cv.languages.map((item) => (
              <li key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.level}</span>
              </li>
            ))}
          </ul>
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
    </article>
  );
}
