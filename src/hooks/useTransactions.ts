/**
 * Hooks for reading and mutating transactions.
 * Uses useLiveQuery from Dexie for reactive updates — any DB change
 * automatically triggers a re-render.
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/db/schema'
import { transactionRepository } from '@/db/repositories/transactionRepository'
import type { Transaction, TransactionFilters } from '@/types'

// ─── Read hooks ───────────────────────────────────────────────────────────────

/** All transactions for a given month, sorted by date desc */
export function useMonthTransactions(month: string): Transaction[] | undefined {
  return useLiveQuery(
    () => transactionRepository.getByMonth(month),
    [month],
  )
}

/** Filtered transaction list (Transactions page) */
export function useFilteredTransactions(filters: TransactionFilters): Transaction[] | undefined {
  return useLiveQuery(
    () => transactionRepository.getFiltered(filters),
    [JSON.stringify(filters)],
  )
}

/** All transactions (used for analytics that span multiple months) */
export function useAllTransactions(): Transaction[] | undefined {
  return useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray())
}

/** Single transaction by ID */
export function useTransaction(id: string): Transaction | undefined {
  return useLiveQuery(() => transactionRepository.getById(id), [id])
}

// ─── Mutation helpers ─────────────────────────────────────────────────────────

export function useTransactionMutations() {
  const create = (transaction: Omit<Transaction, 'id' | 'createdAt'>) =>
    transactionRepository.create(transaction)

  const update = (id: string, patch: Partial<Transaction>) =>
    transactionRepository.update(id, patch)

  const remove = (id: string) => transactionRepository.delete(id)

  const removeByImportSource = (source: string) =>
    transactionRepository.deleteByImportSource(source)

  return { create, update, remove, removeByImportSource }
}

/** Returns all distinct import sources with their transaction count */
export function useImportSources(): { source: string; count: number }[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.transactions.toArray()
    const map = new Map<string, number>()
    for (const t of all) {
      if (!t.importSource) continue
      map.set(t.importSource, (map.get(t.importSource) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.source.localeCompare(a.source))
  })
}
