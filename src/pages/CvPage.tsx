import { useEffect } from 'react';
import { useLanguage } from '../i18n/context';
import type { Localized } from '../i18n/types';
import { CV_STYLES, allCvModels, buildCv, cvFileName, cvFingerprint, cvPath, type CvStyle } from '../lib/cv';
import { Ats } from './cv/Ats';
import { Classic } from './cv/Classic';
import { Compact } from './cv/Compact';
import { Designed } from './cv/Designed';
import styles from './CvPage.module.css';

const STYLE_LABELS: Record<CvStyle, Localized> = {
  designed: { en: 'Designed', ar: 'مصمَّم' },
  ats: { en: 'ATS plain', ar: 'ATS بسيط' },
  compact: { en: 'Compact', ar: 'مختصر' },
  classic: { en: 'Classic', ar: 'كلاسيكي' },
};

const UI = {
  back: { en: 'Back to the site', ar: 'العودة إلى الموقع' },
  download: { en: 'Download PDF', ar: 'تحميل PDF' },
  print: { en: 'Print', ar: 'طباعة' },
  other: { en: 'العربية', ar: 'English' },
  styles: { en: 'CV style', ar: 'نمط السيرة' },
} satisfies Record<string, Localized>;

const LAYOUTS = { designed: Designed, ats: Ats, compact: Compact, classic: Classic } as const;

/** The résumé page: one data model, four layouts, a PDF of each in both languages. */
export function CvPage({ style }: { style: CvStyle }) {
  const { language, toggleLanguage } = useLanguage();
  const l = (value: Localized) => value[language];
  const cv = buildCv(language);
  const Layout = LAYOUTS[style];

  useEffect(() => {
    document.title = `${cv.name} · CV`;
  }, [cv.name]);

  return (
    <div className={styles.page} data-cv-style={style} data-cv-hash={cvFingerprint(allCvModels())}>
      <nav className={styles.toolbar} aria-label={l(UI.styles)}>
        <a href="/">{l(UI.back)}</a>
        <ul className={styles.styles}>
          {CV_STYLES.map((item) => (
            <li key={item}>
              <a href={cvPath(item)} aria-current={item === style ? 'page' : undefined}>
                {l(STYLE_LABELS[item])}
              </a>
            </li>
          ))}
        </ul>
        <span>
          <button type="button" onClick={toggleLanguage}>
            {l(UI.other)}
          </button>
          <a className={styles.download} href={`/downloads/${cvFileName(style, language)}`} download>
            {l(UI.download)}
          </a>
          <button type="button" onClick={() => window.print()}>
            {l(UI.print)}
          </button>
        </span>
      </nav>
      <Layout cv={cv} />
    </div>
  );
}
