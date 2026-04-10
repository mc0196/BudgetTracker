import { MonthlyOverview } from '@/features/dashboard/MonthlyOverview'
import { BudgetProgress } from '@/features/dashboard/BudgetProgress'
import { RecentTransactions } from '@/features/dashboard/RecentTransactions'
import { MonthPicker } from '@/components/MonthPicker'
import { useUIStore } from '@/store'

export function DashboardPage() {
  const { selectedMonth } = useUIStore()

  return (
    <div className="px-4">
      {/* Page header */}
      <div className="flex items-center justify-between py-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Overview</h1>
        <MonthPicker />
      </div>

      {/* Stat cards */}
      <MonthlyOverview month={selectedMonth} />

      {/* Budget */}
      <div className="mt-4">
        <BudgetProgress month={selectedMonth} />
      </div>

      {/* Recent transactions */}
      <div className="mt-4 mb-6">
        <RecentTransactions month={selectedMonth} limit={8} />
      </div>
    </div>
  )
}
