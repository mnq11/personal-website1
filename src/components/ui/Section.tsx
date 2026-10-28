import { useRef, type ReactNode } from "react";
import { useReveal } from "../../hooks/useReveal";
import styles from "./Section.module.css";

/** Page order of the chapters, so each section can show its number. */
const CHAPTERS = [
  "about",
  "story",
  "projects",
  "skills",
  "lab",
  "numbers",
  "experience",
  "education",
  "writing",
  "contact",
];

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
  const head = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  useReveal([head, body]);
  const index = CHAPTERS.indexOf(id);
  return (
    <section id={id} className={styles.section} aria-labelledby={titleId}>
      <div className={styles.inner}>
        <header ref={head} className={styles.head}>
          <div>
            {index >= 0 ? (
              <span className={styles.chapter} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
                <span className={styles.chapterOf}> / {CHAPTERS.length}</span>
              </span>
            ) : null}
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
          </div>
          {lede ? <p className={styles.lede}>{lede}</p> : null}
        </header>
        <div ref={body} className={styles.body}>
          {children}
        </div>
      </div>
    </section>
  );
}
