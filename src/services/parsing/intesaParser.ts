/**
 * Parser for Intesa Sanpaolo CSV/XLS/XLSX exports.
 *
 * Supports two known export formats:
 *
 * ── Classic (web banking statement) ──────────────────────────────────────────
 *   "Data Contabile" | "Data Valuta" | "Descrizione Operazione" |
 *   "Accrediti (€)" | "Addebiti (€)" | "Valuta" | "Saldo (€)"
 *
 * ── App / nuovo portale (2025-2026) ──────────────────────────────────────────
 *   "Data" | "Operazione" | "Dettagli" | "Conto o carta" |
 *   "Contabilizzazione" | "Categoria" | "Valuta" | "Importo"
 *   - Date: DD/MM/YY (2-digit year)
 *   - Importo: signed, negative = expense
 */

import * as XLSX from 'xlsx'
import { formatDate, normalizeCategory } from '@/lib/utils'
import type { IFileParser } from './types'
import type { ImportPreview, ParsedTransaction } from '@/types'

// ─── Column aliases (lowercase) ───────────────────────────────────────────────

const DATE_COLS   = ['data contabile', 'data', 'data operazione']
const CREDIT_COLS = ['accrediti', 'accrediti (€)', 'accredito']
const DEBIT_COLS  = ['addebiti', 'addebiti (€)', 'addebito']
const AMOUNT_COLS = ['importo', 'amount']
const DESC_COLS   = ['operazione', 'descrizione operazione', 'descrizione', 'causale', 'description']
const CAT_COLS    = ['categoria', 'category', 'tipo operazione']

function findColIdx(headers: string[], candidates: string[]): number {
  return headers.findIndex(h => candidates.includes(h.toLowerCase().trim()))
}

// ─── Date parsing ─────────────────────────────────────────────────────────────

function parseItalianDate(raw: unknown): string {
  if (raw === null || raw === undefined) return ''
  const trimmed = String(raw).trim()
  if (!trimmed) return ''

  // DD/MM/YYYY — classic 4-digit year
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/')
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  // DD/MM/YY — new app format ("28/02/26" → 2026)
  if (/^\d{2}\/\d{2}\/\d{2}$/.test(trimmed)) {
    const [d, m, yy] = trimmed.split('/')
    const year = parseInt(yy, 10)
    const fullYear = year <= 49 ? 2000 + year : 1900 + year
    return `${fullYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  // YYYY-MM-DD — already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed

  // Excel serial number
  const num = Number(trimmed)
  if (!isNaN(num) && num > 40_000) {
    try {
      const parsed = XLSX.SSF.parse_date_code(num)
      return formatDate(new Date(parsed.y, parsed.m - 1, parsed.d))
    } catch {
      return ''
    }
  }

  return ''
}

// ─── Amount parsing ───────────────────────────────────────────────────────────

function parseAmount(raw: unknown): number {
  if (typeof raw === 'number') return Math.abs(raw)
  const str = String(raw ?? '').trim().replace(/\s/g, '')
  if (!str) return 0
  // Strip currency symbols / non-relevant chars, keep digits and separators
  const digits = str.replace(/[^0-9.,]/g, '')
  if (!digits) return 0
  // Italian: "1.234,56" — strip thousands dot, swap decimal comma
  if (digits.includes(',')) return Math.abs(parseFloat(digits.replace(/\./g, '').replace(',', '.')) || 0)
  // English / plain: "87.5"
  return Math.abs(parseFloat(digits) || 0)
}

function parseSignedAmount(raw: unknown): number {
  if (typeof raw === 'number') return raw
  const str = String(raw ?? '').trim().replace(/\s/g, '')
  if (!str) return 0
  // Detect negative sign before stripping (leading/trailing minus or parentheses)
  const negative = /^[-−(]/.test(str) || /[-−)]$/.test(str)
  const digits = str.replace(/[^0-9.,]/g, '')
  if (!digits) return 0
  let val: number
  if (digits.includes(',')) {
    val = parseFloat(digits.replace(/\./g, '').replace(',', '.')) || 0
  } else {
    val = parseFloat(digits) || 0
  }
  return negative ? -val : val
}

// ─── Sheet reading ────────────────────────────────────────────────────────────

/**
 * Reads ALL rows from a worksheet as a 2D array of raw cell values.
 * Uses explicit range decoding to avoid any row-skipping behaviour of
 * sheet_to_json (which can be confused by merged cells or unusual ranges).
 */
function readAllRows(ws: XLSX.WorkSheet): unknown[][] {
  const ref = ws['!ref']
  if (!ref) return []

  const range = XLSX.utils.decode_range(ref)
  const rows: unknown[][] = []

  for (let R = range.s.r; R <= range.e.r; R++) {
    const row: unknown[] = []
    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C })
      const cell = ws[addr]
      if (!cell) {
        row.push('')
      } else if (cell.t === 'n') {
        // Numeric cells: use raw value to avoid currency symbols in formatted text (cell.w).
        // parseItalianDate() handles Excel date serials; parseSignedAmount/parseAmount
        // handle JS numbers directly.
        row.push(cell.v)
      } else {
        // Text / boolean / error cells: formatted text preferred
        row.push(cell.w !== undefined ? cell.w : cell.v)
      }
    }
    rows.push(row)
  }

  return rows
}

// ─── Parser ───────────────────────────────────────────────────────────────────

export class IntesaParser implements IFileParser {
  readonly name = 'Intesa Sanpaolo'

  canHandle(file: File, rawText?: string): boolean {
    const lower = file.name.toLowerCase()
    if (lower.includes('intesa') || lower.includes('sanpaolo')) return true

    if (rawText) {
      const head = rawText.slice(0, 3000).toLowerCase()
      if (
        head.includes('intesa sanpaolo') ||
        head.includes('data contabile') ||
        (head.includes('operazione') && head.includes('contabilizzazione'))
      ) return true
    }

    // Default: try Intesa parser for all XLS/XLSX files; falls back to
    // generic column mapper in ImportPage if header detection fails.
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'xls' || ext === 'xlsx') return true

    return false
  }

  async parse(file: File): Promise<ImportPreview> {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array', cellDates: false })

    // Try every sheet — Intesa sometimes puts data on Sheet2+
    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName]
      const result = this.#tryParseSheet(ws, sheetName)
      if (result !== null) return result
    }

    throw new Error(
      'Could not find the transaction table in this Intesa Sanpaolo file. ' +
      'Make sure you export the full account statement (not just a summary). ' +
      `Sheets found: ${wb.SheetNames.join(', ')}`,
    )
  }

  #tryParseSheet(ws: XLSX.WorkSheet, _sheetName: string): ImportPreview | null {
    const raw = readAllRows(ws)
    if (raw.length === 0) return null

    // ── Find header row ──────────────────────────────────────────────────────
    // The metadata section at the top contains "Data inizio periodo:" etc.
    // so we require BOTH a date column AND an amount or description column
    // to positively identify the actual transaction-table header row.
    const AMOUNT_OR_DESC = [...AMOUNT_COLS, ...CREDIT_COLS, ...DEBIT_COLS, ...DESC_COLS]

    let headerRowIdx = -1
    const searchLimit = Math.min(raw.length, 100)

    for (let i = 0; i < searchLimit; i++) {
      const cells = raw[i].map(c => String(c ?? '').toLowerCase().trim())
      const hasDate   = DATE_COLS.some(dc => cells.includes(dc))
      const hasAmount = AMOUNT_OR_DESC.some(ac => cells.includes(ac))
      if (hasDate && hasAmount) {
        headerRowIdx = i
        break
      }
    }

    if (headerRowIdx === -1) return null

    // ── Resolve column indices ───────────────────────────────────────────────
    const headers = raw[headerRowIdx].map(c => String(c ?? ''))

    const dateIdx   = findColIdx(headers, DATE_COLS)
    const creditIdx = findColIdx(headers, CREDIT_COLS)
    const debitIdx  = findColIdx(headers, DEBIT_COLS)
    const amountIdx = findColIdx(headers, AMOUNT_COLS)
    const descIdx   = findColIdx(headers, DESC_COLS)
    const catIdx    = findColIdx(headers, CAT_COLS)

    if (dateIdx === -1) return null
    if (descIdx === -1 && creditIdx === -1 && amountIdx === -1) return null

    // ── Parse rows ───────────────────────────────────────────────────────────
    const transactions: ParsedTransaction[] = []

    for (let i = headerRowIdx + 1; i < raw.length; i++) {
      const row = raw[i]

      // Parse date — skip rows with no valid date
      const date = parseItalianDate(row[dateIdx])
      if (!date) continue

      // Description — use empty string if missing (don't skip the row)
      const description = String(row[descIdx] ?? '').trim()

      // Amount & type
      let amount = 0
      let type: 'income' | 'expense'

      if (creditIdx !== -1 || debitIdx !== -1) {
        // Classic format: separate Accrediti / Addebiti
        const credit = creditIdx !== -1 ? parseAmount(row[creditIdx]) : 0
        const debit  = debitIdx  !== -1 ? parseAmount(row[debitIdx])  : 0
        if (credit > 0) { amount = credit; type = 'income' }
        else            { amount = debit;  type = 'expense' }
      } else {
        // New app format: single signed Importo
        const signed = parseSignedAmount(row[amountIdx])
        amount = Math.abs(signed)
        type = signed >= 0 ? 'income' : 'expense'
      }

      if (amount === 0) continue

      const originalCategory =
        catIdx !== -1
          ? normalizeCategory(String(row[catIdx] ?? '')) || 'Uncategorized'
          : 'Uncategorized'

      transactions.push({ date, amount, type, description, originalCategory })
    }

    if (transactions.length === 0) return null

    const dates = transactions.map(t => t.date).sort()

    return {
      transactions,
      source: this.name,
      totalCount: transactions.length,
      dateRange: { start: dates[0], end: dates[dates.length - 1] },
    }
  }
}

export const intesaParser = new IntesaParser()
