import { certificates, courses, projects, roles, skills } from '../data/resume';
import { currentMonth, yearFraction } from './dates';

export type StatId = 'years' | 'projects' | 'courses' | 'credits' | 'skills' | 'verified' | 'certificates';

export interface Stat {
  id: StatId;
  value: number;
}

export const STAT_ORDER: StatId[] = ['years', 'projects', 'skills', 'verified', 'courses', 'credits', 'certificates'];

/** Headline numbers, always derived from the resume data so they can never drift from it. */
export function buildStats(now = new Date()): Stat[] {
  const firstStart = Math.min(...roles.map((role) => yearFraction(role.start)));
  const values: Record<StatId, number> = {
    years: Math.max(1, Math.floor(yearFraction(currentMonth(now)) - firstStart)),
    projects: projects.length,
    skills: skills.length,
    verified: skills.filter((skill) => skill.verified).length,
    courses: courses.length,
    credits: courses.reduce((sum, course) => sum + course.credits, 0),
    certificates: certificates.length,
  };
  return STAT_ORDER.map((id) => ({ id, value: values[id] }));
}
