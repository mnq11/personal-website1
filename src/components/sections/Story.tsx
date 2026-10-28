import { lazy, useMemo, useState } from "react";
import { story } from "../../data/resume";
import { useLanguage } from "../../i18n/context";
import { css } from "../../scene/kit/theme";
import type { StoryStop } from "../../scene/sections/StoryRoad";
import { LazyScene } from "../ui/LazyScene";
import { Section } from "../ui/Section";
import styles from "./Story.module.css";

const StoryRoad = lazy(() => import("../../scene/sections/StoryRoad"));

export function Story() {
  const { t, language, direction } = useLanguage();
  const [active, setActive] = useState<string | null>(null);

  const stops = useMemo<StoryStop[]>(
    () =>
      story.map((chapter) => ({
        id: chapter.id,
        label: chapter.mark[language],
        color: css[chapter.accent],
      })),
    [language],
  );

  return (
    <Section id="story" title={t.story.title} lede={t.story.lede}>
      <div className={styles.layout}>
        <ol className={styles.chapters} onMouseLeave={() => setActive(null)}>
          {story.map((chapter) => (
            <li
              key={chapter.id}
              className={styles.chapter}
              data-active={active === chapter.id}
              style={{ ["--accent" as string]: `var(--${chapter.accent})` }}
              onMouseEnter={() => setActive(chapter.id)}
              onFocus={() => setActive(chapter.id)}
              onBlur={() => setActive(null)}
              tabIndex={0}
            >
              <span className={styles.mark}>{chapter.mark[language]}</span>
              <h3 className={styles.heading}>{chapter.title[language]}</h3>
              <p>{chapter.text[language]}</p>
              <a className={styles.more} href={`#${chapter.more}`}>
                {t.story.more}{" "}
                <span aria-hidden="true">
                  {direction === "rtl" ? "←" : "→"}
                </span>
              </a>
            </li>
          ))}
        </ol>
        <div className={styles.sceneColumn}>
          <LazyScene className={styles.road} hint={t.story.hint}>
            <StoryRoad stops={stops} active={active} onHover={setActive} />
          </LazyScene>
        </div>
      </div>
    </Section>
  );
}
