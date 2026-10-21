import { describe, expect, it } from 'vitest';
import { education, profile, roles, skills } from '../data/resume';
import { dictionaries } from '../i18n/dictionary';
import { buildSkillMatrix, DOMAIN_ORDER, TIER_ORDER } from './skills';

/** Lists every key path in a nested object, so both languages can be compared shape for shape. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key));
}

describe('dictionaries', () => {
  it('has the same keys in English and Arabic', () => {
    expect(keyPaths(dictionaries.ar).sort()).toEqual(keyPaths(dictionaries.en).sort());
  });

  it('has no empty strings', () => {
    for (const dictionary of Object.values(dictionaries)) {
      const strings = JSON.stringify(dictionary).match(/""/g);
      expect(strings).toBeNull();
    }
  });
});

describe('resume content', () => {
  const localized = [
    profile.name,
    profile.role,
    profile.intro,
    ...profile.about,
    ...profile.interests,
    ...roles.flatMap((role) => [role.title, role.organisation, role.summary, ...role.highlights]),
    ...education.flatMap((item) => [item.degree, item.institution, ...item.courses]),
  ];

  it('is written in both languages', () => {
    for (const text of localized) {
      expect(text.en.trim()).not.toBe('');
      expect(text.ar.trim()).not.toBe('');
    }
  });

  it('lists roles newest first with valid dates', () => {
    const starts = roles.map((role) => role.start);
    expect([...starts].sort().reverse()).toEqual(starts);
    for (const role of roles) {
      expect(role.start).toMatch(/^\d{4}-\d{2}$/);
      if (role.end) expect(role.end >= role.start).toBe(true);
    }
  });
});

describe('buildSkillMatrix', () => {
  it('places every skill exactly once', () => {
    const matrix = buildSkillMatrix(skills);
    const placed = DOMAIN_ORDER.flatMap((domain) => TIER_ORDER.flatMap((tier) => matrix[domain][tier]));
    expect(placed.sort()).toEqual(skills.map((skill) => skill.name).sort());
  });

  it('has no duplicate skill names', () => {
    const names = skills.map((skill) => skill.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });
});
