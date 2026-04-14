import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMacroCategories } from '@/hooks/useCategories'
import { useTransactionMutations } from '@/hooks/useTransactions'
import { useUIStore } from '@/store'
import { formatDate } from '@/lib/utils'
import { haptics } from '@/lib/haptics'
import type { TransactionType } from '@/types'

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'] as const

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

  const amount = parseFloat(amountStr.replace(',', '.')) || 0
  const isValid = amount > 0 && description.trim().length > 0

  const handleNumpad = (key: string) => {
    haptics.light()
    if (key === '⌫') {
      setAmountStr(s => s.slice(0, -1))
    } else if (key === '.' && amountStr.includes('.')) {
      return
    } else if (amountStr.split('.')[1]?.length >= 2) {
      return
    } else {
      setAmountStr(s => (s === '' && key === '0') ? '0' : s + key)
    }
  }

  const handleTypeChange = (t: TransactionType) => {
    haptics.medium()
    setType(t)
  }

  const handleSave = async () => {
    if (!isValid || isSaving) return
    haptics.success()
    setIsSaving(true)
    try {
      await create({
        amount,
        type,
        date,
        description: description.trim(),
        originalCategory: category || 'Manual',
        mappedCategory: category || 'Uncategorized',
      })
      showToast('Transaction saved', 'success')
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
          <div className="px-3 pb-2 grid grid-cols-3 gap-2">
            {NUMPAD_KEYS.map(key => (
              <button
                key={key}
                onClick={() => handleNumpad(key)}
                className={`py-4 rounded-2xl text-xl font-semibold press-scale transition-colors select-none ${
                  key === '⌫'
                    ? 'text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-white/[0.06] active:bg-gray-200 dark:active:bg-white/[0.12]'
                    : 'text-gray-800 dark:text-slate-100 bg-gray-50 dark:bg-white/[0.06] active:bg-gray-200 dark:active:bg-white/[0.14]'
                }`}
              >
                {key === '⌫' ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mx-auto">
                    <path d="M9.914 12 7.5 9.586 8.914 8.172 11.328 10.586 13.742 8.172 15.156 9.586 12.742 12 15.156 14.414 13.742 15.828 11.328 13.414 8.914 15.828 7.5 14.414 9.914 12z"/>
                    <path fillRule="evenodd" d="M9.377 4.5a1.5 1.5 0 00-1.118.502L2.5 12l5.759 6.998A1.5 1.5 0 009.377 19.5H20a1.5 1.5 0 001.5-1.5v-12A1.5 1.5 0 0020 4.5H9.377zM4.11 12l4.96-6.027A.5.5 0 019.377 5.5H20a.5.5 0 01.5.5v12a.5.5 0 01-.5.5H9.377a.5.5 0 01-.373-.165L4.11 12z" clipRule="evenodd"/>
                  </svg>
                ) : key}
              </button>
            ))}
          </div>
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
