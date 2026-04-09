import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'

export function Toast() {
  const { toast, clearToast } = useUIStore()

  if (!toast) return null

  const typeClasses = {
    success: 'bg-income text-white',
    error: 'bg-expense text-white',
    info: 'bg-gray-800 text-white',
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm">
      <div
        className={cn(
          'flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium',
          typeClasses[toast.type],
        )}
        role="alert"
      >
        <span>{toast.message}</span>
        <button
          onClick={clearToast}
          className="flex-shrink-0 opacity-80 hover:opacity-100"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
