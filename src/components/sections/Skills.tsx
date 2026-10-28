import { lazy, useMemo, useState } from 'react';
import { skills, type SkillDomain } from '../../data/resume';
import { useFocus } from '../../focus/context';
import { useLanguage } from '../../i18n/context';
import { DOMAIN_ORDER, TIER_ORDER, buildSkillMatrix } from '../../lib/skills';
import { supportsWebGL } from '../../lib/webgl';
import { LazyScene } from '../ui/LazyScene';
import { Section } from '../ui/Section';
import styles from './Skills.module.css';

const SkillGlobe = lazy(() => import('../../scene/sections/SkillGlobe'));

export function Skills() {
  const { t } = useLanguage();
  // Without WebGL there is no globe, so the full list is the main content and starts open.
  const webgl = supportsWebGL();
  const matrix = useMemo(() => buildSkillMatrix(skills), []);
  const { focus: pointed, clear } = useFocus();
  const [chosen, setChosen] = useState<SkillDomain | null>(null);
  // An answer from "Ask my CV" wins over the chips until the visitor picks a chip again.
  const focus = pointed?.domain ?? chosen;
  const choose = (domain: SkillDomain | null) => {
    clear();
    setChosen(domain);
  };
  const verified = useMemo(() => new Set(skills.filter((skill) => skill.verified).map((skill) => skill.name)), []);

  return (
    <Section id="skills" title={t.skills.title} lede={t.skills.lede}>
      <div className={styles.explorer}>
        <LazyScene className={styles.globe} hint={t.skills.hint}>
          <SkillGlobe skills={skills} focus={focus} highlight={pointed?.skill ?? null} />
        </LazyScene>

        <div className={styles.filters} role="group" aria-label={t.skills.filterLabel}>
          <button type="button" className={styles.chip} aria-pressed={focus === null} onClick={() => choose(null)}>
            {t.skills.all}
          </button>
          {DOMAIN_ORDER.map((domain) => (
            <button
              key={domain}
              type="button"
              className={styles.chip}
              aria-pressed={focus === domain}
              onClick={() => choose(focus === domain ? null : domain)}
            >
              {t.skills.domains[domain]}
            </button>
          ))}
        </div>
        <p className={styles.legend}>
          <span className={styles.verified} aria-hidden="true" />
          {t.skills.verifiedLegend(verified.size)}
        </p>
      </div>

      <details className={styles.matrix} open={!webgl}>
        <summary>{t.skills.matrix}</summary>
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
                            {verified.has(name) ? (
                              <span
                                className={styles.verified}
                                role="img"
                                aria-label={t.skills.verified}
                                title={t.skills.verified}
                              />
                            ) : null}
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
      </details>
    </Section>
  );
}
