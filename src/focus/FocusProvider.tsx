import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Target } from '../lib/ask';
import { FocusContext, type Focus, type FocusContextValue } from './context';

/** Shared "where is the visitor looking" state: sections read it and move their own scenes. */
export function FocusProvider({ children }: { children: ReactNode }) {
  const [focus, setFocus] = useState<Focus | null>(null);
  const point = useCallback((target: Target) => setFocus({ ...target, stamp: Date.now() }), []);
  const clear = useCallback(() => setFocus(null), []);
  const value = useMemo<FocusContextValue>(() => ({ focus, point, clear }), [focus, point, clear]);
  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}
