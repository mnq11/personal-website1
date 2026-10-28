import { certificates, profile, projects } from '../data/resume';
import type { Dictionary } from '../i18n/dictionary';
import type { Language } from '../i18n/types';
import type { Answer } from './ask';
import { formatMonth } from './dates';

export interface Reply {
  title?: string;
  text: string;
  chips: string[];
}

interface FormatContext {
  t: Dictionary;
  language: Language;
  locale: string;
}

/** Writes an answer as sentences in the current language, using only the resume data and the dictionary. */
export function formatAnswer(answer: Answer, { t, language, locale }: FormatContext): Reply {
  const list = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' });
  const numbers = new Intl.NumberFormat(locale);
  const year = new Intl.NumberFormat(locale, { useGrouping: false });
  const ask = t.ask;

  switch (answer.kind) {
    case 'skill': {
      const field = t.skills.domains[answer.skill.domain];
      const lead = ask.skill[answer.skill.tier](answer.skill.name, field);
      const verified = answer.skill.verified ? ask.skill.verified : '';
      const used = answer.projects.length > 0 ? ask.skill.usedIn(list.format(answer.projects.map((p) => p.name))) : '';
      return { text: lead + verified + used, chips: [] };
    }
    case 'tech':
      return {
        text: answer.projects.length > 0 ? ask.tech(answer.name, list.format(answer.projects.map((p) => p.name))) : ask.none,
        chips: [],
      };
    case 'domain': {
      const tiers = ['core', 'proficient', 'familiar'] as const;
      const strongest = tiers.map((tier) => answer.skills.filter((skill) => skill.tier === tier)).find((group) => group.length > 0) ?? [];
      return { text: ask.domain(t.skills.domains[answer.domain], list.format(strongest.map((skill) => skill.name))), chips: [] };
    }
    case 'project': {
      const { project } = answer;
      const name = `${project.name} · ${t.projects.kinds[project.kind]}`;
      return { title: answer.latest ? `${ask.latest}: ${name}` : name, text: project.summary[language], chips: project.stack };
    }
    case 'role': {
      const { role } = answer;
      const period = `${formatMonth(role.start, locale)} – ${role.end ? formatMonth(role.end, locale) : t.experience.present}`;
      return {
        title: `${role.title[language]} · ${role.organisation[language]}`,
        text: role.summary[language],
        chips: [period],
      };
    }
    case 'degree': {
      const { degree } = answer;
      const years = `${year.format(Number(degree.start.slice(0, 4)))} – ${year.format(Number(degree.end.slice(0, 4)))}`;
      return {
        title: `${degree.title[language]} · ${degree.institution[language]}`,
        text: `${t.education.thesis}: ${degree.thesis.title[language]}`,
        chips: [years, ...(degree.credits ? [t.education.credits(degree.credits)] : [])],
      };
    }
    case 'stat':
      return { text: `${t.numbers.labels[answer.stat]}: ${numbers.format(answer.value)}`, chips: [] };
    case 'topic':
      switch (answer.topic) {
        case 'contact':
          return { text: ask.topics.contact(profile.email), chips: [] };
        case 'location':
          return { text: ask.topics.location(profile.location[language]), chips: [] };
        case 'languages':
          return {
            text: ask.topics.languages(list.format(profile.languages.map((item) => `${item.name[language]} (${item.level[language]})`))),
            chips: [],
          };
        case 'certificates':
          return {
            text: ask.topics.certificates(numbers.format(certificates.length), list.format(certificates.map((item) => item.name[language]))),
            chips: [],
          };
        case 'projects':
          return { text: ask.topics.projects(numbers.format(projects.length)), chips: [] };
        case 'writing':
          return { text: ask.topics.writing, chips: [] };
        case 'about':
          return { text: profile.intro[language], chips: [] };
        case 'help':
          return { text: ask.help, chips: [] };
      }
      return { text: ask.none, chips: [] };
    case 'none':
      return { text: ask.none, chips: [] };
  }
}
