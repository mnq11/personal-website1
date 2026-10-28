import { describe, expect, it } from 'vitest';
import { certificates, courses, degrees, diplomas, profile, projects, roles, skills, story } from '../data/resume';
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
    ...story.flatMap((chapter) => [chapter.mark, chapter.title, chapter.text]),
    ...profile.traits,
    ...degrees.flatMap((degree) => [degree.title, degree.institution, degree.programme, degree.thesis.title]),
    ...courses.map((course) => course.name),
    ...projects.flatMap((project) => [project.summary, ...project.features]),
    ...certificates.flatMap((certificate) => [certificate.name, certificate.summary]),
    ...degrees.flatMap((degree) => degree.activities ?? []),
    ...diplomas.flatMap((diploma) => [diploma.title, diploma.institution, diploma.detail]),
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

describe('transcript', () => {
  it('adds up to the 222 credits on the official transcript', () => {
    expect(courses.reduce((sum, course) => sum + course.credits, 0)).toBe(222);
    expect(courses.filter((course) => course.cycle === 1).reduce((sum, course) => sum + course.credits, 0)).toBe(180);
  });

  it('lists courses in the order they were completed, with unique codes', () => {
    const dates = courses.map((course) => course.completed);
    expect([...dates].sort()).toEqual(dates);
    expect(new Set(courses.map((course) => course.code)).size).toBe(courses.length);
  });
});

describe('projects', () => {
  it('have unique ids and valid date ranges', () => {
    expect(new Set(projects.map((project) => project.id)).size).toBe(projects.length);
    for (const project of projects) {
      if (project.start && project.end) expect(project.end >= project.start).toBe(true);
      expect(project.stack.length).toBeGreaterThan(0);
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

describe('headline numbers', () => {
  it('are derived from the resume data', async () => {
    const { buildStats } = await import('./stats');
    const stats = Object.fromEntries(buildStats(new Date('2026-10-21')).map((stat) => [stat.id, stat.value]));
    expect(stats.projects).toBe(projects.length);
    expect(stats.skills).toBe(skills.length);
    expect(stats.courses).toBe(courses.length);
    expect(stats.certificates).toBe(certificates.length);
    expect(stats.years).toBeGreaterThanOrEqual(10);
  });

  it('have an English and Arabic label each', () => {
    const labels = Object.keys(dictionaries.en.numbers.labels);
    expect(labels.sort()).toEqual(Object.keys(dictionaries.ar.numbers.labels).sort());
  });
});
