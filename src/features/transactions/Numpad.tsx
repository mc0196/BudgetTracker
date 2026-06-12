import { haptics } from '@/lib/haptics'

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'] as const

interface NumpadProps {
  value: string
  onChange: (next: string) => void
}

/** Thumb-friendly amount numpad (max 2 decimals). */
export function Numpad({ value, onChange }: NumpadProps) {
  const handleKey = (key: string) => {
    haptics.light()
    if (key === '⌫') {
      onChange(value.slice(0, -1))
    } else if (key === '.' && value.includes('.')) {
      return
    } else if (value.split('.')[1]?.length >= 2) {
      return
    } else {
      onChange(value === '' && key === '0' ? '0' : value + key)
    }
  }

  return (
    <div className="px-3 pb-2 grid grid-cols-3 gap-2">
      {NUMPAD_KEYS.map(key => (
        <button
          key={key}
          onClick={() => handleKey(key)}
          aria-label={key === '⌫' ? 'Delete last digit' : key}
          className={`py-4 rounded-2xl text-xl font-semibold press-scale transition-colors select-none ${
            key === '⌫'
              ? 'text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-white/[0.06] active:bg-gray-200 dark:active:bg-white/[0.12]'
              : 'text-gray-800 dark:text-slate-100 bg-gray-50 dark:bg-white/[0.06] active:bg-gray-200 dark:active:bg-white/[0.14]'
          }`}
        >
          {key === '⌫' ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mx-auto">
              <path d="M9.914 12 7.5 9.586 8.914 8.172 11.328 10.586 13.742 8.172 15.156 9.586 12.742 12 15.156 14.414 13.742 15.828 11.328 13.414 8.914 15.828 7.5 14.414 9.914 12z"/>
              <path fillRule="evenodd" d="M9.377 4.5a1.5 1.5 0 00-1.118.502L2.5 12l5.759 6.998A1.5 1.5 0 009.377 19.5H20a1.5 1.5 0 001.5-1.5v-12A1.5 1.5 0 0020 4.5H9.377zM4.11 12l4.96-6.027A.5.5 0 019.377 5.5H20a.5.5 0 01.5.5v12a.5.5 0 01-.5.5H9.377a.5.5 0 01-.373-.165L4.11 12z" clipRule="evenodd"/>
            </svg>
          ) : key}
        </button>
      ))}
    </div>
  )
}
