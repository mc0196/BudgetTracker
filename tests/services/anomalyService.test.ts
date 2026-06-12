import { describe, it, expect } from 'vitest'
import { detectAnomalies } from '@/services/anomalyService'
import type { Transaction } from '@/types'

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: Math.random().toString(),
    amount: 25,
    type: 'expense',
    date: '2026-03-01',
    description: 'Groceries',
    originalCategory: 'Supermercati',
    mappedCategory: 'Food & Dining',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('detectAnomalies', () => {
  it('returns empty map for empty input', () => {
    expect(detectAnomalies([]).size).toBe(0)
  })

  it('does not flag anything when a category has fewer than 5 samples', () => {
    const txs = [
      makeTx({ amount: 20 }),
      makeTx({ amount: 22 }),
      makeTx({ amount: 25 }),
      makeTx({ amount: 900 }), // would be an outlier, but sample too small
    ]
    expect(detectAnomalies(txs).size).toBe(0)
  })

  it('flags a clear outlier against a stable history', () => {
    const txs = [
      makeTx({ amount: 20 }),
      makeTx({ amount: 25 }),
      makeTx({ amount: 22 }),
      makeTx({ amount: 28 }),
      makeTx({ amount: 24 }),
      makeTx({ id: 'outlier', amount: 450 }),
    ]
    const anomalies = detectAnomalies(txs)
    expect(anomalies.size).toBe(1)
    const info = anomalies.get('outlier')!
    expect(info.category).toBe('Food & Dining')
    expect(info.typicalAmount).toBeCloseTo(24.5, 0)
    expect(info.factor).toBeGreaterThan(10)
  })

  it('does not flag normal variation', () => {
    const txs = [20, 25, 30, 22, 28, 35, 24].map(amount => makeTx({ amount }))
    expect(detectAnomalies(txs).size).toBe(0)
  })

  it('never flags income transactions', () => {
    const txs = [
      ...[1800, 1800, 1800, 1800, 1800].map(amount =>
        makeTx({ amount, type: 'income' as const, mappedCategory: 'Income' })),
      makeTx({ id: 'bonus', amount: 25000, type: 'income', mappedCategory: 'Income' }),
    ]
    expect(detectAnomalies(txs).size).toBe(0)
  })

  it('evaluates each category independently', () => {
    const food = [20, 22, 25, 24, 26].map(amount => makeTx({ amount }))
    const travel = [400, 450, 500, 480, 520].map(amount =>
      makeTx({ amount, mappedCategory: 'Travel' }))
    // 450 is normal for Travel but would be a huge outlier for Food
    const normalTravel = makeTx({ id: 'trip', amount: 450, mappedCategory: 'Travel' })
    const anomalies = detectAnomalies([...food, ...travel, normalTravel])
    expect(anomalies.has('trip')).toBe(false)
  })
})
