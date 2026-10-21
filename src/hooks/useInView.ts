import { useEffect, useState, type RefObject } from 'react';

/**
 * True while the element is within `rootMargin` of the viewport. Used to mount WebGL scenes only
 * when they are about to be seen, so the page never holds more than a couple of GPU contexts.
 */
export function useInView(ref: RefObject<Element | null>, rootMargin = '25% 0px'): boolean {
  // Without IntersectionObserver (very old browsers) treat everything as visible.
  const [inView, setInView] = useState(() => !('IntersectionObserver' in window));

  useEffect(() => {
    const element = ref.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), {
      rootMargin,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
