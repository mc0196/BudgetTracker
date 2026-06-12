import { Card } from '@/components/Card'
import { ProgressBar } from '@/components/ProgressBar'
import { PrivateAmount } from '@/components/PrivateAmount'
import { EmptyState } from '@/components/EmptyState'
import { useBudgetProgress } from '@/hooks/useBudget'
import type { BudgetAlertLevel } from '@/services/budgetService'
import { Link } from 'react-router-dom'

interface BudgetProgressProps {
  month: string
}

/** Bar color per alert level: green → amber (≥80%) → red (≥100%) */
const LEVEL_VARIANTS: Record<BudgetAlertLevel, 'income' | 'warning' | 'expense'> = {
  ok: 'income',
  warning: 'warning',
  critical: 'expense',
}

export function BudgetProgress({ month }: BudgetProgressProps) {
  const budgetProgress = useBudgetProgress(month)

  if (!budgetProgress || budgetProgress.length === 0) {
    return (
      <Card>
        <EmptyState
          icon="💰"
          title="No budget set"
          description="Set a monthly budget to get an alert when you pass 80% of it"
          action={
            <Link
              to="/settings"
              className="text-sm font-medium text-primary-600 dark:text-primary-400 underline underline-offset-2"
            >
              Set budget
            </Link>
          }
        />
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-4">Budget</h3>
      <div className="space-y-4">
        {budgetProgress.map(({ budget, progress }) => (
          <div key={budget.id}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {budget.category ?? 'Total'}
              </span>
              <span className={`text-sm font-semibold ${progress.isOver ? 'text-expense dark:text-expense-bright' : 'text-gray-600 dark:text-slate-400'}`}>
                <PrivateAmount value={progress.spent} /> / <PrivateAmount value={progress.limit} />
              </span>
            </div>
            <ProgressBar value={progress.percentage} variant={LEVEL_VARIANTS[progress.level]} size="md" showLabel />

            {progress.level === 'critical' && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-expense-light dark:bg-expense-subtle text-expense-dark dark:text-expense-bright" role="alert">
                <span aria-hidden>🚨</span>
                <p className="text-xs font-semibold">
                  Budget exceeded by <PrivateAmount value={progress.spent - progress.limit} />
                </p>
              </div>
            )}
            {progress.level === 'warning' && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-400/[0.10] text-amber-700 dark:text-amber-300" role="alert">
                <span aria-hidden>⚠️</span>
                <p className="text-xs font-semibold">
                  Over 80% used — <PrivateAmount value={progress.remaining} /> left
                </p>
              </div>
            )}
            {progress.level === 'ok' && (
              <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">
                <PrivateAmount value={progress.remaining} /> remaining
              </p>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
