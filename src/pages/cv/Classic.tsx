import { CV_LABELS, type CvModel } from '../../lib/cv';
import styles from './Classic.module.css';

function Row({ label, children }: { label?: string | undefined; children: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <div className={styles.label}>{label}</div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}

/** Classic European layout: a label column on the side and the detail beside it, in the spirit of Europass. */
export function Classic({ cv }: { cv: CvModel }) {
  const l = (value: Record<'en' | 'ar', string>) => value[cv.language];
  return (
    <article className={styles.sheet}>
      <header className={styles.head}>
        <h1>{cv.name}</h1>
        <p>{cv.role}</p>
        <ul className={styles.contact}>
          {cv.contact.map((item) => (
            <li key={item.kind} className="ltr">
              {item.label}
            </li>
          ))}
        </ul>
      </header>

      <section>
        <h2>{l(CV_LABELS.profile)}</h2>
        {cv.intro.map((paragraph) => (
          <Row key={paragraph}>
            <p>{paragraph}</p>
          </Row>
        ))}
      </section>

      <section>
        <h2>{l(CV_LABELS.experience)}</h2>
        {cv.roles.map((role) => (
          <Row key={role.title + role.when} label={role.when}>
            <h3>{role.title}</h3>
            <p className={styles.org}>{role.org}</p>
            <p>{role.lines[0]}</p>
            <ul>
              {role.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Row>
        ))}
      </section>

      <section>
        <h2>{l(CV_LABELS.education)}</h2>
        {cv.degrees.map((degree) => (
          <Row key={degree.title} label={degree.when}>
            <h3>{degree.title}</h3>
            <p className={styles.org}>{degree.org}</p>
            {degree.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>
              {l(CV_LABELS.courses)}: {degree.courses.join('; ')}
            </p>
          </Row>
        ))}
        {cv.diplomas.map((diploma) => (
          <Row key={diploma.title} label={diploma.when}>
            <h3>{diploma.title}</h3>
            <p className={styles.org}>{diploma.org}</p>
            <p>{diploma.lines[0]}</p>
          </Row>
        ))}
      </section>

      <section>
        <h2>{l(CV_LABELS.projects)}</h2>
        {cv.projects.map((project) => (
          <Row key={project.title} label={project.when}>
            <h3>{project.title}</h3>
            <p>{project.lines[0]}</p>
            <ul>
              {project.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="ltr">
              {l(CV_LABELS.stack)}: {project.stack.join(', ')}
              {project.url ? ` | ${project.url}` : ''}
            </p>
          </Row>
        ))}
      </section>

      <section>
        <h2>{l(CV_LABELS.skills)}</h2>
        <Row label={l(CV_LABELS.skills)}>
          <p className="ltr">{cv.skills.join(', ')}</p>
        </Row>
        <Row label={l(CV_LABELS.languages)}>
          <p>{cv.languages.map((item) => `${item.name}: ${item.level}`).join(' | ')}</p>
        </Row>
        <Row label={l(CV_LABELS.soft)}>
          <p>{cv.traits.join(', ')}</p>
        </Row>
        <Row label={l(CV_LABELS.certificates)}>
          {cv.certificates.map((certificate) => (
            <p key={certificate.title}>
              {certificate.title}, {certificate.org}, {certificate.when}. {certificate.lines[0]}
            </p>
          ))}
        </Row>
        <Row label={l(CV_LABELS.interests)}>
          <p>{cv.interests.join(', ')}</p>
        </Row>
      </section>
    </article>
  );
}
