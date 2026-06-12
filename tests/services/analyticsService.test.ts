import { describe, it, expect } from 'vitest'
import {
  sumByType,
  computeStatsForMonth,
  computeCategoryStats,
  computeDailyStats,
  aggregateDailyToWeekly,
  detectRecurring,
  computeMonthlySeriesForRange,
} from '@/services/analyticsService'
import type { Transaction } from '@/types'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: Math.random().toString(),
    amount: 100,
    type: 'expense',
    date: '2026-04-01',
    description: 'Test transaction',
    originalCategory: 'Test',
    mappedCategory: 'Food & Dining',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

// ─── sumByType ────────────────────────────────────────────────────────────────

describe('sumByType', () => {
  it('returns zeros for empty array', () => {
    expect(sumByType([])).toEqual({ income: 0, expenses: 0, net: 0 })
  })

  it('correctly sums income and expenses', () => {
    const txs = [
      makeTx({ amount: 1000, type: 'income' }),
      makeTx({ amount: 300, type: 'expense' }),
      makeTx({ amount: 200, type: 'expense' }),
    ]
    expect(sumByType(txs)).toEqual({ income: 1000, expenses: 500, net: 500 })
  })

  it('handles all expenses (net is negative)', () => {
    const txs = [makeTx({ amount: 200 }), makeTx({ amount: 300 })]
    const result = sumByType(txs)
    expect(result.income).toBe(0)
    expect(result.expenses).toBe(500)
    expect(result.net).toBe(-500)
  })
})

// ─── computeStatsForMonth ─────────────────────────────────────────────────────

describe('computeStatsForMonth', () => {
  it('only includes transactions from the target month', () => {
    const txs = [
      makeTx({ date: '2026-04-01', amount: 500, type: 'income' }),
      makeTx({ date: '2026-04-15', amount: 200, type: 'expense' }),
      makeTx({ date: '2026-03-31', amount: 999, type: 'expense' }), // different month
    ]
    const stats = computeStatsForMonth(txs, '2026-04')
    expect(stats.totalIncome).toBe(500)
    expect(stats.totalExpenses).toBe(200)
    expect(stats.netBalance).toBe(300)
    expect(stats.transactionCount).toBe(2)
  })

  it('returns zeros when no transactions in month', () => {
    const stats = computeStatsForMonth([], '2026-04')
    expect(stats.totalIncome).toBe(0)
    expect(stats.totalExpenses).toBe(0)
    expect(stats.netBalance).toBe(0)
  })
})

// ─── computeCategoryStats ─────────────────────────────────────────────────────

describe('computeCategoryStats', () => {
  it('returns empty array when no expenses', () => {
    const txs = [makeTx({ type: 'income', amount: 1000 })]
    expect(computeCategoryStats(txs, 'expense')).toEqual([])
  })

  it('aggregates by mappedCategory and sorts by total descending', () => {
    const txs = [
      makeTx({ mappedCategory: 'Food & Dining', amount: 100 }),
      makeTx({ mappedCategory: 'Transport', amount: 300 }),
      makeTx({ mappedCategory: 'Food & Dining', amount: 50 }),
    ]
    const stats = computeCategoryStats(txs, 'expense')
    expect(stats[0].category).toBe('Transport')
    expect(stats[0].total).toBe(300)
    expect(stats[1].category).toBe('Food & Dining')
    expect(stats[1].total).toBe(150)
  })

  it('computes correct percentages', () => {
    const txs = [
      makeTx({ mappedCategory: 'A', amount: 75 }),
      makeTx({ mappedCategory: 'B', amount: 25 }),
    ]
    const stats = computeCategoryStats(txs, 'expense')
    const a = stats.find(s => s.category === 'A')!
    const b = stats.find(s => s.category === 'B')!
    expect(a.percentage).toBeCloseTo(75)
    expect(b.percentage).toBeCloseTo(25)
    expect(a.percentage + b.percentage).toBeCloseTo(100)
  })

  it('counts transactions per category', () => {
    const txs = [
      makeTx({ mappedCategory: 'Food & Dining', amount: 10 }),
      makeTx({ mappedCategory: 'Food & Dining', amount: 20 }),
      makeTx({ mappedCategory: 'Transport', amount: 30 }),
    ]
    const stats = computeCategoryStats(txs)
    const food = stats.find(s => s.category === 'Food & Dining')!
    expect(food.count).toBe(2)
  })
})

// ─── aggregateDailyToWeekly ───────────────────────────────────────────────────

describe('aggregateDailyToWeekly', () => {
  it('returns empty array for empty input', () => {
    expect(aggregateDailyToWeekly([])).toEqual([])
  })

  it('groups days into ISO weeks keyed by Monday', () => {
    // 2026-04-06 is a Monday; 2026-04-08 same week; 2026-04-13 next Monday
    const txs = [
      makeTx({ date: '2026-04-06', amount: 10 }),
      makeTx({ date: '2026-04-08', amount: 20 }),
      makeTx({ date: '2026-04-13', amount: 5 }),
    ]
    const daily = computeDailyStats(txs, '2026-04-06', '2026-04-19')
    const weekly = aggregateDailyToWeekly(daily)
    expect(weekly[0].date).toBe('2026-04-06')
    expect(weekly[0].expenses).toBe(30)
    expect(weekly[1].date).toBe('2026-04-13')
    expect(weekly[1].expenses).toBe(5)
  })
})

// ─── detectRecurring ──────────────────────────────────────────────────────────

describe('detectRecurring', () => {
  it('returns empty array for empty input', () => {
    expect(detectRecurring([])).toEqual([])
  })

  it('detects transactions that appear in multiple months', () => {
    const txs = [
      makeTx({ description: 'Netflix subscription', date: '2026-01-15' }),
      makeTx({ description: 'Netflix subscription', date: '2026-02-15' }),
      makeTx({ description: 'Netflix subscription', date: '2026-03-15' }),
    ]
    const patterns = detectRecurring(txs)
    expect(patterns.length).toBeGreaterThan(0)
    expect(patterns[0].description).toBe('Netflix subscription')
    expect(patterns[0].occurrences).toBe(3)
  })

  it('ignores single-month repetitions', () => {
    const txs = [
      makeTx({ description: 'Coffee', date: '2026-04-01' }),
      makeTx({ description: 'Coffee', date: '2026-04-02' }),
    ]
    const patterns = detectRecurring(txs)
    expect(patterns).toHaveLength(0)
  })
})

// ─── computeMonthlySeriesForRange ─────────────────────────────────────────────

describe('computeMonthlySeriesForRange', () => {
  it('fills in months with no transactions as zeros', () => {
    const txs = [makeTx({ date: '2026-01-15', amount: 100, type: 'expense' })]
    const series = computeMonthlySeriesForRange(txs, '2026-01', '2026-03')
    expect(series).toHaveLength(3)
    expect(series[1].totalExpenses).toBe(0) // Feb has no data
    expect(series[2].totalExpenses).toBe(0) // Mar has no data
  })

  it('returns data for each month in range', () => {
    const series = computeMonthlySeriesForRange([], '2026-01', '2026-06')
    expect(series).toHaveLength(6)
    expect(series[0].month).toBe('2026-01')
    expect(series[5].month).toBe('2026-06')
  })
})
