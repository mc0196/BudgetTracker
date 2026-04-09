import { Card } from '@/components/Card'
import { MonthPicker } from '@/components/MonthPicker'
import { SpendingPieChart } from '@/features/charts/SpendingPieChart'
import { IncomeExpenseBarChart } from '@/features/charts/IncomeExpenseBarChart'
import { TimeSeriesChart } from '@/features/charts/TimeSeriesChart'
import { useUIStore } from '@/store'

export function ChartsPage() {
  const { selectedMonth } = useUIStore()

  return (
    <div className="px-4 pt-4 space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <MonthPicker />
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Spending by Category</h2>
        <SpendingPieChart month={selectedMonth} />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">
          Income vs Expenses — Last 6 months
        </h2>
        <IncomeExpenseBarChart />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Daily Activity</h2>
        <TimeSeriesChart month={selectedMonth} />
      </Card>
    </div>
  )
}
