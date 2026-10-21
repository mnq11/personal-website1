import type { Dictionary } from '../i18n/dictionary';

/** Parses `YYYY-MM` (or a full ISO date) as the first day of that month, in UTC. */
export function parseMonth(value: string): Date {
  const [year = '1970', month = '01'] = value.split('-');
  return new Date(Date.UTC(Number(year), Number(month) - 1, 1));
}

export function formatMonth(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    parseMonth(value),
  );
}

export function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );
}

/** Whole months from `start` to `end` (`YYYY-MM`). A role that starts and ends in one month counts as one. */
export function monthsBetween(start: string, end: string): number {
  const a = parseMonth(start);
  const b = parseMonth(end);
  const months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
  return Math.max(months, 1);
}

/** Human duration such as "2 yrs 1 mo", using the dictionary's pluralisation. */
export function formatDuration(months: number, duration: Dictionary['duration']): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(duration.year(years));
  if (rest > 0 || years === 0) parts.push(duration.month(Math.max(rest, 1)));
  return parts.join(duration.joiner);
}

export function currentMonth(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}
