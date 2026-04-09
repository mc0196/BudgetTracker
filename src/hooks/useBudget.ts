import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { budgetRepository } from '@/db/repositories/budgetRepository'
import { useMonthTransactions } from './useTransactions'
import { computeBudgetProgress } from '@/services/analyticsService'
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

export function useBudgetMutations() {
  const upsert = (budget: Omit<Budget, 'id' | 'createdAt'>) =>
    budgetRepository.upsert(budget)

  const remove = (id: string) => budgetRepository.delete(id)

  return { upsert, remove }
}
