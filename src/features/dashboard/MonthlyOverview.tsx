import { StatCard } from '@/components/Card'
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

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard
        label="Income"
        value={formatCurrency(stats.totalIncome)}
        color="income"
      />
      <StatCard
        label="Expenses"
        value={formatCurrency(stats.totalExpenses)}
        color="expense"
      />
      <StatCard
        label="Balance"
        value={formatCurrency(stats.netBalance)}
        color={stats.netBalance >= 0 ? 'income' : 'expense'}
      />
    </div>
  )
}
