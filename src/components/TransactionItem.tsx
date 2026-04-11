import { formatCurrency, truncate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Transaction } from '@/types'

const CATEGORY_ICONS: Record<string, string> = {
  'Food & Dining': '🍽️',
  'Transport':     '🚗',
  'Shopping':      '🛍️',
  'Housing':       '🏠',
  'Health':        '💊',
  'Entertainment': '🎬',
  'Travel':        '✈️',
  'Utilities':     '💡',
  'Income':        '💰',
  'Education':     '📚',
  'Other':         '📦',
  'Uncategorized': '❓',
}

interface TransactionItemProps {
  transaction: Transaction
  onClick?: (transaction: Transaction) => void
}

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const { amount, type, description, mappedCategory, date } = transaction

  const isIncome = type === 'income'

  // Format date as "9 Apr"
  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <button
      type="button"
      onClick={() => onClick?.(transaction)}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3',
        'text-left transition-colors',
        onClick && 'active:bg-gray-50 dark:active:bg-white/[0.04]',
      )}
    >
      {/* Category icon pill */}
      <span
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg',
          isIncome
            ? 'bg-income-light dark:bg-income-subtle'
            : 'bg-expense-light dark:bg-expense-subtle',
        )}
        aria-hidden
      >
        {CATEGORY_ICONS[mappedCategory] ?? (isIncome ? '↑' : '↓')}
      </span>

      {/* Description & category */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">
          {truncate(description, 40)}
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500">{mappedCategory}</p>
      </div>

      {/* Amount & date */}
      <div className="flex-shrink-0 text-right">
        <p
          className={cn(
            'text-sm font-semibold tabular-nums',
            isIncome
              ? 'text-income dark:text-income-bright'
              : 'text-expense dark:text-expense-bright',
          )}
        >
          {isIncome ? '+' : '-'}{formatCurrency(amount)}
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500">{dateLabel}</p>
      </div>
    </button>
  )
}

/** Thin separator between items */
export function TransactionDivider() {
  return <div className="mx-4 border-t border-gray-50 dark:border-white/[0.05]" />
}
