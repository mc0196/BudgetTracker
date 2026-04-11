import { useUIStore } from '@/store'
import { cn } from '@/lib/utils'

const ICONS = {
  success: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
  ),
}

const TYPE_CLASSES = {
  success: 'bg-[#132b1e] border-income/25 text-income-bright',
  error:   'bg-[#2b1313] border-expense/25 text-expense-bright',
  info:    'bg-[#16161f] border-white/[0.1] text-slate-200',
}

export function Toast() {
  const { toast, clearToast } = useUIStore()

  if (!toast) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pt-[calc(env(safe-area-inset-top)+12px)] pointer-events-none animate-slide-down">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-sm font-medium',
          'shadow-2xl backdrop-blur-2xl pointer-events-auto w-full max-w-sm',
          TYPE_CLASSES[toast.type],
        )}
        role="alert"
      >
        {ICONS[toast.type]}
        <span className="flex-1">{toast.message}</span>
        <button
          onClick={clearToast}
          className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity p-0.5"
          aria-label="Dismiss"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
