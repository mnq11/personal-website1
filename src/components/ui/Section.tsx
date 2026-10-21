import type { ReactNode } from 'react';
import styles from './Section.module.css';

interface SectionProps {
  id: string;
  title: string;
  lede?: string;
  children: ReactNode;
}

/**
 * Page section: the heading sits in a narrow side column (sticky on wide screens)
 * so the reader always knows where they are, and the content takes the main column.
 */
export function Section({ id, title, lede, children }: SectionProps) {
  const titleId = `${id}-title`;
  return (
    <section id={id} className={styles.section} aria-labelledby={titleId}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {lede ? <p className={styles.lede}>{lede}</p> : null}
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </section>
  );
}
