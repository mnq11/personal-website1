import { useEffect, useRef } from 'react';
import { useMediaQuery, usePrefersReducedMotion } from '../../hooks/useMediaQuery';
import styles from './Cursor.module.css';

const INTERACTIVE = 'a, button, summary, [role="button"], input, textarea, canvas[data-interactive]';
const MAGNETIC = 'a[class*="button"], button[class*="button"], a[class*="primary"], a[class*="ghost"]';
const PULL = 0.28;

/** A soft ring that trails the pointer and a gentle magnetic pull on buttons. Fine pointers only. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const reduced = usePrefersReducedMotion();
  const active = finePointer && !reduced;

  useEffect(() => {
    if (!active) return;
    const el = ring.current;
    if (!el) return;
    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let frame = 0;
    let magnet: HTMLElement | null = null;

    const tick = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      el.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      frame = requestAnimationFrame(tick);
    };

    const release = () => {
      if (magnet) magnet.style.transform = '';
      magnet = null;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      x = event.clientX;
      y = event.clientY;
      el.dataset.on = 'true';
      const target = event.target instanceof Element ? event.target : null;
      el.dataset.hot = target?.closest(INTERACTIVE) ? 'true' : 'false';
      const pull = target?.closest<HTMLElement>(MAGNETIC) ?? null;
      if (pull !== magnet) release();
      if (pull) {
        magnet = pull;
        const box = pull.getBoundingClientRect();
        const dx = (x - (box.left + box.width / 2)) * PULL;
        const dy = (y - (box.top + box.height / 2)) * PULL;
        pull.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      }
    };
    const onLeave = () => {
      el.dataset.on = 'false';
      release();
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      release();
    };
  }, [active]);

  if (!active) return null;
  return <div ref={ring} className={styles.ring} aria-hidden="true" data-on="false" data-hot="false" />;
}
