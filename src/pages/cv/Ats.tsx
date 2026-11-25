import { CV_LABELS, type CvModel } from '../../lib/cv';
import styles from './Plain.module.css';

/** Plain single column, standard headings, no icons or graphics: what applicant-tracking systems parse best. */
export function Ats({ cv }: { cv: CvModel }) {
  const l = (value: Record<'en' | 'ar', string>) => value[cv.language];
  return (
    <article className={styles.sheet}>
      <h1>{cv.name}</h1>
      <p className={styles.role}>{cv.role}</p>
      <p className={styles.contactLine}>{cv.contact.map((item) => item.label).join(' | ')}</p>

      <h2>{l(CV_LABELS.profile)}</h2>
      {cv.intro.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}

      <h2>{l(CV_LABELS.skills)}</h2>
      <p className="ltr">{cv.skills.join(', ')}</p>

      <h2>{l(CV_LABELS.built)}</h2>
      {cv.areas.map((area) => (
        <p key={area.title}>
          <strong>{area.title}:</strong> <span className="ltr">{area.tech.join(', ')}</span>
        </p>
      ))}

      <h2>{l(CV_LABELS.experience)}</h2>
      {cv.roles.map((role) => (
        <section key={role.title + role.when} className={styles.entry}>
          <h3>
            {role.title}, {role.org}
          </h3>
          <p className={styles.when}>{role.when}</p>
          <p>{role.lines[0]}</p>
          <ul>
            {role.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <h2>{l(CV_LABELS.projects)}</h2>
      {cv.projects.map((project) => (
        <section key={project.title} className={styles.entry}>
          <h3>
            {project.title}
            {project.when ? ` (${project.when})` : ''}
          </h3>
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
        </section>
      ))}

      <h2>{l(CV_LABELS.education)}</h2>
      {cv.degrees.map((degree) => (
        <section key={degree.title} className={styles.entry}>
          <h3>
            {degree.title}, {degree.org}
          </h3>
          <p className={styles.when}>{degree.when}</p>
          {degree.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>
            {l(CV_LABELS.courses)}: {degree.courses.join('; ')}
          </p>
        </section>
      ))}
      {cv.diplomas.map((diploma) => (
        <section key={diploma.title} className={styles.entry}>
          <h3>
            {diploma.title}, {diploma.org}
          </h3>
          <p className={styles.when}>{diploma.when}</p>
          <p>{diploma.lines[0]}</p>
        </section>
      ))}

      <h2>{l(CV_LABELS.certificates)}</h2>
      {cv.certificates.map((certificate) => (
        <p key={certificate.title}>
          {certificate.title}, {certificate.org}, {certificate.when}. {certificate.lines[0]}
        </p>
      ))}

      <h2>{l(CV_LABELS.languages)}</h2>
      <p>{cv.languages.map((item) => `${item.name}: ${item.level}`).join(' | ')}</p>

      <h2>{l(CV_LABELS.soft)}</h2>
      <p>{cv.traits.join(', ')}</p>

      <h2>{l(CV_LABELS.interests)}</h2>
      <p>{cv.interests.join(', ')}</p>
    </article>
  );
}
