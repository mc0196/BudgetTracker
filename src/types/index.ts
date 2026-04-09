// ─── Core domain types ────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense'

/**
 * A single financial event (debit or credit).
 * `amount` is always a positive number; `type` determines direction.
 */
export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  /** ISO date string 'YYYY-MM-DD' */
  date: string
  description: string
  /** Raw category string as it came from the bank */
  originalCategory: string
  /** User-defined macro-category after mapping */
  mappedCategory: string
  /** Which import run produced this record */
  importSource?: string
  notes?: string
  /** ISO timestamp */
  createdAt: string
}

/**
 * Maps a bank-provided category label to a user macro-category.
 */
export interface CategoryMapping {
  id: string
  originalCategory: string
  mappedCategory: string
  createdAt: string
}

/**
 * A user-defined macro-category with visual styling.
 */
export interface MacroCategory {
  id: string
  name: string
  /** Tailwind color token, e.g. "indigo" */
  color: string
  /** Emoji or icon identifier */
  icon: string
  createdAt: string
}

/**
 * A monthly spending budget, optionally scoped to a category.
 * If `category` is undefined, the budget applies to total expenses.
 */
export interface Budget {
  id: string
  /** 'YYYY-MM' */
  month: string
  limit: number
  category?: string
  createdAt: string
}

// ─── Analytics / computed types ───────────────────────────────────────────────

export interface MonthlyStats {
  month: string
  totalIncome: number
  totalExpenses: number
  netBalance: number
  transactionCount: number
}

export interface CategoryStats {
  category: string
  total: number
  count: number
  /** Percentage of total expenses (0-100) */
  percentage: number
  color?: string
}

export interface DailyStats {
  date: string
  income: number
  expenses: number
}

// ─── Import / parsing types ───────────────────────────────────────────────────

/**
 * Raw transaction as parsed from an uploaded file, before ID assignment.
 */
export interface ParsedTransaction {
  date: string
  amount: number
  type: TransactionType
  description: string
  originalCategory: string
}

export interface ImportPreview {
  transactions: ParsedTransaction[]
  /** Human-readable source label, e.g. "Intesa Sanpaolo" */
  source: string
  totalCount: number
  dateRange: {
    start: string
    end: string
  }
  /** Columns detected in the file, used for manual mapping */
  detectedColumns?: string[]
}

/**
 * Describes how raw file columns map to the internal ParsedTransaction fields.
 * Used for generic CSV/Excel imports where the format is unknown.
 */
export interface ColumnMapping {
  dateColumn: string
  amountColumn: string
  descriptionColumn: string
  categoryColumn?: string
  /** Column that indicates income vs expense, or a sign-based detection */
  typeColumn?: string
  /** Which value in typeColumn means income */
  incomeValue?: string
}

// ─── UI helper types ──────────────────────────────────────────────────────────

export type DateRange = {
  start: string
  end: string
}

export type TransactionFilters = {
  dateRange?: DateRange
  category?: string
  type?: TransactionType
  search?: string
}

export type SortDirection = 'asc' | 'desc'
export type SortField = 'date' | 'amount' | 'description' | 'mappedCategory'
