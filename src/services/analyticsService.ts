/**
 * Analytics service — pure computation, no side effects.
 * All functions take arrays of Transaction objects and return aggregates.
 */

import { format, parseISO, eachMonthOfInterval, startOfMonth, endOfMonth, startOfISOWeek } from 'date-fns'
import type { Transaction, MonthlyStats, CategoryStats, DailyStats } from '@/types'
import { categoryColor } from '@/lib/utils'

// ─── Totals ───────────────────────────────────────────────────────────────────

export function sumByType(
  transactions: Transaction[],
): { income: number; expenses: number; net: number } {
  let income = 0
  let expenses = 0
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount
    else expenses += t.amount
  }
  return { income, expenses, net: income - expenses }
}

// ─── Monthly stats ────────────────────────────────────────────────────────────

export function computeMonthlyStats(transactions: Transaction[]): MonthlyStats[] {
  if (transactions.length === 0) return []

  // Group by month
  const byMonth = new Map<string, Transaction[]>()
  for (const t of transactions) {
    const m = t.date.slice(0, 7) // 'YYYY-MM'
    if (!byMonth.has(m)) byMonth.set(m, [])
    byMonth.get(m)!.push(t)
  }

  const stats: MonthlyStats[] = []
  for (const [month, txs] of byMonth) {
    const { income, expenses } = sumByType(txs)
    stats.push({
      month,
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
      transactionCount: txs.length,
    })
  }

  return stats.sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * Returns stats for a specific 'YYYY-MM' month.
 * Filters transactions by month prefix.
 */
export function computeStatsForMonth(
  transactions: Transaction[],
  month: string,
): MonthlyStats {
  const txs = transactions.filter(t => t.date.startsWith(month))
  const { income, expenses } = sumByType(txs)
  return {
    month,
    totalIncome: income,
    totalExpenses: expenses,
    netBalance: income - expenses,
    transactionCount: txs.length,
  }
}

// ─── Category stats ───────────────────────────────────────────────────────────

/**
 * Aggregate expenses by mapped category.
 * Returns sorted by total descending, with percentage of total expenses.
 */
export function computeCategoryStats(
  transactions: Transaction[],
  type: 'expense' | 'income' = 'expense',
): CategoryStats[] {
  const filtered = transactions.filter(t => t.type === type)
  const total = filtered.reduce((s, t) => s + t.amount, 0)

  if (total === 0) return []

  const byCategory = new Map<string, { total: number; count: number }>()
  for (const t of filtered) {
    const key = t.mappedCategory || 'Uncategorized'
    const existing = byCategory.get(key) ?? { total: 0, count: 0 }
    byCategory.set(key, { total: existing.total + t.amount, count: existing.count + 1 })
  }

  const stats: CategoryStats[] = []
  let idx = 0
  for (const [category, { total: catTotal, count }] of byCategory) {
    stats.push({
      category,
      total: catTotal,
      count,
      percentage: (catTotal / total) * 100,
      color: categoryColor(idx++),
    })
  }

  return stats.sort((a, b) => b.total - a.total)
}

// ─── Daily stats (for time series) ───────────────────────────────────────────

export function computeDailyStats(
  transactions: Transaction[],
  startDate: string,
  endDate: string,
): DailyStats[] {
  // Build a map of date → totals
  const byDate = new Map<string, DailyStats>()

  // Fill every day in range with zeros first
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const current = new Date(start)
  while (current <= end) {
    const key = format(current, 'yyyy-MM-dd')
    byDate.set(key, { date: key, income: 0, expenses: 0 })
    current.setDate(current.getDate() + 1)
  }

  // Accumulate transactions
  for (const t of transactions) {
    const entry = byDate.get(t.date)
    if (!entry) continue
    if (t.type === 'income') entry.income += t.amount
    else entry.expenses += t.amount
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Aggregates daily stats into ISO-week buckets (keyed by the Monday of each week).
 * Used to keep long-range time series readable on small screens.
 */
export function aggregateDailyToWeekly(stats: DailyStats[]): DailyStats[] {
  const byWeek = new Map<string, DailyStats>()
  for (const day of stats) {
    const key = format(startOfISOWeek(parseISO(day.date)), 'yyyy-MM-dd')
    const entry = byWeek.get(key) ?? { date: key, income: 0, expenses: 0 }
    entry.income += day.income
    entry.expenses += day.expenses
    byWeek.set(key, entry)
  }
  return Array.from(byWeek.values()).sort((a, b) => a.date.localeCompare(b.date))
}

// ─── Monthly series for bar chart ────────────────────────────────────────────

/**
 * Returns month-by-month income/expense data for the last N months,
 * even if some months have no transactions.
 */
export function computeMonthlySeriesForRange(
  transactions: Transaction[],
  startMonth: string,
  endMonth: string,
): MonthlyStats[] {
  const start = startOfMonth(parseISO(`${startMonth}-01`))
  const end = endOfMonth(parseISO(`${endMonth}-01`))

  const months = eachMonthOfInterval({ start, end }).map(d => format(d, 'yyyy-MM'))

  return months.map(month => computeStatsForMonth(transactions, month))
}

// ─── Recurring detection ──────────────────────────────────────────────────────

interface RecurringPattern {
  description: string
  averageAmount: number
  occurrences: number
  monthlyPattern: boolean
}

/**
 * Heuristic: find transactions that appear with a similar description
 * in at least 2 different months.
 */
export function detectRecurring(transactions: Transaction[]): RecurringPattern[] {
  const groups = new Map<string, Transaction[]>()

  for (const t of transactions) {
    // Normalize key: lowercase, remove numbers, trim
    const key = t.description
      .toLowerCase()
      .replace(/\d+/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 40)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(t)
  }

  const patterns: RecurringPattern[] = []
  for (const [, txs] of groups) {
    if (txs.length < 2) continue
    const months = new Set(txs.map(t => t.date.slice(0, 7)))
    if (months.size < 2) continue

    const avg = txs.reduce((s, t) => s + t.amount, 0) / txs.length
    patterns.push({
      description: txs[0].description,
      averageAmount: avg,
      occurrences: txs.length,
      monthlyPattern: months.size === txs.length,
    })
  }

  return patterns.sort((a, b) => b.occurrences - a.occurrences)
}
