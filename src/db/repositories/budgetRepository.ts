import { db } from '@/db/schema'
import type { IBudgetRepository } from '@/db/interfaces'
import type { Budget } from '@/types'
import { randomId } from '@/lib/utils'

export class DexieBudgetRepository implements IBudgetRepository {
  async getAll(): Promise<Budget[]> {
    return db.budgets.orderBy('month').reverse().toArray()
  }

  async getByMonth(month: string): Promise<Budget[]> {
    return db.budgets.where('month').equals(month).toArray()
  }

  async upsert(budget: Omit<Budget, 'id' | 'createdAt'>): Promise<Budget> {
    // A budget is unique by (month, category)
    const existing = await db.budgets
      .where('month')
      .equals(budget.month)
      .filter(b => b.category === budget.category)
      .first()

    if (existing) {
      await db.budgets.update(existing.id, { limit: budget.limit })
      return { ...existing, limit: budget.limit }
    }

    const record: Budget = {
      ...budget,
      id: randomId(),
      createdAt: new Date().toISOString(),
    }
    await db.budgets.add(record)
    return record
  }

  async delete(id: string): Promise<void> {
    await db.budgets.delete(id)
  }
}

export const budgetRepository = new DexieBudgetRepository()
