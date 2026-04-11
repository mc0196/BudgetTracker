/**
 * Quick-add transaction page.
 * Designed for one-thumb use: large amount input, minimal friction.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMacroCategories } from '@/hooks/useCategories'
import { useTransactionMutations } from '@/hooks/useTransactions'
import { useUIStore } from '@/store'
import { formatDate } from '@/lib/utils'
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

  const amount = parseFloat(amountStr.replace(',', '.')) || 0
  const isValid = amount > 0 && description.trim().length > 0

  const handleNumpad = (key: string) => {
    if (key === '⌫') {
      setAmountStr(s => s.slice(0, -1))
    } else if (key === '.' && amountStr.includes('.')) {
      return // Only one decimal separator
    } else if (amountStr.split('.')[1]?.length >= 2) {
      return // Max 2 decimal places
    } else {
      setAmountStr(s => s + key)
    }
  }

  const handleSave = async () => {
    if (!isValid || isSaving) return
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
      showToast('Failed to save transaction', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-dvh bg-white dark:bg-[#0b0b13] pt-safe">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 dark:border-white/[0.08]">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
          aria-label="Back"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100">Add Transaction</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Type toggle */}
        <div className="flex rounded-2xl bg-gray-100 dark:bg-white/[0.06] p-1">
          <button
            onClick={() => setType('expense')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              type === 'expense'
                ? 'bg-expense text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-500'
            }`}
          >
            Expense
          </button>
          <button
            onClick={() => setType('income')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              type === 'income'
                ? 'bg-income text-white shadow-sm'
                : 'text-gray-500 dark:text-slate-500'
            }`}
          >
            Income
          </button>
        </div>

        {/* Amount display */}
        <div className="text-center py-4">
          <div className="text-5xl font-bold tabular-nums text-gray-900 dark:text-slate-100">
            <span className="text-2xl text-gray-400 dark:text-slate-500 mr-1">€</span>
            {amountStr || '0'}
          </div>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map(key => (
            <button
              key={key}
              onClick={() => handleNumpad(key)}
              className="py-4 text-xl font-semibold text-gray-800 dark:text-slate-200 bg-gray-50 dark:bg-white/[0.06] rounded-2xl active:bg-gray-200 dark:active:bg-white/[0.12] transition-colors"
            >
              {key}
            </button>
          ))}
        </div>

        {/* Description */}
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] text-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-400/20"
        />

        {/* Category */}
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-[#13131e] text-sm text-gray-700 dark:text-slate-300 focus:outline-none focus:border-primary-400"
        >
          <option value="">Select category (optional)</option>
          {categories?.map(cat => (
            <option key={cat.id} value={cat.name}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>

        {/* Date */}
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-[#13131e] text-sm text-gray-700 dark:text-slate-300 focus:outline-none focus:border-primary-400"
        />
      </div>

      {/* Save button */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-white/[0.08] pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={handleSave}
          disabled={!isValid || isSaving}
          className="w-full py-4 rounded-2xl bg-primary-500 text-white text-base font-semibold disabled:opacity-40 transition-opacity"
        >
          {isSaving ? 'Saving…' : 'Save Transaction'}
        </button>
      </div>
    </div>
  )
}
