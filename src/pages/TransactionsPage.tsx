import { TransactionList } from '@/features/transactions/TransactionList'

export function TransactionsPage() {
  return (
    <div>
      <div className="px-4 py-4 bg-white dark:bg-[#1a1a28] border-b border-gray-100 dark:border-white/[0.08]">
        <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100">Transactions</h1>
      </div>
      <TransactionList />
    </div>
  )
}
