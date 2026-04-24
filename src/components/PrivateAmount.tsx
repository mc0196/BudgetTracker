import { useUIStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface PrivateAmountProps {
  value: number
  prefix?: string
  className?: string
}

const MASK = '••••'

export function PrivateAmount({ value, prefix = '', className }: PrivateAmountProps) {
  const privacyMode = useUIStore(s => s.privacyMode)

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}{privacyMode ? MASK : formatCurrency(value)}
    </span>
  )
}
