import { db } from '@/db/schema'
import type { ITransactionRepository } from '@/db/interfaces'
import type { Transaction, TransactionFilters } from '@/types'
import { randomId } from '@/lib/utils'

export class DexieTransactionRepository implements ITransactionRepository {
  async getAll(): Promise<Transaction[]> {
    return db.transactions.orderBy('date').reverse().toArray()
  }

  async getById(id: string): Promise<Transaction | undefined> {
    return db.transactions.get(id)
  }

  async getByMonth(month: string): Promise<Transaction[]> {
    // month is 'YYYY-MM'; date is 'YYYY-MM-DD'
    const start = `${month}-01`
    const end = `${month}-31`
    return db.transactions
      .where('date')
      .between(start, end, true, true)
      .reverse()
      .sortBy('date')
      .then(rows => rows.reverse())
  }

  async getByDateRange(start: string, end: string): Promise<Transaction[]> {
    return db.transactions
      .where('date')
      .between(start, end, true, true)
      .toArray()
  }

  async getFiltered(filters: TransactionFilters): Promise<Transaction[]> {
    let collection = db.transactions.orderBy('date').reverse()

    // Apply date range
    if (filters.dateRange) {
      const { start, end } = filters.dateRange
      collection = db.transactions
        .where('date')
        .between(start, end, true, true)
        .reverse() as typeof collection
    }

    let results = await collection.toArray()

    if (filters.type) {
      results = results.filter(t => t.type === filters.type)
    }

    if (filters.category) {
      results = results.filter(t => t.mappedCategory === filters.category)
    }

    if (filters.search) {
      const q = filters.search.toLowerCase()
      results = results.filter(
        t =>
          t.description.toLowerCase().includes(q) ||
          t.mappedCategory.toLowerCase().includes(q) ||
          t.originalCategory.toLowerCase().includes(q),
      )
    }

    return results
  }

  async create(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const record: Transaction = {
      ...transaction,
      id: randomId(),
      createdAt: new Date().toISOString(),
    }
    await db.transactions.add(record)
    return record
  }

  async update(id: string, patch: Partial<Transaction>): Promise<Transaction> {
    await db.transactions.update(id, patch)
    const updated = await db.transactions.get(id)
    if (!updated) throw new Error(`Transaction ${id} not found`)
    return updated
  }

  async delete(id: string): Promise<void> {
    await db.transactions.delete(id)
  }

  async bulkCreate(
    transactions: Omit<Transaction, 'id' | 'createdAt'>[],
  ): Promise<Transaction[]> {
    const now = new Date().toISOString()
    const records: Transaction[] = transactions.map(t => ({
      ...t,
      id: randomId(),
      createdAt: now,
    }))
    await db.transactions.bulkAdd(records)
    return records
  }

  async getImportSources(): Promise<string[]> {
    const all = await db.transactions.toArray()
    const sources = new Set(all.map(t => t.importSource).filter(Boolean) as string[])
    return Array.from(sources)
  }

  async getByImportSource(source: string): Promise<Transaction[]> {
    return db.transactions.where('importSource').equals(source).toArray()
  }

  async deleteByImportSource(source: string): Promise<number> {
    const ids = await db.transactions
      .where('importSource')
      .equals(source)
      .primaryKeys() as string[]
    await db.transactions.bulkDelete(ids)
    return ids.length
  }
}

// Singleton export — use this throughout the app
export const transactionRepository = new DexieTransactionRepository()
