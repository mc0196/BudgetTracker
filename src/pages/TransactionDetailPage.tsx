import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { useTransaction } from '@/hooks/useTransactions'
import { useTransactionMutations } from '@/hooks/useTransactions'
import { useUndoableDelete } from '@/hooks/useUndoableDelete'
import { useAnomalies } from '@/hooks/useAnomalies'
import { useUIStore } from '@/store'
import { PrivateAmount } from '@/components/PrivateAmount'
import { Card } from '@/components/Card'
import { SkeletonMonthlyOverview } from '@/components/Skeleton'
import { TransactionEditForm, type TransactionEditValues } from '@/features/transactions/TransactionEditForm'
import { categoryService } from '@/services/categoryService'
import { haptics } from '@/lib/haptics'
import { formatCurrency } from '@/lib/utils'

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const transaction = useTransaction(id!)
  const anomalies = useAnomalies()
  const { update } = useTransactionMutations()
  const { deleteTransaction } = useUndoableDelete()
  const { showToast } = useUIStore()

  const [isEditing, setIsEditing] = useState(false)

  if (!transaction) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-[#0b0b13] pt-safe px-4 py-5">
        <SkeletonMonthlyOverview />
      </div>
    )
  }

  const anomaly = anomalies?.get(transaction.id)

  const handleSave = async (values: TransactionEditValues) => {
    haptics.success()
    await update(transaction.id, values)
    // Persist the mapping so future imports auto-categorize the same original category
    if (transaction.originalCategory && values.mappedCategory !== transaction.mappedCategory) {
      await categoryService.setMapping(transaction.originalCategory, values.mappedCategory)
    }
    showToast('Transaction updated', 'success')
    setIsEditing(false)
  }

  const handleDelete = async () => {
    haptics.warning()
    await deleteTransaction(transaction)
    navigate(-1)
  }

  const isIncome = transaction.type === 'income'
  const dateLabel = format(parseISO(transaction.date), 'EEEE, d MMMM yyyy')

  return (
    <div className="flex flex-col min-h-dvh bg-gray-50 dark:bg-[#0b0b13] pt-safe">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#13131e] border-b border-gray-100 dark:border-white/[0.08]">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 -ml-2 rounded-xl text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-white/[0.06] min-w-[44px] min-h-[44px]"
          aria-label="Back"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-gray-900 dark:text-slate-100">Transaction</h1>
        <button
          onClick={() => { haptics.light(); setIsEditing(e => !e) }}
          className="text-sm font-medium text-primary-600 dark:text-primary-400 px-3 py-2.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-400/10 min-h-[44px]"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="flex-1 px-4 py-5 space-y-4">
        {isEditing ? (
          <TransactionEditForm transaction={transaction} onSave={handleSave} />
        ) : (
          <>
            {/* Amount hero */}
            <div className={`rounded-3xl p-6 text-center ${
              isIncome ? 'bg-income-light dark:bg-income-subtle' : 'bg-expense-light dark:bg-expense-subtle'
            }`}>
              <PrivateAmount
                value={transaction.amount}
                prefix={isIncome ? '+' : '-'}
                className={`text-4xl font-bold ${
                  isIncome
                    ? 'text-income-dark dark:text-income-bright'
                    : 'text-expense-dark dark:text-expense-bright'
                }`}
              />
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{dateLabel}</p>
            </div>

            {anomaly && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-400/[0.10] text-amber-700 dark:text-amber-300">
                <span className="text-base flex-shrink-0 mt-px" aria-hidden>⚠️</span>
                <p className="text-sm font-medium leading-snug">
                  Unusually large for {anomaly.category} — typical is around {formatCurrency(anomaly.typicalAmount)}
                </p>
              </div>
            )}

            <Card className="space-y-4">
              <Field label="Description">
                <span className="text-sm text-gray-800 dark:text-slate-200">{transaction.description}</span>
              </Field>
              <Field label="Category">
                <span className="text-sm text-gray-800 dark:text-slate-200">{transaction.mappedCategory}</span>
              </Field>
              <Field label="Date">
                <span className="text-sm text-gray-800 dark:text-slate-200">{transaction.date}</span>
              </Field>
              {transaction.originalCategory && transaction.originalCategory !== transaction.mappedCategory && (
                <Field label="Bank category">
                  <span className="text-sm text-gray-400 dark:text-slate-500">{transaction.originalCategory}</span>
                </Field>
              )}
              {transaction.importSource && (
                <Field label="Import">
                  <span className="text-xs text-gray-400 dark:text-slate-500">{transaction.importSource}</span>
                </Field>
              )}
            </Card>

            <button
              onClick={handleDelete}
              className="w-full py-4 rounded-2xl text-sm font-semibold bg-expense-light dark:bg-expense-subtle text-expense dark:text-expense-bright press-scale"
            >
              Delete transaction
            </button>
            <p className="text-center text-xs text-gray-400 dark:text-slate-600">
              You can undo a delete for a few seconds afterwards
            </p>
          </>
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
