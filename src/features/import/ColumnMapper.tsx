/**
 * Step shown when a generic CSV/Excel file is uploaded.
 * Lets the user specify which column maps to date, amount, description, etc.
 */
import { useState } from 'react'
import { Card } from '@/components/Card'
import type { ColumnMapping } from '@/types'

interface ColumnMapperProps {
  columns: string[]
  onConfirm: (mapping: ColumnMapping) => void
  onCancel: () => void
}

const NONE = ''

export function ColumnMapper({ columns, onConfirm, onCancel }: ColumnMapperProps) {
  const [dateCol, setDateCol] = useState(autoDetect(columns, ['date', 'data', 'datum', 'fecha']))
  const [amountCol, setAmountCol] = useState(autoDetect(columns, ['amount', 'importo', 'betrag', 'importe', 'value']))
  const [descCol, setDescCol] = useState(autoDetect(columns, ['description', 'descrizione', 'desc', 'causale', 'memo', 'label', 'name']))
  const [catCol, setCatCol] = useState(autoDetect(columns, ['category', 'categoria', 'type', 'tipo']))
  const [typeCol, setTypeCol] = useState(NONE)
  const [incomeValue, setIncomeValue] = useState('')

  const isValid = dateCol && amountCol && descCol

  const handleConfirm = () => {
    onConfirm({
      dateColumn: dateCol,
      amountColumn: amountCol,
      descriptionColumn: descCol,
      categoryColumn: catCol || undefined,
      typeColumn: typeCol || undefined,
      incomeValue: incomeValue || undefined,
    })
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">Map Columns</h2>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
          Tell us which column in your file corresponds to each field.
        </p>
      </div>

      <Card className="space-y-4">
        <ColumnSelect label="Date *" value={dateCol} columns={columns} onChange={setDateCol} />
        <ColumnSelect
          label="Amount *"
          value={amountCol}
          columns={columns}
          onChange={setAmountCol}
          hint="Negative values = expenses, positive = income"
        />
        <ColumnSelect label="Description *" value={descCol} columns={columns} onChange={setDescCol} />
        <ColumnSelect label="Category" value={catCol} columns={columns} onChange={setCatCol} optional />
        <ColumnSelect
          label="Type column"
          value={typeCol}
          columns={columns}
          onChange={setTypeCol}
          optional
          hint='Column that distinguishes income vs expense (e.g. "C"/"D" or "credit"/"debit")'
        />
        {typeCol && (
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-slate-500 block mb-1">
              Income value in type column
            </label>
            <input
              type="text"
              placeholder='e.g. "C" or "credit" or "income"'
              value={incomeValue}
              onChange={e => setIncomeValue(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary-400"
            />
          </div>
        )}
      </Card>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-white/[0.1] text-sm font-medium text-gray-600 dark:text-slate-400"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={!isValid}
          className="flex-[2] py-3 rounded-2xl bg-primary-500 text-white text-sm font-semibold disabled:opacity-40"
        >
          Parse file
        </button>
      </div>
    </div>
  )
}

interface ColumnSelectProps {
  label: string
  value: string
  columns: string[]
  onChange: (v: string) => void
  optional?: boolean
  hint?: string
}

function ColumnSelect({ label, value, columns, onChange, optional, hint }: ColumnSelectProps) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 dark:text-slate-500 block mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-[#13131e] text-gray-800 dark:text-slate-200 focus:outline-none focus:border-primary-400"
      >
        {optional && <option value="">— not used —</option>}
        {columns.map(col => (
          <option key={col} value={col}>{col}</option>
        ))}
      </select>
      {hint && <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{hint}</p>}
    </div>
  )
}

/** Case-insensitive auto-detect: returns the first column whose name contains any of the candidates */
function autoDetect(columns: string[], candidates: string[]): string {
  const lower = columns.map(c => c.toLowerCase())
  for (const candidate of candidates) {
    const idx = lower.findIndex(c => c.includes(candidate))
    if (idx !== -1) return columns[idx]
  }
  return columns[0] ?? ''
}
