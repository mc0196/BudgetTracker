/**
 * Haptic feedback via Vibration API.
 * Works on Android and iOS Safari 13+.
 * Silently no-ops if the API is not available.
 */
const vibrate = (pattern: number | number[]) => {
  try { navigator.vibrate?.(pattern) } catch { /* not supported */ }
}

export const haptics = {
  /** Light tap — numpad keys, nav tabs */
  light:   () => vibrate(8),
  /** Medium tap — toggle switches, selections */
  medium:  () => vibrate(15),
  /** Success — save, import complete */
  success: () => vibrate([10, 40, 10]),
  /** Error — validation fail, delete */
  error:   () => vibrate([30, 20, 60]),
  /** Warning — confirm delete prompt */
  warning: () => vibrate([20, 30, 20]),
}
