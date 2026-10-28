import { useState } from 'react';
import { profile } from '../../data/resume';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useLanguage } from '../../i18n/context';
import { periodOfDay } from '../../scene/journey';
import type { SceneStatus } from '../../scene/BackgroundScene';
import buttons from '../ui/Button.module.css';
import styles from './Hero.module.css';

interface HeroProps {
  sceneStatus: SceneStatus;
}

export function Hero({ sceneStatus }: HeroProps) {
  const { t, language } = useLanguage();
  // With WebGL the particles draw the name; the heading stays in the page for search and screen readers.
  const drawnByScene = sceneStatus !== 'off';
  const touch = useMediaQuery('(hover: none)');
  // A greeting for the visitor's own time of day, computed once when the page opens.
  const [greeting] = useState(() => {
    const now = new Date();
    return periodOfDay(now.getHours() + now.getMinutes() / 60);
  });

  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <h1 id="hero-title" className={drawnByScene ? 'visually-hidden' : styles.fallbackTitle}>
        {profile.name[language]}
      </h1>

      {sceneStatus === 'ready' ? (
        <p className={styles.hint} aria-hidden="true">
          {touch ? t.hero.hintTouch : t.hero.hint}
        </p>
      ) : null}

      <div className={styles.foot}>
        <div className={styles.copy}>
          <p className={styles.greeting}>{t.hero.greeting[greeting]}</p>
          <p className={styles.role}>
            {t.hero.basedIn} {profile.location[language]}
          </p>
          <p className={styles.intro}>{profile.intro[language]}</p>
        </div>
        <div className={styles.actions}>
          <a href="#projects" className={buttons.primary}>
            {t.hero.viewWork}
          </a>
          <a href="#contact" className={buttons.quiet}>
            {t.hero.contact}
          </a>
        </div>
      </div>
    </section>
  );
}
