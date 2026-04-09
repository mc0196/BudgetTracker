/**
 * Unit tests for the Intesa Sanpaolo parser.
 * We construct minimal XLSX buffers in-memory using SheetJS.
 */

import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { IntesaParser } from '@/services/parsing/intesaParser'

// ─── Helper: build a fake Intesa export file ──────────────────────────────────

function makeIntesaFile(
  rows: Record<string, string | number>[],
  includeMetaRows = true,
): File {
  const wb = XLSX.utils.book_new()

  const sheetData: unknown[][] = []

  if (includeMetaRows) {
    // Intesa exports have a few header rows before the data table
    sheetData.push(['Estratto conto Intesa Sanpaolo'])
    sheetData.push(['IBAN', 'IT00 0000 0000 0000 0000 0000 000'])
    sheetData.push([]) // blank row
  }

  // Column headers
  sheetData.push([
    'Data Contabile',
    'Data Valuta',
    'Descrizione Operazione',
    'Accrediti (€)',
    'Addebiti (€)',
    'Valuta',
    'Saldo (€)',
  ])

  // Data rows
  for (const row of rows) {
    sheetData.push([
      row.date ?? '01/04/2026',
      row.date ?? '01/04/2026',
      row.description ?? 'Test',
      row.credit ?? '',
      row.debit ?? '',
      'EUR',
      0,
    ])
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetData)
  XLSX.utils.book_append_sheet(wb, ws, 'Movimenti')

  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return new File([buffer], 'estratto.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('IntesaParser.canHandle', () => {
  const parser = new IntesaParser()

  it('detects file by name', () => {
    const f = new File([], 'intesa_movimenti.xlsx')
    expect(parser.canHandle(f)).toBe(true)
  })

  it('detects file by content', () => {
    const f = new File([], 'movimenti.csv')
    const preview = 'Data Contabile;Descrizione;Accrediti'
    expect(parser.canHandle(f, preview)).toBe(true)
  })

  it('returns true for any .xlsx file (default bank format)', () => {
    // All XLS/XLSX files are tried as Intesa first; if parsing fails the
    // import flow falls back to the generic column mapper.
    const f = new File([], 'random.xlsx')
    expect(parser.canHandle(f, 'name,amount,date')).toBe(true)
  })

  it('returns false for non-Excel, non-Intesa CSV files', () => {
    const f = new File([], 'random.csv')
    expect(parser.canHandle(f, 'name,amount,date')).toBe(false)
  })
})

describe('IntesaParser.parse', () => {
  const parser = new IntesaParser()

  it('parses a standard credit row as income', async () => {
    const file = makeIntesaFile([
      { date: '01/04/2026', description: 'Accredito stipendio', credit: 2500, debit: '' },
    ])
    const preview = await parser.parse(file)
    expect(preview.transactions).toHaveLength(1)
    expect(preview.transactions[0].type).toBe('income')
    expect(preview.transactions[0].amount).toBe(2500)
    expect(preview.transactions[0].description).toBe('Accredito stipendio')
  })

  it('parses a debit row as expense', async () => {
    const file = makeIntesaFile([
      { date: '05/04/2026', description: 'Esselunga', credit: '', debit: 87.5 },
    ])
    const preview = await parser.parse(file)
    expect(preview.transactions[0].type).toBe('expense')
    expect(preview.transactions[0].amount).toBe(87.5)
  })

  it('converts DD/MM/YYYY dates to ISO format', async () => {
    const file = makeIntesaFile([
      { date: '15/03/2026', description: 'Test', debit: 10 },
    ])
    const preview = await parser.parse(file)
    expect(preview.transactions[0].date).toBe('2026-03-15')
  })

  it('skips blank rows', async () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([
      ['Data Contabile', 'Data Valuta', 'Descrizione Operazione', 'Accrediti (€)', 'Addebiti (€)', 'Valuta'],
      ['01/04/2026', '01/04/2026', 'Spesa', '', 50, 'EUR'],
      ['', '', '', '', '', ''], // blank
      ['02/04/2026', '02/04/2026', 'Stipendio', 2000, '', 'EUR'],
    ])
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
    const file = new File([buffer], 'test.xlsx')

    const preview = await parser.parse(file)
    expect(preview.transactions).toHaveLength(2)
  })

  it('skips metadata rows and finds the real header even if "data" appears early', async () => {
    // Simulate the real Intesa export: metadata rows contain "data inizio periodo"
    // before the actual transaction table header
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([
      ['INTESA SANPAOLO'],
      ['Conto e Carta:', 'IT00 0000 0000 0000'],
      [''],
      ['I movimenti selezionati sono:', '58'],
      ['Data inizio periodo:', '01/01/2026'],       // ← "data" here but NOT a table header
      ['Data fine periodo:', '28/02/2026'],
      [''],
      // Actual transaction table header starts here (row index 7)
      ['Data', 'Operazione', 'Dettagli', 'Conto o carta', 'Contabilizzazione', 'Categoria', 'Valuta', 'Importo'],
      ['28/02/26', 'Esselunga', 'Dettagli...', 'Conto', 'CONTABILIZZATO', 'Supermarket', 'EUR', '-55,20'],
      ['15/01/26', 'Trenitalia', 'Dettagli...', 'Conto', 'CONTABILIZZATO', 'Transport', 'EUR', '-32,00'],
    ])
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
    const file = new File([buffer], 'estratto.xlsx')

    const preview = await parser.parse(file)
    expect(preview.transactions).toHaveLength(2)
    expect(preview.transactions[0].date).toBe('2026-02-28')
    expect(preview.transactions[1].date).toBe('2026-01-15')
    expect(preview.transactions[0].amount).toBe(55.20)
    expect(preview.transactions[1].amount).toBe(32.00)
  })

  it('correctly populates dateRange', async () => {
    const file = makeIntesaFile([
      { date: '01/03/2026', description: 'A', debit: 10 },
      { date: '31/03/2026', description: 'B', debit: 20 },
    ])
    const preview = await parser.parse(file)
    expect(preview.dateRange.start).toBe('2026-03-01')
    expect(preview.dateRange.end).toBe('2026-03-31')
  })

  it('throws if no data table found', async () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet([['Random', 'Data'], ['A', 'B']])
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
    const file = new File([buffer], 'bad.xlsx')

    await expect(parser.parse(file)).rejects.toThrow()
  })

  it('skips rows with zero amount', async () => {
    const file = makeIntesaFile([
      { date: '01/04/2026', description: 'Zero transaction', credit: 0, debit: 0 },
      { date: '02/04/2026', description: 'Real transaction', debit: 50 },
    ])
    const preview = await parser.parse(file)
    expect(preview.transactions).toHaveLength(1)
  })
})
