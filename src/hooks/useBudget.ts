import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { budgetRepository } from '@/db/repositories/budgetRepository'
import { useMonthTransactions } from './useTransactions'
import {
  computeBudgetProgress,
  getBudgetAlertLevel,
  type BudgetAlertLevel,
} from '@/services/budgetService'
import type { Budget } from '@/types'

export function useMonthBudgets(month: string): Budget[] | undefined {
  return useLiveQuery(() => budgetRepository.getByMonth(month), [month])
}

export function useBudgetProgress(month: string) {
  const budgets = useMonthBudgets(month)
  const transactions = useMonthTransactions(month)

  return useMemo(() => {
    if (!budgets || !transactions) return []
    return budgets.map(b => ({
      budget: b,
      progress: computeBudgetProgress(transactions, month, b.limit, b.category),
    }))
  }, [budgets, transactions, month])
}

/**
 * Returns a checker that tells whether adding an expense of `amount`
 * would cross a budget threshold (80% → 'warning', 100% → 'critical').
 * Returns null when no threshold is newly crossed.
 */
export function useBudgetAlertCheck(month: string) {
  const budgets = useMonthBudgets(month)
  const transactions = useMonthTransactions(month)

  return (amount: number, category?: string): BudgetAlertLevel | null => {
    if (!budgets || !transactions || amount <= 0) return null

    let crossed: BudgetAlertLevel | null = null
    for (const b of budgets) {
      // Category budgets only apply to their own category; the total budget to everything
      if (b.category && b.category !== category) continue
      const before = computeBudgetProgress(transactions, month, b.limit, b.category)
      const after = getBudgetAlertLevel(before.spent + amount, b.limit)
      if (after === before.level || after === 'ok') continue
      if (after === 'critical') return 'critical'
      crossed = after
    }
    return crossed
  }
}

export function useBudgetMutations() {
  const upsert = (budget: Omit<Budget, 'id' | 'createdAt'>) =>
    budgetRepository.upsert(budget)

  const remove = (id: string) => budgetRepository.delete(id)

  return { upsert, remove }
}
