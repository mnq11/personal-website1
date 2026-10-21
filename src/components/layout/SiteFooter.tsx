import { profile } from '../../data/resume';
import { useLanguage } from '../../i18n/context';
import { ExternalLink } from '../ui/ExternalLink';
import { Icon } from '../ui/Icon';
import styles from './SiteFooter.module.css';

const SOURCE_URL = 'https://github.com/mnq11/personal-website1';

export function SiteFooter() {
  const { t, language } = useLanguage();
  const year = new Intl.NumberFormat(language === 'ar' ? 'ar' : 'en', { useGrouping: false }).format(
    new Date().getFullYear(),
  );

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>
          © {year} {profile.name[language]}. {t.footer.rights}
        </p>
        <ExternalLink href={SOURCE_URL} className={styles.link}>
          {t.footer.source}
        </ExternalLink>
        <a href="#top" className={styles.link}>
          <Icon name="arrowUp" size={16} />
          {t.footer.backToTop}
        </a>
      </div>
    </footer>
  );
}
