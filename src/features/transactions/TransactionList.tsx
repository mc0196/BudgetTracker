import { useNavigate, Link } from 'react-router-dom'
import { TransactionItem, TransactionDivider } from '@/components/TransactionItem'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonTransactionRow } from '@/components/Skeleton'
import { useFilteredTransactions, useTransactionCount } from '@/hooks/useTransactions'
import { useUndoableDelete } from '@/hooks/useUndoableDelete'
import { useAnomalies } from '@/hooks/useAnomalies'
import { useUIStore } from '@/store'
import { format, parseISO } from 'date-fns'
import type { Transaction } from '@/types'

export function TransactionList() {
  const navigate = useNavigate()
  const { transactionFilters, resetTransactionFilters } = useUIStore()
  const transactions = useFilteredTransactions(transactionFilters)
  const totalCount = useTransactionCount()
  const { deleteTransaction } = useUndoableDelete()
  const anomalies = useAnomalies()

  const grouped = groupByDate(transactions ?? [])
  const groups = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]))

  const handleClick = (tx: Transaction) => navigate(`/transactions/${tx.id}`)

  if (transactions === undefined) {
    return (
      <div className="px-4 pt-3 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#13131e] rounded-2xl border border-gray-100 dark:border-white/[0.07] overflow-hidden">
            <SkeletonTransactionRow />
          </div>
        ))}
      </div>
    )
  }

  if (groups.length === 0) {
    return <div className="px-4 py-3"><ListEmptyState isAppEmpty={totalCount === 0} onResetFilters={resetTransactionFilters} /></div>
  }

  return (
    <div className="px-4 py-3 space-y-3">
      {groups.map(([date, txs], groupIdx) => (
        <div
          key={date}
          className="animate-slide-up"
          style={{ animationDelay: `${Math.min(groupIdx * 40, 240)}ms`, animationFillMode: 'backwards' }}
        >
          <p className="text-xs font-semibold text-gray-400 dark:text-slate-600 uppercase tracking-wide mb-1.5 px-1">
            {formatGroupDate(date)}
          </p>
          <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07]">
            {txs.map((tx, i) => (
              <div key={tx.id}>
                <TransactionItem
                  transaction={tx}
                  onClick={handleClick}
                  onDelete={deleteTransaction}
                  isAnomaly={anomalies?.has(tx.id)}
                />
                {i < txs.length - 1 && <TransactionDivider />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ListEmptyState({ isAppEmpty, onResetFilters }: { isAppEmpty: boolean; onResetFilters: () => void }) {
  if (isAppEmpty) {
    return (
      <EmptyState
        icon="🧾"
        title="No transactions yet"
        description="Import a bank statement or add your first transaction to get started"
        action={
          <div className="flex gap-2">
            <Link to="/import" className="px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold press-scale">
              Import
            </Link>
            <Link to="/add" className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.07] text-gray-700 dark:text-slate-300 text-sm font-semibold press-scale">
              Add manually
            </Link>
          </div>
        }
      />
    )
  }

  return (
    <EmptyState
      icon="🔍"
      title="No matching transactions"
      description="Nothing matches the current filters — try widening them"
      action={
        <button
          onClick={onResetFilters}
          className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/[0.07] text-gray-700 dark:text-slate-300 text-sm font-semibold press-scale"
        >
          Clear filters
        </button>
      }
    />
  )
}

function groupByDate(transactions: Transaction[]): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {}
  for (const tx of transactions) {
    if (!groups[tx.date]) groups[tx.date] = []
    groups[tx.date].push(tx)
  }
  return groups
}

function formatGroupDate(date: string): string {
  const d = parseISO(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (format(d, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) return 'Today'
  if (format(d, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) return 'Yesterday'
  return format(d, 'EEEE, d MMM')
}
