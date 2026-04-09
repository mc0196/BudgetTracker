import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className, onClick, padding = 'md' }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100',
        paddingClasses[padding],
        onClick && 'cursor-pointer active:scale-[0.98] transition-transform',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: 'default' | 'income' | 'expense' | 'primary'
  className?: string
}

export function StatCard({ label, value, subValue, color = 'default', className }: StatCardProps) {
  const colorClasses = {
    default: 'text-gray-900',
    income: 'text-income',
    expense: 'text-expense',
    primary: 'text-primary-600',
  }

  return (
    <Card className={cn('flex flex-col gap-1', className)}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={cn('text-2xl font-bold tabular-nums', colorClasses[color])}>{value}</p>
      {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
    </Card>
  )
}
