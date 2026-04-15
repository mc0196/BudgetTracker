import { MonthlyOverview } from '@/features/dashboard/MonthlyOverview'
import { BudgetProgress } from '@/features/dashboard/BudgetProgress'
import { RecentTransactions } from '@/features/dashboard/RecentTransactions'
import { SpendingInsights } from '@/features/dashboard/SpendingInsights'
import { MonthPicker } from '@/components/MonthPicker'
import { useUIStore } from '@/store'

export function DashboardPage() {
  const { selectedMonth } = useUIStore()

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 bg-gray-50/90 dark:bg-[#0b0b13]/90 backdrop-blur-xl border-b border-gray-100/60 dark:border-white/[0.05]">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Overview</h1>
        <MonthPicker />
      </div>
      <div className="px-4 pt-4">
        {/* Stat cards */}
        <MonthlyOverview month={selectedMonth} />

        {/* Budget */}
        <div className="mt-4">
          <BudgetProgress month={selectedMonth} />
        </div>

        {/* Smart insights */}
        <div className="mt-4">
          <SpendingInsights month={selectedMonth} />
        </div>

        {/* Recent transactions */}
        <div className="mt-4 mb-6">
          <RecentTransactions month={selectedMonth} limit={8} />
        </div>
      </div>
    </div>
  )
}
