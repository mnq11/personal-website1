import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { dictionaries } from './dictionary';
import { LanguageContext, type LanguageContextValue } from './context';
import { DIRECTION, LANGUAGES, LOCALE, type Language } from './types';
import { readStorage, writeStorage } from '../lib/storage';

const STORAGE_KEY = 'mn.language';

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/** Saved choice first, then a `?lang=` link, then the browser's own preference. */
function detectInitialLanguage(): Language {
  const fromQuery = new URLSearchParams(window.location.search).get('lang');
  if (isLanguage(fromQuery)) return fromQuery;
  const saved = readStorage(STORAGE_KEY);
  if (isLanguage(saved)) return saved;
  return navigator.language.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    writeStorage(STORAGE_KEY, next);
  }, []);

  const t = dictionaries[language];

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = DIRECTION[language];
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
  }, [language, t]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      direction: DIRECTION[language],
      locale: LOCALE[language],
      t,
      setLanguage,
      toggleLanguage: () => setLanguage(language === 'en' ? 'ar' : 'en'),
    }),
    [language, t, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
