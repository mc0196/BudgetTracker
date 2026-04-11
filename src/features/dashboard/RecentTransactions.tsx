import { Link } from 'react-router-dom'
import { Card } from '@/components/Card'
import { TransactionItem, TransactionDivider } from '@/components/TransactionItem'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonRecentList } from '@/components/Skeleton'
import { useMonthTransactions } from '@/hooks/useTransactions'

interface RecentTransactionsProps {
  month: string
  limit?: number
}

export function RecentTransactions({ month, limit = 5 }: RecentTransactionsProps) {
  const transactions = useMonthTransactions(month)
  const recent = transactions?.slice(0, limit)

  if (!transactions) return <SkeletonRecentList rows={limit} />

  return (
    <Card padding="none">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">Recent</h3>
        {(transactions.length > limit) && (
          <Link
            to="/transactions"
            className="text-xs font-medium text-primary-600 dark:text-primary-400"
          >
            See all
          </Link>
        )}
      </div>

      {recent && recent.length > 0 ? (
        <div>
          {recent.map((tx, i) => (
            <div key={tx.id}>
              <TransactionItem transaction={tx} />
              {i < recent.length - 1 && <TransactionDivider />}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📋"
          title="No transactions yet"
          description="Import a bank statement or add one manually"
        />
      )}
    </Card>
  )
}
