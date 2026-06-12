import { describe, it, expect } from 'vitest'
import { detectRecurringTransactions, normalizeDescription } from '@/services/recurringService'
import type { Transaction } from '@/types'

function makeTx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: Math.random().toString(),
    amount: 12.99,
    type: 'expense',
    date: '2026-01-15',
    description: 'NETFLIX.COM',
    originalCategory: 'Subscriptions',
    mappedCategory: 'Entertainment',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

const TODAY = '2026-04-20'

describe('normalizeDescription', () => {
  it('strips numbers and punctuation so monthly variants group together', () => {
    expect(normalizeDescription('NETFLIX 03/26')).toBe(normalizeDescription('NETFLIX 04/26'))
  })

  it('keeps letters and is case-insensitive', () => {
    expect(normalizeDescription('Spotify AB')).toBe(normalizeDescription('SPOTIFY AB'))
  })
})

describe('detectRecurringTransactions', () => {
  it('returns empty array for empty input', () => {
    expect(detectRecurringTransactions([], TODAY)).toEqual([])
  })

  it('detects a monthly subscription with identical amounts (2 occurrences suffice)', () => {
    const txs = [
      makeTx({ date: '2026-02-15' }),
      makeTx({ date: '2026-03-15' }),
    ]
    const items = detectRecurringTransactions(txs, TODAY)
    expect(items).toHaveLength(1)
    expect(items[0].cadence).toBe('monthly')
    expect(items[0].averageAmount).toBeCloseTo(12.99)
    expect(items[0].isActive).toBe(true)
  })

  it('detects monthly cadence with slightly varying dates and amounts', () => {
    const txs = [
      makeTx({ date: '2026-01-14', amount: 55.0, description: 'PALESTRA FIT 01' }),
      makeTx({ date: '2026-02-15', amount: 55.0, description: 'PALESTRA FIT 02' }),
      makeTx({ date: '2026-03-17', amount: 59.0, description: 'PALESTRA FIT 03' }),
    ]
    const items = detectRecurringTransactions(txs, TODAY)
    expect(items).toHaveLength(1)
    expect(items[0].cadence).toBe('monthly')
    expect(items[0].occurrences).toBe(3)
  })

  it('computes nextExpectedDate one interval after the last occurrence', () => {
    const txs = [
      makeTx({ date: '2026-02-15' }),
      makeTx({ date: '2026-03-15' }),
    ]
    const [item] = detectRecurringTransactions(txs, TODAY)
    expect(item.nextExpectedDate).toBe('2026-04-12') // 28 days after 15 March
  })

  it('rejects groups with unstable amounts', () => {
    const txs = [
      makeTx({ date: '2026-01-15', amount: 10, description: 'BAR SPORT' }),
      makeTx({ date: '2026-02-15', amount: 80, description: 'BAR SPORT' }),
      makeTx({ date: '2026-03-15', amount: 25, description: 'BAR SPORT' }),
    ]
    expect(detectRecurringTransactions(txs, TODAY)).toHaveLength(0)
  })

  it('rejects irregular intervals (random purchases at the same shop)', () => {
    const txs = [
      makeTx({ date: '2026-01-02', amount: 20, description: 'ESSELUNGA' }),
      makeTx({ date: '2026-01-05', amount: 20, description: 'ESSELUNGA' }),
      makeTx({ date: '2026-03-28', amount: 20, description: 'ESSELUNGA' }),
    ]
    expect(detectRecurringTransactions(txs, TODAY)).toHaveLength(0)
  })

  it('rejects same-day duplicates', () => {
    const txs = [
      makeTx({ date: '2026-03-15' }),
      makeTx({ date: '2026-03-15' }),
      makeTx({ date: '2026-03-15' }),
    ]
    expect(detectRecurringTransactions(txs, TODAY)).toHaveLength(0)
  })

  it('detects weekly cadence', () => {
    const txs = [
      makeTx({ date: '2026-03-02', amount: 9.5, description: 'LEZIONE YOGA' }),
      makeTx({ date: '2026-03-09', amount: 9.5, description: 'LEZIONE YOGA' }),
      makeTx({ date: '2026-03-16', amount: 9.5, description: 'LEZIONE YOGA' }),
      makeTx({ date: '2026-03-23', amount: 9.5, description: 'LEZIONE YOGA' }),
    ]
    const items = detectRecurringTransactions(txs, TODAY)
    expect(items).toHaveLength(1)
    expect(items[0].cadence).toBe('weekly')
  })

  it('detects yearly cadence with 2 occurrences', () => {
    const txs = [
      makeTx({ date: '2025-04-01', amount: 320, description: 'ASSICURAZIONE AUTO' }),
      makeTx({ date: '2026-04-01', amount: 330, description: 'ASSICURAZIONE AUTO' }),
    ]
    const items = detectRecurringTransactions(txs, TODAY)
    expect(items).toHaveLength(1)
    expect(items[0].cadence).toBe('yearly')
  })

  it('marks a lapsed pattern as inactive', () => {
    const txs = [
      makeTx({ date: '2025-10-15' }),
      makeTx({ date: '2025-11-15' }),
      makeTx({ date: '2025-12-15' }),
    ]
    const [item] = detectRecurringTransactions(txs, TODAY) // ~4 months later
    expect(item.isActive).toBe(false)
  })

  it('keeps income recurrences (salary) separate from expenses', () => {
    const txs = [
      makeTx({ date: '2026-01-27', amount: 1800, type: 'income', description: 'STIPENDIO ACME' }),
      makeTx({ date: '2026-02-27', amount: 1800, type: 'income', description: 'STIPENDIO ACME' }),
      makeTx({ date: '2026-03-27', amount: 1800, type: 'income', description: 'STIPENDIO ACME' }),
    ]
    const items = detectRecurringTransactions(txs, TODAY)
    expect(items).toHaveLength(1)
    expect(items[0].type).toBe('income')
    expect(items[0].cadence).toBe('monthly')
  })
})
