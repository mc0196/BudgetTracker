import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTransaction, useTransactionMutations } from '@/hooks/useTransactions'
import { useMacroCategories } from '@/hooks/useCategories'
import { useUIStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { PageLoader } from '@/components/LoadingSpinner'
import { Card } from '@/components/Card'
import type { TransactionType } from '@/types'

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const transaction = useTransaction(id!)
  const categories = useMacroCategories()
  const { update, remove } = useTransactionMutations()
  const { showToast } = useUIStore()

  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editType, setEditType] = useState<TransactionType>('expense')

  if (!transaction) return <PageLoader />

  const startEdit = () => {
    setEditAmount(transaction.amount.toString())
    setEditDescription(transaction.description)
    setEditCategory(transaction.mappedCategory)
    setEditDate(transaction.date)
    setEditType(transaction.type)
    setIsEditing(true)
  }

  const handleSave = async () => {
    const amount = parseFloat(editAmount.replace(',', '.'))
    if (isNaN(amount) || amount <= 0) return
    await update(transaction.id, {
      amount,
      description: editDescription.trim(),
      mappedCategory: editCategory,
      date: editDate,
      type: editType,
    })
    showToast('Transaction updated', 'success')
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setIsDeleting(true)
    try {
      await remove(transaction.id)
      showToast('Transaction deleted', 'info')
      navigate(-1)
    } catch {
      showToast('Delete failed', 'error')
      setIsDeleting(false)
    }
  }

  const isIncome = isEditing ? editType === 'income' : transaction.type === 'income'
  const dateLabel = format(parseISO(transaction.date), 'EEEE, d MMMM yyyy')

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50 dark:bg-[#0b0b13] pt-[env(safe-area-inset-top)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white dark:bg-[#1a1a28] border-b border-gray-100 dark:border-white/[0.08]">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-xl text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
          aria-label="Back"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900 dark:text-slate-100">Transaction</h1>
        {!isEditing ? (
          <button
            onClick={startEdit}
            className="text-sm font-medium text-primary-600 dark:text-primary-400 px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-400/10"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm font-medium text-gray-500 dark:text-slate-500 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.06]"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="flex-1 px-4 py-5 space-y-4">
        {/* Amount hero */}
        <div className={`rounded-3xl p-6 text-center ${
          isIncome
            ? 'bg-income-light dark:bg-income-subtle'
            : 'bg-expense-light dark:bg-expense-subtle'
        }`}>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex rounded-2xl bg-white/60 dark:bg-white/[0.08] p-1 w-fit mx-auto">
                {(['expense', 'income'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setEditType(t)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                      editType === t
                        ? t === 'income' ? 'bg-income text-white' : 'bg-expense text-white'
                        : 'text-gray-500 dark:text-slate-400'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <div className="relative mt-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-slate-400 font-medium">€</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editAmount}
                  onChange={e => setEditAmount(e.target.value)}
                  className="w-full text-center text-2xl font-bold bg-white/80 dark:bg-white/[0.08] dark:text-slate-100 rounded-2xl py-3 pl-8 pr-4 border-none outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-400/30"
                />
              </div>
            </div>
          ) : (
            <>
              <p className={`text-4xl font-bold tabular-nums ${
                isIncome
                  ? 'text-income-dark dark:text-income-bright'
                  : 'text-expense-dark dark:text-expense-bright'
              }`}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{dateLabel}</p>
            </>
          )}
        </div>

        {/* Fields */}
        <Card className="space-y-4">
          <Field label="Description">
            {isEditing ? (
              <input
                type="text"
                value={editDescription}
                onChange={e => setEditDescription(e.target.value)}
                className="w-full text-sm text-gray-800 dark:text-slate-200 bg-gray-50 dark:bg-white/[0.06] rounded-xl px-3 py-2 border border-gray-200 dark:border-white/[0.1] focus:outline-none focus:border-primary-400"
              />
            ) : (
              <span className="text-sm text-gray-800 dark:text-slate-200">{transaction.description}</span>
            )}
          </Field>

          <Field label="Category">
            {isEditing ? (
              <select
                value={editCategory}
                onChange={e => setEditCategory(e.target.value)}
                className="w-full text-sm text-gray-800 dark:text-slate-200 bg-gray-50 dark:bg-[#13131e] rounded-xl px-3 py-2 border border-gray-200 dark:border-white/[0.1] focus:outline-none focus:border-primary-400"
              >
                {categories?.map(c => (
                  <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                ))}
                <option value="Uncategorized">❓ Uncategorized</option>
              </select>
            ) : (
              <span className="text-sm text-gray-800 dark:text-slate-200">{transaction.mappedCategory}</span>
            )}
          </Field>

          <Field label="Date">
            {isEditing ? (
              <input
                type="date"
                value={editDate}
                onChange={e => setEditDate(e.target.value)}
                className="w-full text-sm text-gray-800 dark:text-slate-200 bg-gray-50 dark:bg-[#13131e] rounded-xl px-3 py-2 border border-gray-200 dark:border-white/[0.1] focus:outline-none focus:border-primary-400"
              />
            ) : (
              <span className="text-sm text-gray-800 dark:text-slate-200">{transaction.date}</span>
            )}
          </Field>

          {!isEditing && transaction.originalCategory && transaction.originalCategory !== transaction.mappedCategory && (
            <Field label="Bank category">
              <span className="text-sm text-gray-400 dark:text-slate-500">{transaction.originalCategory}</span>
            </Field>
          )}

          {!isEditing && transaction.importSource && (
            <Field label="Import">
              <span className="text-xs text-gray-400 dark:text-slate-500">{transaction.importSource}</span>
            </Field>
          )}
        </Card>

        {isEditing && (
          <button
            onClick={handleSave}
            className="w-full py-4 rounded-2xl bg-primary-500 text-white text-base font-semibold"
          >
            Save changes
          </button>
        )}

        {!isEditing && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`w-full py-4 rounded-2xl text-sm font-semibold transition-colors ${
              confirmDelete
                ? 'bg-expense text-white'
                : 'bg-expense-light dark:bg-expense-subtle text-expense dark:text-expense-bright'
            }`}
          >
            {isDeleting ? 'Deleting…' : confirmDelete ? 'Tap again to confirm delete' : 'Delete transaction'}
          </button>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide mt-0.5 w-24 shrink-0">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
