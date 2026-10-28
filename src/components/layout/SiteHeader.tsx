import { useEffect, useState } from 'react';
import { profile } from '../../data/resume';
import { useLanguage } from '../../i18n/context';
import { useActiveSection } from '../../hooks/useActiveSection';
import { Icon } from '../ui/Icon';
import styles from './SiteHeader.module.css';

const NAV_SECTIONS = ['about', 'story', 'projects', 'skills', 'experience', 'education', 'writing', 'contact'] as const;

export function SiteHeader() {
  const { t, language, toggleLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(NAV_SECTIONS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const otherLanguage = language === 'en' ? 'ar' : 'en';

  return (
    <header className={styles.header} data-scrolled={scrolled || menuOpen}>
      <div className={styles.bar}>
        <a href="#top" className={styles.wordmark} onClick={() => setMenuOpen(false)}>
          {profile.name[language]}
        </a>

        <nav aria-label={t.a11y.primaryNav} className={styles.nav} data-open={menuOpen}>
          <ul id="primary-nav" className={styles.links}>
            {NAV_SECTIONS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={styles.link}
                  aria-current={active === id ? 'location' : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  {t.nav[id]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.tools}>
          <button
            type="button"
            className={styles.language}
            onClick={toggleLanguage}
            aria-label={t.a11y.switchLanguage}
          >
            <span lang={otherLanguage}>{t.languageToggle}</span>
          </button>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="primary-nav"
            aria-label={menuOpen ? t.a11y.closeMenu : t.a11y.openMenu}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
