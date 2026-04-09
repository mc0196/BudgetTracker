import { TransactionList } from '@/features/transactions/TransactionList'

export function TransactionsPage() {
  return (
    <div>
      <div className="px-4 py-4 bg-white border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
      </div>
      <TransactionList />
    </div>
  )
}
