import { useEffect, useState } from 'react';

export type RemoteState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: T };

/**
 * Runs an abortable loader once (per `key`) and exposes loading / error / ready states.
 * The request is cancelled if the component unmounts first.
 */
export function useRemoteData<T>(key: string, loader: (signal: AbortSignal) => Promise<T>): RemoteState<T> {
  const [state, setState] = useState<{ key: string; value: RemoteState<T> }>({
    key,
    value: { status: 'loading' },
  });

  useEffect(() => {
    const controller = new AbortController();
    loader(controller.signal)
      .then((data) => setState({ key, value: { status: 'ready', data } }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.warn(`[${key}]`, error);
        setState({ key, value: { status: 'error' } });
      });
    return () => controller.abort();
    // The loader is expected to be stable for a given key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state.key === key ? state.value : { status: 'loading' };
}
