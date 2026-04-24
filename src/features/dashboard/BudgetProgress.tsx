import { Card } from '@/components/Card'
import { ProgressBar } from '@/components/ProgressBar'
import { PrivateAmount } from '@/components/PrivateAmount'
import { EmptyState } from '@/components/EmptyState'
import { useBudgetProgress } from '@/hooks/useBudget'
import { Link } from 'react-router-dom'

interface BudgetProgressProps {
  month: string
}

export function BudgetProgress({ month }: BudgetProgressProps) {
  const budgetProgress = useBudgetProgress(month)

  if (!budgetProgress || budgetProgress.length === 0) {
    return (
      <Card>
        <EmptyState
          icon="💰"
          title="No budget set"
          description="Set a monthly budget to track your spending"
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
            <ProgressBar value={progress.percentage} variant="expense" size="md" showLabel />
            {progress.isOver && (
              <p className="mt-1 text-xs text-expense dark:text-expense-bright font-medium">
                Over budget by <PrivateAmount value={progress.spent - progress.limit} />
              </p>
            )}
            {!progress.isOver && (
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
