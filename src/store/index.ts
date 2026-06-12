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
  /** Hides all monetary amounts behind •••• */
  privacyMode: boolean
  togglePrivacyMode: () => void

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

  /** Toast / notification message, with optional action (e.g. Undo) */
  toast: Toast | null
  showToast: (message: string, type?: ToastType, action?: ToastAction) => void
  clearToast: () => void
}

export type ToastType = 'success' | 'error' | 'info'

export interface ToastAction {
  label: string
  onAction: () => void
}

export interface Toast {
  message: string
  type: ToastType
  action?: ToastAction
}

/** Auto-dismiss timer — module-level so a new toast cancels the previous one's timer */
let toastTimer: ReturnType<typeof setTimeout> | undefined

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      privacyMode: false,
      togglePrivacyMode: () => set((s) => ({ privacyMode: !s.privacyMode })),

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
      showToast: (message, type = 'info', action) => {
        if (toastTimer) clearTimeout(toastTimer)
        set({ toast: { message, type, action } })
        // Longer window when there's an action so the user can react
        toastTimer = setTimeout(() => set({ toast: null }), action ? 5000 : 3000)
      },
      clearToast: () => {
        if (toastTimer) clearTimeout(toastTimer)
        set({ toast: null })
      },
    }),
    {
      name: 'budget-tracker-ui',
      // Only persist the selected month between sessions
      partialize: (state) => ({
        selectedMonth: state.selectedMonth,
        privacyMode: state.privacyMode,
      }),
    },
  ),
)
