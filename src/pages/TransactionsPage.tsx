import { TransactionList } from '@/features/transactions/TransactionList'
import { TransactionFiltersBar } from '@/features/transactions/TransactionFilters'
import { useUIStore } from '@/store'

export function TransactionsPage() {
  const { transactionFilters, setTransactionFilters } = useUIStore()

  return (
    <div>
      {/* Single sticky block: title + filters — no fragile pixel offsets */}
      <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#1a1a28]/95 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.08]">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Transactions</h1>
        </div>
        <TransactionFiltersBar filters={transactionFilters} onChange={setTransactionFilters} />
      </div>
      <TransactionList />
    </div>
  )
}
