import { useState } from 'react'
import { Card } from '@/components/Card'
import { CategoryMappings } from '@/features/settings/CategoryMappings'
import { MacroCategoryEditor } from '@/features/settings/MacroCategoryEditor'
import { ImportHistory } from '@/features/settings/ImportHistory'
import { useBudgetMutations, useMonthBudgets } from '@/hooks/useBudget'
import { useUIStore } from '@/store'
import { currentMonth, formatCurrency } from '@/lib/utils'
import { db } from '@/db/schema'

type SettingsTab = 'categories' | 'mappings' | 'budget' | 'imports' | 'data'

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('categories')

  const TABS: { id: SettingsTab; label: string }[] = [
    { id: 'categories', label: 'Categories' },
    { id: 'mappings', label: 'Mappings' },
    { id: 'budget', label: 'Budget' },
    { id: 'imports', label: 'Imports' },
    { id: 'data', label: 'Data' },
  ]

  return (
    <div>
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-100 bg-white overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              tab === t.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {tab === 'categories' && <MacroCategoryEditor />}
        {tab === 'mappings' && <CategoryMappings />}
        {tab === 'budget' && <BudgetSettings />}
        {tab === 'imports' && <ImportHistory />}
        {tab === 'data' && <DataSettings />}
      </div>
    </div>
  )
}

// ─── Budget settings ──────────────────────────────────────────────────────────

function BudgetSettings() {
  const month = currentMonth()
  const budgets = useMonthBudgets(month)
  const { upsert, remove } = useBudgetMutations()
  const { showToast } = useUIStore()

  const [limitStr, setLimitStr] = useState('')

  const totalBudget = budgets?.find(b => !b.category)

  const handleSave = async () => {
    const limit = parseFloat(limitStr.replace(',', '.'))
    if (isNaN(limit) || limit <= 0) return
    await upsert({ month, limit })
    setLimitStr('')
    showToast('Budget updated', 'success')
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Monthly Budget ({month})</h3>
        {totalBudget && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">Current limit</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {formatCurrency(totalBudget.limit)}
              </span>
              <button
                onClick={() => remove(totalBudget.id)}
                className="text-xs text-expense font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={totalBudget ? 'New limit' : 'Set budget limit'}
              value={limitStr}
              onChange={e => setLimitStr(e.target.value)}
              className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-400"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={!limitStr}
            className="px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </Card>
    </div>
  )
}

// ─── Data management ──────────────────────────────────────────────────────────

function DataSettings() {
  const { showToast } = useUIStore()
  const [isClearing, setIsClearing] = useState(false)

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
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3 py-1"
        >
          <span className="text-xl">📤</span>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-800">Export data</p>
            <p className="text-xs text-gray-400">Download all transactions as JSON</p>
          </div>
        </button>
      </Card>

      <Card>
        <button
          onClick={handleClearAll}
          disabled={isClearing}
          className="w-full flex items-center gap-3 py-1"
        >
          <span className="text-xl">🗑️</span>
          <div className="text-left">
            <p className="text-sm font-medium text-expense">Clear all data</p>
            <p className="text-xs text-gray-400">Permanently delete all transactions</p>
          </div>
        </button>
      </Card>

      <div className="text-center pt-4">
        <p className="text-xs text-gray-300">BudgetTracker v0.1.0</p>
        <p className="text-xs text-gray-300">All data stored locally on your device</p>
      </div>
    </div>
  )
}
