import Dexie, { type Table } from 'dexie'
import type { Transaction, CategoryMapping, MacroCategory, Budget } from '@/types'

/**
 * Dexie database definition.
 *
 * Version history:
 *   1 – initial schema
 *
 * Index notation:
 *   ++id       → auto-increment primary key (not used here — we use UUID strings)
 *   &id        → unique primary key
 *   [a+b]      → compound index
 *   *tags      → multi-entry index
 */
export class BudgetDatabase extends Dexie {
  transactions!: Table<Transaction, string>
  categoryMappings!: Table<CategoryMapping, string>
  macroCategories!: Table<MacroCategory, string>
  budgets!: Table<Budget, string>

  constructor() {
    super('BudgetTrackerDB')

    this.version(1).stores({
      // Primary key first, then indexed fields
      transactions: '&id, date, type, mappedCategory, originalCategory, importSource',
      categoryMappings: '&id, &originalCategory, mappedCategory',
      macroCategories: '&id, &name',
      budgets: '&id, month, category',
    })
  }
}

// Singleton instance — shared across the app
export const db = new BudgetDatabase()
