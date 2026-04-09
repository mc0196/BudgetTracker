import { useNavigate } from 'react-router-dom'
import { TransactionItem, TransactionDivider } from '@/components/TransactionItem'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { TransactionFiltersBar } from './TransactionFilters'
import { useFilteredTransactions } from '@/hooks/useTransactions'
import { useUIStore } from '@/store'
import { format, parseISO } from 'date-fns'
import type { Transaction } from '@/types'
import { Card } from '@/components/Card'

export function TransactionList() {
  const navigate = useNavigate()
  const { transactionFilters, setTransactionFilters } = useUIStore()
  const transactions = useFilteredTransactions(transactionFilters)

  // Group transactions by date for display
  const grouped = groupByDate(transactions ?? [])
  const groups = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]))

  const handleTransactionClick = (tx: Transaction) => {
    navigate(`/transactions/${tx.id}`)
  }

  if (transactions === undefined) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <TransactionFiltersBar filters={transactionFilters} onChange={setTransactionFilters} />

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
              <p className="text-xs font-medium text-gray-400 mb-1 px-1">
                {formatGroupDate(date)}
              </p>
              <Card padding="none">
                {txs.map((tx, i) => (
                  <div key={tx.id}>
                    <TransactionItem transaction={tx} onClick={handleTransactionClick} />
                    {i < txs.length - 1 && <TransactionDivider />}
                  </div>
                ))}
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
