import { Card } from '@/components/Card'
import { MonthPicker } from '@/components/MonthPicker'
import { SpendingPieChart } from '@/features/charts/SpendingPieChart'
import { IncomeExpenseBarChart } from '@/features/charts/IncomeExpenseBarChart'
import { TimeSeriesChart } from '@/features/charts/TimeSeriesChart'
import { useUIStore } from '@/store'

export function ChartsPage() {
  const { selectedMonth } = useUIStore()

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 bg-gray-50/90 dark:bg-[#0b0b13]/90 backdrop-blur-xl border-b border-gray-100/60 dark:border-white/[0.05]">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Analytics</h1>
        <MonthPicker />
      </div>

      <div className="px-4 pt-4 space-y-4 pb-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">🍩</span>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Spending by Category</h2>
          </div>
          <SpendingPieChart month={selectedMonth} />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">📊</span>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Income vs Expenses — Last 6 months</h2>
          </div>
          <IncomeExpenseBarChart />
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">📈</span>
            <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Daily Activity</h2>
          </div>
          <TimeSeriesChart month={selectedMonth} />
        </Card>
      </div>
    </div>
  )
}
