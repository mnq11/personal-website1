import { describe, expect, it } from 'vitest';
import { dictionaries } from '../i18n/dictionary';
import { formatDuration, monthsBetween, parseMonth } from './dates';

describe('parseMonth', () => {
  it('reads YYYY-MM as the first of the month in UTC', () => {
    expect(parseMonth('2019-09').toISOString()).toBe('2019-09-01T00:00:00.000Z');
  });
});

describe('monthsBetween', () => {
  it('counts elapsed months', () => {
    expect(monthsBetween('2017-08', '2019-08')).toBe(24);
    expect(monthsBetween('2022-01', '2023-01')).toBe(12);
  });

  it('counts a single-month role as one month', () => {
    expect(monthsBetween('2018-12', '2018-12')).toBe(1);
  });
});

describe('formatDuration', () => {
  it('formats English durations', () => {
    const { duration } = dictionaries.en;
    expect(formatDuration(1, duration)).toBe('1 mo');
    expect(formatDuration(12, duration)).toBe('1 yr');
    expect(formatDuration(37, duration)).toBe('3 yrs 1 mo');
  });

  it('formats Arabic durations with dual forms and the conjunction', () => {
    const { duration } = dictionaries.ar;
    expect(formatDuration(1, duration)).toBe('شهر');
    expect(formatDuration(24, duration)).toBe('سنتان');
    expect(formatDuration(13, duration)).toBe('سنة وشهر');
    expect(formatDuration(38, duration)).toBe('3 سنوات وشهران');
  });
});
