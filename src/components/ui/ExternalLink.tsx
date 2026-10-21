import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { useLanguage } from '../../i18n/context';

interface ExternalLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> {
  href: string;
  children: ReactNode;
}

/** Link that opens in a new tab, announces that to screen readers, and doesn't leak `window.opener`. */
export function ExternalLink({ children, ...props }: ExternalLinkProps) {
  const { t } = useLanguage();
  return (
    <a {...props} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="visually-hidden"> {t.a11y.opensInNewTab}</span>
    </a>
  );
}
