import { describe, expect, it } from 'vitest';
import { roles } from '../data/resume';
import { buildStats } from './stats';

describe('buildStats', () => {
  it('counts years in software from the first software role, not from support work', () => {
    const firstSoftware = Math.min(
      ...roles.filter((role) => role.software !== false).map((role) => Number(role.start.slice(0, 4))),
    );
    const years = buildStats(new Date(`${firstSoftware + 7}-06-15`)).find((stat) => stat.id === 'years')?.value;
    expect(years).toBe(7);
    const earliestOverall = Math.min(...roles.map((role) => Number(role.start.slice(0, 4))));
    expect(earliestOverall).toBeLessThan(firstSoftware);
  });
});
