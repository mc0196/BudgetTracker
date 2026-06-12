import { transactionRepository } from '@/db/repositories/transactionRepository'
import { useUIStore } from '@/store'
import { haptics } from '@/lib/haptics'
import type { Transaction } from '@/types'

/**
 * Delete with an undo window.
 * Deletion is committed immediately; undo re-inserts the captured records
 * with their original ids (idempotent bulkPut), so it works even after
 * navigating away or deleting something else in the meantime.
 */
export function useUndoableDelete() {
  const { showToast } = useUIStore()

  const restore = (records: Transaction[]) => {
    haptics.medium()
    transactionRepository
      .restore(records)
      .catch(() => showToast('Undo failed', 'error'))
  }

  /** Deletes a single transaction with undo */
  const deleteTransaction = async (transaction: Transaction) => {
    await transactionRepository.delete(transaction.id)
    showToast('Transaction deleted', 'info', {
      label: 'Undo',
      onAction: () => restore([transaction]),
    })
  }

  /** Deletes a whole import batch with undo. Returns the number of records removed. */
  const deleteImport = async (source: string) => {
    const records = await transactionRepository.getByImportSource(source)
    await transactionRepository.deleteByImportSource(source)
    showToast(`Removed ${records.length} transactions`, 'info', {
      label: 'Undo',
      onAction: () => restore(records),
    })
    return records.length
  }

  return { deleteTransaction, deleteImport }
}
