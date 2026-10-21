import { usePrefersReducedMotion } from '../../hooks/useMediaQuery';

/** 0 when the visitor asked for reduced motion, otherwise 1. Multiply idle animation by it. */
export function useMotionFactor(): number {
  return usePrefersReducedMotion() ? 0 : 1;
}
