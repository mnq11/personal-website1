import { useLanguage } from '../../i18n/context';
import styles from './SkipLink.module.css';

export function SkipLink() {
  const { t } = useLanguage();
  return (
    <a href="#main" className={styles.skip}>
      {t.a11y.skipToContent}
    </a>
  );
}
