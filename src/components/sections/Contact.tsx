import { lazy, useEffect, useMemo, useRef, useState } from 'react';
import { profile, socials } from '../../data/resume';
import { useLanguage } from '../../i18n/context';
import { css } from '../../scene/kit/theme';
import type { OrbitLink } from '../../scene/sections/SocialOrbits';
import { ExternalLink } from '../ui/ExternalLink';
import { Icon } from '../ui/Icon';
import { LazyScene } from '../ui/LazyScene';
import buttons from '../ui/Button.module.css';
import styles from './Contact.module.css';

const SocialOrbits = lazy(() => import('../../scene/sections/SocialOrbits'));

const NETWORK_ACCENT: Record<string, string> = {
  github: css.violet,
  linkedin: css.sky,
  devto: css.teal,
  x: css.rose,
};

export function Contact() {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const orbitLinks = useMemo<OrbitLink[]>(
    () =>
      socials.map((social) => ({
        id: social.network,
        label: social.label,
        url: social.url,
        accent: NETWORK_ACCENT[social.network] ?? css.saffron,
      })),
    [],
  );
  const resetTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // Clipboard blocked: the address is visible and selectable, and the mail link still works.
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section id="contact" className={styles.contact} aria-labelledby="contact-title">
      <div className={styles.inner}>
        <h2 id="contact-title" className={styles.title}>
          {t.contact.title}
        </h2>
        <p className={styles.lede}>{t.contact.lede}</p>

        <div className={styles.emailRow}>
          <a href={`mailto:${profile.email}`} className={`${styles.email} ltr`}>
            {profile.email}
          </a>
          <button type="button" className={buttons.quiet} onClick={copyEmail}>
            <Icon name={copied ? 'check' : 'copy'} size={18} />
            <span aria-live="polite">{copied ? t.contact.copied : t.contact.copy}</span>
          </button>
        </div>

        <h3 className={styles.elsewhere}>{t.contact.elsewhere}</h3>
        <ul className={styles.socials}>
          {socials.map((social) => (
            <li key={social.network}>
              <ExternalLink href={social.url} className={styles.social}>
                <Icon name={social.network} size={20} />
                <span className="ltr">{social.label}</span>
              </ExternalLink>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.orbits}>
        <LazyScene className={styles.orbitScene} hint={t.contact.orbitsHint}>
          <SocialOrbits
            centre={t.contact.hello}
            links={orbitLinks}
            onCentre={() => {
              window.location.href = `mailto:${profile.email}`;
            }}
          />
        </LazyScene>
      </div>
    </section>
  );
}
