import { lazy, useMemo, useState } from 'react';
import { skills, type SkillDomain } from '../../data/resume';
import { useLanguage } from '../../i18n/context';
import { DOMAIN_ORDER, TIER_ORDER, buildSkillMatrix } from '../../lib/skills';
import { LazyScene } from '../ui/LazyScene';
import { Section } from '../ui/Section';
import styles from './Skills.module.css';

const SkillGlobe = lazy(() => import('../../scene/sections/SkillGlobe'));

export function Skills() {
  const { t } = useLanguage();
  const matrix = useMemo(() => buildSkillMatrix(skills), []);
  const [focus, setFocus] = useState<SkillDomain | null>(null);

  return (
    <Section id="skills" title={t.skills.title} lede={t.skills.lede}>
      <div className={styles.explorer}>
        <LazyScene className={styles.globe} hint={t.skills.hint}>
          <SkillGlobe skills={skills} focus={focus} />
        </LazyScene>

        <div className={styles.filters} role="group" aria-label={t.skills.filterLabel}>
          <button type="button" className={styles.chip} aria-pressed={focus === null} onClick={() => setFocus(null)}>
            {t.skills.all}
          </button>
          {DOMAIN_ORDER.map((domain) => (
            <button
              key={domain}
              type="button"
              className={styles.chip}
              aria-pressed={focus === domain}
              onClick={() => setFocus(focus === domain ? null : domain)}
            >
              {t.skills.domains[domain]}
            </button>
          ))}
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <td />
            {TIER_ORDER.map((tier) => (
              <th key={tier} scope="col" data-tier={tier}>
                {t.skills.tiers[tier]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DOMAIN_ORDER.map((domain) => (
            <tr key={domain} data-dim={focus !== null && focus !== domain}>
              <th scope="row">{t.skills.domains[domain]}</th>
              {TIER_ORDER.map((tier) => (
                <td key={tier} data-tier={tier} data-label={t.skills.tiers[tier]}>
                  {matrix[domain][tier].length > 0 ? (
                    <ul className={styles.names}>
                      {matrix[domain][tier].map((name) => (
                        <li key={name} className="ltr">
                          {name}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}
