import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/Card'
import { useUIStore } from '@/store'
import { db } from '@/db/schema'

export function DataSettings() {
  const { showToast } = useUIStore()
  const [isClearing, setIsClearing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const jsonInputRef = useRef<HTMLInputElement>(null)

  const handleExport = async () => {
    const transactions = await db.transactions.toArray()
    const json = JSON.stringify(transactions, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budget-tracker-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data exported', 'success')
  }

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setIsImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!Array.isArray(data)) throw new Error('Invalid format — expected a JSON array')
      const valid = data.filter(t =>
        t && typeof t === 'object' &&
        typeof t.id === 'string' &&
        typeof t.amount === 'number' &&
        (t.type === 'income' || t.type === 'expense') &&
        typeof t.date === 'string' &&
        typeof t.description === 'string'
      )
      if (valid.length === 0) throw new Error('No valid transactions found in file')
      // bulkPut: existing ids are updated, new ids are inserted — no duplicates
      await db.transactions.bulkPut(valid)
      showToast(`Imported ${valid.length} transactions`, 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Import failed', 'error')
    } finally {
      setIsImporting(false)
    }
  }

  const handleClearAll = async () => {
    if (!confirm('This will delete ALL transactions. This cannot be undone. Continue?')) return
    setIsClearing(true)
    try {
      await db.transactions.clear()
      await db.categoryMappings.clear()
      await db.budgets.clear()
      showToast('All data cleared', 'info')
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <div className="space-y-3">
      <Card>
        <Link to="/import" className="w-full flex items-center gap-3 py-1 min-h-[44px]">
          <span className="text-xl" aria-hidden>📥</span>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-800 dark:text-slate-200">Import bank statement</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">CSV, XLSX or XLS from your bank</p>
          </div>
        </Link>
      </Card>

      <Card>
        <input
          ref={jsonInputRef}
          type="file"
          accept=".json"
          onChange={handleImportJSON}
          className="hidden"
          disabled={isImporting}
        />
        <button
          onClick={() => jsonInputRef.current?.click()}
          disabled={isImporting}
          className="w-full flex items-center gap-3 py-1 min-h-[44px]"
        >
          <span className="text-xl" aria-hidden>{isImporting ? '⏳' : '📲'}</span>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
              {isImporting ? 'Importing…' : 'Import from JSON'}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">Sync from another device's export</p>
          </div>
        </button>
      </Card>

      <Card>
        <button onClick={handleExport} className="w-full flex items-center gap-3 py-1 min-h-[44px]">
          <span className="text-xl" aria-hidden>📤</span>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-800 dark:text-slate-200">Export data</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">Download all transactions as JSON</p>
          </div>
        </button>
      </Card>

      <Card>
        <button
          onClick={handleClearAll}
          disabled={isClearing}
          className="w-full flex items-center gap-3 py-1 min-h-[44px]"
        >
          <span className="text-xl" aria-hidden>🗑️</span>
          <div className="text-left">
            <p className="text-sm font-medium text-expense">Clear all data</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">Permanently delete all transactions</p>
          </div>
        </button>
      </Card>

      <div className="text-center pt-4">
        <p className="text-xs text-gray-400 dark:text-slate-600">BudgetTracker v0.2.0</p>
        <p className="text-xs text-gray-400 dark:text-slate-600">All data stored locally on your device</p>
      </div>
    </div>
  )
}
