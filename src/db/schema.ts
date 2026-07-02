import Dexie, { type Table } from 'dexie'
import type { Transaction, CategoryMapping, MacroCategory, Budget, Subcategory } from '@/types'

/**
 * Dexie database definition.
 *
 * Version history:
 *   1 – initial schema
 *   2 – add `subcategories` table (subcategories feature)
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
  subcategories!: Table<Subcategory, string>

  constructor() {
    super('BudgetTrackerDB')

    this.version(1).stores({
      // Primary key first, then indexed fields
      transactions: '&id, date, type, mappedCategory, originalCategory, importSource',
      categoryMappings: '&id, &originalCategory, mappedCategory',
      macroCategories: '&id, &name',
      budgets: '&id, month, category',
    })

    // v2: add subcategories table. New optional fields on transactions /
    // categoryMappings (mappedSubcategory) are non-indexed, so no store change
    // is needed for them and existing records remain valid (field stays absent).
    this.version(2).stores({
      subcategories: '&id, parentCategoryId, name',
    })
  }
}

// Singleton instance — shared across the app
export const db = new BudgetDatabase()
