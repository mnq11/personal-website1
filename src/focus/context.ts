import { createContext, useContext } from 'react';
import type { Target } from '../lib/ask';

/** A place the visitor was pointed at, e.g. by an answer from "Ask my CV". `stamp` makes repeats count. */
export interface Focus extends Target {
  stamp: number;
}

export interface FocusContextValue {
  focus: Focus | null;
  point: (target: Target) => void;
  clear: () => void;
}

export const FocusContext = createContext<FocusContextValue | null>(null);

export function useFocus(): FocusContextValue {
  const value = useContext(FocusContext);
  if (!value) throw new Error('useFocus must be used inside <FocusProvider>.');
  return value;
}
