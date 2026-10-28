interface NavigatorHints {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

/**
 * True on devices likely to struggle with a full-size particle scene: few CPU cores, little memory,
 * or the visitor asked the browser to save data. The scene then draws fewer particles at lower resolution.
 */
export function isLowPower(hints: NavigatorHints = typeof navigator === 'undefined' ? {} : (navigator as NavigatorHints)): boolean {
  const { hardwareConcurrency, deviceMemory, connection } = hints;
  if (connection?.saveData) return true;
  if (typeof deviceMemory === 'number' && deviceMemory <= 2) return true;
  return typeof hardwareConcurrency === 'number' && hardwareConcurrency > 0 && hardwareConcurrency <= 2;
}
