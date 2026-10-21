import { createContext, useContext } from 'react';
import type { Dictionary } from './dictionary';
import type { Language, Localized } from './types';

export interface LanguageContextValue {
  language: Language;
  direction: 'ltr' | 'rtl';
  locale: string;
  t: Dictionary;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLanguage must be used inside <LanguageProvider>.');
  return value;
}

/** Returns a resolver that picks the current language from a `Localized` value. */
export function useLocalize(): (value: Localized) => string {
  const { language } = useLanguage();
  return (value) => value[language];
}
