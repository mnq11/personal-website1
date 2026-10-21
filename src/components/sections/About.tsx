import { profile } from '../../data/resume';
import { useLanguage } from '../../i18n/context';
import { Section } from '../ui/Section';
import styles from './About.module.css';

export function About() {
  const { t, language } = useLanguage();

  return (
    <Section id="about" title={t.about.title}>
      <div className={styles.layout}>
        <div className={styles.text}>
          {profile.about.map((paragraph) => (
            <p key={paragraph.en}>{paragraph[language]}</p>
          ))}

          <dl className={styles.facts}>
            <div>
              <dt>{t.about.languages}</dt>
              <dd>
                <ul>
                  {profile.languages.map((item) => (
                    <li key={item.name.en}>
                      {item.name[language]} <span className={styles.muted}>{item.level[language]}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt>{t.about.outsideWork}</dt>
              <dd>
                <ul>
                  {profile.interests.map((interest) => (
                    <li key={interest.en}>{interest[language]}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>

        <figure className={styles.portrait}>
          <picture>
            <source
              type="image/webp"
              srcSet={`${profile.portrait.small} 360w, ${profile.portrait.large} 720w`}
              sizes="(min-width: 1100px) 300px, (min-width: 700px) 34vw, 70vw"
            />
            <img
              src={profile.portrait.fallback}
              alt={t.about.portraitAlt}
              width={720}
              height={720}
              loading="lazy"
              decoding="async"
            />
          </picture>
        </figure>
      </div>
    </Section>
  );
}
