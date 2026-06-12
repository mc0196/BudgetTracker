import { useState } from 'react'
import { Card } from '@/components/Card'
import { useMacroCategories } from '@/hooks/useCategories'
import type { Transaction, TransactionType } from '@/types'

export interface TransactionEditValues {
  amount: number
  description: string
  mappedCategory: string
  date: string
  type: TransactionType
}

interface TransactionEditFormProps {
  transaction: Transaction
  onSave: (values: TransactionEditValues) => void
}

const INPUT_CLASSES =
  'w-full text-sm text-gray-800 dark:text-slate-200 bg-gray-50 dark:bg-[#13131e] rounded-xl px-3 py-2.5 border border-gray-200 dark:border-white/[0.1] focus:outline-none focus:border-primary-400'

export function TransactionEditForm({ transaction, onSave }: TransactionEditFormProps) {
  const categories = useMacroCategories()

  const [amount, setAmount] = useState(transaction.amount.toString())
  const [description, setDescription] = useState(transaction.description)
  const [category, setCategory] = useState(transaction.mappedCategory)
  const [date, setDate] = useState(transaction.date)
  const [type, setType] = useState<TransactionType>(transaction.type)

  const parsedAmount = parseFloat(amount.replace(',', '.'))
  const isValid = !isNaN(parsedAmount) && parsedAmount > 0 && description.trim().length > 0 && !!date

  const handleSave = () => {
    if (!isValid) return
    onSave({
      amount: parsedAmount,
      description: description.trim(),
      mappedCategory: category,
      date,
      type,
    })
  }

  return (
    <div className="space-y-4">
      {/* Type + amount hero */}
      <div className={`rounded-3xl p-6 text-center ${
        type === 'income' ? 'bg-income-light dark:bg-income-subtle' : 'bg-expense-light dark:bg-expense-subtle'
      }`}>
        <div className="flex rounded-2xl bg-white/60 dark:bg-white/[0.08] p-1 w-fit mx-auto">
          {(['expense', 'income'] as const).map(t => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors min-h-[40px] ${
                type === t
                  ? t === 'income' ? 'bg-income text-white' : 'bg-expense text-white'
                  : 'text-gray-500 dark:text-slate-400'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative mt-3">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-medium">€</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            aria-label="Amount in euros"
            className="w-full text-center text-2xl font-bold bg-white/80 dark:bg-white/[0.08] dark:text-slate-100 rounded-2xl py-3 pl-8 pr-4 border-none outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-400/30"
          />
        </div>
      </div>

      {/* Fields */}
      <Card className="space-y-4">
        <label className="block">
          <span className="block text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">Description</span>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={INPUT_CLASSES}
          />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">Category</span>
          <select value={category} onChange={e => setCategory(e.target.value)} className={INPUT_CLASSES}>
            {categories?.map(c => (
              <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
            ))}
            <option value="Uncategorized">❓ Uncategorized</option>
          </select>
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">Date</span>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={INPUT_CLASSES} />
        </label>
      </Card>

      <button
        onClick={handleSave}
        disabled={!isValid}
        className="w-full py-4 rounded-2xl bg-primary-500 text-white text-base font-semibold press-scale disabled:opacity-50"
      >
        Save changes
      </button>
    </div>
  )
}
