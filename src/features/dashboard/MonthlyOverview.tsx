import { useMonthlyStats } from '@/hooks/useAnalytics'
import { useCountUp } from '@/hooks/useCountUp'
import { useUIStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import { SkeletonMonthlyOverview } from '@/components/Skeleton'

const MASK = '••••'

interface MonthlyOverviewProps {
  month: string
}

export function MonthlyOverview({ month }: MonthlyOverviewProps) {
  const stats = useMonthlyStats(month)

  if (!stats) return <SkeletonMonthlyOverview />

  return <MonthlyOverviewInner stats={stats} />
}

interface Stats {
  netBalance: number
  totalIncome: number
  totalExpenses: number
}

/** Separated so hooks always run with real values (no conditional hook calls) */
function MonthlyOverviewInner({ stats }: { stats: Stats }) {
  const animatedBalance  = useCountUp(Math.abs(stats.netBalance))
  const animatedIncome   = useCountUp(stats.totalIncome, 600)
  const animatedExpenses = useCountUp(stats.totalExpenses, 650)
  const privacyMode = useUIStore(s => s.privacyMode)

  const isPositive = stats.netBalance >= 0

  const balanceColor = isPositive
    ? 'text-income-dark dark:text-income-bright'
    : 'text-expense-dark dark:text-expense-bright'

  const heroBg = isPositive
    ? 'bg-income-light dark:bg-income-subtle'
    : 'bg-expense-light dark:bg-expense-subtle'

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Balance hero */}
      <div className={`rounded-3xl px-5 py-5 ${heroBg}`}>
        <p className={`text-[11px] font-semibold uppercase tracking-widest mb-2 opacity-60 ${balanceColor}`}>
          Balance
        </p>
        <p className={`text-4xl font-bold tabular-nums ${balanceColor}`}>
          {privacyMode ? MASK : `${isPositive ? '+' : '-'}${formatCurrency(animatedBalance)}`}
        </p>
      </div>

      {/* Income + Expenses row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl px-4 py-4 bg-income-light dark:bg-income-subtle">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-income-dark dark:text-income-bright opacity-60 mb-1.5">
            Income
          </p>
          <p className="text-2xl font-bold tabular-nums text-income-dark dark:text-income-bright">
            {privacyMode ? MASK : `+${formatCurrency(animatedIncome)}`}
          </p>
        </div>
        <div className="rounded-2xl px-4 py-4 bg-expense-light dark:bg-expense-subtle">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-expense-dark dark:text-expense-bright opacity-60 mb-1.5">
            Expenses
          </p>
          <p className="text-2xl font-bold tabular-nums text-expense-dark dark:text-expense-bright">
            {privacyMode ? MASK : `-${formatCurrency(animatedExpenses)}`}
          </p>
        </div>
      </div>
    </div>
  )
}
