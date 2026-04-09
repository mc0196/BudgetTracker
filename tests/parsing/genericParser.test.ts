import { describe, it, expect, beforeEach } from 'vitest'
import * as XLSX from 'xlsx'
import { GenericParser } from '@/services/parsing/genericParser'
import type { ColumnMapping } from '@/types'

function makeExcelFile(rows: Record<string, unknown>[]): File {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return new File([buffer], 'data.xlsx')
}

describe('GenericParser', () => {
  let parser: GenericParser

  beforeEach(() => {
    parser = new GenericParser()
  })

  it('detects columns from Excel file', async () => {
    const file = makeExcelFile([{ Date: '2026-04-01', Amount: 100, Description: 'Test' }])
    const cols = await parser.detectColumns(file)
    expect(cols).toContain('Date')
    expect(cols).toContain('Amount')
    expect(cols).toContain('Description')
  })

  it('requires setMapping before parse', async () => {
    const file = makeExcelFile([{ Date: '2026-04-01', Amount: 100, Description: 'Test' }])
    await expect(parser.parse(file)).rejects.toThrow(/mapping required/)
  })

  it('parses basic Excel with sign-based income detection', async () => {
    const mapping: ColumnMapping = {
      dateColumn: 'Date',
      amountColumn: 'Amount',
      descriptionColumn: 'Description',
    }
    parser.setMapping(mapping)

    const file = makeExcelFile([
      { Date: '2026-04-01', Amount: 100, Description: 'Salary' },
      { Date: '2026-04-02', Amount: -50, Description: 'Grocery' },
    ])

    const preview = await parser.parse(file)
    expect(preview.transactions).toHaveLength(2)
    expect(preview.transactions[0].type).toBe('income')
    expect(preview.transactions[0].amount).toBe(100)
    expect(preview.transactions[1].type).toBe('expense')
    expect(preview.transactions[1].amount).toBe(50)
  })

  it('uses typeColumn + incomeValue for type detection', async () => {
    const mapping: ColumnMapping = {
      dateColumn: 'Date',
      amountColumn: 'Amount',
      descriptionColumn: 'Desc',
      typeColumn: 'Type',
      incomeValue: 'C',
    }
    parser.setMapping(mapping)

    const file = makeExcelFile([
      { Date: '2026-04-01', Amount: 500, Desc: 'Payment', Type: 'C' },
      { Date: '2026-04-02', Amount: 30, Desc: 'Coffee', Type: 'D' },
    ])

    const preview = await parser.parse(file)
    expect(preview.transactions[0].type).toBe('income')
    expect(preview.transactions[1].type).toBe('expense')
  })

  it('skips rows with zero amount', async () => {
    parser.setMapping({
      dateColumn: 'Date',
      amountColumn: 'Amount',
      descriptionColumn: 'Desc',
    })

    const file = makeExcelFile([
      { Date: '2026-04-01', Amount: 0, Desc: 'Empty' },
      { Date: '2026-04-02', Amount: 100, Desc: 'Real' },
    ])

    const preview = await parser.parse(file)
    expect(preview.transactions).toHaveLength(1)
  })
})
