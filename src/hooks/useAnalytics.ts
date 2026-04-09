import { useMemo } from 'react'
import { subMonths, format } from 'date-fns'
import { useMonthTransactions, useAllTransactions } from './useTransactions'
import {
  computeStatsForMonth,
  computeCategoryStats,
  computeMonthlySeriesForRange,
  computeDailyStats,
} from '@/services/analyticsService'
import { monthDateRange } from '@/lib/utils'

/** Monthly overview stats for the dashboard */
export function useMonthlyStats(month: string) {
  const transactions = useMonthTransactions(month)
  return useMemo(() => {
    if (!transactions) return null
    return computeStatsForMonth(transactions, month)
  }, [transactions, month])
}

/** Category breakdown (expenses) for a given month */
export function useCategoryStats(month: string) {
  const transactions = useMonthTransactions(month)
  return useMemo(() => {
    if (!transactions) return []
    return computeCategoryStats(transactions, 'expense')
  }, [transactions])
}

/** Month-by-month stats for the last N months (for bar chart) */
export function useMonthSeries(monthsBack = 6) {
  const all = useAllTransactions()

  return useMemo(() => {
    if (!all) return []
    const endMonth = format(new Date(), 'yyyy-MM')
    const startMonth = format(subMonths(new Date(), monthsBack - 1), 'yyyy-MM')
    return computeMonthlySeriesForRange(all, startMonth, endMonth)
  }, [all, monthsBack])
}

/** Daily income/expense series for a given month (for line chart) */
export function useDailySeries(month: string) {
  const transactions = useMonthTransactions(month)

  return useMemo(() => {
    if (!transactions) return []
    const { start, end } = monthDateRange(month)
    return computeDailyStats(transactions, start, end)
  }, [transactions, month])
}
