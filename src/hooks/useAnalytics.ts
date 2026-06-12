import { useMemo } from 'react'
import { subMonths, format, parseISO, differenceInCalendarDays } from 'date-fns'
import { useMonthTransactions, useAllTransactions, useRangeTransactions } from './useTransactions'
import {
  computeStatsForMonth,
  computeCategoryStats,
  computeMonthlySeriesForRange,
  computeDailyStats,
  aggregateDailyToWeekly,
} from '@/services/analyticsService'
import { monthDateRange } from '@/lib/utils'
import type { DateRange } from '@/types'

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

// ─── Date-range variants (Charts page) ───────────────────────────────────────

/** Category breakdown (expenses) for an arbitrary date range. undefined = loading */
export function useCategoryStatsForRange(range: DateRange) {
  const transactions = useRangeTransactions(range.start, range.end)
  return useMemo(
    () => (transactions ? computeCategoryStats(transactions, 'expense') : undefined),
    [transactions],
  )
}

/**
 * Time series for an arbitrary date range.
 * Ranges longer than ~3 months are aggregated by week to stay readable on mobile.
 */
export function useTimeSeriesForRange(range: DateRange) {
  const transactions = useRangeTransactions(range.start, range.end)
  return useMemo(() => {
    if (!transactions) return undefined
    const daily = computeDailyStats(transactions, range.start, range.end)
    const days = differenceInCalendarDays(parseISO(range.end), parseISO(range.start))
    const weekly = days > 92
    return {
      stats: weekly ? aggregateDailyToWeekly(daily) : daily,
      granularity: weekly ? ('week' as const) : ('day' as const),
    }
  }, [transactions, range.start, range.end])
}

/**
 * Month-by-month series covering the range — widened to at least 6 months
 * (ending at the range's last month) so the bar chart stays meaningful.
 */
export function useMonthlySeriesForDateRange(range: DateRange) {
  const all = useAllTransactions()
  return useMemo(() => {
    if (!all) return undefined
    const endMonth = range.end.slice(0, 7)
    const minStart = format(subMonths(parseISO(`${endMonth}-01`), 5), 'yyyy-MM')
    const startMonth = range.start.slice(0, 7) < minStart ? range.start.slice(0, 7) : minStart
    return computeMonthlySeriesForRange(all, startMonth, endMonth)
  }, [all, range.start, range.end])
}
