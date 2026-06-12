import { ProgressBar } from '@/components/ProgressBar'

export interface ImportProgressState {
  label: string
  /** 0-100 */
  percent: number
}

/** Progress indicator shown while parsing or saving large import files. */
export function ImportProgress({ label, percent }: ImportProgressState) {
  return (
    <div
      className="mt-4 p-4 rounded-2xl bg-white dark:bg-[#13131e] border border-gray-100 dark:border-white/[0.07] animate-slide-up"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</span>
        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 tabular-nums">
          {Math.round(percent)}%
        </span>
      </div>
      <ProgressBar value={percent} size="sm" />
    </div>
  )
}
