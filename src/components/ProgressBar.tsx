import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number      // 0-100
  max?: number       // default 100
  variant?: 'default' | 'income' | 'expense' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  className,
}: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100)

  // Auto-switch to warning color when over 80%
  const effectiveVariant =
    variant === 'expense' && pct >= 100
      ? 'warning'
      : variant === 'expense' && pct >= 80
      ? 'warning'
      : variant

  const trackClasses = {
    default: 'bg-primary-500',
    income: 'bg-income dark:bg-income-bright',
    expense: 'bg-expense dark:bg-expense-bright',
    warning: 'bg-amber-500',
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-gray-100 dark:bg-white/[0.08] rounded-full overflow-hidden', heightClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            trackClasses[effectiveVariant],
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-gray-500 dark:text-slate-500 text-right">{pct.toFixed(0)}%</p>
      )}
    </div>
  )
}
