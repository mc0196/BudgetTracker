import { Card } from '@/components/Card'
import { PrivateAmount } from '@/components/PrivateAmount'
import { useRecurring } from '@/hooks/useRecurring'
import { categoryIcon } from '@/lib/categoryIcons'
import { truncate } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import type { RecurringCadence } from '@/services/recurringService'

const CADENCE_LABELS: Record<RecurringCadence, string> = {
  weekly: 'weekly',
  monthly: 'monthly',
  yearly: 'yearly',
}

const MAX_ITEMS = 5

/** Dashboard card surfacing detected subscriptions / recurring payments. */
export function RecurringTransactions() {
  const recurring = useRecurring()

  const active = recurring?.filter(r => r.isActive).slice(0, MAX_ITEMS)
  // Detection needs history — hide the card entirely until there's something to show
  if (!active || active.length === 0) return null

  return (
    <Card padding="none">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Recurring</h3>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
          Detected from repeating patterns in your history
        </p>
      </div>

      {active.map((item, i) => (
        <div key={`${item.type}|${item.description}`}>
          <div className="flex items-center gap-3 px-4 py-3">
            <span
              className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-50 dark:bg-white/[0.06] flex items-center justify-center text-lg"
              aria-hidden
            >
              {item.type === 'income' ? '💰' : categoryIcon(item.category, '🔄')}
            </span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
                {truncate(item.description, 32)}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500">
                {CADENCE_LABELS[item.cadence]} · next ~{format(parseISO(item.nextExpectedDate), 'd MMM')}
              </p>
            </div>

            <PrivateAmount
              value={item.averageAmount}
              prefix={item.type === 'income' ? '+' : '-'}
              className={`flex-shrink-0 text-sm font-semibold tabular-nums ${
                item.type === 'income'
                  ? 'text-income dark:text-income-bright'
                  : 'text-gray-700 dark:text-slate-300'
              }`}
            />
          </div>
          {i < active.length - 1 && <div className="mx-4 border-t border-gray-50 dark:border-white/[0.05]" />}
        </div>
      ))}
    </Card>
  )
}
