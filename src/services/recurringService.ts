/**
 * Recurring transaction detection — pure functions, no side effects.
 *
 * Groups transactions by normalized description, then validates that the
 * group repeats at a regular interval with a stable amount.
 */

import type { Transaction, TransactionType } from '@/types'

export type RecurringCadence = 'weekly' | 'monthly' | 'yearly'

export interface RecurringItem {
  /** Most recent original description of the group */
  description: string
  category: string
  type: TransactionType
  averageAmount: number
  occurrences: number
  cadence: RecurringCadence
  lastDate: string
  nextExpectedDate: string
  /** False when the pattern appears to have lapsed (next occurrence overdue) */
  isActive: boolean
}

/** Amounts must stay within ±20% of the group median */
const AMOUNT_TOLERANCE = 0.2
/** Share of occurrences that must be within amount tolerance */
const MIN_STABLE_SHARE = 0.8

const DAY_MS = 86_400_000

/** Strips numbers/dates so "NETFLIX 03/26" and "NETFLIX 04/26" group together */
export function normalizeDescription(description: string): string {
  return description
    .toLowerCase()
    .replace(/\d+/g, '')
    .replace(/[^\p{L}\s&]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 40)
}

function classifyCadence(medianIntervalDays: number): RecurringCadence | null {
  if (medianIntervalDays >= 5 && medianIntervalDays <= 9) return 'weekly'
  if (medianIntervalDays >= 25 && medianIntervalDays <= 35) return 'monthly'
  if (medianIntervalDays >= 350 && medianIntervalDays <= 380) return 'yearly'
  return null
}

function median(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function addDays(date: string, days: number): string {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + Math.round(days))
  return d.toISOString().slice(0, 10)
}

/**
 * Detects recurring patterns ("Netflix €12.99 — monthly").
 *
 * Requirements per group (same normalized description + type):
 * - at least 3 occurrences (2 for yearly, or 2 with identical amounts)
 * - intervals between occurrences classify as weekly/monthly/yearly
 * - at least 80% of amounts within ±20% of the group median
 *
 * @param today reference date (ISO) for the isActive computation — defaults to now
 */
export function detectRecurringTransactions(
  transactions: Transaction[],
  today: string = new Date().toISOString().slice(0, 10),
): RecurringItem[] {
  const groups = new Map<string, Transaction[]>()

  for (const t of transactions) {
    const norm = normalizeDescription(t.description)
    if (!norm) continue
    const key = `${t.type}|${norm}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(t)
  }

  const items: RecurringItem[] = []

  for (const txs of groups.values()) {
    if (txs.length < 2) continue

    const sorted = [...txs].sort((a, b) => a.date.localeCompare(b.date))

    // Intervals between consecutive occurrences, in days
    const intervals: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      const days =
        (Date.parse(sorted[i].date) - Date.parse(sorted[i - 1].date)) / DAY_MS
      intervals.push(days)
    }
    if (intervals.some(d => d <= 0)) continue // same-day duplicates aren't a cadence

    const medianInterval = median([...intervals].sort((a, b) => a - b))
    const cadence = classifyCadence(medianInterval)
    if (!cadence) continue

    // Amount stability
    const amounts = sorted.map(t => t.amount)
    const medAmount = median([...amounts].sort((a, b) => a - b))
    if (medAmount <= 0) continue
    const stable = amounts.filter(
      a => Math.abs(a - medAmount) / medAmount <= AMOUNT_TOLERANCE,
    )
    if (stable.length / amounts.length < MIN_STABLE_SHARE) continue

    // Occurrence minimums: 2 is enough for yearly or perfectly identical amounts
    const identicalAmounts = new Set(amounts).size === 1
    const minOccurrences = cadence === 'yearly' || identicalAmounts ? 2 : 3
    if (sorted.length < minOccurrences) continue

    const last = sorted[sorted.length - 1]
    const nextExpectedDate = addDays(last.date, medianInterval)
    // Lapsed when the expected occurrence is overdue by more than one interval
    const isActive = today <= addDays(nextExpectedDate, medianInterval)

    items.push({
      description: last.description,
      category: last.mappedCategory,
      type: last.type,
      averageAmount: stable.reduce((s, a) => s + a, 0) / stable.length,
      occurrences: sorted.length,
      cadence,
      lastDate: last.date,
      nextExpectedDate,
      isActive,
    })
  }

  // Most frequent / most expensive first
  return items.sort((a, b) => b.occurrences - a.occurrences || b.averageAmount - a.averageAmount)
}
