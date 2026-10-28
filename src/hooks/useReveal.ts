import { useEffect, type RefObject } from 'react';

/**
 * Fades the direct children of the given elements in as they scroll into view, one after another.
 * It only sets `data-in="true"`; the hidden starting state exists in CSS under `html.reveal`, which main.tsx
 * adds when the browser supports IntersectionObserver and the visitor has not asked for reduced motion.
 */
export function useReveal(refs: RefObject<HTMLElement | null>[]) {
  useEffect(() => {
    if (!document.documentElement.classList.contains('reveal')) return;
    const roots = refs.map((ref) => ref.current).filter((element): element is HTMLElement => element !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          const siblings = target.parentElement ? [...target.parentElement.children] : [];
          target.style.setProperty('--i', String(Math.min(siblings.indexOf(target), 6)));
          target.dataset['in'] = 'true';
          observer.unobserve(target);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -6% 0px' },
    );
    const watch = (element: Element) => {
      if (!(element as HTMLElement).dataset['in']) observer.observe(element);
    };
    roots.forEach((root) => [...root.children].forEach(watch));
    // Content that arrives later (fetched articles, say) is watched too, so nothing stays hidden.
    const mutations = new MutationObserver((records) => {
      for (const record of records) record.addedNodes.forEach((node) => node instanceof HTMLElement && watch(node));
    });
    roots.forEach((root) => mutations.observe(root, { childList: true }));
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
    // The refs are stable objects created once per Section.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
