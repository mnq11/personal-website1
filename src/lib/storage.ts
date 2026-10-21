/**
 * Browser storage can be missing or throw (private windows, blocked site data),
 * so every access is guarded and the site works the same without it.
 */
export function readStorage(key: string, area: 'local' | 'session' = 'local'): string | null {
  try {
    return (area === 'local' ? window.localStorage : window.sessionStorage).getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string, area: 'local' | 'session' = 'local'): void {
  try {
    (area === 'local' ? window.localStorage : window.sessionStorage).setItem(key, value);
  } catch {
    // Storage unavailable; the preference simply isn't remembered.
  }
}
