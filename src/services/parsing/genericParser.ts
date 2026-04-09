/**
 * Generic CSV / Excel parser.
 * Used as fallback when no bank-specific parser matches.
 * Requires a ColumnMapping to know which columns correspond to which fields.
 */

import * as XLSX from 'xlsx'
import { formatDate, normalizeCategory } from '@/lib/utils'
import type { IFileParser } from './types'
import type { ColumnMapping, ImportPreview, ParsedTransaction } from '@/types'

function parseAmount(raw: unknown): number {
  const str = String(raw ?? '')
    .replace(/\s/g, '')
    .replace(/[^0-9.,-]/g, '')
    .replace(',', '.')
  return Math.abs(parseFloat(str) || 0)
}

function parseDate(raw: unknown): string {
  const str = String(raw ?? '').trim()

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split('/')
    return `${y}-${m}-${d}`
  }

  // YYYY-MM-DD (already correct)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str

  // MM/DD/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [m, d, y] = str.split('/')
    return `${y}-${m}-${d}`
  }

  // Excel serial
  const num = Number(str)
  if (!isNaN(num) && num > 40000) {
    const parsed = XLSX.SSF.parse_date_code(num)
    return formatDate(new Date(parsed.y, parsed.m - 1, parsed.d))
  }

  return str
}

export class GenericParser implements IFileParser {
  readonly name = 'Generic'
  private mapping: ColumnMapping | null = null

  /** Set before calling parse() */
  setMapping(mapping: ColumnMapping): void {
    this.mapping = mapping
  }

  /** Returns column headers without parsing transactions */
  async detectColumns(file: File): Promise<string[]> {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
    if (rows.length === 0) return []
    return rows[0].map(c => String(c).trim()).filter(Boolean)
  }

  canHandle(_file: File): boolean {
    // Fallback — always returns true; should be last in factory chain
    return true
  }

  async parse(file: File): Promise<ImportPreview> {
    if (!this.mapping) {
      throw new Error('Column mapping required for generic parser. Call setMapping() first.')
    }

    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: '' })

    const m = this.mapping
    const transactions: ParsedTransaction[] = []

    for (const row of rows) {
      const dateRaw = row[m.dateColumn]
      const date = parseDate(dateRaw)
      if (!date) continue

      const amount = parseAmount(row[m.amountColumn])
      if (amount === 0) continue

      const description = String(row[m.descriptionColumn] ?? '').trim()

      let type: 'income' | 'expense' = 'expense'
      if (m.typeColumn && m.incomeValue) {
        type = String(row[m.typeColumn]).trim() === m.incomeValue ? 'income' : 'expense'
      } else {
        // Infer from sign of raw amount
        const raw = parseFloat(
          String(row[m.amountColumn]).replace(',', '.').replace(/[^0-9.-]/g, ''),
        )
        type = raw >= 0 ? 'income' : 'expense'
      }

      const originalCategory = m.categoryColumn
        ? normalizeCategory(String(row[m.categoryColumn] ?? '')) || 'Uncategorized'
        : 'Uncategorized'

      transactions.push({ date, amount, type, description, originalCategory })
    }

    const dates = transactions.map(t => t.date).sort()

    return {
      transactions,
      source: 'Generic CSV/Excel',
      totalCount: transactions.length,
      dateRange: {
        start: dates[0] ?? '',
        end: dates[dates.length - 1] ?? '',
      },
      detectedColumns: Object.keys(rows[0] ?? {}),
    }
  }
}

export const genericParser = new GenericParser()
