import { useState } from 'react'
import { Card } from '@/components/Card'
import { useBudgetMutations, useMonthBudgets } from '@/hooks/useBudget'
import { useUIStore } from '@/store'
import { haptics } from '@/lib/haptics'
import { currentMonth, formatCurrency } from '@/lib/utils'

export function BudgetSettings() {
  const month = currentMonth()
  const budgets = useMonthBudgets(month)
  const { upsert, remove } = useBudgetMutations()
  const { showToast } = useUIStore()

  const [limitStr, setLimitStr] = useState('')

  const totalBudget = budgets?.find(b => !b.category)

  const handleSave = async () => {
    const limit = parseFloat(limitStr.replace(',', '.'))
    if (isNaN(limit) || limit <= 0) return
    haptics.success()
    await upsert({ month, limit })
    setLimitStr('')
    showToast('Budget updated', 'success')
  }

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Monthly Budget ({month})</h3>
        {totalBudget && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 dark:text-slate-400">Current limit</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                {formatCurrency(totalBudget.limit)}
              </span>
              <button
                onClick={() => remove(totalBudget.id)}
                className="text-xs text-expense font-medium px-2 py-2 -my-2"
              >
                Remove
              </button>
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm">€</span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={totalBudget ? 'New limit' : 'Set budget limit'}
              value={limitStr}
              onChange={e => setLimitStr(e.target.value)}
              aria-label="Monthly budget limit in euros"
              className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary-400"
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
        <p className="mt-3 text-xs text-gray-400 dark:text-slate-500 leading-relaxed">
          You'll see a visual warning on the dashboard when spending passes 80% of the limit.
        </p>
      </Card>
    </div>
  )
}
