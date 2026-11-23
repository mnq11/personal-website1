import { certificates, courses, degrees, diplomas, profile, projects, roles, skills, socials } from '../data/resume';
import type { Language, Localized } from '../i18n/types';
import { LOCALE } from '../i18n/types';
import { formatMonth } from './dates';

export const CV_STYLES = ['designed', 'ats', 'compact', 'classic'] as const;
export type CvStyle = (typeof CV_STYLES)[number];

/** Labels used by every CV layout. */
export const CV_LABELS = {
  role: { en: 'Software Developer', ar: 'مطوّر برمجيات' },
  profile: { en: 'Profile', ar: 'نبذة' },
  contact: { en: 'Contact', ar: 'التواصل' },
  education: { en: 'Education', ar: 'التعليم' },
  earlierStudies: { en: 'Earlier studies', ar: 'دراسات سابقة' },
  courses: { en: 'Courses', ar: 'المقررات' },
  skills: { en: 'Skills', ar: 'المهارات' },
  projects: { en: 'Projects', ar: 'المشاريع' },
  experience: { en: 'Work experience', ar: 'الخبرة العملية' },
  languages: { en: 'Languages', ar: 'اللغات' },
  certificates: { en: 'Certificates', ar: 'الشهادات' },
  soft: { en: 'Soft skills', ar: 'المهارات الشخصية' },
  interests: { en: 'Interests', ar: 'الاهتمامات' },
  tasks: { en: 'Achievements / tasks', ar: 'الإنجازات / المهام' },
  thesis: { en: 'Thesis', ar: 'الرسالة' },
  stack: { en: 'Stack', ar: 'التقنيات' },
  present: { en: 'Present', ar: 'الحاضر' },
} satisfies Record<string, Localized>;

export interface CvContact {
  kind: 'email' | 'location' | 'linkedin' | 'web' | 'github';
  label: string;
  href?: string;
}

export interface CvEntry {
  title: string;
  org?: string;
  when?: string;
  lines: string[];
  bullets: string[];
}

export interface CvModel {
  language: Language;
  name: string;
  role: string;
  intro: string[];
  contact: CvContact[];
  degrees: (CvEntry & { courses: string[] })[];
  diplomas: CvEntry[];
  roles: CvEntry[];
  projects: (CvEntry & { stack: string[]; url?: string })[];
  skills: string[];
  certificates: CvEntry[];
  languages: { name: string; level: string }[];
  traits: string[];
  interests: string[];
}

const bare = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

/** Everything on the résumé, resolved for one language. Every layout renders this model, so none can drift. */
export function buildCv(language: Language): CvModel {
  const locale = LOCALE[language];
  const l = (value: Localized) => value[language];
  const range = (start: string, end?: string) =>
    `${formatMonth(start, locale)} – ${end ? formatMonth(end, locale) : l(CV_LABELS.present)}`;
  const social = (network: string) => socials.find((item) => item.network === network);
  const contact: CvContact[] = [{ kind: 'email', label: profile.email, href: `mailto:${profile.email}` }];
  contact.push({ kind: 'location', label: l(profile.location) });
  for (const kind of ['linkedin', 'web', 'github'] as const) {
    const item = social(kind);
    if (item) contact.push({ kind, label: bare(item.url), href: item.url });
  }

  return {
    language,
    name: l(profile.name),
    role: l(CV_LABELS.role),
    intro: [l(profile.intro), l(profile.background), ...profile.about.map(l)],
    contact,
    degrees: degrees.map((degree) => ({
      title: l(degree.title),
      org: l(degree.institution),
      when: range(degree.start, degree.end),
      lines: [l(degree.programme), `${l(CV_LABELS.thesis)}: ${l(degree.thesis.title)}`],
      bullets: [],
      courses: courses
        .filter((course) => course.cycle === (degree.id === 'bachelor' ? 1 : 2))
        .map((course) => l(course.name)),
    })),
    diplomas: diplomas.map((diploma) => ({
      title: l(diploma.title),
      org: l(diploma.institution),
      when: `${diploma.start} – ${diploma.end}`,
      lines: [l(diploma.detail)],
      bullets: [],
    })),
    roles: roles.map((role) => ({
      title: l(role.title),
      org: l(role.organisation),
      when: range(role.start, role.end),
      lines: [l(role.summary)],
      bullets: role.highlights.map(l),
    })),
    projects: projects.map((project) => ({
      title: project.name,
      ...(project.start ? { when: range(project.start, project.end) } : {}),
      lines: [l(project.summary)],
      bullets: project.features.map(l),
      stack: project.stack,
      ...(project.url ? { url: project.url } : {}),
    })),
    skills: skills.map((skill) => skill.name),
    certificates: certificates.map((certificate) => ({
      title: l(certificate.name),
      org: certificate.issuer,
      when: String(certificate.year),
      lines: [l(certificate.summary)],
      bullets: [],
    })),
    languages: profile.languages.map((item) => ({ name: l(item.name), level: l(item.level) })),
    traits: profile.traits.map(l),
    interests: profile.interests.map(l),
  };
}

/** Small, stable fingerprint of the résumé content. The PDF manifest stores it so stale PDFs are caught by a test. */
export function cvFingerprint(models: CvModel[]): string {
  const text = JSON.stringify(models);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function allCvModels(): CvModel[] {
  return [buildCv('en'), buildCv('ar')];
}

export function cvFileName(style: CvStyle, language: Language): string {
  return `mohammed-nabil-cv-${style}-${language}.pdf`;
}

export function cvStyleFromPath(pathname: string): CvStyle {
  const name = pathname.replace(/\/+$/, '').replace(/^\/cv-?/, '');
  return CV_STYLES.find((style) => style === name) ?? 'designed';
}

/** Flat paths (/cv, /cv-ats) keep the site's relative asset URLs working. */
export function cvPath(style: CvStyle): string {
  return style === 'designed' ? '/cv' : `/cv-${style}`;
}
