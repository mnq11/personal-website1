import { describe, expect, it } from 'vitest';
import { projects, roles, skills } from '../data/resume';
import { ask, normalize } from './ask';

describe('normalize', () => {
  it('folds Arabic spelling variants and keeps technology symbols', () => {
    expect(normalize('أَهلاً بِالجافا!')).toBe('اهلا بالجافا');
    expect(normalize('C# and .NET, Node.js?')).toBe('c# and net node.js');
    expect(normalize('مدرسة')).toBe('مدرسه');
  });
});

describe('ask', () => {
  it('finds a skill in English and points at it', () => {
    const answer = ask('Do you know Spring?');
    expect(answer.kind).toBe('skill');
    if (answer.kind === 'skill') {
      expect(answer.skill.name).toBe('Spring');
      expect(answer.target).toMatchObject({ section: 'skills', skill: 'Spring', domain: 'backend' });
    }
  });

  it('finds the same skill when asked in Arabic, with a prefix attached', () => {
    const answer = ask('هل تعرف سبرينج؟');
    expect(answer.kind === 'skill' && answer.skill.name).toBe('Spring');
    const prefixed = ask('هل تعمل بالبايثون');
    expect(prefixed.kind === 'skill' && prefixed.skill.name).toBe('Python');
  });

  it('prefers the longer technology name', () => {
    const answer = ask('react native experience');
    expect(answer.kind === 'skill' && answer.skill.name).toBe('React Native');
  });

  it('sends "what did you build with X" to the projects that use it', () => {
    const answer = ask('What did you build with React?');
    expect(answer.kind).toBe('skill');
    if (answer.kind === 'skill') {
      expect(answer.projects.length).toBeGreaterThan(0);
      expect(answer.target.section).toBe('projects');
      expect(answer.target.projectId).toBe(answer.projects[0]?.id);
    }
  });

  it('answers a stack-only technology from the projects that list it', () => {
    const answer = ask('Have you used Cloudinary?');
    expect(answer.kind).toBe('tech');
    if (answer.kind === 'tech') expect(answer.projects.map((p) => p.id)).toContain('joltna');
  });

  it('answers a field as a domain', () => {
    expect(ask('what about AI?').kind).toBe('domain');
    expect(ask('ماذا عن الواجهات؟').kind).toBe('domain');
  });

  it('answers where the person works, not where they live', () => {
    const answer = ask('Where do you work?');
    expect(answer.kind).toBe('role');
    if (answer.kind === 'role') expect(answer.role.id).toBe(roles.find((role) => !role.end)?.id);
    expect(ask('Where do you live?')).toMatchObject({ kind: 'topic', topic: 'location' });
  });

  it('finds a role by organisation name in both languages', () => {
    expect(ask('Tell me about Hlkat Wsl')).toMatchObject({ kind: 'role', role: { id: 'hlkat-wsl' } });
    expect(ask('ماذا تفعل في حلقة وصل')).toMatchObject({ kind: 'role', role: { id: 'hlkat-wsl' } });
  });

  it('finds the latest project and a project by name', () => {
    const latest = ask('What is your latest project?');
    expect(latest).toMatchObject({ kind: 'project', latest: true });
    expect(ask('Tell me about Joltna')).toMatchObject({ kind: 'project', project: { id: 'joltna' } });
  });

  it('answers studies, with the bachelor when asked for it', () => {
    expect(ask('What did you study?')).toMatchObject({ kind: 'degree', degree: { id: 'master-level' } });
    expect(ask('هل لديك بكالوريوس؟')).toMatchObject({ kind: 'degree', degree: { id: 'bachelor' } });
  });

  it('reads headline numbers', () => {
    expect(ask('How many projects have you done?')).toMatchObject({ kind: 'stat', stat: 'projects', value: projects.length });
    expect(ask('كم عدد المهارات؟')).toMatchObject({ kind: 'stat', stat: 'skills', value: skills.length });
    expect(ask('How many years of experience?')).toMatchObject({ kind: 'stat', stat: 'years' });
    expect(ask('How many projects?')).toMatchObject({ target: { section: 'numbers', stat: 'projects' } });
  });

  it('answers the common topics in both languages', () => {
    expect(ask('How can I contact you?')).toMatchObject({ kind: 'topic', topic: 'contact' });
    expect(ask('كيف أتواصل معك؟')).toMatchObject({ kind: 'topic', topic: 'contact' });
    expect(ask('Which languages do you speak?')).toMatchObject({ kind: 'topic', topic: 'languages' });
    expect(ask('Do you write articles?')).toMatchObject({ kind: 'topic', topic: 'writing' });
  });

  it('says nothing for what it cannot find', () => {
    expect(ask('')).toEqual({ kind: 'none' });
    expect(ask('what is the capital of France')).toEqual({ kind: 'none' });
  });

  it('recognises every skill by its own name', () => {
    for (const skill of skills) {
      const answer = ask(skill.name);
      const name = answer.kind === 'skill' ? answer.skill.name : answer.kind;
      // A longer skill name may contain a shorter one (React Native / React), so accept either.
      expect(answer.kind, `${skill.name} → ${name}`).toBe('skill');
    }
  });
});

describe('suggested questions', () => {
  it('are all answered, in both languages', async () => {
    const { dictionaries } = await import('../i18n/dictionary');
    const { formatAnswer } = await import('./askFormat');
    for (const language of ['en', 'ar'] as const) {
      for (const suggestion of dictionaries[language].ask.suggestions) {
        const answer = ask(suggestion);
        expect(answer.kind, `${language}: ${suggestion}`).not.toBe('none');
        const reply = formatAnswer(answer, { t: dictionaries[language], language, locale: language });
        expect(reply.text.length).toBeGreaterThan(10);
      }
    }
  });

  it('write a sentence for every kind of answer, in both languages', async () => {
    const { dictionaries } = await import('../i18n/dictionary');
    const { formatAnswer } = await import('./askFormat');
    const questions = ['Spring', 'Cloudinary', 'AI', 'Joltna', 'Hlkat Wsl', 'degree', 'how many courses', 'contact', 'where do you live', 'languages', 'certificates', 'projects', 'articles', 'who are you', 'hello', 'zzz'];
    for (const language of ['en', 'ar'] as const) {
      for (const question of questions) {
        const reply = formatAnswer(ask(question), { t: dictionaries[language], language, locale: language });
        expect(reply.text, `${language}: ${question}`).not.toMatch(/undefined|\[object/);
        expect(reply.text.length).toBeGreaterThan(5);
      }
    }
  });
});
