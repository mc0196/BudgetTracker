import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useMonthlyStats } from '@/hooks/useAnalytics'
import { formatCurrency } from '@/lib/utils'

interface MonthlyOverviewProps {
  month: string
}

export function MonthlyOverview({ month }: MonthlyOverviewProps) {
  const stats = useMonthlyStats(month)

  if (!stats) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  const isPositive = stats.netBalance >= 0

  return (
    <div className="space-y-3">
      {/* Balance hero */}
      <div className={`rounded-3xl px-5 py-5 ${
        isPositive
          ? 'bg-income-light dark:bg-income-subtle'
          : 'bg-expense-light dark:bg-expense-subtle'
      }`}>
        <p className={`text-[11px] font-semibold uppercase tracking-widest mb-2 opacity-60 ${
          isPositive
            ? 'text-income-dark dark:text-income-bright'
            : 'text-expense-dark dark:text-expense-bright'
        }`}>
          Balance
        </p>
        <p className={`text-4xl font-bold tabular-nums ${
          isPositive
            ? 'text-income-dark dark:text-income-bright'
            : 'text-expense-dark dark:text-expense-bright'
        }`}>
          {isPositive ? '+' : ''}{formatCurrency(stats.netBalance)}
        </p>
      </div>

      {/* Income + Expenses row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl px-4 py-4 bg-income-light dark:bg-income-subtle">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-income-dark dark:text-income-bright opacity-60 mb-1.5">
            Income
          </p>
          <p className="text-2xl font-bold tabular-nums text-income-dark dark:text-income-bright">
            +{formatCurrency(stats.totalIncome)}
          </p>
        </div>
        <div className="rounded-2xl px-4 py-4 bg-expense-light dark:bg-expense-subtle">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-expense-dark dark:text-expense-bright opacity-60 mb-1.5">
            Expenses
          </p>
          <p className="text-2xl font-bold tabular-nums text-expense-dark dark:text-expense-bright">
            -{formatCurrency(stats.totalExpenses)}
          </p>
        </div>
      </div>
    </div>
  )
}
