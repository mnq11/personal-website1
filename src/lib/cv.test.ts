import { describe, expect, it } from 'vitest';
import { certificates, courses, degrees, diplomas, profile, projects, roles, skills } from '../data/resume';
import manifestText from '../../public/downloads/cv-manifest.json?raw';
import { LANGUAGES } from '../i18n/types';
import { CV_STYLES, allCvModels, buildCv, cvFileName, cvFingerprint, cvPath, cvStyleFromPath } from './cv';

describe('cv model', () => {
  for (const language of LANGUAGES) {
    it(`includes every piece of résumé data in ${language}`, () => {
      const text = JSON.stringify(buildCv(language));
      const has = (value: string) => expect(text).toContain(JSON.stringify(value).slice(1, -1));
      for (const role of roles) {
        has(role.title[language]);
        has(role.organisation[language]);
        role.highlights.forEach((item) => has(item[language]));
      }
      for (const degree of degrees) has(degree.title[language]);
      for (const diploma of diplomas) has(diploma.title[language]);
      for (const course of courses) has(course.name[language]);
      for (const project of projects) {
        has(project.name);
        has(project.summary[language]);
        project.features.forEach((item) => has(item[language]));
        project.stack.forEach(has);
      }
      for (const certificate of certificates) has(certificate.name[language]);
      for (const skill of skills) has(skill.name);
      for (const item of [...profile.languages, ...profile.traits.map((name) => ({ name }))]) has(item.name[language]);
      profile.interests.forEach((item) => has(item[language]));
      has(profile.email);
    });
  }
});

describe('cv downloads', () => {
  it('has a PDF for every style and language, built from the current data', () => {
    const manifest = JSON.parse(manifestText) as {
      hash: string;
      files: string[];
    };
    for (const style of CV_STYLES) {
      for (const language of LANGUAGES) expect(manifest.files).toContain(cvFileName(style, language));
    }
    // If this fails, the résumé data changed: run `npm run cv:pdf` and commit the new PDFs.
    expect(manifest.hash).toBe(cvFingerprint(allCvModels()));
  });
});

describe('cv routes', () => {
  it('maps every style to a flat path and back', () => {
    for (const style of CV_STYLES) expect(cvStyleFromPath(cvPath(style))).toBe(style);
    expect(cvPath('designed')).toBe('/cv');
    expect(cvStyleFromPath('/cv/')).toBe('designed');
    expect(cvStyleFromPath('/cv-unknown')).toBe('designed');
  });
});
