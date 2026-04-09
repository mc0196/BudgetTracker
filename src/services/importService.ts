/**
 * Import service — orchestrates file parsing, category resolution, and DB persistence.
 */

import { parserFactory } from './parsing/parserFactory'
import { categoryService } from './categoryService'
import { transactionRepository } from '@/db/repositories/transactionRepository'
import type { ImportPreview, ParsedTransaction, Transaction } from '@/types'
import { formatMonth } from '@/lib/utils'

export interface ImportResult {
  imported: number
  skipped: number
  transactions: Transaction[]
}

export class ImportService {
  /**
   * Step 1: Parse a file and return a preview (no DB writes).
   * The preview is shown to the user before they confirm the import.
   */
  async preview(file: File): Promise<ImportPreview> {
    const parser = await parserFactory.getParser(file)
    return parser.parse(file)
  }

  /**
   * Step 2: Commit a previewed import to the database.
   * Applies category mapping, deduplicates against existing records.
   */
  async commit(
    preview: ImportPreview,
    selectedTransactions?: ParsedTransaction[],
  ): Promise<ImportResult> {
    const toImport = selectedTransactions ?? preview.transactions

    // Warm the category cache for fast resolution
    await categoryService.warm()

    // Resolve mapped categories for all transactions
    const mappings = await categoryService.batchResolve(toImport)
    const mappingMap = new Map(mappings.map(m => [m.original, m.mapped]))

    // Deduplicate: skip exact duplicates (same date, amount, description)
    const existing = await transactionRepository.getAll()
    const existingKeys = new Set(
      existing.map(t => `${t.date}|${t.amount}|${t.description}`),
    )

    const newTransactions = toImport.filter(
      t => !existingKeys.has(`${t.date}|${t.amount}|${t.description}`),
    )

    const skipped = toImport.length - newTransactions.length

    // Persist
    const importSource = `${preview.source} — ${formatMonth(new Date())}`
    const records = await transactionRepository.bulkCreate(
      newTransactions.map(t => ({
        ...t,
        mappedCategory: mappingMap.get(t.originalCategory) ?? 'Uncategorized',
        importSource,
      })),
    )

    return { imported: records.length, skipped, transactions: records }
  }
}

export const importService = new ImportService()
