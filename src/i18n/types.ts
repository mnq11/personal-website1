export const LANGUAGES = ['en', 'ar'] as const;

export type Language = (typeof LANGUAGES)[number];

/** A piece of copy that exists in every supported language. */
export type Localized = Record<Language, string>;

export const DIRECTION: Record<Language, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl',
};

/** BCP 47 locale used for dates and numbers in each language. */
export const LOCALE: Record<Language, string> = {
  en: 'en-GB',
  ar: 'ar',
};
