import { useState } from 'react'
import { Card } from '@/components/Card'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useImportSources, useTransactionMutations } from '@/hooks/useTransactions'
import { useUIStore } from '@/store'

export function ImportHistory() {
  const sources = useImportSources()
  const { removeByImportSource } = useTransactionMutations()
  const { showToast } = useUIStore()

  if (!sources) return <div className="flex justify-center py-8"><LoadingSpinner /></div>

  if (sources.length === 0) {
    return (
      <EmptyState
        icon="📭"
        title="No imports yet"
        description="Imported files will appear here. You can delete an entire import if you made a mistake."
      />
    )
  }

  return (
    <Card padding="none">
      {sources.map((item, i) => (
        <div key={item.source}>
          <ImportRow
            source={item.source}
            count={item.count}
            onDelete={async () => {
              const deleted = await removeByImportSource(item.source)
              showToast(`Removed ${deleted} transactions`, 'info')
            }}
          />
          {i < sources.length - 1 && (
            <div className="mx-4 border-t border-gray-50 dark:border-white/[0.05]" />
          )}
        </div>
      ))}
    </Card>
  )
}

interface ImportRowProps {
  source: string
  count: number
  onDelete: () => Promise<void>
}

function ImportRow({ source, count, onDelete }: ImportRowProps) {
  const [confirming, setConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handlePress = async () => {
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 3000)
      return
    }
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
      setConfirming(false)
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-2xl shrink-0" aria-hidden>📄</span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{source}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500">{count} transaction{count !== 1 ? 's' : ''}</p>
      </div>

      <button
        onClick={handlePress}
        disabled={isDeleting}
        className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
          confirming
            ? 'bg-expense text-white'
            : 'bg-expense-light dark:bg-expense-subtle text-expense dark:text-expense-bright'
        }`}
      >
        {isDeleting ? '…' : confirming ? 'Confirm' : 'Delete'}
      </button>
    </div>
  )
}
