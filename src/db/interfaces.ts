/**
 * Repository interfaces.
 *
 * Both the local Dexie implementation and a future Convex-backed
 * implementation must satisfy these contracts. This allows swapping the
 * storage layer without touching any business logic or UI code.
 */

import type {
  Transaction,
  CategoryMapping,
  MacroCategory,
  Budget,
  TransactionFilters,
} from '@/types'

// ─── Transaction repository ───────────────────────────────────────────────────

export interface ITransactionRepository {
  getAll(): Promise<Transaction[]>
  getById(id: string): Promise<Transaction | undefined>
  getByMonth(month: string): Promise<Transaction[]>
  getByDateRange(start: string, end: string): Promise<Transaction[]>
  getFiltered(filters: TransactionFilters): Promise<Transaction[]>
  create(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction>
  update(id: string, patch: Partial<Transaction>): Promise<Transaction>
  delete(id: string): Promise<void>
  bulkCreate(transactions: Omit<Transaction, 'id' | 'createdAt'>[]): Promise<Transaction[]>
  /** Returns all distinct import source labels */
  getImportSources(): Promise<string[]>
  /** Returns all transactions from a specific import */
  getByImportSource(source: string): Promise<Transaction[]>
  /** Deletes all transactions from a specific import */
  deleteByImportSource(source: string): Promise<number>
}

// ─── Category mapping repository ─────────────────────────────────────────────

export interface ICategoryMappingRepository {
  getAll(): Promise<CategoryMapping[]>
  getByOriginal(originalCategory: string): Promise<CategoryMapping | undefined>
  upsert(originalCategory: string, mappedCategory: string): Promise<CategoryMapping>
  delete(id: string): Promise<void>
  bulkUpsert(mappings: Array<{ originalCategory: string; mappedCategory: string }>): Promise<void>
}

// ─── Macro-category repository ────────────────────────────────────────────────

export interface IMacroCategoryRepository {
  getAll(): Promise<MacroCategory[]>
  getByName(name: string): Promise<MacroCategory | undefined>
  create(category: Omit<MacroCategory, 'id' | 'createdAt'>): Promise<MacroCategory>
  update(id: string, patch: Partial<MacroCategory>): Promise<MacroCategory>
  delete(id: string): Promise<void>
}

// ─── Budget repository ────────────────────────────────────────────────────────

export interface IBudgetRepository {
  getAll(): Promise<Budget[]>
  getByMonth(month: string): Promise<Budget[]>
  upsert(budget: Omit<Budget, 'id' | 'createdAt'>): Promise<Budget>
  delete(id: string): Promise<void>
}
