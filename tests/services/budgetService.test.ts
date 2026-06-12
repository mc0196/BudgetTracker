import { describe, it, expect } from 'vitest'
import { computeBudgetProgress, getBudgetAlertLevel } from '@/services/budgetService'
import type { Transaction } from '@/types'

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

// ─── computeBudgetProgress ────────────────────────────────────────────────────

describe('computeBudgetProgress', () => {
  it('calculates percentage correctly', () => {
    const txs = [makeTx({ date: '2026-04-10', amount: 500, type: 'expense' })]
    const progress = computeBudgetProgress(txs, '2026-04', 1000)
    expect(progress.spent).toBe(500)
    expect(progress.percentage).toBe(50)
    expect(progress.remaining).toBe(500)
    expect(progress.isOver).toBe(false)
    expect(progress.level).toBe('ok')
  })

  it('caps percentage at 100 when over budget', () => {
    const txs = [makeTx({ date: '2026-04-10', amount: 1500, type: 'expense' })]
    const progress = computeBudgetProgress(txs, '2026-04', 1000)
    expect(progress.percentage).toBe(100)
    expect(progress.isOver).toBe(true)
    expect(progress.remaining).toBe(0)
    expect(progress.level).toBe('critical')
  })

  it('only counts expenses, not income', () => {
    const txs = [
      makeTx({ date: '2026-04-10', amount: 2000, type: 'income' }),
      makeTx({ date: '2026-04-10', amount: 200, type: 'expense' }),
    ]
    const progress = computeBudgetProgress(txs, '2026-04', 1000)
    expect(progress.spent).toBe(200)
  })

  it('filters by category when specified', () => {
    const txs = [
      makeTx({ date: '2026-04-10', amount: 100, type: 'expense', mappedCategory: 'Food & Dining' }),
      makeTx({ date: '2026-04-10', amount: 999, type: 'expense', mappedCategory: 'Transport' }),
    ]
    const progress = computeBudgetProgress(txs, '2026-04', 500, 'Food & Dining')
    expect(progress.spent).toBe(100)
  })

  it('handles zero limit gracefully', () => {
    const txs = [makeTx({ date: '2026-04-10', amount: 100, type: 'expense' })]
    const progress = computeBudgetProgress(txs, '2026-04', 0)
    expect(progress.percentage).toBe(0)
    expect(progress.level).toBe('ok')
  })
})

// ─── getBudgetAlertLevel ──────────────────────────────────────────────────────

describe('getBudgetAlertLevel', () => {
  it('returns ok below 80%', () => {
    expect(getBudgetAlertLevel(0, 1000)).toBe('ok')
    expect(getBudgetAlertLevel(799.99, 1000)).toBe('ok')
  })

  it('returns warning between 80% and 100%', () => {
    expect(getBudgetAlertLevel(800, 1000)).toBe('warning')
    expect(getBudgetAlertLevel(999.99, 1000)).toBe('warning')
  })

  it('returns critical at and above 100%', () => {
    expect(getBudgetAlertLevel(1000, 1000)).toBe('critical')
    expect(getBudgetAlertLevel(1500, 1000)).toBe('critical')
  })

  it('returns ok for zero or negative limit', () => {
    expect(getBudgetAlertLevel(500, 0)).toBe('ok')
    expect(getBudgetAlertLevel(500, -10)).toBe('ok')
  })
})
