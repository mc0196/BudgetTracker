import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMacroCategories } from '@/hooks/useCategories'
import { useTransactionMutations } from '@/hooks/useTransactions'
import { useBudgetAlertCheck } from '@/hooks/useBudget'
import { CategorySuggestions } from '@/features/transactions/CategorySuggestions'
import { Numpad } from '@/features/transactions/Numpad'
import { useUIStore } from '@/store'
import { formatDate } from '@/lib/utils'
import { haptics } from '@/lib/haptics'
import type { TransactionType } from '@/types'

export function AddTransactionPage() {
  const navigate = useNavigate()
  const categories = useMacroCategories()
  const { create } = useTransactionMutations()
  const { showToast } = useUIStore()

  const [type, setType] = useState<TransactionType>('expense')
  const [amountStr, setAmountStr] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(formatDate(new Date()))
  const [isSaving, setIsSaving] = useState(false)

  const checkBudgetAlert = useBudgetAlertCheck(date.slice(0, 7))

  const amount = parseFloat(amountStr.replace(',', '.')) || 0
  const isValid = amount > 0 && description.trim().length > 0

  const handleTypeChange = (t: TransactionType) => {
    haptics.medium()
    setType(t)
  }

  const handleSave = async () => {
    if (!isValid || isSaving) return
    setIsSaving(true)
    // Check thresholds before the write so "before" state is accurate
    const crossed = type === 'expense' ? checkBudgetAlert(amount, category || undefined) : null
    try {
      await create({
        amount,
        type,
        date,
        description: description.trim(),
        originalCategory: category || 'Manual',
        mappedCategory: category || 'Uncategorized',
      })
      if (crossed === 'critical') {
        haptics.warning()
        showToast('Saved — this puts you over your monthly budget', 'error')
      } else if (crossed === 'warning') {
        haptics.warning()
        showToast("Saved — you've passed 80% of your monthly budget", 'info')
      } else {
        haptics.success()
        showToast('Transaction saved', 'success')
      }
      navigate(-1)
    } catch {
      haptics.error()
      showToast('Failed to save transaction', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const isIncome = type === 'income'

  return (
    <div className="flex flex-col h-dvh bg-white dark:bg-[#0b0b13] pt-safe">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.08]">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl text-gray-400 dark:text-slate-500 active:bg-gray-100 dark:active:bg-white/[0.06] press-scale"
          aria-label="Back"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900 dark:text-slate-100">New Transaction</h1>
        <div className="w-9" />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Type toggle + amount hero */}
        <div className={`px-4 pt-5 pb-6 transition-colors duration-300 ${
          isIncome ? 'bg-income-light dark:bg-income-subtle' : 'bg-expense-light dark:bg-expense-subtle'
        }`}>
          {/* Type toggle */}
          <div className="flex rounded-2xl bg-white/50 dark:bg-black/20 p-1 mb-5 w-fit mx-auto">
            {(['expense', 'income'] as const).map(t => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 press-scale ${
                  type === t
                    ? t === 'income'
                      ? 'bg-income text-white shadow-md shadow-income/30'
                      : 'bg-expense text-white shadow-md shadow-expense/30'
                    : 'text-gray-500 dark:text-slate-400'
                }`}
              >
                {t === 'income' ? 'Income' : 'Expense'}
              </button>
            ))}
          </div>

          {/* Amount display */}
          <div className="text-center">
            <div className={`flex items-start justify-center gap-1 ${
              isIncome ? 'text-income-dark dark:text-income-bright' : 'text-expense-dark dark:text-expense-bright'
            }`}>
              <span className="text-2xl font-semibold mt-2 opacity-70">€</span>
              <span className="text-6xl font-bold tabular-nums tracking-tight leading-none">
                {amountStr || '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable fields + numpad */}
        <div className="flex-1 overflow-y-auto">
          {/* Description + category + date */}
          <div className="px-4 py-4 space-y-3">
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-white/[0.04] text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-400/20 transition-colors"
            />

            <CategorySuggestions
              description={description}
              selected={category}
              onSelect={setCategory}
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-3.5 rounded-2xl border border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-[#13131e] text-sm text-gray-700 dark:text-slate-300 focus:outline-none focus:border-primary-400 transition-colors"
              >
                <option value="">Category</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                ))}
              </select>

              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-3.5 rounded-2xl border border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-[#13131e] text-sm text-gray-700 dark:text-slate-300 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>
          </div>

          {/* Numpad */}
          <Numpad value={amountStr} onChange={setAmountStr} />
        </div>

        {/* Save button */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.08] pb-[max(12px,env(safe-area-inset-bottom))]">
          <button
            onClick={handleSave}
            disabled={!isValid || isSaving}
            className={`w-full py-4 rounded-2xl text-base font-semibold press-scale transition-all duration-200 ${
              isValid && !isSaving
                ? isIncome
                  ? 'bg-income text-white shadow-lg shadow-income/25'
                  : 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-slate-600'
            }`}
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
