/**
 * Budget service — pure budget math and alert levels, no side effects.
 */

import type { Transaction } from '@/types'

export type BudgetAlertLevel = 'ok' | 'warning' | 'critical'

export interface BudgetProgress {
  spent: number
  limit: number
  percentage: number
  remaining: number
  isOver: boolean
  level: BudgetAlertLevel
}

/**
 * Alert thresholds: 'warning' at 80% of the limit, 'critical' at 100%.
 */
export function getBudgetAlertLevel(spent: number, limit: number): BudgetAlertLevel {
  if (limit <= 0) return 'ok'
  const ratio = spent / limit
  if (ratio >= 1) return 'critical'
  if (ratio >= 0.8) return 'warning'
  return 'ok'
}

/**
 * Returns how much of a budget has been consumed for a given month,
 * optionally scoped to one category.
 */
export function computeBudgetProgress(
  transactions: Transaction[],
  month: string,
  limit: number,
  category?: string,
): BudgetProgress {
  const monthTxs = transactions.filter(t => t.date.startsWith(month) && t.type === 'expense')
  const filtered = category ? monthTxs.filter(t => t.mappedCategory === category) : monthTxs

  const spent = filtered.reduce((s, t) => s + t.amount, 0)
  const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0

  return {
    spent,
    limit,
    percentage,
    remaining: Math.max(limit - spent, 0),
    isOver: spent > limit,
    level: getBudgetAlertLevel(spent, limit),
  }
}
