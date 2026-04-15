import { useNavigate } from 'react-router-dom'
import { TransactionItem, TransactionDivider } from '@/components/TransactionItem'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonTransactionRow } from '@/components/Skeleton'
import { useFilteredTransactions, useTransactionMutations } from '@/hooks/useTransactions'
import { useUIStore } from '@/store'
import { format, parseISO } from 'date-fns'
import type { Transaction } from '@/types'

export function TransactionList() {
  const navigate = useNavigate()
  const { transactionFilters, showToast } = useUIStore()
  const transactions = useFilteredTransactions(transactionFilters)
  const { remove } = useTransactionMutations()

  const grouped = groupByDate(transactions ?? [])
  const groups = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]))

  const handleClick = (tx: Transaction) => navigate(`/transactions/${tx.id}`)

  const handleDelete = async (id: string) => {
    try {
      await remove(id)
      showToast('Transaction deleted', 'info')
    } catch {
      showToast('Delete failed', 'error')
    }
  }

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

  return (
    <div>
      <div className="px-4 py-3 space-y-3">
        {groups.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No transactions found"
            description="Try adjusting your filters or importing a bank statement"
          />
        ) : (
          groups.map(([date, txs]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-600 uppercase tracking-wide mb-1.5 px-1">
                {formatGroupDate(date)}
              </p>
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07]">
                {txs.map((tx, i) => (
                  <div key={tx.id}>
                    <TransactionItem
                      transaction={tx}
                      onClick={handleClick}
                      onDelete={handleDelete}
                    />
                    {i < txs.length - 1 && <TransactionDivider />}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
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
