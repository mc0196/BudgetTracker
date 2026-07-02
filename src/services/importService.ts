/**
 * Import service — orchestrates file parsing, category resolution, and DB persistence.
 */

import { parserFactory } from './parsing/parserFactory'
import { categoryService } from './categoryService'
import { transactionRepository } from '@/db/repositories/transactionRepository'
import type { ParseProgressCallback } from './parsing/types'
import type { ImportPreview, ParsedTransaction, Transaction } from '@/types'
import { formatMonth } from '@/lib/utils'

export interface ImportResult {
  imported: number
  skipped: number
  transactions: Transaction[]
}

/** Progress of the commit step, reported in [0, 100]. */
export interface CommitProgress {
  phase: 'categorizing' | 'saving'
  percent: number
}

export type CommitProgressCallback = (progress: CommitProgress) => void

/** Insert in chunks so progress can be reported on large imports */
const INSERT_CHUNK_SIZE = 200

export class ImportService {
  /**
   * Step 1: Parse a file and return a preview (no DB writes).
   * The preview is shown to the user before they confirm the import.
   */
  async preview(file: File, onProgress?: ParseProgressCallback): Promise<ImportPreview> {
    const parser = await parserFactory.getParser(file)
    return parser.parse(file, onProgress)
  }

  /**
   * Step 2: Commit a previewed import to the database.
   * Applies category mapping, deduplicates against existing records.
   */
  async commit(
    preview: ImportPreview,
    selectedTransactions?: ParsedTransaction[],
    onProgress?: CommitProgressCallback,
  ): Promise<ImportResult> {
    const toImport = selectedTransactions ?? preview.transactions

    // Warm the category cache for fast resolution
    onProgress?.({ phase: 'categorizing', percent: 0 })
    await categoryService.warm()

    // Resolve mapped categories (and learned/suggested subcategories) for all transactions
    const mappings = await categoryService.batchResolve(toImport)
    const mappingMap = new Map(
      mappings.map(m => [m.original, { mapped: m.mapped, subcategory: m.subcategory }]),
    )
    onProgress?.({ phase: 'categorizing', percent: 100 })

    // Deduplicate: skip exact duplicates (same date, amount, description)
    const existing = await transactionRepository.getAll()
    const existingKeys = new Set(
      existing.map(t => `${t.date}|${t.amount}|${t.description}`),
    )

    const newTransactions = toImport.filter(
      t => !existingKeys.has(`${t.date}|${t.amount}|${t.description}`),
    )

    const skipped = toImport.length - newTransactions.length

    // Persist in chunks so progress is visible on large files
    const importSource = `${preview.source} — ${formatMonth(new Date())}`
    const toInsert = newTransactions.map(t => {
      const resolved = mappingMap.get(t.originalCategory)
      return {
        ...t,
        mappedCategory: resolved?.mapped ?? 'Uncategorized',
        mappedSubcategory: resolved?.subcategory,
        importSource,
      }
    })

    const records: Transaction[] = []
    onProgress?.({ phase: 'saving', percent: 0 })
    for (let i = 0; i < toInsert.length; i += INSERT_CHUNK_SIZE) {
      const chunk = toInsert.slice(i, i + INSERT_CHUNK_SIZE)
      records.push(...(await transactionRepository.bulkCreate(chunk)))
      onProgress?.({ phase: 'saving', percent: Math.min(((i + chunk.length) / Math.max(toInsert.length, 1)) * 100, 100) })
    }

    return { imported: records.length, skipped, transactions: records }
  }
}

export const importService = new ImportService()
