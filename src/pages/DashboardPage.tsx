import { MonthlyOverview } from '@/features/dashboard/MonthlyOverview'
import { BudgetProgress } from '@/features/dashboard/BudgetProgress'
import { RecentTransactions } from '@/features/dashboard/RecentTransactions'
import { SpendingInsights } from '@/features/dashboard/SpendingInsights'
import { RecurringTransactions } from '@/features/dashboard/RecurringTransactions'
import { OnboardingHero } from '@/features/dashboard/OnboardingHero'
import { MonthPicker } from '@/components/MonthPicker'
import { useTransactionCount } from '@/hooks/useTransactions'
import { useUIStore } from '@/store'

export function DashboardPage() {
  const { selectedMonth, privacyMode, togglePrivacyMode } = useUIStore()
  const transactionCount = useTransactionCount()
  const isFirstLaunch = transactionCount === 0

  return (
    <div>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 bg-gray-50/90 dark:bg-[#0b0b13]/90 backdrop-blur-xl border-b border-gray-100/60 dark:border-white/[0.05]">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Overview</h1>

        <div className="flex items-center gap-2">
          {/* Privacy toggle */}
          <button
            onClick={togglePrivacyMode}
            className="p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
            aria-label={privacyMode ? 'Show amounts' : 'Hide amounts'}
          >
            {privacyMode ? (
              /* Eye-slash */
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              /* Eye */
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>

          <MonthPicker />
        </div>
      </div>

      <div className="px-4 pt-4">
        {isFirstLaunch ? (
          <div className="pb-6">
            <OnboardingHero />
          </div>
        ) : (
          <>
            <MonthlyOverview month={selectedMonth} />

            <div className="mt-4">
              <BudgetProgress month={selectedMonth} />
            </div>

            <div className="mt-4">
              <SpendingInsights month={selectedMonth} />
            </div>

            <div className="mt-4">
              <RecurringTransactions />
            </div>

            <div className="mt-4 mb-6">
              <RecentTransactions month={selectedMonth} limit={8} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
