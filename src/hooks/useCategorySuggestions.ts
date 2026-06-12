import { useDeferredValue, useMemo } from 'react'
import { useAllTransactions } from './useTransactions'
import { useCategoryMappings } from './useCategories'
import {
  suggestCategoriesForInput,
  type CategorySuggestion,
} from '@/services/suggestionService'

/**
 * Live category suggestions while typing a description.
 * Uses useDeferredValue so heavy matching never blocks keystrokes.
 */
export function useCategorySuggestions(description: string): CategorySuggestion[] {
  const deferredInput = useDeferredValue(description)
  const transactions = useAllTransactions()
  const mappings = useCategoryMappings()

  return useMemo(
    () => suggestCategoriesForInput(deferredInput, transactions ?? [], mappings ?? []),
    [deferredInput, transactions, mappings],
  )
}
