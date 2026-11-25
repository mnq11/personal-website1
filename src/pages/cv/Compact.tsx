import { CV_LABELS, type CvModel } from '../../lib/cv';
import styles from './Plain.module.css';

/** Dense overview: the most recent roles, the key projects and the full skill list, meant to read in a minute. */
export function Compact({ cv }: { cv: CvModel }) {
  const l = (value: Record<'en' | 'ar', string>) => value[cv.language];
  return (
    <article className={`${styles.sheet} ${styles.compact}`}>
      <header className={styles.compactHead}>
        <div>
          <h1>{cv.name}</h1>
          <p className={styles.role}>{cv.role}</p>
        </div>
        <p className={styles.contactStack}>
          {cv.contact.map((item) => (
            <span key={item.kind} className="ltr">
              {item.label}
            </span>
          ))}
        </p>
      </header>
      <p>{cv.intro[0]}</p>
      <div className={styles.twoCols}>
        <div>
          <h2>{l(CV_LABELS.experience)}</h2>
          {cv.roles.map((role) => (
            <div key={role.title + role.when} className={styles.row}>
              <strong>{role.title}</strong>, {role.org} <span className={styles.when}>{role.when}</span>
            </div>
          ))}
          <h2>{l(CV_LABELS.education)}</h2>
          {cv.degrees.map((degree) => (
            <div key={degree.title} className={styles.row}>
              <strong>{degree.title}</strong>, {degree.org} <span className={styles.when}>{degree.when}</span>
            </div>
          ))}
          {cv.diplomas.map((diploma) => (
            <div key={diploma.title} className={styles.row}>
              <strong>{diploma.title}</strong>, {diploma.org} <span className={styles.when}>{diploma.when}</span>
            </div>
          ))}
          <h2>{l(CV_LABELS.certificates)}</h2>
          {cv.certificates.map((certificate) => (
            <div key={certificate.title} className={styles.row}>
              <strong>{certificate.title}</strong>, {certificate.org}{' '}
              <span className={styles.when}>{certificate.when}</span>
            </div>
          ))}
          <h2>{l(CV_LABELS.languages)}</h2>
          <p>{cv.languages.map((item) => `${item.name}: ${item.level}`).join(' | ')}</p>
        </div>
        <div>
          <h2>{l(CV_LABELS.projects)}</h2>
          {cv.projects.map((project) => (
            <div key={project.title} className={styles.row}>
              <strong>{project.title}</strong>{' '}
              {project.when ? <span className={styles.when}>{project.when}</span> : null}
              <div>{project.lines[0]}</div>
              <div className={`${styles.when} ltr`}>{project.stack.join(', ')}</div>
            </div>
          ))}
          <h2>{l(CV_LABELS.skills)}</h2>
          <p className="ltr">{cv.skills.join(', ')}</p>
          <h2>{l(CV_LABELS.built)}</h2>
          {cv.areas.map((area) => (
            <p key={area.title}>
              <strong>{area.title}:</strong> <span className="ltr">{area.tech.join(', ')}</span>
            </p>
          ))}
          <h2>{l(CV_LABELS.soft)}</h2>
          <p>{cv.traits.join(', ')}</p>
          <h2>{l(CV_LABELS.interests)}</h2>
          <p>{cv.interests.join(', ')}</p>
        </div>
      </div>
    </article>
  );
}
