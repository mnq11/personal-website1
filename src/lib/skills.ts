import type { Skill, SkillDomain, SkillTier } from '../data/resume';

export const DOMAIN_ORDER: SkillDomain[] = ['frontend', 'backend', 'data', 'delivery', 'mobile'];
export const TIER_ORDER: SkillTier[] = ['core', 'proficient', 'familiar'];

export type SkillMatrix = Record<SkillDomain, Record<SkillTier, string[]>>;

/** Arranges skills into a domain × tier grid, keeping the order they were declared in. */
export function buildSkillMatrix(skills: readonly Skill[]): SkillMatrix {
  const matrix = Object.fromEntries(
    DOMAIN_ORDER.map((domain) => [domain, Object.fromEntries(TIER_ORDER.map((tier) => [tier, [] as string[]]))]),
  ) as SkillMatrix;

  for (const skill of skills) {
    matrix[skill.domain][skill.tier].push(skill.name);
  }
  return matrix;
}
