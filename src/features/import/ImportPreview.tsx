import { useState } from 'react'
import { Card } from '@/components/Card'
import { TransactionItem, TransactionDivider } from '@/components/TransactionItem'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import type { ImportPreview as ImportPreviewType, ParsedTransaction } from '@/types'


interface ImportPreviewProps {
  preview: ImportPreviewType
  onConfirm: (selected: ParsedTransaction[]) => Promise<void>
  onCancel: () => void
}

export function ImportPreview({ preview, onConfirm, onCancel }: ImportPreviewProps) {
  const [selected, setSelected] = useState<Set<number>>(
    new Set(preview.transactions.map((_, i) => i)),
  )
  const [isImporting, setIsImporting] = useState(false)

  const toggleAll = () => {
    if (selected.size === preview.transactions.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(preview.transactions.map((_, i) => i)))
    }
  }

  const toggle = (idx: number) => {
    const next = new Set(selected)
    if (next.has(idx)) next.delete(idx)
    else next.add(idx)
    setSelected(next)
  }

  const handleConfirm = async () => {
    setIsImporting(true)
    try {
      const selectedTxs = preview.transactions.filter((_, i) => selected.has(i))
      await onConfirm(selectedTxs)
    } finally {
      setIsImporting(false)
    }
  }

  // Convert ParsedTransaction to Transaction shape for display component
  const asTransaction = (pt: ParsedTransaction, id: string) => ({
    ...pt,
    id,
    mappedCategory: pt.originalCategory,
    createdAt: new Date().toISOString(),
  })

  const selectedCount = selected.size

  return (
    <div className="flex flex-col h-full">
      {/* Header summary */}
      <Card className="mx-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-semibold text-gray-800">{preview.source}</p>
            <p className="text-xs text-gray-400">
              {preview.dateRange.start} → {preview.dateRange.end}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{preview.totalCount}</p>
            <p className="text-xs text-gray-400">transactions</p>
          </div>
        </div>

        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 bg-income-light text-income font-medium rounded-full">
            {preview.transactions.filter(t => t.type === 'income').length} income
          </span>
          <span className="px-2 py-1 bg-expense-light text-expense font-medium rounded-full">
            {preview.transactions.filter(t => t.type === 'expense').length} expenses
          </span>
        </div>
      </Card>

      {/* Toggle all */}
      <div className="flex items-center justify-between px-4 py-2 mt-2">
        <p className="text-xs text-gray-500">
          {selectedCount} of {preview.totalCount} selected
        </p>
        <button
          onClick={toggleAll}
          className="text-xs font-medium text-primary-600"
        >
          {selected.size === preview.transactions.length ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      {/* Transaction list */}
      <div className="flex-1 overflow-y-auto px-4 space-y-0">
        <Card padding="none">
          {preview.transactions.map((tx, i) => (
            <div key={i}>
              <div className="flex items-center">
                <label className="pl-4 pr-1 flex-shrink-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(i)}
                    onChange={() => toggle(i)}
                    className="w-4 h-4 rounded text-primary-500"
                  />
                </label>
                <div className="flex-1 min-w-0">
                  <TransactionItem transaction={asTransaction(tx, String(i))} />
                </div>
              </div>
              {i < preview.transactions.length - 1 && <TransactionDivider />}
            </div>
          ))}
        </Card>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-4 bg-white border-t border-gray-100 flex gap-3">
        <button
          onClick={onCancel}
          disabled={isImporting}
          className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={isImporting || selectedCount === 0}
          className="flex-2 flex-grow-[2] py-3 rounded-2xl bg-primary-500 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isImporting ? (
            <>
              <LoadingSpinner size="sm" />
              Importing…
            </>
          ) : (
            `Import ${selectedCount} transactions`
          )}
        </button>
      </div>
    </div>
  )
}
