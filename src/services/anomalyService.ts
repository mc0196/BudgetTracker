/**
 * Anomaly detection — pure functions, no side effects.
 *
 * Flags expense transactions that are unusually large compared to the
 * historical distribution of their category.
 */

import type { Transaction } from '@/types'

export interface AnomalyInfo {
  /** Typical (median) expense amount for the category */
  typicalAmount: number
  /** How many times larger than typical this transaction is */
  factor: number
  category: string
}

/** Minimum expenses a category needs before anomalies can be assessed */
const MIN_SAMPLES = 5
/** Flag when the amount is more than this multiple of the category median… */
const MEDIAN_FACTOR = 3
/** …or more than mean + this many standard deviations */
const STD_DEVS = 2.5

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

/**
 * Returns a map of transaction id → anomaly info for unusually large expenses.
 *
 * A transaction is anomalous when its category has at least MIN_SAMPLES
 * expenses and the amount exceeds both the median × MEDIAN_FACTOR and
 * mean + STD_DEVS × σ. Income transactions are never flagged.
 */
export function detectAnomalies(transactions: Transaction[]): Map<string, AnomalyInfo> {
  const result = new Map<string, AnomalyInfo>()

  // Group expenses by category
  const byCategory = new Map<string, Transaction[]>()
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    const key = t.mappedCategory || 'Uncategorized'
    if (!byCategory.has(key)) byCategory.set(key, [])
    byCategory.get(key)!.push(t)
  }

  for (const [category, txs] of byCategory) {
    if (txs.length < MIN_SAMPLES) continue

    const amounts = txs.map(t => t.amount).sort((a, b) => a - b)
    const med = median(amounts)
    const mean = amounts.reduce((s, a) => s + a, 0) / amounts.length
    const variance = amounts.reduce((s, a) => s + (a - mean) ** 2, 0) / amounts.length
    const std = Math.sqrt(variance)

    const medianThreshold = med * MEDIAN_FACTOR
    const stdThreshold = mean + STD_DEVS * std

    for (const t of txs) {
      if (t.amount > medianThreshold && t.amount > stdThreshold && med > 0) {
        result.set(t.id, {
          typicalAmount: med,
          factor: t.amount / med,
          category,
        })
      }
    }
  }

  return result
}
