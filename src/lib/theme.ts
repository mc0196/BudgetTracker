/**
 * Theme management — light / dark / system.
 *
 * The resolved theme is applied as a `dark` class on <html> (Tailwind
 * `darkMode: 'class'`). An inline script in index.html applies the stored
 * preference before first paint to avoid a flash of the wrong theme.
 */

export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'bt-theme'

/** Matches the page backgrounds so the browser chrome blends in */
const META_COLORS = { light: '#f9fafb', dark: '#0b0b13' } as const

export function getStoredTheme(): ThemePreference {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  } catch {
    /* storage unavailable (private mode) */
  }
  return 'system'
}

export function storeTheme(pref: ThemePreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, pref)
  } catch {
    /* storage unavailable */
  }
}

export function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return pref
}

export function applyTheme(pref: ThemePreference): void {
  const resolved = resolveTheme(pref)
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', META_COLORS[resolved])
}

/**
 * Re-applies the theme when the OS color scheme changes while the
 * preference is 'system'. Returns a cleanup function.
 */
export function watchSystemTheme(getPref: () => ThemePreference): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => {
    if (getPref() === 'system') applyTheme('system')
  }
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}
