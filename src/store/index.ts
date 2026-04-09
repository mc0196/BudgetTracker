/**
 * Zustand store — UI state only.
 * Persistent data lives in Dexie; this store holds navigation state,
 * selected filters, and loading flags that don't need to survive refresh.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { currentMonth } from '@/lib/utils'
import type { TransactionFilters } from '@/types'

interface UIState {
  /** Currently viewed month, 'YYYY-MM' */
  selectedMonth: string
  setSelectedMonth: (month: string) => void

  /** Active filter on Transactions page */
  transactionFilters: TransactionFilters
  setTransactionFilters: (filters: TransactionFilters) => void
  resetTransactionFilters: () => void

  /** Import flow: whether the preview modal is open */
  importPreviewOpen: boolean
  setImportPreviewOpen: (open: boolean) => void

  /** Global loading state (e.g. during import) */
  isLoading: boolean
  setLoading: (loading: boolean) => void

  /** Toast / notification message */
  toast: { message: string; type: 'success' | 'error' | 'info' } | null
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  clearToast: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      selectedMonth: currentMonth(),
      setSelectedMonth: (month) => set({ selectedMonth: month }),

      transactionFilters: {},
      setTransactionFilters: (filters) => set({ transactionFilters: filters }),
      resetTransactionFilters: () => set({ transactionFilters: {} }),

      importPreviewOpen: false,
      setImportPreviewOpen: (open) => set({ importPreviewOpen: open }),

      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      toast: null,
      showToast: (message, type = 'info') => {
        set({ toast: { message, type } })
        // Auto-dismiss after 3 s
        setTimeout(() => set({ toast: null }), 3000)
      },
      clearToast: () => set({ toast: null }),
    }),
    {
      name: 'budget-tracker-ui',
      // Only persist the selected month between sessions
      partialize: (state) => ({ selectedMonth: state.selectedMonth }),
    },
  ),
)
