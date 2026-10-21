import { useMemo } from 'react';
import { skills } from '../../data/resume';
import { useLanguage } from '../../i18n/context';
import { DOMAIN_ORDER, TIER_ORDER, buildSkillMatrix } from '../../lib/skills';
import { Section } from '../ui/Section';
import styles from './Skills.module.css';

export function Skills() {
  const { t } = useLanguage();
  const matrix = useMemo(() => buildSkillMatrix(skills), []);

  return (
    <Section id="skills" title={t.skills.title} lede={t.skills.lede}>
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
            <tr key={domain}>
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
