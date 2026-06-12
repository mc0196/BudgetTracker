import { useEffect, useState } from 'react'
import {
  applyTheme,
  getStoredTheme,
  storeTheme,
  watchSystemTheme,
  type ThemePreference,
} from '@/lib/theme'

/**
 * Theme preference with persistence.
 * The inline script in index.html applies the initial theme before paint;
 * this hook handles changes at runtime (user toggle + OS scheme changes).
 */
export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(getStoredTheme)

  useEffect(() => watchSystemTheme(getStoredTheme), [])

  const setTheme = (pref: ThemePreference) => {
    setPreference(pref)
    storeTheme(pref)
    applyTheme(pref)
  }

  return { preference, setTheme }
}
