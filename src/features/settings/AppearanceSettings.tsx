import { Card } from '@/components/Card'
import { useTheme } from '@/hooks/useTheme'
import { haptics } from '@/lib/haptics'
import { cn } from '@/lib/utils'
import type { ThemePreference } from '@/lib/theme'

const OPTIONS: { value: ThemePreference; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '📱' },
]

export function AppearanceSettings() {
  const { preference, setTheme } = useTheme()

  const handleSelect = (pref: ThemePreference) => {
    haptics.medium()
    setTheme(pref)
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Theme</h3>
      <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">
        "System" follows your device's appearance automatically
      </p>
      <div
        className="grid grid-cols-3 gap-1 rounded-2xl bg-gray-100 dark:bg-white/[0.06] p-1"
        role="radiogroup"
        aria-label="Theme"
      >
        {OPTIONS.map(opt => {
          const isSelected = preference === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              role="radio"
              aria-checked={isSelected}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 min-h-[44px]',
                isSelected
                  ? 'bg-white dark:bg-[#1a1a28] text-gray-900 dark:text-slate-100 shadow-sm'
                  : 'text-gray-500 dark:text-slate-500',
              )}
            >
              <span className="text-base" aria-hidden>{opt.icon}</span>
              {opt.label}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
